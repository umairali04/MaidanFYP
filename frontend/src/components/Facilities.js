'use client'

import { useRouter } from 'next/navigation'

export default function Facilities() {
  const router = useRouter()

  const facilities = [
  {
    id: 1,
    category: 'Tennis Court',
    title: 'Premier Tennis Courts & Clay Tracks',
    image: 'https://picsum.photos/600/900?random=1',
  },
  {
    id: 2,
    category: 'Football',
    title: 'High-Performance Soccer Fields',
    image: 'https://picsum.photos/600/900?random=2',
  },
  {
    id: 3,
    category: 'Basketball',
    title: 'Indoor Basketball Arenas & Fitness',
    image: 'https://picsum.photos/600/900?random=3',
  },
  {
    id: 4,
    category: 'Running',
    title: 'Open Running Tracks & Outdoor Workout',
    image: 'https://picsum.photos/600/900?random=4',
  },
]

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">

          <div>
            <p className="text-sm text-gray-500 mb-3">
              Our Facilities
            </p>

            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Experience the Best in Sports
              <br />
              Facilities at Maidan
            </h2>
          </div>

          <button
            onClick={() => router.push('/grounds')}
            className="self-start lg:self-center flex items-center gap-3 bg-lime-300 hover:bg-lime-400 transition px-6 py-3 rounded-full font-semibold text-gray-900"
          >
            View All Facilities

            <span className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M7 17L17 7"
                  strokeLinecap="round"
                />
                <path
                  d="M9 7h8v8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

          </button>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {facilities.map((facility) => (

            <div
              key={facility.id}
              className="group relative h-[460px] rounded-3xl overflow-hidden cursor-pointer"
            >

                          {/* Background Image */}
              <img
                src={facility.image} alt={facility.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Top Right Arrow */}
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-full bg-lime-300 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110">
                  <svg
                    className="w-4 h-4 text-gray-900"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M7 17L17 7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 7h8v8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">

                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full mb-4">
                  {facility.category}
                </span>

                <h3
                  className="text-white text-2xl font-semibold leading-snug"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {facility.title}
                </h3>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  )
}