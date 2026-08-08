'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function EditProfilePage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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

    fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setForm({
            name: d.user.name || '',
            phone: d.user.phone || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    const token = getToken()

    try {
      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Update failed')
      }

      document.cookie = `name=${encodeURIComponent(form.name)}; path=/`
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8fafc] px-4 py-16 font-sans">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => router.back()}
            className="mb-6 cursor-pointer text-sm font-medium text-gray-500 transition hover:text-gray-800"
          >
            ← Back
          </button>

          {loading ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-20 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="flex justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00ff88] border-t-transparent" />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:p-10">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#00ff88]/10">
                  <svg
                    className="h-8 w-8 text-[#00cc6f]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.121 17.804A9 9 0 1118.879 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Edit Profile
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Update your personal information and keep your account up to date.
                  </p>
                </div>
              </div>

              {success && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  ✅ Profile updated successfully!
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-7">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <input
                    value={form.name}
                    onChange={e =>
                      setForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#00ff88] focus:bg-white focus:ring-4 focus:ring-[#00ff88]/15"
                  />
                </div>

                <div className='mt-2 mb-2'>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>

                  <input
                    value={form.phone}
                    onChange={e =>
                      setForm(prev => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+92 300 1234567"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#00ff88] focus:bg-white focus:ring-4 focus:ring-[#00ff88]/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full cursor-pointer rounded-2xl bg-[#00ff88] py-4 text-base font-bold text-black shadow-lg shadow-green-200 transition hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}