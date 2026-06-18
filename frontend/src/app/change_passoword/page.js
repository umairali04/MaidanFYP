'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function ChangePasswordPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function getToken() {
    return document.cookie
      .split('; ')
      .find(r => r.startsWith('token='))
      ?.split('=')[1]
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    const token = getToken()

    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      setSuccess(true)
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function PasswordInput({ field, name, placeholder }) {
    return (
      <div className="relative">
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={form[name]}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              [name]: e.target.value,
            }))
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#00ff88] focus:bg-white"
        />

        <button
          type="button"
          onClick={() =>
            setShowPw(prev => ({
              ...prev,
              [field]: !prev[field],
            }))
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-400 hover:text-gray-600"
        >
          {showPw[field] ? '🙈' : '👁️'}
        </button>
      </div>
    )
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={() => router.back()}
            className="mb-5 cursor-pointer bg-transparent p-0 text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back
          </button>

          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Change Password
          </h1>

          <p className="mb-8 text-sm text-gray-500">
            Keep your account secure
          </p>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-7">
            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
                ✅ Password changed successfully!
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Current Password
                </label>
                <PasswordInput
                  field="current"
                  name="currentPassword"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <PasswordInput
                  field="new"
                  name="newPassword"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <PasswordInput
                  field="confirm"
                  name="confirmPassword"
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full cursor-pointer rounded-xl bg-[#00ff88] py-4 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}