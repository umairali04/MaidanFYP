'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = document.cookie
        .split('; ')
        .find(r => r.startsWith('token='))
        ?.split('=')[1]

    if (!token) {
        router.push('/login')
        return
    }

    fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
        Authorization: `Bearer ${token}`
        }
    })
        .then(r => r.json())
        .then(d => {
        if (d.user) setUser(d.user)
        })
        .finally(() => setLoading(false))
    }, [router])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 32 }}>My Profile</h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #00ff88', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
            </div>
          ) : user ? (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden' }}>

              {/* Avatar header */}
              <div style={{ background: '#0f0f0f', padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#0f0f0f', margin: '0 auto 12px' }}>
                  {initials}
                </div>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>{user.name}</h2>
                <span style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {user.role}
                </span>
              </div>

              {/* Info rows */}
              <div style={{ padding: 24 }}>
                {[
                  { label: 'Full Name',  value: user.name },
                  { label: 'Email',      value: user.email },
                  { label: 'Phone',      value: user.phone || 'Not added' },
                  { label: 'Role',       value: user.role },
                  { label: 'Verified',   value: user.isVerified ? '✅ Verified' : '❌ Not Verified' },
                  { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: 14 }}>{row.label}</span>
                    <span style={{ color: '#111', fontSize: 14, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}

                <button onClick={() => router.push('/edit_profile')}
                  style={{ width: '100%', marginTop: 24, padding: 14, background: '#00ff88', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center' }}>Could not load profile.</p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
            to {
            transform: rotate(360deg);
            }
        }
        `}
    </style>
      <Footer />
    </>
  )
}