"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function GroundsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sport = searchParams.get("sport");

  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGround, setSelectedGround] = useState(null);

  function fetchGrounds() {
    setLoading(true);

    const params = new URLSearchParams();

    if (sport) params.append("sport", sport);
    if (search) params.append("city", search);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grounds?${params}`)
      .then((r) => r.json())
      .then((data) => setGrounds(data.grounds || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchGrounds();
  }, [sport]);

  function handleSearch(e) {
    e.preventDefault();
    fetchGrounds();
  }

  function handleBookNow(e, groundId) {
    e.stopPropagation();

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      router.push(`/login?redirect=/ground/${groundId}`);
    } else {
      router.push(`/ground/${groundId}`);
    }
  }

  const sportLabel = sport ? sport.charAt(0) + sport.slice(1).toLowerCase() : "All";

  const avgRating = (reviews) => {
    if (!reviews?.length) return null;

    return (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7fbf9] text-slate-900">
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-8 text-center sm:py-10 lg:py-11">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Discover Grounds
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              Find the perfect <span className="text-emerald-600">ground</span>
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500 sm:text-sm">
              Search sports grounds by city, explore facilities and book your next game.
            </p>

            {sport && (
              <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 shadow-sm">
                <span className="text-sm">
                  {sport === "FOOTBALL"
                    ? "⚽"
                    : sport === "CRICKET"
                    ? "🏏"
                    : sport === "TENNIS"
                    ? "🎾"
                    : sport === "BADMINTON"
                    ? "🏸"
                    : sport === "HOCKEY"
                    ? "🏑"
                    : "🎾"}
                </span>
                <span className="text-xs font-bold text-emerald-700">{sportLabel} Grounds</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="mx-auto mt-6 max-w-2xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1 px-3 text-left">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Search location</p>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter a city, e.g. Lahore" className="mt-0.5 w-full border-none bg-transparent p-0 text-xs font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 sm:text-sm" />
                  </div>

                  {search && (
                    <button type="button" onClick={() => { setSearch(""); setTimeout(() => fetchGrounds(), 0); }} className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                      ✕
                    </button>
                  )}
                </div>

                <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-xs font-extrabold text-white shadow-md shadow-emerald-600/15 transition hover:bg-emerald-700 sm:w-auto">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  Search
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="mr-1 text-[10px] font-medium text-slate-400">Popular:</span>

              {["Islamabad", "Lahore", "Rawalpindi", "Karachi"].map((city) => (
                <button key={city} type="button" onClick={() => { setSearch(city); setTimeout(() => fetchGrounds(), 0); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  {city}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          {!loading && (
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Available grounds</h2>

                <p className="mt-1 text-xs text-slate-400">
                  {grounds.length} {grounds.length === 1 ? "ground" : "grounds"} found
                  {search ? ` in ${search}` : ""}
                </p>
              </div>

              {sport && (
                <button type="button" onClick={() => router.push("/grounds")} className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600">
                  View all sports
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-52 animate-pulse bg-slate-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : grounds.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-white px-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                🏟️
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-800">No grounds found</h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                We couldn't find any grounds matching your search. Try another city or explore all available grounds.
              </p>

              <button type="button" onClick={() => { setSearch(""); router.push("/grounds"); }} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700">
                Explore All Grounds
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grounds.map((ground) => (
                <div key={ground.id} onClick={() => setSelectedGround(ground)} className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_25px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_45px_rgba(16,185,129,0.12)]">
                  <div className="relative h-52 overflow-hidden">
                    <img src={ground.images?.[0] || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6"} alt={ground.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                    <div className="absolute left-4 top-4 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 shadow-sm backdrop-blur">
                      {ground.sportType}
                    </div>

                    <div className="absolute right-4 top-4 rounded-lg bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      {ground.isActive ? "● Open" : "● Closed"}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="truncate text-lg font-black text-white">{ground.name}</h3>

                      <p className="mt-1 truncate text-xs text-white/75">
                        📍 {ground.location}, {ground.city}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    {ground.reviews?.length > 0 && (
                      <div className="mb-3 flex items-center gap-1.5">
                        <span className="text-sm text-yellow-400">★</span>

                        <span className="text-xs font-extrabold text-slate-700">
                          {avgRating(ground.reviews)}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          ({ground.reviews.length} reviews)
                        </span>
                      </div>
                    )}

                    {ground.facilities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ground.facilities.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                            {f}
                          </span>
                        ))}

                        {ground.facilities.length > 3 && (
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                            +{ground.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400">Starting from</p>

                        <div className="mt-0.5">
                          <span className="text-lg font-black text-emerald-600">
                            Rs. {ground.pricePerHour}
                          </span>

                          <span className="ml-1 text-[10px] text-slate-400">/ hour</span>
                        </div>
                      </div>

                      <button onClick={(e) => handleBookNow(e, ground.id)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/15 transition-all hover:bg-emerald-700">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {selectedGround && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelectedGround(null)}>
          <div className="mt-20 mb-0 max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:mb-0 sm:max-w-2xl sm:rounded-3xl sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedGround.images?.[0] || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6"} alt={selectedGround.name} className="h-56 w-full rounded-t-3xl object-cover sm:h-64" />

              <div className="absolute inset-0 rounded-t-3xl bg-black/25" />

              <button onClick={() => setSelectedGround(null)} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-600 shadow-lg transition hover:text-slate-950">
                ✕
              </button>

              <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" />

              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-white">
                  {selectedGround.sportType}
                </span>

                <span className="rounded-lg bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  {selectedGround.isActive ? "🟢 Open" : "🔴 Closed"}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black leading-tight text-slate-950">
                    {selectedGround.name}
                  </h2>

                  <p className="mt-1.5 text-sm text-slate-400">
                    📍 {selectedGround.location}, {selectedGround.city}
                  </p>
                </div>

                {selectedGround.reviews?.length > 0 && (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-yellow-100 bg-yellow-50 px-2.5 py-1.5">
                    <span className="text-yellow-400">★</span>

                    <span className="text-xs font-bold text-slate-700">
                      {avgRating(selectedGround.reviews)}
                    </span>
                  </div>
                )}
              </div>

              {selectedGround.description && (
                <p className="mt-5 border-b border-slate-100 pb-5 text-sm leading-6 text-slate-500">
                  {selectedGround.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-[10px] text-slate-400">Price</p>

                  <p className="mt-1 text-sm font-black text-emerald-600">
                    Rs. {selectedGround.pricePerHour}
                    <span className="text-[9px] font-normal text-slate-400">/hr</span>
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-[10px] text-slate-400">Hours</p>

                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {selectedGround.openTime} – {selectedGround.closeTime}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-[10px] text-slate-400">Slot</p>

                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {selectedGround.slotDuration} min
                  </p>
                </div>
              </div>

              {selectedGround.facilities?.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-extrabold text-slate-800">Facilities</p>

                  <div className="flex flex-wrap gap-2">
                    {selectedGround.facilities.map((f) => (
                      <span key={f} className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedGround.reviews?.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-extrabold text-slate-800">
                    Reviews
                    <span className="ml-1 font-normal text-slate-400">
                      ({selectedGround.reviews.length})
                    </span>
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {selectedGround.reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 p-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                              {r.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>

                            <span className="text-xs font-bold text-slate-800">
                              {r.user?.name || "User"}
                            </span>
                          </div>

                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-xs ${star <= r.rating ? "text-yellow-400" : "text-slate-200"}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        {r.comment && (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={(e) => handleBookNow(e, selectedGround.id)} className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.99]">
                Book Now — Rs. {selectedGround.pricePerHour}/hr
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function GroundsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7fbf9]" />}>
      <GroundsContent />
    </Suspense>
  );
}