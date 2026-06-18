"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/admin_dashboard")
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-[#f4f8f5] flex items-center justify-center px-4">
    <div
      className={`w-full max-w-md transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Brand */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-[0.22em] text-gray-900">
          MAIDAN
        </h1>
        <p className="mt-4 text-sm tracking-wide text-gray-500 uppercase">
          Admin Portal
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200 border border-gray-100 px-8 py-9">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h2>

        <p className="text-gray-500 mt-2 mb-8">
          Sign in to your admin account
        </p>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-[0.18em] text-gray-700 uppercase">
              Email Address
            </label>

            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>

              <input
                type="email"
                required
                placeholder="admin@maidan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 pl-12 text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-[0.18em] text-gray-700 uppercase">
              Password
            </label>

            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>

              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 pl-12 pr-12 text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-extrabold uppercase tracking-[0.22em] text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Login →"}
          </button>
        </form>

        <p className="mt-7 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
          Secured by <span className="font-bold text-green-600">MAIDAN</span> · Admin Access Only
        </p>
      </div>
    </div>
  </div>
)
}