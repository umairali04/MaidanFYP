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

  const profileImage = user?.image
    ? user.image.startsWith('http')
      ? user.image
      : `${BASE_URL}${user.image.startsWith('/') ? '' : '/'}${user.image}`
    : null

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-6xl">

          {/* PAGE HEADER */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-emerald-600">
                Account
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage your profile, wallet and account information.
              </p>
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* ==========================================
                  PROFILE CARD
              ========================================== */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:col-span-1">

                {/* PROFILE HEADER */}
                <div className="relative overflow-hidden bg-slate-900 px-6 pb-7 pt-8">

                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

                  <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

                  <div className="relative flex flex-col items-center text-center">

                    {/* PROFILE IMAGE */}
                    <div className="relative mb-4">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-emerald-500 shadow-xl shadow-black/20">
                        {profileImage ? (
                          <img src={profileImage} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-3xl font-extrabold text-white">
                            {initials || 'U'}
                          </span>
                        )}
                      </div>

                      {/* ONLINE / VERIFIED DOT */}
                      <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-slate-900 bg-emerald-500">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
                        </svg>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-white">
                      {user.name}
                    </h2>

                    <p className="mt-1 max-w-full truncate px-4 text-sm text-slate-400">
                      {user.email}
                    </p>

                    <span className="mt-4 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* PROFILE DETAILS */}
                <div className="p-6">

                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Personal Details
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Your account information
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-4">

                    <InfoRow
                      icon="user"
                      label="Full Name"
                      value={user.name}
                    />

                    <InfoRow
                      icon="mail"
                      label="Email"
                      value={user.email}
                    />

                    <InfoRow
                      icon="phone"
                      label="Phone"
                      value={user.phone || 'Not added'}
                    />

                    <InfoRow
                      icon="shield"
                      label="Account Status"
                      value={user.isVerified ? 'Verified' : 'Not Verified'}
                      valueClass={user.isVerified ? 'text-emerald-600' : 'text-red-500'}
                    />

                    <InfoRow
                      icon="calendar"
                      label="Member Since"
                      value={new Date(user.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    />

                  </div>

                  {/* EDIT BUTTON */}
                  <button onClick={() => router.push('/edit_profile')} className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-500 hover:text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4l10.768-10.768a2.5 2.5 0 00-3.536-3.536L4 16.464V20z" />
                    </svg>
                    Edit Profile
                  </button>

                </div>
              </div>

              {/* ==========================================
                  RIGHT SIDE
              ========================================== */}

              <div className="space-y-6 lg:col-span-2">

                {/* WALLET CARD */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-[0_15px_45px_rgba(15,23,42,0.15)] sm:p-8">

                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

                  <div className="absolute -bottom-24 left-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

                  <div className="relative z-10">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect width="20" height="14" x="2" y="5" rx="2" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
                            </svg>
                          </div>

                          <p className="text-sm font-semibold text-slate-400">
                            Digital Wallet
                          </p>
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                          Rs. {wallet?.balance || 0}
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                          Your wallet balance can be used to pay for ground bookings.
                        </p>
                      </div>

                      <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:flex">
                        <svg className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 12h.01M19 12h.01M2 10h20" />
                        </svg>
                      </div>

                    </div>

                    <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Available Balance
                        </p>

                        <p className="mt-1 text-sm font-semibold text-emerald-400">
                          Ready for bookings
                        </p>
                      </div>

                      <button onClick={() => setShowTopup(true)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/30 sm:w-auto">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                        Add Money
                      </button>

                    </div>

                  </div>
                </div>

                {/* TRANSACTIONS */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">

                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Recent Transactions
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Your latest wallet activity
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">

                    {wallet?.transactions?.length > 0 ? (
                      <div className="space-y-3">

                        {wallet.transactions.slice(0, 5).map(t => (
                          <div key={t.id} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-emerald-100 hover:bg-emerald-50/30">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.type === 'ADD_MONEY' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {t.type === 'ADD_MONEY' ? (
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                  </svg>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {t.type === 'ADD_MONEY'
                                    ? 'Money Added'
                                    : t.type === 'BOOKING_PAYMENT'
                                      ? 'Booking Payment'
                                      : t.type}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {t.note || 'Wallet transaction'}
                                </p>
                              </div>

                            </div>

                            <div className="shrink-0 text-right">
                              <p className={`text-sm font-bold ${t.type === 'ADD_MONEY' ? 'text-emerald-600' : 'text-red-500'}`}>
                                {t.type === 'ADD_MONEY' ? '+' : '-'} Rs. {t.amount}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {new Date(t.createdAt).toLocaleDateString('en-PK')}
                              </p>
                            </div>

                          </div>
                        ))}

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
                          </svg>
                        </div>

                        <p className="text-sm font-semibold text-slate-700">
                          No transactions yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Your wallet activity will appear here.
                        </p>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-medium text-slate-500">
                Could not load profile.
              </p>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
    TOP UP MODAL
========================================== */}

      {showTopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6">

          <div className="relative flex max-h-[calc(100vh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:max-h-[calc(100vh-48px)]">

            {/* ==========================================
                MODAL HEADER
            ========================================== */}

            <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">

              <div className="flex items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                      Add Money
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                      Add funds to your wallet
                    </p>
                  </div>

                </div>

                <button onClick={() => setShowTopup(false)} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>

              </div>

            </div>

            {/* ==========================================
                MODAL BODY
            ========================================== */}

            <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">

              {/* AMOUNT */}
              <div className="mb-6">

                <label className="mb-2.5 block text-sm font-bold text-slate-700">
                  Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-600">
                    Rs.
                  </span>

                  <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />

                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Enter the amount you want to add.
                  </p>

                  {amount && Number(amount) > 0 && (
                    <p className="text-xs font-bold text-emerald-600">
                      Rs. {Number(amount).toLocaleString()}
                    </p>
                  )}
                </div>

              </div>

              {/* PAYMENT METHOD */}
              <div>

                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700">
                    Payment Method
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    Select one
                  </span>
                </div>

                <div className="space-y-3">

                  {[
                    {
                      value: 'JazzCash',
                      emoji: '📱',
                      desc: 'Pay using JazzCash account',
                    },
                    {
                      value: 'EasyPaisa',
                      emoji: '💚',
                      desc: 'Pay using EasyPaisa account',
                    },
                    {
                      value: 'Card',
                      emoji: '💳',
                      desc: 'Pay using debit/credit card',
                    },
                  ].map(item => (

                    <button key={item.value} type="button" onClick={() => setMethod(item.value)} className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${method === item.value ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'}`}>

                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${method === item.value ? 'bg-white' : 'bg-slate-50'}`}>
                        {item.emoji}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-bold text-slate-900">
                          {item.value}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {item.desc}
                        </p>

                      </div>

                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${method === item.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>

                        {method === item.value && (
                          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
                          </svg>
                        )}

                      </div>

                    </button>

                  ))}

                </div>

              </div>

              {/* SUMMARY */}
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Amount to add
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      Rs. {amount && Number(amount) > 0 ? Number(amount).toLocaleString() : '0'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Method
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      {method}
                    </p>
                  </div>

                </div>

              </div>

              {/* ADD MONEY BUTTON */}
              <button onClick={handleAddMoney} disabled={addingMoney} className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50">

                {addingMoney ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>

                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>

                    Add Rs. {amount && Number(amount) > 0 ? Number(amount).toLocaleString() : '0'}
                  </>
                )}

              </button>

              {/* FOOTER NOTE */}
              <p className="mt-4 px-3 text-center text-xs leading-5 text-slate-400">
                For FYP/demo purposes, this simulates payment. Real payments require payment gateway verification.
              </p>

            </div>

          </div>

        </div>
      )}

      <Footer />
    </>
  )
}

function InfoRow({ icon, label, value, valueClass = 'text-slate-900' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        {icon === 'user' && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 00-16 0M12 13a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        )}

        {icon === 'mail' && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 7l10 6 10-6" />
          </svg>
        )}

        {icon === 'phone' && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.6 3h2.2l1.4 4-2 1.5a16 16 0 007.3 7.3l1.5-2 4 1.4v2.2A2.6 2.6 0 0118.4 20C9.4 19.4 4.6 14.6 4 5.6A2.6 2.6 0 016.6 3z" />
          </svg>
        )}

        {icon === 'shield' && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          </svg>
        )}

        {icon === 'calendar' && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className={`mt-0.5 truncate text-sm font-semibold ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  )
}