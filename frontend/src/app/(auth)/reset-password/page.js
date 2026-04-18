'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputs = useRef([])

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputs.current[index + 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const userId = localStorage.getItem('resetUserId')
    const finalOtp = otp.join('')

    if (!userId) {
      setError('Session expired. Try again.')
      return
    }

    if (finalOtp.length !== 6) {
      setError('Enter complete OTP')
      return
    }

    if (!password) {
      setError('Enter new password')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          otp: finalOtp,
          newPassword: password,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      alert('Password reset successful')

      localStorage.removeItem('resetUserId')

      router.push('/login')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md text-center">

        <h2 className="text-2xl font-bold text-gray-800">
          Reset Password
        </h2>

        <p className="text-gray-500 text-sm mt-2">
          Enter OTP and new password
        </p>

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* OTP */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          {/* Password */}
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

        </form>
      </div>
    </div>
  )
}