"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GroundDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [refreshingSlots, setRefreshingSlots] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  function getToken() {
    return document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1];
  }

  function normalizeDate(value) {
    if (!value) return "";
    const str = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-CA");
  }

  function timeToMinutes(value) {
    if (!value) return null;
    const parts = String(value).split(":").map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    return parts[0] * 60 + parts[1];
  }

  function generateSlots(openTime, closeTime, duration) {
    const result = [];
    const [openH, openM] = String(openTime).split(":").map(Number);
    const [closeH, closeM] = String(closeTime).split(":").map(Number);
    let current = openH * 60 + openM;
    const end = closeH * 60 + closeM;

    while (current + duration <= end) {
      const startH = String(Math.floor(current / 60)).padStart(2, "0");
      const startM = String(current % 60).padStart(2, "0");
      const finish = current + duration;
      const endH = String(Math.floor(finish / 60)).padStart(2, "0");
      const endM = String(finish % 60).padStart(2, "0");

      result.push({ start: `${startH}:${startM}`, end: `${endH}:${endM}` });
      current += duration;
    }

    return result;
  }

  async function loadGround(showLoader = false) {
    try {
      if (showLoader) setRefreshingSlots(true);

      const res = await fetch(`${BASE_URL}/api/grounds/${id}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to load ground");

      setGround(data.ground);
    } catch (err) {
      console.error("Failed to load ground:", err);
    } finally {
      if (showLoader) setRefreshingSlots(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadGround(true);
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    loadGround(true);
  }, [selectedDate, id]);

  function getBookings() {
    if (!ground) return [];
    if (Array.isArray(ground.bookings)) return ground.bookings;
    return [];
  }

  function findBookingForSlot(slot) {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    if (slotStart === null || slotEnd === null) return null;

    return getBookings().find((booking) => {
      const bookingDate = normalizeDate(booking.bookingDate);
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      const status = String(booking.status || "").toUpperCase();

      if (bookingDate !== selectedDate) return false;
      if (bookingStart === null || bookingEnd === null) return false;
      if (!["CONFIRMED", "PENDING"].includes(status)) return false;

      return slotStart < bookingEnd && slotEnd > bookingStart;
    }) || null;
  }

  function isSlotBooked(slot) {
    return Boolean(findBookingForSlot(slot));
  }

  function toggleSlot(slot) {
    if (isSlotBooked(slot)) {
      setError("This time slot is already booked.");
      return;
    }

    setError("");

    setSelectedSlots((current) => {
      const exists = current.some((item) => item.start === slot.start);
      if (exists) return current.filter((item) => item.start !== slot.start);
      return [...current, slot].sort((a, b) => a.start.localeCompare(b.start));
    });
  }

  const avgRating = (reviews) => {
    if (!reviews?.length) return null;
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  };

  const today = new Date().toISOString().split("T")[0];

  const slots = ground ? generateSlots(ground.openTime, ground.closeTime, ground.slotDuration) : [];

  const totalPrice = ground && selectedSlots.length > 0 ? ground.pricePerHour * selectedSlots.length * (ground.slotDuration / 60) : 0;

  async function handleConfirmBooking() {
    if (!selectedDate || selectedSlots.length === 0) return;

    setError("");

    await loadGround(true);

    if (selectedSlots.some((slot) => isSlotBooked(slot))) {
      setError("One or more selected slots are already booked. Please select another slot.");
      setSelectedSlots((current) => current.filter((slot) => !isSlotBooked(slot)));
      return;
    }

    setBooking(true);

    const token = getToken();

    if (!token) {
      router.push(`/login?redirect=/ground/${id}`);
      return;
    }

    try {
      const created = [];

      for (const slot of selectedSlots) {
        const start = timeToMinutes(slot.start);
        const end = timeToMinutes(slot.end);
        const duration = (end - start) / 60;

        const res = await fetch(`${BASE_URL}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ groundId: id, bookingDate: selectedDate, startTime: slot.start, endTime: slot.end, duration, totalPrice: ground.pricePerHour * duration }),
        });

        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Booking API returned an invalid response (${res.status}).`);
        }

        if (!res.ok) throw new Error(data?.message || data?.error || "Booking failed");
        if (!data?.booking) throw new Error("Booking was not created.");

        created.push(data.booking);
      }

      setCreatedBooking(created);
      setPaymentDone(false);
      setShowPayment(true);
    } catch (err) {
      setError(err.message);
      await loadGround(true);
    } finally {
      setBooking(false);
    }
  }

  async function handlePayment() {
    if (!createdBooking.length) return;

    setPaying(true);
    setError("");

    const token = getToken();

    try {
      for (const booking of createdBooking) {
        const initRes = await fetch(`${BASE_URL}/api/payments/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bookingId: booking.id, method: paymentMethod }),
        });

        const initData = await initRes.json();
        if (!initRes.ok) throw new Error(initData.message || "Payment initiation failed");

        const confirmRes = await fetch(`${BASE_URL}/api/payments/${initData.payment.id}/confirm`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        });

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmData.message || "Payment confirmation failed");
      }

      setPaymentDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  async function handleCancelPayment() {
    const token = getToken();

    try {
      for (const booking of createdBooking) {
        const res = await fetch(`${BASE_URL}/api/payments/booking/${booking.id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.payment) {
          await fetch(`${BASE_URL}/api/payments/${data.payment.id}/fail`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          });
        }
      }
    } catch (err) {
      console.error("Payment cancellation error:", err);
    }

    setShowPayment(false);
    setCreatedBooking([]);
    setSelectedSlots([]);
    setPaymentDone(false);
    setError("");
    await loadGround(true);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading ground details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!ground) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
          <div>
            <div className="text-6xl mb-4">🏟️</div>
            <h2 className="text-xl font-bold text-gray-700">Ground not found</h2>
            <button onClick={() => router.back()} className="mt-4 px-5 py-2 bg-[#00ff88] text-black font-bold rounded-lg text-sm cursor-pointer">Go Back</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <img src={ground.images?.[0] || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6"} alt={ground.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <button onClick={() => router.back()} className="absolute top-5 left-5 bg-white/90 hover:bg-white text-gray-700 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all cursor-pointer">← Back</button>
          <div className="absolute bottom-5 left-5 flex gap-2">
            <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full">{ground.sportType}</span>
            <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">{ground.isActive ? "🟢 Open" : "🔴 Closed"}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#111]">{ground.name}</h1>
                  {ground.reviews?.length > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-xl shrink-0">
                      <span className="text-yellow-400">★</span>
                      <span className="font-bold text-gray-700">{avgRating(ground.reviews)}</span>
                      <span className="text-gray-400 text-sm">({ground.reviews.length})</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mt-1">📍 {ground.location}, {ground.city}</p>
              </div>

              {ground.description && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-2">About</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{ground.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Price/hr</p>
                  <p className="text-[#00cc6a] font-bold text-lg">Rs. {ground.pricePerHour}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Hours</p>
                  <p className="text-[#111] font-bold text-sm">{ground.openTime}–{ground.closeTime}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Slot</p>
                  <p className="text-[#111] font-bold text-sm">{ground.slotDuration} min</p>
                </div>
              </div>

              {ground.facilities?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-3">Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {ground.facilities.map((facility) => (
                      <span key={facility} className="text-xs bg-[#00ff88]/10 text-[#00aa55] font-semibold px-3 py-1.5 rounded-full border border-[#00ff88]/20">✓ {facility}</span>
                    ))}
                  </div>
                </div>
              )}

              {ground.reviews?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-4">Reviews <span className="text-gray-400 font-normal">({ground.reviews.length})</span></h3>
                  <div className="flex flex-col gap-3">
                    {ground.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-xs font-bold text-[#00aa55]">{review.user?.name?.[0]?.toUpperCase() || "U"}</div>
                            <span className="font-semibold text-[#111] text-sm">{review.user?.name || "User"}</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => <span key={star} className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>)}
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-500 text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <h3 className="font-bold text-[#111] text-lg mb-4">Book a Slot</h3>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Select Date</label>
                  <input type="date" min={today} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlots([]); setError(""); }} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#00ff88] transition-colors cursor-pointer" />
                </div>

                {selectedDate && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Select Time Slot</label>
                      {refreshingSlots && <span className="text-[10px] text-gray-400">Checking...</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {slots.map((slot, index) => {
                        const bookedBooking = findBookingForSlot(slot);
                        const booked = Boolean(bookedBooking);
                        const selected = selectedSlots.some((item) => item.start === slot.start);

                        return (
                          <button key={index} type="button" disabled={booked} onClick={() => toggleSlot(slot)} title={booked ? "This slot is already booked" : `${slot.start}–${slot.end}`} className={`relative py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${booked ? "bg-red-100 text-red-600 border-red-300 cursor-not-allowed" : selected ? "bg-[#00ff88] text-black border-[#00ff88] cursor-pointer" : "bg-gray-50 text-gray-600 border-gray-100 hover:border-[#00ff88] hover:text-[#00aa55] cursor-pointer"}`}>
                            {slot.start}–{slot.end}
                            {booked && <span className="block text-[9px] font-bold uppercase mt-0.5 text-red-500">Booked</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />Available</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Booked</div>
                    </div>
                  </div>
                )}

                {selectedSlots.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-500 mb-2"><span>Selected Slots</span><span className="font-semibold text-[#111]">{selectedSlots.length}</span></div>
                    <div className="flex justify-between text-gray-500 mb-2"><span>Rate</span><span>Rs. {ground.pricePerHour}/hr</span></div>
                    <div className="flex justify-between font-bold text-[#111] pt-2 border-t border-gray-200"><span>Total</span><span className="text-[#00cc6a]">Rs. {totalPrice}</span></div>
                  </div>
                )}

                {error && <p className="text-red-500 text-xs mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}

                <button onClick={handleConfirmBooking} disabled={!selectedDate || selectedSlots.length === 0 || booking} className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                  {booking ? "Creating Booking..." : "Confirm Booking →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex justify-center px-4 py-24">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden h-fit">
              {paymentDone ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-4xl">✅</span></div>
                  <h2 className="text-2xl font-bold text-[#111] mb-2">Payment Successful!</h2>
                  <p className="text-gray-400 text-sm mb-2">Your booking is now <span className="text-[#00cc6a] font-bold">CONFIRMED</span></p>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-left">
                    <div className="flex justify-between mb-2"><span className="text-gray-400">Ground</span><span className="font-semibold text-[#111]">{ground.name}</span></div>
                    <div className="flex justify-between mb-2"><span className="text-gray-400">Date</span><span className="font-semibold text-[#111]">{selectedDate}</span></div>
                    <div className="mb-2"><span className="text-gray-400 block mb-1">Time Slots</span>{createdBooking.map((bookingItem, index) => <span key={bookingItem.id || index} className="font-semibold text-[#111] block">{bookingItem.startTime} – {bookingItem.endTime}</span>)}</div>
                    <div className="flex justify-between mb-2"><span className="text-gray-400">Method</span><span className="font-semibold text-[#111]">{paymentMethod}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-200"><span className="font-bold text-[#111]">Amount Paid</span><span className="font-bold text-[#00cc6a]">Rs. {totalPrice}</span></div>
                  </div>
                  <button onClick={() => router.push("/")} className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 transition-all cursor-pointer">Go to Home</button>
                </div>
              ) : (
                <>
                  <div className="bg-[#0f0f0f] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white font-bold text-lg">Complete Payment</h2>
                      <button onClick={handleCancelPayment} className="text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-sm">
                      <div className="flex justify-between text-gray-400 mb-1"><span>Ground</span><span className="text-white font-semibold">{ground.name}</span></div>
                      <div className="flex justify-between text-gray-400 mb-1"><span>Date</span><span className="text-white">{selectedDate}</span></div>
                      <div className="mb-1"><span className="text-gray-400 block mb-1">Time Slots</span>{createdBooking.map((bookingItem, index) => <span key={bookingItem.id || index} className="text-white block">{bookingItem.startTime} – {bookingItem.endTime}</span>)}</div>
                      <div className="flex justify-between pt-2 border-t border-white/10 mt-2"><span className="text-white font-bold">Total</span><span className="text-[#00ff88] font-bold text-base">Rs. {totalPrice}</span></div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>

                    <div className="flex flex-col gap-3 mb-6">
                      {[{ value: "JazzCash", emoji: "📱", label: "JazzCash", desc: "Pay via JazzCash mobile account" }, { value: "EasyPaisa", emoji: "💚", label: "EasyPaisa", desc: "Pay via EasyPaisa mobile account" }, { value: "Cash", emoji: "💵", label: "Cash", desc: "Pay cash at the ground" }].map((method) => (
                        <button key={method.value} onClick={() => setPaymentMethod(method.value)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${paymentMethod === method.value ? "border-[#00ff88] bg-[#00ff88]/5" : "border-gray-100 hover:border-gray-200"}`}>
                          <span className="text-2xl">{method.emoji}</span>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${paymentMethod === method.value ? "text-[#00aa55]" : "text-[#111]"}`}>{method.label}</p>
                            <p className="text-gray-400 text-xs">{method.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === method.value ? "border-[#00ff88] bg-[#00ff88]" : "border-gray-300"}`}>
                            {paymentMethod === method.value && <span className="text-black text-xs font-bold">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>

                    {error && <p className="text-red-500 text-xs mb-3 bg-red-50 p-3 rounded-xl">{error}</p>}

                    <button onClick={handlePayment} disabled={paying} className="w-full py-4 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2">
                      {paying ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing Payment...</> : <>Pay Rs. {totalPrice} via {paymentMethod}</>}
                    </button>

                    <button onClick={handleCancelPayment} className="w-full mt-3 py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors cursor-pointer">Cancel & go back</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}