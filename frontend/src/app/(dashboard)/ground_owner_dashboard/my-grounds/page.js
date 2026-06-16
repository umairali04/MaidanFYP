'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const SPORT_ICONS = {
  CRICKET: '🏏',
  FOOTBALL: '⚽',
  HOCKEY: '🏑',
  BADMINTON: '🏸',
  TENNIS: '🎾',
  SQUASH: '🟡',
}

export default function MyGrounds() {
  const router = useRouter()
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getToken = () =>
    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] ||
    localStorage.getItem('token')

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/grounds`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setGrounds(data.grounds)
      } catch (err) {
        setError(err.message || 'Failed to load your grounds.')
      } finally {
        setLoading(false)
      }
    }

    fetchGrounds()
  }, [])

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 bg-gray-800 rounded w-48 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">❌ {error}</p>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white underline text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">My Grounds</h1>
            <p className="text-gray-400 text-sm mt-1">
              {grounds.length} ground{grounds.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {/* Empty state */}
        {grounds.length === 0 ? (
          <div className="text-center py-24 bg-[#111]/80 border border-gray-800 rounded-2xl">
            <p className="text-5xl mb-4">🏟️</p>
            <p className="text-gray-300 text-lg font-semibold mb-1">No grounds yet</p>
            <p className="text-gray-500 text-sm">Add your first ground to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grounds.map(ground => (
              <GroundCard
                key={ground.id}
                ground={ground}
                onEdit={() => router.push(`/owner/grounds/${ground.id}/edit`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Ground Card ─────────────────────────────────────────────────────────────
function GroundCard({ ground, onEdit }) {
  const icon = SPORT_ICONS[ground.sportType] || '🏟️'
  const coverImage = ground.images?.[0] || null

  return (
    <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/40 transition-all group flex flex-col">

      {/* Image */}
      <div className="relative h-44 bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={ground.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <span className="text-5xl opacity-30">{icon}</span>
        )}

        {/* Active badge */}
        <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full border ${
          ground.isActive
            ? 'bg-green-500/20 border-green-500/50 text-green-400'
            : 'bg-red-500/20 border-red-500/50 text-red-400'
        }`}>
          {ground.isActive ? 'Active' : 'Inactive'}
        </span>

        {/* Sport type badge */}
        <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full bg-black/60 border border-gray-700 text-gray-300">
          {icon} {ground.sportType.charAt(0) + ground.sportType.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-base font-black text-white leading-tight">{ground.name}</h3>

        <div className="space-y-1.5 text-sm text-gray-400">
          <p>📍 {ground.city} — {ground.location}</p>
          <p>🕐 {ground.openTime} – {ground.closeTime}</p>
          <p>💰 <span className="text-green-400 font-bold">₨ {Number(ground.pricePerHour).toLocaleString()}</span> / hour</p>
          {ground._count && (
            <p>📋 {ground._count.bookings} booking{ground._count.bookings !== 1 ? 's' : ''}</p>
          )}
          {ground.reviews?.length > 0 && (
            <p>⭐ {(ground.reviews.reduce((s, r) => s + r.rating, 0) / ground.reviews.length).toFixed(1)} ({ground.reviews.length} review{ground.reviews.length !== 1 ? 's' : ''})</p>
          )}
        </div>

        {/* Facilities */}
        {ground.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {ground.facilities.slice(0, 4).map(f => (
              <span key={f} className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-full">
                {f}
              </span>
            ))}
            {ground.facilities.length > 4 && (
              <span className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-500 rounded-full">
                +{ground.facilities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="mt-auto w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-black transition-colors"
        >
          ✏️ Edit Ground
        </button>
      </div>

    </div>
  )
}