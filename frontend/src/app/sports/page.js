'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const sports = [
  {
    type:    'FOOTBALL',
    label:   'Football',
    emoji:   '⚽',
    image:   'https://images.unsplash.com/photo-1529900748604-07564a03e7a6',
    desc:    'Futsal & outdoor football grounds',
    color:   'from-green-500/20 to-green-500/5',
    border:  'hover:border-green-400/40',
  },
  {
    type:    'CRICKET',
    label:   'Cricket',
    emoji:   '🏏',
    image:   'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
    desc:    'Full size & tape ball cricket grounds',
    color:   'from-yellow-500/20 to-yellow-500/5',
    border:  'hover:border-yellow-400/40',
  },
  {
    type:    'TENNIS',
    label:   'Tennis',
    emoji:   '🎾',
    image:   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8',
    desc:    'Hard courts & padel arenas',
    color:   'from-blue-500/20 to-blue-500/5',
    border:  'hover:border-blue-400/40',
  },
  {
    type:    'BADMINTON',
    label:   'Badminton',
    emoji:   '🏸',
    image:   'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
    desc:    'Indoor air-conditioned courts',
    color:   'from-purple-500/20 to-purple-500/5',
    border:  'hover:border-purple-400/40',
  },
  {
    type:    'HOCKEY',
    label:   'Hockey',
    emoji:   '🏑',
    image:   'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc',
    desc:    'Astro turf & grass hockey fields',
    color:   'from-red-500/20 to-red-500/5',
    border:  'hover:border-red-400/40',
  },
  {
    type:    'SQUASH',
    label:   'Squash',
    emoji:   '🎾',
    image:   'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1',
    desc:    'Professional squash courts & training',
    grounds: '30+ Grounds',
    color:   'from-orange-500/20 to-orange-500/5',
    border:  'hover:border-orange-400/40',
  },
]

export default function SportsPage() {
  const router = useRouter()

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white">

        {/* Header */}
        <div className="text-center py-16 px-5 border-b border-gray-100">
          <span className="text-[#00cc6a] text-sm font-semibold tracking-widest uppercase">
            Browse by Sport
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111] mt-2">
            What do you want to play?
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-3 max-w-md mx-auto">
            Select a sport to find and book available grounds near you
          </p>
        </div>

        {/* Sports Grid */}
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map(({ type, label, emoji, image, desc, color, border }) => (
              <div
                key={type}
                onClick={() => router.push(`/grounds?sport=${type}`)}
                className={`group relative rounded-2xl overflow-hidden border border-gray-100 ${border} shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />

                  {/* Emoji on image */}
                  <div className="absolute top-4 left-4 text-4xl drop-shadow-lg">
                    {emoji}
                  </div>

                  {/* Grounds count badge */}
                  
                </div>

                {/* Card Bottom */}
                <div className={`bg-gradient-to-b ${color} p-5`}>
                  <h3 className="text-[#111] font-bold text-xl mb-1">{label}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      ))}
                    </div>
                    <span className="text-[#00cc6a] text-sm font-bold group-hover:gap-2 flex items-center gap-1 transition-all">
                      Explore <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </>
  )
}