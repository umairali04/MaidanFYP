'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GroundsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sport = searchParams.get('sport')

  const [grounds, setGrounds]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [city, setCity]         = useState('')
  const [search, setSearch]     = useState('')

  function fetchGrounds() {
    setLoading(true)
    const params = new URLSearchParams()
    if (sport)  params.append('sport', sport)
    if (search) params.append('city', search)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grounds?${params}`)
      .then(r => r.json())
      .then(data => setGrounds(data.grounds || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGrounds()
  }, [sport])

  function handleSearch(e) {
    e.preventDefault()
    fetchGrounds()
  }

  function handleCardClick(id) {
    router.push(`/ground/${id}`)
  }

  const sportLabel = sport
    ? sport.charAt(0) + sport.slice(1).toLowerCase()
    : 'All'

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">

        {/* Header Banner */}
        <div className="bg-[#0f0f0f] py-12 px-5 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {sportLabel} Grounds
          </h1>
          <p className="text-gray-400 text-sm">Find and book the best courts near you</p>

          {/* Search by City */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 max-w-md mx-auto mt-6"
          >
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by city e.g. Lahore..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm outline-none focus:border-[#00ff88] transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00ff88] text-black font-bold rounded-lg text-sm hover:brightness-110 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto px-5 py-10">

          {/* Count */}
          {!loading && (
            <p className="text-gray-400 text-sm mb-6">
              {grounds.length} {grounds.length === 1 ? 'ground' : 'grounds'} found
              {search ? ` in "${search}"` : ''}
            </p>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200" />
                  <div className="p-4 flex flex-col gap-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>

          ) : grounds.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No grounds found</h3>
              <p className="text-gray-400 text-sm">Try a different city or sport</p>
            </div>

          ) : (
            /* Ground Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {grounds.map(ground => (
                <div
                  key={ground.id}
                  onClick={() => handleCardClick(ground.id)}
                  className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={ground.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6'}
                      alt={ground.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />

                    {/* Sport badge */}
                    <div className="absolute top-3 left-3 bg-[#00ff88] text-black text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {ground.sportType}
                    </div>

                    {/* Active badge */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                      {ground.isActive ? '🟢 Open' : '🔴 Closed'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-[#111] text-base mb-1">{ground.name}</h3>
                    <p className="text-gray-400 text-sm">📍 {ground.location}, {ground.city}</p>

                    {/* Rating */}
                    {ground.reviews?.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {(ground.reviews.reduce((a, r) => a + r.rating, 0) / ground.reviews.length).toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-xs">({ground.reviews.length} reviews)</span>
                      </div>
                    )}

                    {/* Facilities */}
                    {ground.facilities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {ground.facilities.slice(0, 3).map(f => (
                          <span key={f} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {f}
                          </span>
                        ))}
                        {ground.facilities.length > 3 && (
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            +{ground.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[#00cc6a] font-bold text-base">Rs. {ground.pricePerHour}</span>
                        <span className="text-gray-400 text-xs">/hr</span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleCardClick(ground.id) }}
                        className="px-4 py-1.5 bg-[#00ff88] text-black text-xs font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}