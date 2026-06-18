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

      <main className="min-h-screen bg-gray-50 px-4 py-10 font-sans">
        <div className="mx-auto max-w-md">
          <button
            onClick={() => router.back()}
            className="mb-5 cursor-pointer border-none bg-transparent p-0 text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back
          </button>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Edit Profile
          </h1>

          <p className="mb-8 text-sm text-gray-500">
            Update your personal information
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#00ff88] border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-7">
              {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
                  ✅ Profile updated successfully!
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="flex flex-col gap-5">
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#00ff88] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={e =>
                      setForm(prev => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#00ff88] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-2 w-full cursor-pointer rounded-xl bg-[#00ff88] py-3.5 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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