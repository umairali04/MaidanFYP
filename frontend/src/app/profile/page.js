'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showTopup, setShowTopup] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('JazzCash')
  const [addingMoney, setAddingMoney] = useState(false)

  function getToken() {
    return document.cookie
      .split('; ')
      .find(r => r.startsWith('token='))
      ?.split('=')[1]
  }

  useEffect(() => {
    const token = getToken()

    if (!token) {
      router.push('/login')
      return
    }

    Promise.all([
      fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),

      fetch(`${BASE_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([userData, walletData]) => {
        if (userData.user) setUser(userData.user)
        setWallet(walletData)
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleAddMoney() {
    const token = getToken()

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setAddingMoney(true)

    try {
      const res = await fetch(`${BASE_URL}/api/wallet/add-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          method,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add money')
      }

      setWallet(prev => ({
        ...prev,
        balance: data.balance,
      }))

      setAmount('')
      setShowTopup(false)
      alert(`Rs. ${amount} added successfully via ${method}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setAddingMoney(false)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          {loading ? (
            <div className="flex min-h-400px items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00ff88] border-t-transparent" />
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Left Profile Card */}
              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm lg:col-span-1">
                <div className="bg-[#0f0f0f] px-6 py-10 text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 p-10 items-center justify-center rounded-full bg-[#00ff88] text-3xl font-extrabold text-black">
                    {initials}
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    {user.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    {user.email}
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-[#00ff88]/15 px-4 py-1 text-xs font-bold text-[#00ff88]">
                    {user.role}
                  </span>
                </div>

                <div className="space-y-4 p-6">
                  <InfoRow label="Full Name" value={user.name} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Phone" value={user.phone || 'Not added'} />
                  <InfoRow label="Role" value={user.role} />
                  <InfoRow
                    label="Verified"
                    value={user.isVerified ? '✅ Verified' : '❌ Not Verified'}
                  />
                  <InfoRow
                    label="Member Since"
                    value={new Date(user.createdAt).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  />

                  <button
                    onClick={() => router.push('/edit_profile')}
                    className="mt-4 w-full rounded-xl bg-[#00ff88] py-3 text-sm font-bold text-black transition hover:brightness-110"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Right Wallet Area */}
              <div className="space-y-6 lg:col-span-2">

                {/* Wallet Card */}
                <div className="relative overflow-hidden rounded-3xl bg-[#0f0f0f] p-6 text-white shadow-xl">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00ff88]/20 blur-2xl" />
                  <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#00ff88]/10 blur-2xl" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Digital Wallet</p>
                        <h2 className="mt-2 text-xl font-extrabold">
                          Rs. {wallet?.balance || 0}
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                          Use wallet balance to pay for ground bookings.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4 text-3xl">
                        💳
                      </div>
                    </div>

                    <button
                      onClick={() => setShowTopup(true)}
                      className="mt-6 rounded-xl bg-[#00ff88] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110"
                    >
                      Add Money
                    </button>
                  </div>
                </div>

                {/* Transactions */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      Recent Transactions
                    </h3>
                    <span className="text-xs text-gray-400">
                      Wallet history
                    </span>
                  </div>

                  {wallet?.transactions?.length > 0 ? (
                    <div className="space-y-3">
                      {wallet.transactions.slice(0, 5).map(t => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {t.type === 'ADD_MONEY'
                                ? 'Money Added'
                                : t.type === 'BOOKING_PAYMENT'
                                  ? 'Booking Payment'
                                  : t.type}
                            </p>
                            <p className="text-xs text-gray-400">
                              {t.note || 'Wallet transaction'}
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${
                                t.type === 'ADD_MONEY'
                                  ? 'text-green-600'
                                  : 'text-red-500'
                              }`}
                            >
                              {t.type === 'ADD_MONEY' ? '+' : '-'} Rs. {t.amount}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(t.createdAt).toLocaleDateString('en-PK')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gray-50 p-8 text-center">
                      <p className="text-sm text-gray-400">
                        No wallet transactions yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Could not load profile.
            </p>
          )}
        </div>
      </main>

      {/* Top Up Modal */}
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-[#0f0f0f] p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Add Money to Wallet</h2>
                <button
                  onClick={() => setShowTopup(false)}
                  className="text-xl text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Choose payment method and enter amount.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount e.g. 1000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#00ff88]"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Payment Method
                </label>

                <div className="space-y-3">
                  {[
                    { value: 'JazzCash', emoji: '📱', desc: 'Pay using JazzCash account' },
                    { value: 'EasyPaisa', emoji: '💚', desc: 'Pay using EasyPaisa account' },
                    { value: 'Card', emoji: '💳', desc: 'Pay using debit/credit card' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setMethod(item.value)}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                        method === item.value
                          ? 'border-[#00ff88] bg-[#00ff88]/10'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>

                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          {item.value}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.desc}
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          method === item.value
                            ? 'border-[#00ff88] bg-[#00ff88]'
                            : 'border-gray-300'
                        }`}
                      >
                        {method === item.value && (
                          <span className="text-xs font-bold text-black">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddMoney}
                disabled={addingMoney}
                className="w-full rounded-xl bg-[#00ff88] py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {addingMoney ? 'Processing...' : `Add Rs. ${amount || 0}`}
              </button>

              <p className="text-center text-xs text-gray-400">
                For FYP/demo, this simulates payment. Real apps require JazzCash,
                EasyPaisa, or card gateway verification.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  )
}