'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function GroundDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [ground, setGround]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  // const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedSlots, setSelectedSlots] = useState([])
  const [booking, setBooking]           = useState(false)
  const [error, setError]               = useState('')

  // ── Payment modal state ──
  const [showPayment, setShowPayment]   = useState(false)
  const [createdBooking, setCreatedBooking] = useState(null)  // booking just created
  const [paymentMethod, setPaymentMethod]   = useState('Cash')
  const [paying, setPaying]             = useState(false)
  const [paymentDone, setPaymentDone]   = useState(false)     // final success screen

  useEffect(() => {
    fetch(`${BASE_URL}/api/grounds/${id}`)
      .then(r => r.json())
      .then(data => setGround(data.ground))
      .finally(() => setLoading(false))
  }, [id])

  // ── Helpers ──────────────────────────────────────────────────────────────
  function getToken() {
    return document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1]
  }

  function generateSlots(openTime, closeTime, slotDuration) {
    const slots = []
    const [openH, openM]   = openTime.split(':').map(Number)
    const [closeH, closeM] = closeTime.split(':').map(Number)
    let current = openH * 60 + openM
    const end   = closeH * 60 + closeM
    while (current + slotDuration <= end) {
      const startH = Math.floor(current / 60).toString().padStart(2, '0')
      const startM = (current % 60).toString().padStart(2, '0')
      const endMin = current + slotDuration
      const endH   = Math.floor(endMin / 60).toString().padStart(2, '0')
      const endMm  = (endMin % 60).toString().padStart(2, '0')
      slots.push({
        start: `${startH}:${startM}`,
        end: `${endH}:${endMm}`
      })
      current += slotDuration
    }
    return slots
  }

  function isSlotBooked(slot) {
    if (!selectedDate || !ground?.bookings) return false
    return ground.bookings.some(b => {
      const bDate = new Date(b.bookingDate).toISOString().split('T')[0]
      return bDate === selectedDate && b.startTime === slot.start &&
        (b.status === 'CONFIRMED' || b.status === 'PENDING')
    })
  }

  const avgRating = (reviews) => {
    if (!reviews?.length) return null
    return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
  }

  // const totalPrice = ground && selectedSlot
  //   ? ground.pricePerHour * (ground.slotDuration / 60)
  //   : 0
  const totalPrice = ground && selectedSlots.length > 0
  ? ground.pricePerHour * selectedSlots.length * (ground.slotDuration / 60)
  : 0

  const today = new Date().toISOString().split('T')[0]

  // ── Step 1: Create booking (PENDING) ─────────────────────────────────────
  async function handleConfirmBooking() {
  if (!selectedDate || selectedSlots.length === 0) return

  setError('')
  setBooking(true)

  const token = getToken()

  if (!token) {
    router.push(`/login?redirect=/ground/${id}`)
    return
  }

  try {
    const createdBookings = []

    for (const slot of selectedSlots) {
      const [startH, startM] = slot.start.split(':').map(Number)
      const [endH, endM] = slot.end.split(':').map(Number)

      const duration = ((endH * 60 + endM) - (startH * 60 + startM)) / 60

      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groundId: id,
          bookingDate: selectedDate,
          startTime: slot.start,
          endTime: slot.end,
          duration,
          totalPrice: ground.pricePerHour * duration,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Booking failed')
      }

      createdBookings.push(data.booking)
    }

    setCreatedBooking(createdBookings)
    setShowPayment(true)

  } catch (err) {
    setError(err.message)
  } finally {
    setBooking(false)
  }
}

  //Two slots together 
  function toggleSlot(slot) {
  setSelectedSlots(prev => {
    const exists = prev.some(s => s.start === slot.start)

    if (exists) {
      return prev.filter(s => s.start !== slot.start)
    }

    const updated = [...prev, slot].sort((a, b) => a.start.localeCompare(b.start))

    // only allow continuous slots
    // for (let i = 0; i < updated.length - 1; i++) {
    //   if (updated[i].end !== updated[i + 1].start) {
    //     alert('Please select continuous slots only')
    //     return prev
    //   }
    // }

    return updated
  })
}

  // ── Step 2: Initiate + Confirm payment ───────────────────────────────────
  async function handlePayment() {
  if (!createdBooking || createdBooking.length === 0) return

  setPaying(true)
  setError('')

  const token = getToken()

  try {
    for (const booking of createdBooking) {
      const initRes = await fetch(`${BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          method: paymentMethod,
        }),
      })

      const initData = await initRes.json()

      if (!initRes.ok) {
        throw new Error(initData.message || 'Payment initiation failed')
      }

      const paymentId = initData.payment.id

      const confirmRes = await fetch(`${BASE_URL}/api/payments/${paymentId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      const confirmData = await confirmRes.json()

      if (!confirmRes.ok) {
        throw new Error(confirmData.message || 'Payment confirmation failed')
      }
    }

    setPaymentDone(true)

  } catch (err) {
    setError(err.message)
  } finally {
    setPaying(false)
  }
}

  // ── Step 2 (alt): Cancel payment → fail booking ──────────────────────────
  async function handleCancelPayment() {
    const token = getToken()
    if (createdBooking) {
      // Get the payment for this booking and mark as failed
      try {
        const res = await fetch(`${BASE_URL}/api/payments/booking/${createdBooking.id}`, {
          headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        })
        const data = await res.json()
        if (data.payment) {
          await fetch(`${BASE_URL}/api/payments/${data.payment.id}/fail`, {
            method: 'PUT',
            headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
          })
        }
      } catch (_) {}
    }
    setShowPayment(false)
    setCreatedBooking(null)
    setSelectedSlots([])
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
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
  )

  if (!ground) return (
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
  )

  const slots = generateSlots(ground.openTime, ground.closeTime, ground.slotDuration)

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <img src={ground.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6'} alt={ground.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <button onClick={() => router.back()} className="absolute top-5 left-5 bg-white/90 hover:bg-white text-gray-700 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all cursor-pointer">← Back</button>
          <div className="absolute bottom-5 left-5 flex gap-2">
            <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full">{ground.sportType}</span>
            <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">{ground.isActive ? '🟢 Open' : '🔴 Closed'}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT */}
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
                    {ground.facilities.map(f => (
                      <span key={f} className="text-xs bg-[#00ff88]/10 text-[#00aa55] font-semibold px-3 py-1.5 rounded-full border border-[#00ff88]/20">✓ {f}</span>
                    ))}
                  </div>
                </div>
              )}

              {ground.reviews?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-4">Reviews <span className="text-gray-400 font-normal">({ground.reviews.length})</span></h3>
                  <div className="flex flex-col gap-3">
                    {ground.reviews.map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-xs font-bold text-[#00aa55]">{r.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                            <span className="font-semibold text-[#111] text-sm">{r.user?.name || 'User'}</span>
                          </div>
                          <div className="flex">{[1,2,3,4,5].map(star => <span key={star} className={`text-sm ${star <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                        </div>
                        {r.comment && <p className="text-gray-500 text-sm">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Booking Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <h3 className="font-bold text-[#111] text-lg mb-4">Book a Slot</h3>

                {/* Date */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Select Date</label>
                  <input
                    type="date" min={today} value={selectedDate}
                    onChange={e => {
                      setSelectedDate(e.target.value)
                      setSelectedSlots([])
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#00ff88] transition-colors cursor-pointer"
                  />
                </div>

                {/* Slots */}
                {selectedDate && (
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Select Time Slot</label>
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {slots.map((slot, i) => {
                        const booked   = isSlotBooked(slot)
                        // const selected = selectedSlot?.start === slot.start
                        const selected = selectedSlots.some(s => s.start === slot.start)
                        return (
                          // <button key={i} disabled={booked} onClick={() => setSelectedSlot(slot)}
                          <button key={i} disabled={booked} onClick={() => toggleSlot(slot)}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                              ${booked ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through'
                                : selected ? 'bg-[#00ff88] text-black border-[#00ff88]'
                                : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-[#00ff88] hover:text-[#00aa55]'}`}>
                            {slot.start}–{slot.end}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                {selectedSlots.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span>Slot</span>
                      <span className="font-semibold text-[#111]">
                        {selectedSlots.length > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                            <div className="flex justify-between text-gray-500 mb-1">
                              <span>Selected Slots</span>
                              <span className="font-semibold text-[#111]">
                                {selectedSlots.length}
                              </span>
                            </div>

                            <div className="flex justify-between text-gray-500 mb-1">
                              <span>Rate</span>
                              <span>Rs. {ground.pricePerHour}/hr</span>
                            </div>

                            <div className="flex justify-between font-bold text-[#111] pt-2 border-t border-gray-200">
                              <span>Total</span>
                              <span className="text-[#00cc6a]">
                                Rs. {totalPrice}
                              </span>
                            </div>
                          </div>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span>Rate</span>
                      <span>Rs. {ground.pricePerHour}/hr</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#111] pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-[#00cc6a]">Rs. {totalPrice}</span>
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-xs mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}

                <button
                  onClick={handleConfirmBooking}
                  // disabled={!selectedDate || !selectedSlot || booking}
                  disabled={!selectedDate || selectedSlots.length === 0 || booking}
                  className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {booking ? 'Creating Booking...' : 'Confirm Booking →'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />

      {/* ══════════════════════════════════════════
          PAYMENT MODAL
      ══════════════════════════════════════════ */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

            {paymentDone ? (
              /* ── SUCCESS SCREEN ── */
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111] mb-2">Payment Successful!</h2>
                <p className="text-gray-400 text-sm mb-2">Your booking is now <span className="text-[#00cc6a] font-bold">CONFIRMED</span></p>
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Ground</span>
                    <span className="font-semibold text-[#111]">{ground.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Date</span>
                    <span className="font-semibold text-[#111]">{selectedDate}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-400 block mb-1">Time Slots</span>

                    <div className="flex flex-col gap-1">
                      {createdBooking?.map((booking, index) => (
                        <span key={booking.id || index} className="font-semibold text-[#111]">
                          {booking.startTime} – {booking.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Method</span>
                    <span className="font-semibold text-[#111]">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-[#111]">Amount Paid</span>
                    <span className="font-bold text-[#00cc6a]">Rs. {totalPrice}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 transition-all cursor-pointer"
                >
                  Go to Home
                </button>
              </div>

            ) : (
              /* ── PAYMENT FORM ── */
              <>
                {/* Header */}
                <div className="bg-[#0f0f0f] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg">Complete Payment</h2>
                    <button onClick={handleCancelPayment} className="text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
                  </div>
                  {/* Booking summary */}
                  <div className="bg-white/5 rounded-2xl p-4 text-sm">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Ground</span>
                      <span className="text-white font-semibold">{ground.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Date</span>
                      <span className="text-white">{selectedDate}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-gray-400 block mb-1">Time Slots</span>

                      <div className="flex flex-col gap-1">
                        {createdBooking?.map((booking, index) => (
                          <span key={booking.id || index} className="text-white">
                            {booking.startTime} – {booking.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 mt-2">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-[#00ff88] font-bold text-base">Rs. {totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="p-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {[
                      { value: 'JazzCash',  emoji: '📱', label: 'JazzCash',  desc: 'Pay via JazzCash mobile account' },
                      { value: 'EasyPaisa', emoji: '💚', label: 'EasyPaisa', desc: 'Pay via EasyPaisa mobile account' },
                      { value: 'Cash',      emoji: '💵', label: 'Cash',      desc: 'Pay cash at the ground' },
                    ].map(method => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left
                          ${paymentMethod === method.value
                            ? 'border-[#00ff88] bg-[#00ff88]/5'
                            : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <span className="text-2xl">{method.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${paymentMethod === method.value ? 'text-[#00aa55]': 'text-[#111]'}`}>{method.label}</p>
                          <p className="text-gray-400 text-xs">{method.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                          ${paymentMethod === method.value ? 'border-[#00ff88] bg-[#00ff88]' : 'border-gray-300'}`}>
                          {paymentMethod === method.value && <span className="text-black text-xs font-bold">✓</span>}
                        </div>
                      </button>
                    ))}
                  </div>

                  {error && <p className="text-red-500 text-xs mb-3 bg-red-50 p-3 rounded-xl">{error}</p>}

                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full py-4 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {paying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>Pay Rs. {totalPrice} via {paymentMethod}</>
                    )}
                  </button>

                  <button
                    onClick={handleCancelPayment}
                    className="w-full mt-3 py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    Cancel & go back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}