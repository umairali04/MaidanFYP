'use client'

import { useEffect, useState } from 'react'

const STAT_CONFIG = [
  {
    key: 'totalGrounds',
    label: 'Total Grounds',
    icon: '⚽',
    accent: '#22C55E',
    iconBg: 'bg-green-50',
    valueColor: 'text-green-600',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'totalBookingsAllTime',
    label: 'Total Bookings',
    icon: '📋',
    accent: '#3B82F6',
    iconBg: 'bg-blue-50',
    valueColor: 'text-blue-600',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'totalBookingsThisMonth',
    label: 'Bookings This Month',
    icon: '📅',
    accent: '#A855F7',
    iconBg: 'bg-purple-50',
    valueColor: 'text-purple-600',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'totalRevenueAllTime',
    label: 'Total Revenue',
    icon: '💰',
    accent: '#10B981',
    iconBg: 'bg-emerald-50',
    valueColor: 'text-emerald-600',
    format: (v) => `₨ ${Number(v || 0).toLocaleString()}`,
  },
  {
    key: 'totalRevenueThisMonth',
    label: 'Revenue This Month',
    icon: '💵',
    accent: '#F59E0B',
    iconBg: 'bg-amber-50',
    valueColor: 'text-amber-600',
    format: (v) => `₨ ${Number(v || 0).toLocaleString()}`,
  },
]

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-8 md:mb-12">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 p-6 md:p-7 rounded-2xl shadow-sm animate-pulse">
            <div className="h-11 w-11 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-8 md:mb-12">
      {STAT_CONFIG.map(({ key, label, icon, accent, iconBg, valueColor, format }) => (
        <div
          key={key}
          className="relative bg-white border border-gray-200 p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
        >
          {/* top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ backgroundColor: accent }}
          />

          <div className={`w-11 h-11 md:w-12 md:h-12 ${iconBg} rounded-xl flex items-center justify-center text-xl md:text-2xl mb-6 group-hover:scale-105 transition-transform`}>
            {icon}
          </div>

          <h3 className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            {label}
          </h3>
          <p className={`text-2xl md:text-3xl font-black ${valueColor} tracking-tight truncate`}>
            {format(stats[key])}
          </p>
        </div>
      ))}
    </div>
  )
}