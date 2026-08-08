'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GroundsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sport = searchParams.get('sport')

  const [grounds, setGrounds]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selectedGround, setSelectedGround] = useState(null)  // ← controls modal

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

  useEffect(() => { fetchGrounds() }, [sport])

  function handleSearch(e) {
    e.preventDefault()
    fetchGrounds()
  }

  function handleBookNow(e, groundId) {
    e.stopPropagation()
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      router.push(`/login?redirect=/ground/${groundId}`)
    } else {
      router.push(`/ground/${groundId}`)
    }
  }

  const sportLabel = sport
    ? sport.charAt(0) + sport.slice(1).toLowerCase()
    : 'All'

  const avgRating = (reviews) => {
    if (!reviews?.length) return null
    return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
  }

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
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mx-auto mt-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by city e.g. Lahore..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm outline-none focus:border-[#00ff88] transition-colors"
            />
            <button type="submit" className="px-5 py-2.5 bg-[#00ff88] text-black font-bold rounded-lg text-sm hover:brightness-110 transition-all cursor-pointer">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto px-5 py-10">
          {!loading && (
            <p className="text-gray-400 text-sm mb-6">
              {grounds.length} {grounds.length === 1 ? 'ground' : 'grounds'} found
              {search ? ` in "${search}"` : ''}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
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
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No grounds found</h3>
              <p className="text-gray-400 text-sm">Try a different city or sport</p>
            </div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {grounds.map(ground => (
                <div
                  key={ground.id}
                  onClick={() => setSelectedGround(ground)}   // ← open modal
                  className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={ground.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6'}
                      alt={ground.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                    <div className="absolute top-3 left-3 bg-[#00ff88] text-black text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {ground.sportType}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                      {ground.isActive ? '🟢 Open' : '🔴 Closed'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#111] text-base mb-1">{ground.name}</h3>
                    <p className="text-gray-400 text-sm">📍 {ground.location}, {ground.city}</p>
                    {ground.reviews?.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-sm font-semibold text-gray-700">{avgRating(ground.reviews)}</span>
                        <span className="text-gray-400 text-xs">({ground.reviews.length} reviews)</span>
                      </div>
                    )}
                    {ground.facilities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {ground.facilities.slice(0, 3).map(f => (
                          <span key={f} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                        {ground.facilities.length > 3 && (
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{ground.facilities.length - 3} more</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[#00cc6a] font-bold text-base">Rs. {ground.pricePerHour}</span>
                        <span className="text-gray-400 text-xs">/hr</span>
                      </div>
                      <button
                        onClick={e => handleBookNow(e, ground.id)}
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

      {/* ============ MODAL ============ */}
      {selectedGround && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedGround(null)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl mt-30 mb-10 max-h-[100vh] sm:max-h-[90vh] overflow-y-auto sm:rounded-3xl rounded-t-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              <img
                src={selectedGround.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6'}
                alt={selectedGround.name}
                className="w-full h-52 sm:h-64 object-cover sm:rounded-t-3xl rounded-t-3xl"
              />
              <div className="absolute inset-0 bg-black/25 sm:rounded-t-3xl rounded-t-3xl" />

              {/* Close button */}
              <button
                onClick={() => setSelectedGround(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-black font-bold text-base shadow-md transition-all cursor-pointer z-10"
              >
                ✕
              </button>

              {/* Mobile drag handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/60 rounded-full sm:hidden" />

              {/* Badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full">
                  {selectedGround.sportType}
                </span>
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  {selectedGround.isActive ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">

              {/* Name + Rating */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#111] leading-tight">
                  {selectedGround.name}
                </h2>
                {selectedGround.reviews?.length > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-lg shrink-0">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-bold text-gray-700">{avgRating(selectedGround.reviews)}</span>
                    <span className="text-gray-400 text-xs">({selectedGround.reviews.length})</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <p className="text-gray-400 text-sm mb-4">
                📍 {selectedGround.location}, {selectedGround.city}
              </p>

              {/* Description */}
              {selectedGround.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-5 pb-5 border-b border-gray-100">
                  {selectedGround.description}
                </p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-[11px] mb-1">Price</p>
                  <p className="text-[#00cc6a] font-bold text-sm sm:text-base">
                    Rs. {selectedGround.pricePerHour}
                    <span className="text-gray-400 text-[10px] font-normal">/hr</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-[11px] mb-1">Hours</p>
                  <p className="text-[#111] font-bold text-xs sm:text-sm">
                    {selectedGround.openTime} – {selectedGround.closeTime}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-[11px] mb-1">Slot</p>
                  <p className="text-[#111] font-bold text-xs sm:text-sm">
                    {selectedGround.slotDuration} min
                  </p>
                </div>
              </div>

              {/* Facilities */}
              {selectedGround.facilities?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-[#111] mb-2.5">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGround.facilities.map(f => (
                      <span
                        key={f}
                        className="text-xs bg-[#00ff88]/10 text-[#00aa55] font-semibold px-3 py-1.5 rounded-full border border-[#00ff88]/20"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {selectedGround.reviews?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#111] mb-3">
                    Reviews
                    <span className="text-gray-400 font-normal ml-1">({selectedGround.reviews.length})</span>
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {selectedGround.reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-xs font-bold text-[#00aa55]">
                              {r.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-semibold text-[#111]">
                              {r.user?.name || 'User'}
                            </span>
                          </div>
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <span key={star} className={`text-xs ${star <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-gray-500 text-xs leading-relaxed">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Now CTA */}
              <button
                onClick={e => handleBookNow(e, selectedGround.id)}
                className="w-full py-3.5 bg-[#00ff88] text-black font-bold rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                Book Now — Rs. {selectedGround.pricePerHour}/hr
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  )
}