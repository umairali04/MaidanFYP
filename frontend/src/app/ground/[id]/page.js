'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GroundDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [ground, setGround]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking]         = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grounds/${id}`)
      .then(r => r.json())
      .then(data => setGround(data.ground))
      .finally(() => setLoading(false))
  }, [id])

  // Generate time slots based on ground open/close time
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
      slots.push({ start: `${startH}:${startM}`, end: `${endH}:${endMm}` })
      current += slotDuration
    }
    return slots
  }

  // Check if a slot is already booked
  function isSlotBooked(slot) {
    if (!selectedDate || !ground?.bookings) return false
    return ground.bookings.some(b => {
      const bDate = new Date(b.bookingDate).toISOString().split('T')[0]
      return bDate === selectedDate && b.startTime === slot.start
    })
  }

  async function handleConfirmBooking() {
    if (!selectedDate || !selectedSlot) return
    setError('')
    setBooking(true)

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      router.push(`/login?redirect=/ground/${id}`)
      return
    }

    try {
      const [startH, startM] = selectedSlot.start.split(':').map(Number)
      const [endH, endM]     = selectedSlot.end.split(':').map(Number)
      const duration = ((endH * 60 + endM) - (startH * 60 + startM)) / 60

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          groundId:    id,
          bookingDate: selectedDate,
          startTime:   selectedSlot.start,
          endTime:     selectedSlot.end,
          duration,
          totalPrice:  ground.pricePerHour * duration,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Booking failed')

      setSuccess(true)
      setSelectedSlot(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  const avgRating = (reviews) => {
    if (!reviews?.length) return null
    return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

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
          <button onClick={() => router.back()} className="mt-4 px-5 py-2 bg-[#00ff88] text-black font-bold rounded-lg text-sm cursor-pointer">
            Go Back
          </button>
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

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <img
            src={ground.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6'}
            alt={ground.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-5 left-5 bg-white/90 hover:bg-white text-gray-700 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            ← Back
          </button>

          {/* Badges */}
          <div className="absolute bottom-5 left-5 flex gap-2">
            <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full">
              {ground.sportType}
            </span>
            <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {ground.isActive ? '🟢 Open' : '🔴 Closed'}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — Ground Info */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Name + Rating */}
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

              {/* Description */}
              {ground.description && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-2">About</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{ground.description}</p>
                </div>
              )}

              {/* Info Cards */}
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

              {/* Facilities */}
              {ground.facilities?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-3">Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {ground.facilities.map(f => (
                      <span key={f} className="text-xs bg-[#00ff88]/10 text-[#00aa55] font-semibold px-3 py-1.5 rounded-full border border-[#00ff88]/20">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {ground.reviews?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-[#111] mb-4">
                    Reviews <span className="text-gray-400 font-normal">({ground.reviews.length})</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {ground.reviews.map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-xs font-bold text-[#00aa55]">
                              {r.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="font-semibold text-[#111] text-sm">{r.user?.name || 'User'}</span>
                          </div>
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <span key={star} className={`text-sm ${star <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
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

                {success ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-3">🎉</div>
                    <h4 className="font-bold text-[#111] mb-1">Booking Confirmed!</h4>
                    <p className="text-gray-400 text-sm mb-4">Your slot has been reserved.</p>
                    <button
                      onClick={() => { setSuccess(false); setSelectedDate('') }}
                      className="w-full py-2.5 bg-[#00ff88] text-black font-bold rounded-xl text-sm cursor-pointer"
                    >
                      Book Another
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Date Picker */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Select Date</label>
                      <input
                        type="date"
                        min={today}
                        value={selectedDate}
                        onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null) }}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#00ff88] transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <div className="mb-4">
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Select Time Slot</label>
                        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                          {slots.map((slot, i) => {
                            const booked   = isSlotBooked(slot)
                            const selected = selectedSlot?.start === slot.start
                            return (
                              <button
                                key={i}
                                disabled={booked}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                                  ${booked
                                    ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through'
                                    : selected
                                    ? 'bg-[#00ff88] text-black border-[#00ff88]'
                                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-[#00ff88] hover:text-[#00aa55]'
                                  }`}
                              >
                                {slot.start}–{slot.end}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price Summary */}
                    {selectedSlot && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>Slot</span>
                          <span className="font-semibold text-[#111]">{selectedSlot.start} – {selectedSlot.end}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>Rate</span>
                          <span>Rs. {ground.pricePerHour}/hr</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#111] pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-[#00cc6a]">
                            Rs. {ground.pricePerHour * (ground.slotDuration / 60)}
                          </span>
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-red-500 text-xs mb-3 bg-red-50 p-2 rounded-lg">{error}</p>
                    )}

                    <button
                      onClick={handleConfirmBooking}
                      disabled={!selectedDate || !selectedSlot || booking}
                      className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      {booking ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}