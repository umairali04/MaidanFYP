"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from 'next/link'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// ============================================================
// HELPERS
// ============================================================

function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  }
}

// ============================================================
// ICONS
// ============================================================

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className = "",
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `shrink-0 ${className}`,
  }

  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    ground: (
      <>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M8 20v-6h8v6" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="17" rx="2" />
        <path d="M16 2v5M8 2v5M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),

    card: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M2.5 10h19M6 15h3" />
      </>
    ),

    warning: (
      <>
        <path d="m10.3 3.8-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.2l-8-14a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),

    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5M21 12H9" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  }

  return (
    <svg {...common}>
      {icons[name] || icons.dashboard}
    </svg>
  )
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const styles = {
    CONFIRMED:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

    PENDING:
      "bg-amber-50 text-amber-700 ring-amber-600/10",

    CANCELLED:
      "bg-red-50 text-red-700 ring-red-600/10",

    SUCCESS:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

    FAILED:
      "bg-red-50 text-red-700 ring-red-600/10",

    RESOLVED:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

    OPEN:
      "bg-amber-50 text-amber-700 ring-amber-600/10",

    IN_REVIEW:
      "bg-blue-50 text-blue-700 ring-blue-600/10",

    REJECTED:
      "bg-red-50 text-red-700 ring-red-600/10",

    ADMIN:
      "bg-violet-50 text-violet-700 ring-violet-600/10",

    PLAYER:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

    GROUND_OWNER:
      "bg-blue-50 text-blue-700 ring-blue-600/10",

    ACTIVE:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

    BANNED:
      "bg-red-50 text-red-700 ring-red-600/10",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${
        styles[status] ||
        "bg-slate-50 text-slate-600 ring-slate-600/10"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status
        ? status.replaceAll("_", " ")
        : "Unknown"}
    </span>
  )
}

// ============================================================
// PANEL
// ============================================================

function Panel({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-2xl
        border border-slate-200/80
        bg-white
        shadow-[0_8px_30px_rgba(15,23,42,0.045)]
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  title,
  accent,
  description,
}) {
  return (
    <div className="mb-5">
      <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
        <span className="h-5 w-1 rounded-full bg-emerald-500" />

        {title}

        <span className="text-emerald-600">
          {accent}
        </span>
      </h2>

      {description && (
        <p className="mt-1 pl-3 text-xs text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "green",
}) {
  const tones = {
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      line: "from-emerald-500 to-teal-400",
      sub: "text-emerald-600",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",
      line: "from-blue-500 to-cyan-400",
      sub: "text-blue-600",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      line: "from-amber-400 to-orange-400",
      sub: "text-amber-600",
    },

    red: {
      icon: "bg-red-50 text-red-600",
      line: "from-red-500 to-rose-400",
      sub: "text-red-600",
    },
  }

  const t = tones[tone] || tones.green

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.05)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-emerald-200
        hover:shadow-[0_14px_35px_rgba(16,185,129,0.10)]
      "
    >
      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-1
          bg-gradient-to-r
          ${t.line}
        `}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <h2 className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${t.icon}
          `}
        >
          <Icon name={icon} size={19} />
        </div>
      </div>

      {sub && (
        <p className={`mt-3 text-xs font-semibold ${t.sub}`}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ============================================================
// TABLE HELPERS
// ============================================================

function TableRow({ children }) {
  return (
    <tr className="transition-colors hover:bg-emerald-50/40">
      {children}
    </tr>
  )
}

function TableCell({
  children,
  className = "",
}) {
  return (
    <td
      className={`
        whitespace-nowrap
        px-4
        py-3.5
        text-xs
        text-slate-600
        sm:px-5
        ${className}
      `}
    >
      {children}
    </td>
  )
}

function LoadingRows({ count = 4 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: count }).map(
        (_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl bg-slate-100"
          />
        )
      )}
    </div>
  )
}

// ============================================================
// DASHBOARD
// ============================================================

function DashboardSection({
  stats,
  bookings,
  payments,
}) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  const revenueByMonth = Array(12).fill(0)
  const bookingsByMonth = Array(12).fill(0)

  payments?.forEach((payment) => {
    if (
      payment.paymentStatus === "SUCCESS" &&
      payment.createdAt
    ) {
      const month = new Date(
        payment.createdAt
      ).getMonth()

      revenueByMonth[month] +=
        Number(payment.amount) || 0
    }
  })

  bookings?.forEach((booking) => {
    if (booking.createdAt) {
      const month = new Date(
        booking.createdAt
      ).getMonth()

      bookingsByMonth[month]++
    }
  })

  const chartData = monthNames.map(
    (name, index) => ({
      name,
      revenue: revenueByMonth[index],
      bookings: bookingsByMonth[index],
    })
  )

  const sportCount = {}

bookings?.forEach((booking) => {
  const sport =
    booking.sportType ||
    booking.sport ||
    booking.sport?.name ||
    booking.sportType?.name ||
    booking.ground?.sportType ||
    booking.ground?.sport ||
    "Other"

  const cleanSport = String(sport).trim()

  if (cleanSport) {
    sportCount[cleanSport] =
      (sportCount[cleanSport] || 0) + 1
  }
})

const sportData = Object.entries(sportCount)
  .map(([name, value]) => ({
    name,
    value,
  }))
  .sort((a, b) => b.value - a.value) 

  const pieColors = [
    "#16a34a",
    "#2563eb",
    "#d97706",
    "#ea580c",
    "#7c3aed",
    "#0891b2",
  ]

  const recentBookings = [
    ...(bookings || []),
  ].slice(0, 5)

  return (
    <div className="space-y-6">

      {/* STATISTICS */}
      <div
        className="
          grid
          grid-cols-1
          gap-4
          min-[480px]:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          icon="users"
          label="Total Users"
          value={stats?.totalUsers || 0}
          sub="All registered users"
        />

        <StatCard
          icon="ground"
          label="Total Grounds"
          value={stats?.totalGrounds || 0}
          sub="Listed grounds"
          tone="blue"
        />

        <StatCard
          icon="calendar"
          label="Total Bookings"
          value={stats?.totalBookings || 0}
          sub="All time bookings"
          tone="amber"
        />

        <StatCard
          icon="card"
          label="Revenue"
          value={`Rs ${stats?.totalRevenue || 0}`}
          sub="Successful payments"
        />
      </div>

      {/* CHARTS */}
      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]
        "
      >
        {/* LINE CHART */}
        <Panel className="min-w-0 p-4 sm:p-6">
          <SectionHeader
            title="Monthly"
            accent="Overview"
            description="Revenue and bookings performance"
          />

          <div className="h-[240px] w-full sm:h-[280px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eef2f1"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    boxShadow:
                      "0 10px 30px rgba(15,23,42,.10)",
                    color: "#0f172a",
                    fontSize: 12,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Revenue (Rs)"
                />

                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-5 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Revenue
            </span>

            <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Bookings
            </span>
          </div>
        </Panel>

        {/* PIE CHART */}
        <Panel className="min-w-0 p-4 sm:p-6">
          <SectionHeader
            title="Sport"
            accent="Breakdown"
            description="Bookings by sport"
          />

          {sportData.length > 0 ? (
            <>
              <div className="h-[190px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {sportData.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              pieColors[
                                index %
                                  pieColors.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: 12,
                        boxShadow:
                          "0 10px 30px rgba(15,23,42,.10)",
                        color: "#0f172a",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
                {sportData.map(
                  (sport, index) => (
                    <span
                      key={sport.name}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            pieColors[
                              index %
                                pieColors.length
                            ],
                        }}
                      />

                      {sport.name}
                    </span>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex h-[190px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
              No booking data yet
            </div>
          )}
        </Panel>
      </div>

      {/* RECENT BOOKINGS */}
      <Panel className="overflow-hidden">
        <div className="p-4 pb-0 sm:p-6 sm:pb-0">
          <SectionHeader
            title="Recent"
            accent="Bookings"
            description="Latest activity across the platform"
          />
        </div>

        {recentBookings.length === 0 ? (
          <div className="px-5 pb-7 text-sm text-slate-400">
            No bookings yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Player",
                    "Ground",
                    "Sport",
                    "Date",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentBookings.map(
                  (booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-bold text-slate-800">
                        {booking.user?.name || "—"}
                      </TableCell>

                      <TableCell>
                        {booking.ground?.name || "—"}
                      </TableCell>

                      <TableCell>
                        {booking.sport || "—"}
                      </TableCell>

                      <TableCell className="text-slate-400">
                        {booking.date
                          ? new Date(
                              booking.date
                            ).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={booking.status}
                        />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ============================================================
// USERS
// ============================================================

function UsersSection() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] =
    useState("ALL")

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/users`, {
      headers: authHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((user) => {
    const query = search.toLowerCase()

    const matchesSearch =
      user.name
        ?.toLowerCase()
        .includes(query) ||
      user.email
        ?.toLowerCase()
        .includes(query)

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div>
      <SectionHeader
        title="All"
        accent="Users"
        description={`${filtered.length} matching user${
          filtered.length === 1 ? "" : "s"
        }`}
      />

      <div className="mb-5 flex flex-col gap-3 xl:flex-row">
        <div className="relative min-w-0 flex-1">
          <Icon
            name="search"
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              pl-10
              pr-4
              text-sm
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-emerald-400
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            "ALL",
            "PLAYER",
            "GROUND_OWNER",
            "ADMIN",
          ].map((role) => (
            <button
              key={role}
              onClick={() =>
                setRoleFilter(role)
              }
              className={`
                whitespace-nowrap
                rounded-xl
                px-4
                py-2.5
                text-xs
                font-bold
                transition-all

                ${
                  roleFilter === role
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                }
              `}
            >
              {role === "ALL"
                ? "All"
                : role === "GROUND_OWNER"
                  ? "Owners"
                  : role.charAt(0) +
                    role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Name",
                    "Email",
                    "Role",
                    "Phone",
                    "Joined",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold text-slate-800">
                      {user.name}
                    </TableCell>

                    <TableCell className="text-slate-500">
                      {user.email}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={user.role}
                      />
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {user.phone || "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ============================================================
// GROUNDS
// ============================================================

function GroundsSection() {
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/grounds`, {
      headers: authHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setGrounds(data.grounds || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = grounds.filter(
    (ground) =>
      ground.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      ground.city
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      ground.owner?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  )

  return (
    <div>
      <SectionHeader
        title="All"
        accent="Grounds"
        description={`${filtered.length} ground${
          filtered.length === 1 ? "" : "s"
        } currently listed`}
      />

      <div className="relative mb-5">
        <Icon
          name="search"
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search by name, city or owner..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            pl-10
            pr-4
            text-sm
            text-slate-800
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-emerald-400
            focus:ring-4
            focus:ring-emerald-500/10
          "
        />
      </div>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Ground Name",
                    "Owner",
                    "Sport",
                    "City",
                    "Price/hr",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((ground) => (
                  <TableRow key={ground.id}>
                    <TableCell className="font-bold text-slate-800">
                      {ground.name}
                    </TableCell>

                    <TableCell>
                      {ground.owner?.name || "—"}
                    </TableCell>

                    <TableCell>
                      {ground.sport || "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {ground.city || "—"}
                    </TableCell>

                    <TableCell className="font-bold text-emerald-600">
                      Rs {ground.pricePerHour || 0}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={
                          ground.status || "ACTIVE"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No grounds found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ============================================================
// BOOKINGS
// ============================================================

function BookingsSection() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] =
    useState("ALL")

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/bookings`, {
      headers: authHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.status === statusFilter
        )

  return (
    <div>
      <SectionHeader
        title="All"
        accent="Bookings"
        description={`${filtered.length} booking${
          filtered.length === 1 ? "" : "s"
        } in this view`}
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[
          "ALL",
          "CONFIRMED",
          "PENDING",
          "CANCELLED",
        ].map((status) => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter(status)
            }
            className={`
              whitespace-nowrap
              rounded-xl
              px-4
              py-2.5
              text-xs
              font-bold
              transition-all

              ${
                statusFilter === status
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }
            `}
          >
            {status === "ALL"
              ? "All"
              : status.charAt(0) +
                status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Player",
                    "Ground",
                    "Sport",
                    "Date",
                    "Time",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-bold text-slate-800">
                      {booking.user?.name || "—"}
                    </TableCell>

                    <TableCell>
                      {booking.ground?.name || "—"}
                    </TableCell>

                    <TableCell>
                      {booking.sport || "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {booking.date
                        ? new Date(
                            booking.date
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {booking.startTime || "—"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={booking.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ============================================================
// PAYMENTS
// ============================================================

function PaymentsSection() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/payments`, {
      headers: authHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPayments(data.payments || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = payments
    .filter(
      (payment) =>
        payment.paymentStatus === "SUCCESS"
    )
    .reduce(
      (sum, payment) =>
        sum + (Number(payment.amount) || 0),
      0
    )

  const totalFailed = payments.filter(
    (payment) =>
      payment.paymentStatus === "FAILED"
  ).length

  const totalPending = payments.filter(
    (payment) =>
      payment.paymentStatus === "PENDING"
  ).length

  return (
    <div>
      <SectionHeader
        title="All"
        accent="Payments"
        description="Payment activity across the platform"
      />

      <div
        className="
          mb-6
          grid
          grid-cols-1
          gap-4
          min-[480px]:grid-cols-3
        "
      >
        <StatCard
          icon="check"
          label="Total Revenue"
          value={`Rs ${totalRevenue}`}
        />

        <StatCard
          icon="calendar"
          label="Pending"
          value={totalPending}
          tone="amber"
        />

        <StatCard
          icon="warning"
          label="Failed"
          value={totalFailed}
          tone="red"
        />
      </div>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Payment ID",
                    "Booking ID",
                    "Amount",
                    "Method",
                    "Status",
                    "Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {payment.id?.slice(0, 8)}
                      ...
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {payment.bookingId?.slice(
                        0,
                        8
                      ) || "—"}
                      ...
                    </TableCell>

                    <TableCell className="font-bold text-emerald-600">
                      Rs {payment.amount || 0}
                    </TableCell>

                    <TableCell>
                      {payment.method || "—"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={
                          payment.paymentStatus
                        }
                      />
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {payment.createdAt
                        ? new Date(
                            payment.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ============================================================
// DISPUTES
// ============================================================

function DisputesSection() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] =
    useState(null)

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/disputes`, {
      headers: authHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setDisputes(data.disputes || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (
    id,
    status
  ) => {
    setUpdating(id)

    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/disputes/${id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setDisputes((previous) =>
          previous.map((dispute) =>
            dispute.id === id
              ? {
                  ...dispute,
                  status,
                }
              : dispute
          )
        )
      }
    } catch (error) {
      console.error(
        "Failed to update dispute:",
        error
      )
    } finally {
      setUpdating(null)
    }
  }

  const open = disputes.filter(
    (dispute) =>
      dispute.status === "OPEN" ||
      dispute.status === "PENDING"
  ).length

  const inReview = disputes.filter(
    (dispute) =>
      dispute.status === "IN_REVIEW"
  ).length

  const resolved = disputes.filter(
    (dispute) =>
      dispute.status === "RESOLVED"
  ).length

  return (
    <div>
      <SectionHeader
        title="All"
        accent="Disputes"
        description="Review and resolve reported issues"
      />

      <div
        className="
          mb-6
          grid
          grid-cols-1
          gap-4
          min-[480px]:grid-cols-3
        "
      >
        <StatCard
          icon="warning"
          label="Open"
          value={open}
          tone="red"
        />

        <StatCard
          icon="eye"
          label="In Review"
          value={inReview}
          tone="blue"
        />

        <StatCard
          icon="check"
          label="Resolved"
          value={resolved}
        />
      </div>

      <Panel className="overflow-hidden">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    "Raised By",
                    "Ground",
                    "Issue",
                    "Status",
                    "Date",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-bold text-slate-800">
                      {dispute.user?.name || "—"}
                    </TableCell>

                    <TableCell>
                      {dispute.ground?.name || "—"}
                    </TableCell>

                    <TableCell className="max-w-[240px] truncate text-slate-500">
                      {dispute.description ||
                        dispute.issue ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={dispute.status}
                      />
                    </TableCell>

                    <TableCell className="text-slate-400">
                      {dispute.createdAt
                        ? new Date(
                            dispute.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {dispute.status !==
                          "RESOLVED" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                dispute.id,
                                "RESOLVED"
                              )
                            }
                            disabled={
                              updating ===
                              dispute.id
                            }
                            className="
                              rounded-lg
                              bg-emerald-50
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              text-emerald-700
                              transition
                              hover:bg-emerald-100
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {updating ===
                            dispute.id
                              ? "..."
                              : "Resolve"}
                          </button>
                        )}

                        {(dispute.status ===
                          "OPEN" ||
                          dispute.status ===
                            "PENDING") && (
                          <button
                            onClick={() =>
                              updateStatus(
                                dispute.id,
                                "IN_REVIEW"
                              )
                            }
                            disabled={
                              updating ===
                              dispute.id
                            }
                            className="
                              rounded-lg
                              bg-blue-50
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              text-blue-700
                              transition
                              hover:bg-blue-100
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {disputes.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No disputes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ============================================================
// MAIN ADMIN DASHBOARD
// ============================================================

export default function AdminDashboard() {
  const [activeSection, setActiveSection] =
    useState("dashboard")

  const [stats, setStats] = useState(null)

  const [bookings, setBookings] =
    useState([])

  const [payments, setPayments] =
    useState([])

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  useEffect(() => {
    const token = getToken()

    if (!token) {
      window.location.href = "/login"
      return
    }

    // Dashboard stats
    fetch(
      `${BASE_URL}/api/admin/dashboard`,
      {
        headers: authHeaders(),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data)
        }
      })
      .catch((error) =>
        console.error(
          "Dashboard error:",
          error
        )
      )

    // Bookings for dashboard chart
    fetch(
      `${BASE_URL}/api/admin/bookings`,
      {
        headers: authHeaders(),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings || [])
        }
      })
      .catch((error) =>
        console.error(
          "Bookings error:",
          error
        )
      )

    // Payments for dashboard chart
    fetch(
      `${BASE_URL}/api/admin/payments`,
      {
        headers: authHeaders(),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setPayments(data.payments || [])
        }
      })
      .catch((error) =>
        console.error(
          "Payments error:",
          error
        )
      )
  }, [])

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
    },
    {
      key: "users",
      label: "Users",
      icon: "users",
    },
    {
      key: "grounds",
      label: "Grounds",
      icon: "ground",
    },
    {
      key: "bookings",
      label: "Bookings",
      icon: "calendar",
    },
    {
      key: "payments",
      label: "Payments",
      icon: "card",
    },
    {
      key: "disputes",
      label: "Disputes",
      icon: "warning",
    },
  ]

  const currentTitle =
    navItems.find(
      (item) =>
        item.key === activeSection
    )?.label || "Dashboard"

  const selectSection = (key) => {
    setActiveSection(key)
    setMobileMenuOpen(false)
  }

  const signOut = () => {
    localStorage.clear()
    window.location.href =
      "/admin_login"
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">

      {/* ======================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div
          className="
            absolute
            -left-40
            -top-40
            h-96
            w-96
            rounded-full
            bg-emerald-200/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -right-40
            top-20
            h-[450px]
            w-[450px]
            rounded-full
            bg-teal-100/30
            blur-3xl
          "
        />
      </div>

      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-[245px]
          flex-col
          border-r
          border-slate-200/80
          bg-white/95
          px-4
          py-6
          shadow-[4px_0_25px_rgba(15,23,42,0.025)]
          backdrop-blur-xl
          lg:flex
        "
      >

        {/* Logo */}
        <div className="px-3 pb-8">
          

            {/* Replace this small mark with your actual logo if desired */}
            <Link href="/" className="flex items-center">
              <img
                src="/Maidaan-logo-colored.jpg"
                alt="Maidan"
                className="h-9 w-28 object-contain"
              />
            </Link>

            <div>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                Admin Panel
              </p>
            </div>

         
        </div>

        {/* Workspace label */}
        <div className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </div>

        {/* Navigation */}
        <nav className="space-y-1">

          {navItems.map((item) => {
            const active =
              activeSection === item.key

            return (
              <button
                key={item.key}
                onClick={() =>
                  selectSection(item.key)
                }
                className={`
                  group
                  relative
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    active
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >

                <span
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    transition

                    ${
                      active
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
                    }
                  `}
                >
                  <Icon
                    name={item.icon}
                    size={17}
                  />
                </span>

                <span>
                  {item.label}
                </span>

                {active && (
                  <span
                    className="
                      absolute
                      right-3
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-500
                    "
                  />
                )}
              </button>
            )
          })}

        </nav>

        {/* Sidebar bottom */}
        <div className="mt-auto border-t border-slate-100 pt-4">

          <div
            className="
              mb-3
              flex
              items-center
              gap-3
              rounded-xl
              bg-slate-50
              p-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-emerald-600
                text-xs
                font-extrabold
                text-white
                shadow-sm
                shadow-emerald-600/20
              "
            >
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">
                Administrator
              </p>

              <p className="truncate text-[10px] text-slate-400">
                Maidan Management
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-sm
              font-semibold
              text-red-500
              transition
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-red-50
              "
            >
              <Icon
                name="logout"
                size={16}
              />
            </span>

            Sign Out
          </button>
        </div>
      </aside>

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-slate-200/80
          bg-white/95
          px-4
          py-3
          shadow-[0_4px_20px_rgba(15,23,42,0.04)]
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0 items-center gap-2">

            <Link href="/" className="flex items-center">
              <img
                src="/Maidaan-logo-colored.jpg"
                alt="Maidan"
                className="h-9 w-28 object-contain"
              />
            </Link>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                Admin
              </p>
            </div>
          </div>

          {/* Hamburger */}
          <button
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-slate-700
              transition
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
            "
            aria-label="Open menu"
          >
            <Icon
              name="menu"
              size={20}
            />
          </button>

          {/* Mobile brand */}
        
        </div>
      </header>

      {/* ======================================================
          MOBILE DRAWER
      ====================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">

          {/* Overlay */}
          <button
            className="
              absolute
              inset-0
              bg-slate-900/25
              backdrop-blur-[2px]
            "
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Close menu"
          />

          {/* Drawer */}
          <aside
            className="
              absolute
              left-0
              top-0
              flex
              h-full
              w-[82%]
              max-w-[310px]
              flex-col
              border-r
              border-slate-200
              bg-white
              p-4
              shadow-2xl
            "
          >

            {/* Drawer header */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-2
                pb-5
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <span className="text-lg font-black">
                    m
                  </span>
                </div>

                <div>
                  <p className="text-[17px] font-extrabold tracking-tight text-slate-900">
                    maidan
                  </p>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                    Admin Panel
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-50
                  text-slate-500
                  transition
                  hover:bg-red-50
                  hover:text-red-500
                "
              >
                <Icon
                  name="close"
                  size={18}
                />
              </button>

            </div>

            {/* Label */}
            <div className="px-2 pb-2 pt-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </div>

            {/* Navigation */}
            <nav className="space-y-1">

              {navItems.map((item) => {
                const active =
                  activeSection === item.key

                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      selectSection(item.key)
                    }
                    className={`
                      relative
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      transition

                      ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg

                        ${
                          active
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "bg-slate-50 text-slate-400"
                        }
                      `}
                    >
                      <Icon
                        name={item.icon}
                        size={17}
                      />
                    </span>

                    {item.label}

                    {active && (
                      <span
                        className="
                          absolute
                          right-3
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-emerald-500
                        "
                      />
                    )}

                  </button>
                )
              })}

            </nav>

            {/* Drawer footer */}
            <div className="mt-auto border-t border-slate-100 pt-4">

              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-slate-50
                  p-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-600
                    text-xs
                    font-extrabold
                    text-white
                  "
                >
                  A
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Administrator
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Maidan Management
                  </p>
                </div>
              </div>

              <button
                onClick={signOut}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-red-500
                  hover:bg-red-50
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-red-50
                  "
                >
                  <Icon
                    name="logout"
                    size={16}
                  />
                </span>

                Sign Out
              </button>

            </div>
          </aside>
        </div>
      )}

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          relative
          z-10
          min-h-screen
          lg:ml-[245px]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-4
            py-5
            sm:px-6
            sm:py-7
            xl:px-8
            xl:py-9
          "
        >

          {/* PAGE HEADER */}
          <div
            className="
              mb-6
              flex
              flex-col
              gap-4
              sm:mb-8
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div className="min-w-0">

              <div className="mb-2 flex items-center gap-2">
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-500
                    shadow-sm
                    shadow-emerald-500/40
                  "
                />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600">
                  Maidan Admin
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {currentTitle}

                <span className="text-emerald-600">
                  {" "}
                  {activeSection ===
                  "dashboard"
                    ? "Overview"
                    : "Management"}
                </span>
              </h1>

              <p className="mt-1.5 text-xs font-medium text-slate-400 sm:text-sm">
                {new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>

            </div>

            {/* Desktop status */}
          </div>

          {/* ==================================================
              ACTIVE SECTION
          ================================================== */}

          {activeSection ===
            "dashboard" && (
            <DashboardSection
              stats={stats}
              bookings={bookings}
              payments={payments}
            />
          )}

          {activeSection === "users" && (
            <UsersSection />
          )}

          {activeSection === "grounds" && (
            <GroundsSection />
          )}

          {activeSection ===
            "bookings" && (
            <BookingsSection />
          )}

          {activeSection ===
            "payments" && (
            <PaymentsSection />
          )}

          {activeSection ===
            "disputes" && (
            <DisputesSection />
          )}

        </div>
      </main>
    </div>
  )
}