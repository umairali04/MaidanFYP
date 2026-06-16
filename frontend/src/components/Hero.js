'use client'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  const stats = [
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
        </svg>
      ),
      label: '500+ Grounds',
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
      label: '50+ Cities',
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      label: '10K+ Users',
    },
  ]

  return (
    <section
      className="relative min-h-[88vh] flex items-center bg-[#f8f7f4] overflow-hidden"
    >
      {/* Background image — right side only */}
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[60%] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1400&q=80')",
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,1) 60%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,1) 60%)',
        }}
      />
      {/* Warm overlay on image */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[60%] bg-[#f8f7f4]/30" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24 w-full">
        <div className="max-w-lg">

          {/* Tag */}
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-emerald-100 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Pakistan's #1 Sports Platform
          </span>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.05] mb-5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Book Sports<br />
            Grounds<br />
            <span className="text-emerald-600">Instantly</span>
          </h1>

          {/* Sub */}
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8">
            Padel · Futsal · Cricket · Pickleball<br />
            Find and reserve your perfect ground in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => router.push('/sports')}
              className="px-7 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-all duration-200 shadow-sm shadow-emerald-100 cursor-pointer"
            >
              Explore Sports
            </button>
            <button className="px-7 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:border-emerald-600 hover:text-emerald-600 transition-all duration-200 bg-white cursor-pointer">
              How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            {stats.map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600 shadow-sm"
              >
                <span className="text-emerald-600">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
