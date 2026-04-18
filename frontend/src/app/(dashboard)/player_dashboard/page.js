'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PlayerDashboard() {
  const router = useRouter()

  const [city, setCity] = useState('')
  const [date, setDate] = useState('')
  const [sport, setSport] = useState('CRICKET')

  const handleSearch = () => {
    router.push(`/grounds?city=${city}&date=${date}&sport=${sport}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="bg-blue-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold">Find your next ground</h1>
        <p className="mt-2 text-gray-200">
          Book cricket, football, badminton & more
        </p>

        {/* SEARCH BOX */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">

          <input
            type="text"
            placeholder="City (e.g. Lahore)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-black"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-black"
          />

          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-black"
          >
            <option>CRICKET</option>
            <option>FOOTBALL</option>
            <option>BADMINTON</option>
          </select>

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Popular Grounds</h2>
        {/* later fetch grounds here */}
      </div>

    </div>
  )
}