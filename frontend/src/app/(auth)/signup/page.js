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

  const inputStyle = (field, extraPaddingRight = false) => {
    const hasError = touched[field] && (fieldError(field) || (field === 'password' && form.password && passwordErrors.length > 0))
    return {
      width: '100%',
      height: '44px',
      padding: extraPaddingRight ? '0 2.8rem 0 1rem' : '0 1rem',
      border: hasError
        ? '1.5px solid #ef4444'
        : focusedField === field
          ? '1.5px solid var(--blue, #2563eb)'
          : '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontFamily: 'Inter, sans-serif',
      color: '#111',
      background: '#fafafa',
      outline: 'none',
      transition: 'border 0.2s',
      boxSizing: 'border-box',
    }
  }

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box',
      }}>

        {/* Header */}
        <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#111', margin: '0 0 0.3rem' }}>
          Create account
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.8rem' }}>
          Join us — it only takes a minute
        </p>

        {/* Submit error */}
        {submitError && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.6rem 0.9rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} noValidate>

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              onFocus={() => setFocusedField('name')}
              onBlur={() => { setFocusedField(null); handleBlur('name')() }}
              placeholder="John Doe"
              autoComplete="name"
              style={inputStyle('name')}
            />
            {fieldError('name') && <p style={{ margin: 0, fontSize: '0.78rem', color: '#ef4444' }}>{fieldError('name')}</p>}
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              onFocus={() => setFocusedField('email')}
              onBlur={() => { setFocusedField(null); handleBlur('email')() }}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle('email')}
            />
            {fieldError('email') && <p style={{ margin: 0, fontSize: '0.78rem', color: '#ef4444' }}>{fieldError('email')}</p>}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => { setFocusedField(null); handleBlur('password')() }}
                placeholder="••••••••"
                autoComplete="new-password"
                style={inputStyle('password', true)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#9ca3af',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Password rules */}
            {touched.password && form.password && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
                {[
                  { label: 'At least 6 characters', ok: form.password.length >= 6 },
                  { label: 'At least one special character', ok: SPECIAL_CHAR.test(form.password) },
                ].map(rule => (
                  <p key={rule.label} style={{
                    margin: 0,
                    fontSize: '0.78rem',
                    color: rule.ok ? '#16a34a' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    {rule.ok ? '✓' : '✗'} {rule.label}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyle}>Phone number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => { setFocusedField(null); handleBlur('phone')() }}
              placeholder="+92 300 1234567"
              autoComplete="tel"
              style={inputStyle('phone')}
            />
            {fieldError('phone') && <p style={{ margin: 0, fontSize: '0.78rem', color: '#ef4444' }}>{fieldError('phone')}</p>}
          </div>

          {/* Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={labelStyle}>Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { value: 'PLAYER', label: 'Player' },
                { value: 'GROUND_OWNER', label: 'Ground Owner' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setForm(p => ({ ...p, role: opt.value })); setTouched(p => ({ ...p, role: true })) }}
                  style={{
                    height: '44px',
                    border: form.role === opt.value ? '1.5px solid var(--blue, #2563eb)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: form.role === opt.value ? 'rgba(37, 99, 235, 0.08)' : '#fafafa',
                    color: form.role === opt.value ? 'var(--blue, #2563eb)' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: form.role === opt.value ? '600' : '500',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {touched.role && !form.role && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#ef4444' }}>Please select a role.</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1d4ed8' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--blue, #2563eb)' }}
            style={{
              marginTop: '0.4rem',
              height: '44px',
              width: '100%',
              background: 'var(--blue, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background 0.2s, opacity 0.2s',
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Already have account */}
        <p style={{ marginTop: '1.6rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <a
            href="/login"
            style={{ color: 'var(--blue, #2563eb)', fontWeight: '600', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}