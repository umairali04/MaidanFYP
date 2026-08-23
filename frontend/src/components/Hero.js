'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Hero() {
  const router = useRouter()

  const heroImages = [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&q=80",
    "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?w=1600&q=80",
  ]

  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
    <section className="relative min-h-[88vh] flex items-center bg-[#f8f7f4] overflow-hidden">
      {/* Curved image panel — right side only, clipped with an organic S-curve edge */}
      <div
        className="absolute inset-y-0 right-0 w-[58%] sm:w-[62%] md:w-[60%] lg:w-[56%]"
        style={{
          clipPath: 'url(#hero-curve-clip)',
        }}
      >
        <div className="absolute inset-0">
  {heroImages.map((image, index) => (
    <div
      key={index}
      className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
        currentImage === index ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundImage: `url(${image})`,
        maskImage:
          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,1) 60%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,1) 60%)',
      }}
    />
  ))}
</div>
        {/* subtle warm wash to blend tones with the page background */}
        <div className="absolute inset-0 bg-[#f8f7f4]/10" />
      </div>

      {/* Hairline stroke that traces the same curve, drawn on top for the hand-drawn edge look */}
      {/* <svg
        className="absolute inset-y-0 right-0 w-[58%] sm:w-[62%] md:w-[60%] lg:w-[56%] h-full pointer-events-none z-[5]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 13 0 C 10 18, 2 40, 2 50 C 2 60, 10 82, 15 100"
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke="#1f2a24"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.2"
        />
      </svg> */}

      {/* Animated Border */}
      <svg
        className="absolute inset-y-0 right-0 w-[58%] sm:w-[62%] md:w-[60%] lg:w-[56%] h-full pointer-events-none z-[5]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Animated Gradient */}
          <linearGradient id="movingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="#00ff99">
              <animate attributeName="offset" values="-0.3;1.3;-0.3" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#10b981">
              <animate attributeName="offset" values="-0.1;1.5;-0.1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="75%" stopColor="#6ee7b7">
              <animate attributeName="offset" values="0.1;1.7;0.1" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Base Line */}
        <path
          d="M 13 0 C 10 18, 2 40, 2 50 C 2 60, 10 82, 15 100"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="5"
          vectorEffect="non-scaling-stroke"
        />

        {/* Animated Glow */}
        <path
          d="M 13 0 C 10 18, 2 40, 2 50 C 2 60, 10 82, 15 100"
          fill="none"
          stroke="url(#movingGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Shared clip-path definition for the image panel above */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="hero-curve-clip" clipPathUnits="objectBoundingBox">
  <path d="M0.13 0 C0.10 0.18 0.02 0.40 0.02 0.50 C0.02 0.60 0.10 0.82 0.15 1 L1 1 L1 0 Z" />
</clipPath>
        </defs>
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 md:px-10 py-20 sm:py-24 w-full">
        <div className="max-w-[88%] sm:max-w-md md:max-w-lg">
          {/* Tag */}
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-emerald-100 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Pakistan's #1 Sports Platform
          </span>

          {/* Headline */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.08] sm:leading-[1.05] mb-5"
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
            <button onClick={() => router.push('/how-it-works')} className="px-7 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:border-emerald-600 hover:text-emerald-600 transition-all duration-200 bg-white cursor-pointer">
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