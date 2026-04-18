'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    //Connecting database
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

      // Save in cookie (IMPORTANT for middleware)
      document.cookie = `token=${data.token}; path=/`
      document.cookie = `role=${data.user.role}; path=/`

      document.cookie = `name=${encodeURIComponent(data.user.name)}; path=/`
      document.cookie = `email=${encodeURIComponent(data.user.email)}; path=/`

      // Optional (keep for frontend use)
      // Save token (if using JWT)
      localStorage.setItem('token', data.token)

      // Redirect
      if (data.user.role === "PLAYER") {
        router.push('/player_dashboard')
      } else {
        router.push('/ground_owner_dashboard')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%',
    height: '44px',
    padding: '0 1rem',
    border: focusedField === field ? '1.5px solid var(--blue, #2563eb)' : '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontFamily: 'Inter, sans-serif',
    color: '#111',
    background: '#fafafa',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      fontFamily: 'Inter, sans-serif',
      padding: '1rem',
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
          Welcome back
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.8rem' }}>
          Sign in to your account
        </p>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.6rem 0.9rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
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
              style={inputStyle('email')}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                Password
              </label>
              <a
                href="/forgot-password"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--blue, #2563eb)',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ ...inputStyle('password'), paddingRight: '2.8rem' }}
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
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#9ca3af',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
              >
                {showPassword ? (
                  /* Eye-off */
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* Eye */
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Create account */}
        <p style={{ marginTop: '1.6rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{ color: 'var(--blue, #2563eb)', fontWeight: '600', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}