'use client'

import { useEffect, useMemo, useState } from 'react'

const getToken = () => {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)

  if (match) {
    return decodeURIComponent(match[1])
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token')
  }

  return null
}

const formatCurrency = (value) => {
  return `Rs ${Number(value || 0).toLocaleString()}`
}

const StatIcon = ({ type }) => {
  const icons = {
    grounds: '⚽',
    bookings: '📋',
    monthBookings: '📅',
    revenue: '💰',
    monthRevenue: '📈',
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
      {icons[type]}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent = 'green',
  description,
}) {
  const accentClasses = {
    green: {
      value: 'text-emerald-600',
      icon: 'bg-emerald-50',
      line: 'bg-emerald-500',
    },
    blue: {
      value: 'text-blue-600',
      icon: 'bg-blue-50',
      line: 'bg-blue-500',
    },
    purple: {
      value: 'text-violet-600',
      icon: 'bg-violet-50',
      line: 'bg-violet-500',
    },
    orange: {
      value: 'text-orange-600',
      icon: 'bg-orange-50',
      line: 'bg-orange-500',
    },
  }

  const colors = accentClasses[accent]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${colors.icon}`}
        >
          {icon}
        </div>

        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Overview
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </p>

        <p
          className={`mt-1 text-2xl font-black tracking-tight ${colors.value}`}
        >
          {value}
        </p>

        {description && (
          <p className="mt-1 text-xs font-medium text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full ${colors.line}`}
      />
    </div>
  )
}

function ProgressRow({
  label,
  value,
  total,
  color = 'bg-emerald-500',
  displayValue,
}) {
  const percentage =
    total > 0
      ? Math.min(Math.max((Number(value || 0) / Number(total || 1)) * 100, 0), 100)
      : 0

  const widthClass = useMemo(() => {
    if (percentage >= 95) return 'w-[95%]'
    if (percentage >= 85) return 'w-[85%]'
    if (percentage >= 75) return 'w-[75%]'
    if (percentage >= 65) return 'w-[65%]'
    if (percentage >= 55) return 'w-[55%]'
    if (percentage >= 45) return 'w-[45%]'
    if (percentage >= 35) return 'w-[35%]'
    if (percentage >= 25) return 'w-[25%]'
    if (percentage >= 15) return 'w-[15%]'
    if (percentage > 0) return 'w-[8%]'
    return 'w-0'
  }, [percentage])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-gray-500">
          {label}
        </span>

        <span className="text-xs font-black text-gray-800">
          {displayValue}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color} ${widthClass}`}
        />
      </div>
    </div>
  )
}

export default function OwnerStats() {
  const [stats, setStats] = useState({
    totalGrounds: 0,
    totalBookingsAllTime: 0,
    totalBookingsThisMonth: 0,
    totalRevenue: 0,
    totalRevenueThisMonth: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken()

        if (!token) {
          throw new Error('Authentication token not found.')
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/owner/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load dashboard statistics.')
        }

        const result = data.stats || data


        setStats({
          totalGrounds: Number(
            result.totalGrounds ??
            result.groundsCount ??
            0
          ),

          totalBookingsAllTime: Number(
            result.totalBookingsAllTime ??
            result.totalBookings ??
            result.bookingsCount ??
            0
          ),

          totalBookingsThisMonth: Number(
            result.totalBookingsThisMonth ??
            result.bookingsThisMonth ??
            0
          ),

          totalRevenue: Number(
            result.totalRevenue ??
            result.totalRevenueAllTime ??
            result.revenue ??
            result.revenueAllTime ??
            0
          ),

          totalRevenueThisMonth: Number(
            result.totalRevenueThisMonth ??
            result.revenueThisMonth ??
            0
          ),
        })
      } catch (err) {
        console.error('OWNER STATS ERROR:', err)
        setError(err.message || 'Failed to load dashboard statistics.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-white xl:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
        ❌ {error}
      </div>
    )
  }

  const bookingPercentage =
    stats.totalBookingsAllTime > 0
      ? Math.round(
          (stats.totalBookingsThisMonth /
            stats.totalBookingsAllTime) *
            100
        )
      : 0

  const revenuePercentage =
    stats.totalRevenue > 0
      ? Math.round(
          (stats.totalRevenueThisMonth /
            stats.totalRevenue) *
            100
        )
      : 0

  return (
    <div className="space-y-6">

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <StatCard
          label="Total Grounds"
          value={stats.totalGrounds}
          icon="⚽"
          accent="green"
          description="Active grounds under management"
        />

        <StatCard
          label="Total Bookings"
          value={stats.totalBookingsAllTime}
          icon="📋"
          accent="blue"
          description="All-time bookings"
        />

        <StatCard
          label="Bookings This Month"
          value={stats.totalBookingsThisMonth}
          icon="📅"
          accent="purple"
          description="Current month activity"
        />

        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          accent="green"
          description="All-time earnings"
        />

        <StatCard
          label="Revenue This Month"
          value={formatCurrency(stats.totalRevenueThisMonth)}
          icon="📈"
          accent="orange"
          description="Current month earnings"
        />

      </div>


      {/* =====================================================
          ANALYTICS AREA
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Business Performance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <h2 className="text-lg font-black tracking-tight text-gray-900">
                  Business Performance
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-400">
                Current month compared with your overall activity
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
              LIVE OVERVIEW
            </span>

          </div>


          {/* Revenue */}
          <div className="mt-8 rounded-xl bg-gray-50 p-5">

            <div className="mb-5 flex items-end justify-between gap-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Revenue
                </p>

                <p className="mt-1 text-2xl font-black text-gray-900">
                  {formatCurrency(stats.totalRevenueThisMonth)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">
                  of total revenue
                </p>

                <p className="text-sm font-black text-emerald-600">
                  {revenuePercentage}%
                </p>
              </div>

            </div>

            <ProgressRow
              label="This month"
              value={stats.totalRevenueThisMonth}
              total={stats.totalRevenue}
              color="bg-emerald-500"
              displayValue={formatCurrency(stats.totalRevenueThisMonth)}
            />

          </div>


          {/* Bookings */}
          <div className="mt-4 rounded-xl bg-gray-50 p-5">

            <div className="mb-5 flex items-end justify-between gap-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Bookings
                </p>

                <p className="mt-1 text-2xl font-black text-gray-900">
                  {stats.totalBookingsThisMonth}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">
                  of all bookings
                </p>

                <p className="text-sm font-black text-blue-600">
                  {bookingPercentage}%
                </p>
              </div>

            </div>

            <ProgressRow
              label="This month"
              value={stats.totalBookingsThisMonth}
              total={stats.totalBookingsAllTime}
              color="bg-blue-500"
              displayValue={`${stats.totalBookingsThisMonth} bookings`}
            />

          </div>

        </div>


        {/* Revenue Snapshot */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

              <h2 className="text-lg font-black tracking-tight text-gray-900">
                Revenue Snapshot
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-400">
              Your current financial overview
            </p>
          </div>


          <div className="mt-8 rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-5 text-white">

            <p className="text-xs font-semibold text-gray-400">
              TOTAL REVENUE
            </p>

            <p className="mt-2 text-3xl font-black tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </p>

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-5 flex items-center justify-between">

              <div>
                <p className="text-[11px] text-gray-400">
                  This month
                </p>

                <p className="mt-1 text-lg font-black text-emerald-400">
                  {formatCurrency(stats.totalRevenueThisMonth)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
                ↑
              </div>

            </div>

          </div>


          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Grounds
              </p>

              <p className="mt-1 text-xl font-black text-gray-900">
                {stats.totalGrounds}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Bookings
              </p>

              <p className="mt-1 text-xl font-black text-gray-900">
                {stats.totalBookingsAllTime}
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              ⚡
            </div>

            <div>
              <p className="text-sm font-black text-gray-900">
                Active Management
              </p>

              <p className="text-xs text-gray-400">
                {stats.totalGrounds} grounds available
              </p>
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📊
            </div>

            <div>
              <p className="text-sm font-black text-gray-900">
                Booking Activity
              </p>

              <p className="text-xs text-gray-400">
                {stats.totalBookingsThisMonth} this month
              </p>
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
              💵
            </div>

            <div>
              <p className="text-sm font-black text-gray-900">
                Monthly Earnings
              </p>

              <p className="text-xs text-gray-400">
                {formatCurrency(stats.totalRevenueThisMonth)}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}