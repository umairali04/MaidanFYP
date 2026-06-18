'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

function getToken() {
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('token='))
    ?.split('=')[1]
}

function StatusBadge({ status }) {
  const map = {
    CONFIRMED: {
      className: 'bg-green-50 text-green-600',
      label: 'Confirmed',
    },
    PENDING: {
      className: 'bg-yellow-50 text-yellow-600',
      label: 'Pending Payment',
    },
    CANCELLED: {
      className: 'bg-red-50 text-red-500',
      label: 'Cancelled',
    },
    COMPLETED: {
      className: 'bg-blue-50 text-blue-500',
      label: 'Completed',
    },
  }

  const s = map[status] || {
    className: 'bg-gray-100 text-gray-500',
    label: status,
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.className}`}>
      {s.label}
    </span>
  )
}

export default function MyBookingsPage() {
  const router = useRouter()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [showPayment, setShowPayment] = useState(false)
  const [activeBooking, setActiveBooking] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paying, setPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const [showDispute, setShowDispute] = useState(false)
  const [disputeBooking, setDisputeBooking] = useState(null)
  const [disputeTitle, setDisputeTitle] = useState('')
  const [disputeDesc, setDisputeDesc] = useState('')
  const [submittingDispute, setSubmittingDispute] = useState(false)
  const [disputeSuccess, setDisputeSuccess] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()

    if (!token) {
      router.push('/login')
      return
    }

    fetch(`${BASE_URL}/api/bookings/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setBookings(d.bookings)
      })
      .finally(() => setLoading(false))
  }, [router])

  function handlePayNow(booking) {
    setActiveBooking(booking)
    setPaymentMethod('Cash')
    setPaymentSuccess(false)
    setError('')
    setShowPayment(true)
  }

  async function handleConfirmPayment() {
    if (!activeBooking) return

    setPaying(true)
    setError('')

    const token = getToken()

    try {
      const initRes = await fetch(`${BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          method: paymentMethod,
        }),
      })

      const initData = await initRes.json()

      if (!initRes.ok) {
        throw new Error(initData.message || 'Payment initiation failed')
      }

      const confirmRes = await fetch(
        `${BASE_URL}/api/payments/${initData.payment.id}/confirm`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      )

      const confirmData = await confirmRes.json()

      if (!confirmRes.ok) {
        throw new Error(confirmData.message || 'Payment confirmation failed')
      }

      setBookings(prev =>
        prev.map(b =>
          b.id === activeBooking.id
            ? {
                ...b,
                status: 'CONFIRMED',
                payment: {
                  paymentStatus: 'SUCCESS',
                  method: paymentMethod,
                },
              }
            : b
        )
      )

      setPaymentSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setPaying(false)
    }
  }

  function openDisputeModal(booking) {
    setDisputeBooking(booking)
    setDisputeTitle('')
    setDisputeDesc('')
    setDisputeSuccess(false)
    setError('')
    setShowDispute(true)
  }

  async function handleSubmitDispute() {
    if (!disputeTitle.trim() || !disputeDesc.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setSubmittingDispute(true)
    setError('')

    const token = getToken()

    try {
      const res = await fetch(`${BASE_URL}/api/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groundId: disputeBooking.groundId,
          bookingId: disputeBooking.id,
          title: disputeTitle,
          description: disputeDesc,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit dispute')
      }

      setDisputeSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmittingDispute(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            My Bookings
          </h1>

          <p className="mb-8 text-sm text-gray-500">
            View and manage all your ground bookings
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#00ff88] border-t-transparent" />
              <p className="mt-3 text-sm text-gray-400">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white px-5 py-14 text-center">
              <div className="mb-3 text-5xl">📅</div>
              <h3 className="mb-2 font-semibold text-gray-900">No bookings yet</h3>
              <p className="mb-6 text-sm text-gray-400">
                Book a ground to get started
              </p>
              <button
                onClick={() => router.push('/grounds')}
                className="rounded-xl bg-[#00ff88] px-6 py-3 text-sm font-bold text-black hover:brightness-110"
              >
                Explore Grounds
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map(b => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">
                          {b.ground?.name || 'Ground'}
                        </h3>
                        <StatusBadge status={b.status} />
                      </div>

                      <p className="mb-1 text-sm text-gray-500">
                        📍 {b.ground?.location}, {b.ground?.city}
                      </p>

                      <p className="mb-1 text-sm text-gray-500">
                        📅{' '}
                        {new Date(b.bookingDate).toLocaleDateString('en-PK', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        ⏰ {b.startTime} – {b.endTime}
                      </p>

                      <p className="mt-2 text-base font-bold text-green-600">
                        Rs. {b.totalPrice}
                      </p>

                      {b.payment && (
                        <p
                          className={`mt-1 text-xs font-semibold ${
                            b.payment.paymentStatus === 'SUCCESS'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {b.payment.paymentStatus === 'SUCCESS'
                            ? `✅ Paid via ${b.payment.method}`
                            : '⏳ Payment Pending'}
                        </p>
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-40">
                      {b.status === 'PENDING' &&
                        b.payment?.paymentStatus !== 'SUCCESS' && (
                          <button
                            onClick={() => handlePayNow(b)}
                            className="w-full rounded-xl bg-[#00ff88] px-4 py-2.5 text-sm font-bold text-black hover:brightness-110"
                          >
                            💳 Pay Now
                          </button>
                        )}

                      {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') && (
                        <button
                          onClick={() => openDisputeModal(b)}
                          className="w-full rounded-xl border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"
                        >
                          ⚠️ Report Dispute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showPayment && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white">
            {paymentSuccess ? (
              <div className="p-8 text-center sm:p-10">
                <div className="mb-3 text-5xl">✅</div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  Payment Successful!
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Your booking is now{' '}
                  <strong className="text-green-600">CONFIRMED</strong>
                </p>
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full rounded-xl bg-[#00ff88] py-3.5 text-sm font-bold text-black"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#0f0f0f] p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      Complete Payment
                    </h2>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="text-xl text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 text-sm">
                    <div className="mb-2 flex justify-between gap-4 text-gray-400">
                      <span>Ground</span>
                      <span className="text-right font-semibold text-white">
                        {activeBooking.ground?.name}
                      </span>
                    </div>

                    <div className="mb-2 flex justify-between text-gray-400">
                      <span>Time</span>
                      <span className="text-white">
                        {activeBooking.startTime} – {activeBooking.endTime}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
                      <span className="font-bold text-white">Total</span>
                      <span className="font-bold text-[#00ff88]">
                        Rs. {activeBooking.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Select Payment Method
                  </p>

                  {[
                    { value: 'JazzCash', emoji: '📱', label: 'JazzCash', desc: 'Pay via JazzCash' },
                    { value: 'EasyPaisa', emoji: '💚', label: 'EasyPaisa', desc: 'Pay via EasyPaisa' },
                    { value: 'Cash', emoji: '💵', label: 'Cash', desc: 'Pay cash at ground' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`mb-2 flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                        paymentMethod === m.value
                          ? 'border-[#00ff88] bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>

                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            paymentMethod === m.value
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {m.label}
                        </p>
                        <p className="text-xs text-gray-400">{m.desc}</p>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          paymentMethod === m.value
                            ? 'border-[#00ff88] bg-[#00ff88]'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === m.value && '✓'}
                      </div>
                    </button>
                  ))}

                  {error && (
                    <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleConfirmPayment}
                    disabled={paying}
                    className="mt-2 w-full rounded-xl bg-[#00ff88] py-4 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paying
                      ? 'Processing...'
                      : `Pay Rs. ${activeBooking.totalPrice} via ${paymentMethod}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDispute && disputeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-8">
            {disputeSuccess ? (
              <div className="text-center">
                <div className="mb-3 text-5xl">📨</div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  Dispute Submitted!
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Our admin team will review your dispute shortly.
                </p>
                <button
                  onClick={() => setShowDispute(false)}
                  className="w-full rounded-xl bg-[#00ff88] py-3.5 text-sm font-bold text-black"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    ⚠️ Report Dispute
                  </h2>
                  <button
                    onClick={() => setShowDispute(false)}
                    className="text-xl text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  Booking:{' '}
                  <strong className="text-gray-900">
                    {disputeBooking.ground?.name}
                  </strong>{' '}
                  · {disputeBooking.startTime} – {disputeBooking.endTime}
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Title
                  </label>
                  <input
                    value={disputeTitle}
                    onChange={e => setDisputeTitle(e.target.value)}
                    placeholder="e.g. Ground was not available"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#00ff88]"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={disputeDesc}
                    onChange={e => setDisputeDesc(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#00ff88]"
                  />
                </div>

                {error && (
                  <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmitDispute}
                  disabled={submittingDispute}
                  className="w-full rounded-xl bg-red-500 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}