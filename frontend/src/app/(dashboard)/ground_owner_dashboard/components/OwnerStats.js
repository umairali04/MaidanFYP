'use client'

import { useEffect, useState } from 'react'

export default function OwnerStats() {
  const [stats, setStats] = useState({
    totalGrounds: 0,
    totalBookingsAllTime: 0,
    totalBookingsThisMonth: 0,
    totalRevenueAllTime: 0,
    totalRevenueThisMonth: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token =
          document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))?.split('=')[1] ||
          localStorage.getItem('token')

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/owner/stats`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        )

        const data = await res.json()

        if (!res.ok) throw new Error(data.message)

        console.log('✅ API Response:', data) // Debug log

        setStats({
          totalGrounds: data.totalGrounds || 0,
          totalBookingsAllTime: data.totalBookingsAllTime || 0,
          totalBookingsThisMonth: data.totalBookingsThisMonth || 0,
          totalRevenueAllTime: data.totalRevenueAllTime || 0,
          totalRevenueThisMonth: data.totalRevenueThisMonth || 0,
        })
      } catch (err) {
        console.error('Stats error:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-2xl animate-pulse">
            <div className="h-8 w-8 bg-gray-600 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-12 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
      
      {/* 1. TOTAL GROUNDS */}
      <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-2xl hover:border-green-500/50 transition-all group">
        <div className="text-2xl md:text-3xl mb-2">⚽</div>
        <h3 className="text-sm md:text-base font-bold text-white mb-1">Total Grounds</h3>
        <p className="text-2xl md:text-4xl lg:text-3xl font-black text-green-500">
          {stats.totalGrounds.toLocaleString()}
        </p>
      </div>

      {/* 2. TOTAL BOOKINGS (ALL TIME) */}
      <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
        <div className="text-2xl md:text-3xl mb-2">📋</div>
        <h3 className="text-sm md:text-base font-bold text-white mb-1">Total Bookings</h3>
        <p className="text-2xl md:text-4xl lg:text-3xl font-black text-blue-400">
          {stats.totalBookingsAllTime.toLocaleString()}
        </p>
      </div>

      {/* 3. BOOKINGS THIS MONTH */}
      <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-2xl hover:border-purple-500/50 transition-all group">
        <div className="text-2xl md:text-3xl mb-2">📅</div>
        <h3 className="text-sm md:text-base font-bold text-white mb-1">Bookings This Month</h3>
        <p className="text-2xl md:text-4xl lg:text-3xl font-black text-purple-400">
          {stats.totalBookingsThisMonth.toLocaleString()}
        </p>
      </div>

      {/* 4. TOTAL REVENUE (ALL TIME) */}
      <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-2xl hover:border-emerald-500/50 transition-all group">
        <div className="text-2xl md:text-3xl mb-2">💰</div>
        <h3 className="text-sm md:text-base font-bold text-white mb-1">Total Revenue</h3>
        <p className="text-2xl md:text-4xl lg:text-3xl font-black text-emerald-400">
          ₨ {Number(stats.totalRevenueAllTime || 0).toLocaleString()}
        </p>
      </div>

      {/* 5. REVENUE THIS MONTH */}
      <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 p-6 md:p-8 rounded-2xl hover:border-yellow-500/50 transition-all group">
        <div className="text-2xl md:text-3xl mb-2">💵</div>
        <h3 className="text-sm md:text-base font-bold text-white mb-1">Revenue This Month</h3>
        <p className="text-2xl md:text-4xl lg:text-3xl font-black text-yellow-400">
          ₨ {Number(stats.totalRevenueThisMonth || 0).toLocaleString()}
        </p>
      </div>

    </div>
  )
}