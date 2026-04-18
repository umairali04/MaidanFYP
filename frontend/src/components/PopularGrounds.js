'use client'
import { useRouter } from 'next/navigation'

export default function PopularGrounds() {
  const router = useRouter()

  const grounds = [
    { img: "/images/futsal.avif",  alt: "Futsal Court",   label: "Futsal Court",   sub: "FIFA turf • Indoor",    sport: "FOOTBALL"  },
    { img: "/images/cricket.avif", alt: "Cricket Ground", label: "Cricket Ground", sub: "Full size • Outdoor",   sport: "CRICKET"   },
    { img: "/images/padel.avif",   alt: "Padel Court",    label: "Padel Court",    sub: "Modern glass court",    sport: "TENNIS"    },
    { img: "/images/tennis.jpeg",  alt: "Tennis Court",   label: "Tennis Court",   sub: "Hard court",            sport: "BADMINTON" },
  ]

  return (
    <section className="py-16 px-5 bg-white text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#111] mb-2">🏟️ Popular Grounds</h2>
      <p className="text-gray-400 text-sm mb-10">Find and book the best courts near you</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {grounds.map(({ img, alt, label, sub, sport }) => (
          <div
            key={label}
            onClick={() => router.push(`/grounds?sport=${sport}`)}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left cursor-pointer"
          >
            <div className="relative overflow-hidden">
              <img
                src={img}
                alt={alt}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white text-sm font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
                {label}
              </div>
              <div className="absolute top-3 left-3 bg-[#00ff88] text-black text-[11px] font-bold px-2 py-0.5 rounded-full">
                Available
              </div>
            </div>
            <div className=" abc px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">{sub}</span>
              <span className="text-[#00ff88] text-lg font-bold">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}