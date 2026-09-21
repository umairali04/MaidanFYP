"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

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
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 font-sans">

      <div className="grid w-full max-w-6xl min-h-[80vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl md:grid-cols-2">

        {/* LEFT SIDE - IMAGE */}
        <div
          className="hidden md:block md:h-full"
          style={{ height: "80vh" }}
        >
          <img
            src="/images/background/bg_3.jpg"
            alt="Sports"
            className="h-full w-full object-cover"
          />
        </div>

        {/* LOGIN SIDE */}
        <div className="relative z-10 flex h-full w-full items-center justify-center bg-white px-6 py-10 md:px-8">

          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>

              <p className="text-sm font-medium text-gray-500">
                Sign in to your admin account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-700">
                  Email Address
                </label>

                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600"
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
                    placeholder="admin@maidaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 pl-12 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 mt-3 block text-xs font-bold uppercase tracking-[0.16em] text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600"
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
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 pl-12 pr-12 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-green-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Authenticating..." : "Login →"}
              </button>

            </form>

            {/* Footer */}
            <p className="mt-8 border-t border-gray-100 pt-5 text-center text-xs font-medium text-gray-400">
              Secured by{" "}
              <span className="font-bold text-green-600">
                MAIDAAN
              </span>{" "}
              · Admin Access Only
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}