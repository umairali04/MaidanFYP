'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] =useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed')
      }

      document.cookie = `token=${data.token}; path=/`
      document.cookie = `role=${data.user.role}; path=/`

      document.cookie = `name=${encodeURIComponent(data.user.name)}; path=/`
      document.cookie = `email=${encodeURIComponent(data.user.email)}; path=/`

      localStorage.setItem('token', data.token)

      if (data.user.role === "PLAYER") {
        router.push('/')
      } else {
        router.push('/ground_owner_dashboard')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
     <Navbar />
     
     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-[Inter]">

    <div className="grid w-full max-w-6xl min-h-[80vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl md:grid-cols-2">

  {/* LEFT SIDE - IMAGE */}
  <div
  className="hidden md:block md:h-full"
  style={{ height: '80vh' }}
>
  <img
    src="/images/background/bg_3.jpg"
    alt="Sports"
    className="h-full w-full object-cover"
  />
</div>

  {/* Login Card */}
  <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-xl">

          {/* Header */}
          <h1 className="mb-1 text-[1.6rem] font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mb-7 text-sm text-gray-500">
            Sign in to your account
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                autoComplete="email"
                className={`h-11 w-full rounded-lg bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition-all ${
                  focusedField === 'email'
                    ? 'border-[1.5px] border-blue-600'
                    : 'border border-gray-200'
                }`}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">

              <div className="flex items-center justify-between">

                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>

                <a
                  href="/forgot-password"
                  className="text-[13px] font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>

              </div>

              <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`h-11 w-full rounded-lg bg-gray-50 px-4 pr-11 text-[15px] text-gray-900 outline-none transition-all ${
                    focusedField === 'password'
                      ? 'border-[1.5px] border-blue-600'
                      : 'border border-gray-200'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 w-full rounded-lg bg-black text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Create account
            </a>
          </p>

        </div>
      </div>
      </div>
      </div>
      
    </>
  )
}