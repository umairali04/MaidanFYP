'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyOtpPage() {
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔥 NEW STATES
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(60)

  const inputs = useRef([])

  // 🔥 TIMER EFFECT
  useEffect(() => {
    if (timer === 0) return

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const userId = localStorage.getItem('otpUserId')
    const finalOtp = otp.join('')

    if (finalOtp.length !== 6) {
      setError('Enter complete OTP')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: finalOtp }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Invalid OTP')

      alert('Account verified successfully!')
      localStorage.removeItem('otpUserId')
      router.push('/login')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 RESEND FUNCTION
  const handleResend = async () => {
    const userId = localStorage.getItem('otpUserId')

    if (!userId) {
      setError('Session expired. Please signup again.')
      return
    }

    try {
      setResendLoading(true)

      const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      // reset OTP boxes
      setOtp(['', '', '', '', '', ''])

      // restart timer
      setTimer(60)

      alert('OTP resent successfully!')

    } catch (err) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md text-center">
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Verify OTP
            </h2>

            <p className="text-gray-500 text-xs sm:text-sm mt-2">
            Enter the 6-digit code sent to your account
            </p>

            {error && (
            <p className="text-red-500 text-xs sm:text-sm mt-3">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
            
            {/* OTP Boxes */}
            <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    ref={(el) => (inputs.current[index] = el)}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="
                    w-10 h-10 
                    sm:w-12 sm:h-12 
                    text-center text-base sm:text-lg 
                    border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                />
                ))}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
            >
                {loading ? 'Verifying...' : 'Verify'}
            </button>
            </form>

            {/* Resend Section */}
            <p className="text-xs sm:text-sm text-gray-500 mt-4">
            Didn’t receive code?{' '}
            <button
                onClick={handleResend}
                disabled={timer > 0 || resendLoading}
                className={`font-medium ${
                timer > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:underline'
                }`}
            >
                {resendLoading
                ? 'Sending...'
                : timer > 0
                ? `Resend in ${timer}s`
                : 'Resend OTP'}
            </button>
            </p>

        </div>
    </div>
  )
}