'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getTokenFromCookie } from '../lib/connectionsApi' // adjust path to match your project

const SPORTS = [
  { value: '', label: 'All Sports' },
  { value: 'CRICKET', label: 'Cricket' },
  { value: 'FOOTBALL', label: 'Football' },
  { value: 'HOCKEY', label: 'Hockey' },
  { value: 'BADMINTON', label: 'Badminton' },
  { value: 'TENNIS', label: 'Tennis' },
  { value: 'SQUASH', label: 'Squash' },
]

const FACTOR_LABELS = {
  sportMatch: 'Sport fit',
  locationFit: 'Nearby',
  priceFit: 'Price fit',
  timePatternFit: 'Usual time',
}

// Fallback gradient per sport when a ground has no image — light, airy
// tones instead of the old near-black gradients.
const SPORT_GRADIENTS = {
  CRICKET: 'from-emerald-100 via-emerald-50 to-white',
  FOOTBALL: 'from-lime-100 via-green-50 to-white',
  HOCKEY: 'from-sky-100 via-slate-50 to-white',
  BADMINTON: 'from-fuchsia-100 via-purple-50 to-white',
  TENNIS: 'from-yellow-100 via-amber-50 to-white',
  SQUASH: 'from-orange-100 via-red-50 to-white',
}

function ScoreBadge({ score }) {
  const pct = Math.round(score * 100)
  const tier =
    pct >= 75
      ? 'bg-emerald-500 text-white'
      : pct >= 50
      ? 'bg-amber-400 text-amber-950'
      : 'bg-zinc-300 text-zinc-700'
  return (
    <span className={`absolute top-2.5 left-2.5 z-10 rounded-md px-2 py-1 text-xs font-bold shadow-sm ${tier}`}>
      {pct}% match
    </span>
  )
}

function FactorBar({ label, value }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="w-[56px] shrink-0 text-[10px] text-zinc-500">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-[10px] text-zinc-500">{pct}%</span>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (isSameDay(d, today)) return 'Today'
  if (isSameDay(d, tomorrow)) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function to12Hour(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

// Card: white surface, soft shadow, green accents. Lifts and gains a
// slightly stronger shadow + emerald ring on hover instead of a glow.
function RecommendationCard({ rec, onView }) {
  const gradient = SPORT_GRADIENTS[rec.sportType] || 'from-zinc-100 via-zinc-50 to-white'

  return (
    <div
      className="group w-[240px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10"
      onClick={() => onView(rec)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <ScoreBadge score={rec.score} />
        {rec.image ? (
          <img
            src={rec.image}
            alt={rec.groundName}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-2 left-2.5 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-emerald-300 backdrop-blur-sm">
          {formatDate(rec.date)} · {to12Hour(rec.startTime)}
        </span>
      </div>

      {/* Details */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[0.92rem] font-semibold text-zinc-900">{rec.groundName}</h3>
          <span className="shrink-0 text-[0.82rem] font-semibold text-emerald-600">Rs {rec.pricePerHour}/hr</span>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {rec.sportType.charAt(0) + rec.sportType.slice(1).toLowerCase()} · {rec.city}
        </p>

        <div className="mt-3 flex flex-col gap-1.5">
          {Object.entries(rec.breakdown).map(([key, val]) => (
            <FactorBar key={key} label={FACTOR_LABELS[key] || key} value={val} />
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onView(rec) }}
          className="mt-3.5 w-full rounded-md border border-emerald-500 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white"
        >
          View ground →
        </button>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="w-[240px] shrink-0 snap-start overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="aspect-video w-full animate-pulse bg-zinc-100" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-zinc-100" />
        <div className="mt-2 h-8 w-full animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  )
}

export default function SlotRecommendations({ defaultLimit = 8 }) {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sportType, setSportType] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const railRef = useRef(null)

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchRecommendations = useCallback(async (sport) => {
    const token = getTokenFromCookie()

    if (!token) {
      setRecommendations([])
      setError('')
      setLoggedIn(false)
      setLoading(false)
      return
    }

    setLoggedIn(true)
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({ limit: defaultLimit })
      if (sport) params.append('sportType', sport)

      const res = await fetch(`${BASE_URL}/api/recommendations/slots?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!res.ok || !data.success) throw new Error(data.message || 'Could not load recommendations')

      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [BASE_URL, defaultLimit])

  useEffect(() => {
    fetchRecommendations(sportType)
  }, [sportType, fetchRecommendations])

  useEffect(() => {
    const recheck = () => {
      if (!getTokenFromCookie() && loggedIn) {
        setRecommendations([])
        setLoggedIn(false)
      }
    }
    window.addEventListener('focus', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => {
      window.removeEventListener('focus', recheck)
      document.removeEventListener('visibilitychange', recheck)
    }
  }, [loggedIn])

  const handleView = (rec) => {
    router.push(`/ground/${rec.groundId}`)
  }

  const scrollRail = (direction) => {
    if (!railRef.current) return
    railRef.current.scrollBy({ left: direction * 256, behavior: 'smooth' })
  }

  if (!loading && !loggedIn) return null

  return (
    <section className="group/section relative bg-zinc-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Matched to your game</h2>
            <p className="mt-1 text-sm text-zinc-500">Slots matched to how, where, and when you usually play</p>
          </div>
        </div>

        {/* Sport filter chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {SPORTS.map(s => {
            const active = sportType === s.value
            return (
              <button
                key={s.value || 'all'}
                onClick={() => setSportType(s.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Rail wrapper */}
        {!error && (recommendations.length > 0 || loading) && (
          <div className="relative">
            {/* Left/right edge fades — matched to the light background now */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-zinc-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-zinc-50 to-transparent" />

            {/* Arrows */}
            <button
              aria-label="Scroll left"
              onClick={() => scrollRail(-1)}
              className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 text-zinc-600 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:bg-white group-hover/section:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollRail(1)}
              className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 text-zinc-600 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:bg-white group-hover/section:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>

            <div
              ref={railRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {loading && Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}

              {!loading && recommendations.map((rec, i) => (
                <RecommendationCard key={`${rec.groundId}-${rec.startTime}-${i}`} rec={rec} onView={handleView} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-9 text-center">
            <p className="mb-1 text-sm font-semibold text-zinc-600">No open slots match this filter right now</p>
            <p className="text-xs text-zinc-400">Try a different sport, or check back once more grounds open up their schedules.</p>
          </div>
        )}
      </div>
    </section>
  )
}