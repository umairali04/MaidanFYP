'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SPECIAL_CHAR = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/

function validatePassword(pw) {
  const errors = []
  if (pw.length < 6) errors.push('At least 6 characters')
  if (!SPECIAL_CHAR.test(pw)) errors.push('At least one special character')
  return errors
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
const BASE_URL = process.env.NEXT_PUBLIC_API_URL
export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const passwordErrors = validatePassword(form.password)

  const handleChange = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const handleBlur = (field) => () => setTouched(p => ({ ...p, [field]: true }))

  const fieldError = (field) => {
    if (!touched[field]) return null
    if (!form[field]) return 'This field is required.'
    if (field === 'email' && !/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.'
    if (field === 'phone' && !/^\+?[0-9\s\-]{7,15}$/.test(form.phone)) return 'Enter a valid phone number.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setTouched({ name: true, email: true, password: true, phone: true, role: true })

    if (!form.name || !form.email || !form.password || !form.phone || !form.role) {
      setSubmitError('Please fill in all fields.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setSubmitError('Enter a valid email address.')
      return
    }
    if (passwordErrors.length > 0) {
      setSubmitError('Please fix password errors before continuing.')
      return
    }
    if (!/^\+?[0-9\s\-]{7,15}$/.test(form.phone)) {
      setSubmitError('Enter a valid phone number.')
      return
    }

    try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || 'Signup failed')
    }

    localStorage.setItem('otpUserId', data.userId)

    alert('Otp is send to you on Email!')

    // redirect to OTP page
    router.push('/verify-otp')

    } catch (err) {
    setSubmitError(err.message)
    } finally {
    setLoading(false)
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-[Inter]">

    <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-2">

      {/* LEFT SIDE - IMAGE */}
      <div className="h-56 md:h-auto md:min-h-[700px]">
        <img
          src="/images/background/bg_3.jpg"
          alt="Sports"
          className="h-full w-full object-cover"
        />
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="p-6 sm:p-8 lg:p-12">

      {/* Header */}
      <h1 className="mb-1 text-3xl font-bold text-gray-900">
        Create account
      </h1>

      <p className="mb-8 text-sm text-gray-500">
        Join us — it only takes a minute
      </p>

      {/* Submit Error */}
      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5"
      >

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Full name
          </label>

          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            onFocus={() => setFocusedField('name')}
            onBlur={() => {
              setFocusedField(null)
              handleBlur('name')()
            }}
            placeholder="John Doe"
            autoComplete="name"
            className={`h-11 w-full rounded-lg bg-gray-50 px-4 text-sm outline-none transition-all
            ${
              touched.name && fieldError('name')
                ? 'border border-red-500'
                : focusedField === 'name'
                ? 'border border-blue-600'
                : 'border border-gray-300'
            }`}
          />

          {fieldError('name') && (
            <p className="text-xs text-red-500">
              {fieldError('name')}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            onFocus={() => setFocusedField('email')}
            onBlur={() => {
              setFocusedField(null)
              handleBlur('email')()
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className={`h-11 w-full rounded-lg bg-gray-50 px-4 text-sm outline-none transition-all
            ${
              touched.email && fieldError('email')
                ? 'border border-red-500'
                : focusedField === 'email'
                ? 'border border-blue-600'
                : 'border border-gray-300'
            }`}
          />

          {fieldError('email') && (
            <p className="text-xs text-red-500">
              {fieldError('email')}
            </p>
          )}
        </div>
                {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              onFocus={() => setFocusedField('password')}
              onBlur={() => {
                setFocusedField(null)
                handleBlur('password')()
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`h-11 w-full rounded-lg bg-gray-50 px-4 pr-11 text-sm outline-none transition-all
              ${
                touched.password &&
                (fieldError('password') ||
                  (form.password && passwordErrors.length > 0))
                  ? 'border border-red-500'
                  : focusedField === 'password'
                  ? 'border border-blue-600'
                  : 'border border-gray-300'
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {touched.password && form.password && (
            <div className="mt-1 flex flex-col gap-1">
              {[
                {
                  label: 'At least 6 characters',
                  ok: form.password.length >= 6,
                },
                {
                  label: 'At least one special character',
                  ok: SPECIAL_CHAR.test(form.password),
                },
              ].map(rule => (
                <p
                  key={rule.label}
                  className={`flex items-center gap-1 text-xs ${
                    rule.ok ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {rule.ok ? '✓' : '✗'} {rule.label}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Phone number
          </label>

          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => {
              setFocusedField(null)
              handleBlur('phone')()
            }}
            placeholder="+92 300 1234567"
            autoComplete="tel"
            className={`h-11 w-full rounded-lg bg-gray-50 px-4 text-sm outline-none transition-all
            ${
              touched.phone && fieldError('phone')
                ? 'border border-red-500'
                : focusedField === 'phone'
                ? 'border border-blue-600'
                : 'border border-gray-300'
            }`}
          />

          {fieldError('phone') && (
            <p className="text-xs text-red-500">
              {fieldError('phone')}
            </p>
          )}
        </div>
                {/* Role */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Role
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { value: 'PLAYER', label: 'Player' },
              { value: 'GROUND_OWNER', label: 'Ground Owner' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setForm((p) => ({ ...p, role: opt.value }))
                  setTouched((p) => ({ ...p, role: true }))
                }}
                className={`h-11 rounded-lg border text-sm font-medium transition-all
                ${
                  form.role === opt.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {touched.role && !form.role && (
            <p className="text-xs text-red-500">
              Please select a role.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`mt-2 h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold uppercase tracking-wide text-white transition-all
          ${
            loading
              ? 'cursor-not-allowed opacity-60'
              : 'hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-7 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-semibold text-blue-600 transition hover:underline"
        >
          Sign in
        </a>
      </p>
      </div>

    </div>

</div>
)
}