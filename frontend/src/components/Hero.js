'use client'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  return (
    <section
      className="relative min-h-[90vh] flex justify-center items-center text-center bg-cover bg-center text-white"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521412644187-c49fa049e84d')" }}
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 max-w-3xl px-5 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
          Book Sports Grounds Instantly ⚽🏏
        </h1>
        <p className="text-[#ddd] text-sm sm:text-base md:text-lg mb-8">
          Padel • Futsal • Cricket • Pickleball — Book your favorite ground in seconds
        </p>
        <button
          onClick={() => router.push('/sports')}
          className="px-8 py-3 bg-[#00ff88] text-black font-bold rounded-lg text-sm sm:text-base hover:brightness-110 transition-all cursor-pointer"
        >
          Explore Sports
        </button>
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-[#ccc] text-sm">
          <div>⚽ 500+ Grounds</div>
          <div>📍 50+ Cities</div>
          <div>👥 10K+ Users</div>
        </div>
      </div>
    </section>
  )
}