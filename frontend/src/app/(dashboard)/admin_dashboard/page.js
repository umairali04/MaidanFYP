"use client"
import { useEffect, useState } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// ─── helpers ────────────────────────────────────────────────────────────────
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
  }
}

function StatusBadge({ status }) {
  const map = {
    CONFIRMED: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Confirmed" },
    PENDING:   { bg: "rgba(234,179,8,0.12)",  color: "#eab308", label: "Pending"   },
    CANCELLED: { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Cancelled" },
    SUCCESS:   { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Success"   },
    FAILED:    { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Failed"    },
    RESOLVED:  { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Resolved"  },
    OPEN:      { bg: "rgba(234,179,8,0.12)",  color: "#eab308", label: "Open"      },
    IN_REVIEW: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "In Review" },
    REJECTED:  { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Rejected"  },
    ADMIN:     { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", label: "Admin"     },
    PLAYER:    { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Player"    },
    GROUND_OWNER: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "Ground Owner" },
    ACTIVE:    { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Active"    },
    BANNED:    { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Banned"    },
  }
  const s = map[status] || { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", label: status }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em"
    }}>{s.label}</span>
  )
}

function StatCard({ icon, label, value, sub, color = "#22c55e" }) {
  return (
    <div style={{
      background: "#0f1610",
      border: "1px solid rgba(34,197,94,0.12)",
      borderRadius: 16, padding: "24px 20px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`
      }} />
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
      <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f0fdf0", margin: 0 }}>{value}</h2>
      {sub && <p style={{ color, fontSize: 12, marginTop: 6, fontWeight: 600 }}>{sub}</p>}
    </div>
  )
}

function SectionHeader({ title, accent }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f0fdf0", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 20, background: "#22c55e", borderRadius: 2, display: "inline-block" }} />
      {title} <span style={{ color: "#22c55e" }}>{accent}</span>
    </h2>
  )
}

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 13 }
const thStyle = { padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }
const tdStyle = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#d1fae5", verticalAlign: "middle" }

// ─── DASHBOARD SECTION ───────────────────────────────────────────────────────
function DashboardSection({ stats, bookings, payments }) {
  // Build monthly revenue from payments
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const revenueByMonth = Array(12).fill(0)
  const bookingsByMonth = Array(12).fill(0)

  payments?.forEach(p => {
    if (p.paymentStatus === "SUCCESS" && p.createdAt) {
      const m = new Date(p.createdAt).getMonth()
      revenueByMonth[m] += p.amount || 0
    }
  })

  bookings?.forEach(b => {
    if (b.createdAt) {
      const m = new Date(b.createdAt).getMonth()
      bookingsByMonth[m]++
    }
  })

  const chartData = monthNames.map((name, i) => ({
    name, revenue: revenueByMonth[i], bookings: bookingsByMonth[i]
  }))

  // Sport breakdown from bookings
  const sportCount = {}
  bookings?.forEach(b => { sportCount[b.sport] = (sportCount[b.sport] || 0) + 1 })
  const sportData = Object.entries(sportCount).map(([name, value]) => ({ name, value }))
  const PIE_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#f97316", "#8b5cf6"]

  const recentBookings = [...(bookings || [])].slice(0, 5)
  const pendingGrounds = 0 // extend if you add ground approval
  const openDisputes = 0  // shown in disputes section

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard icon="👥" label="Total Users"    value={stats?.totalUsers    || 0} sub="All registered users" />
        <StatCard icon="🏟️" label="Total Grounds"  value={stats?.totalGrounds  || 0} sub="Listed grounds" />
        <StatCard icon="📅" label="Total Bookings" value={stats?.totalBookings || 0} sub="All time bookings" />
        <StatCard icon="💰" label="Revenue"        value={`Rs ${stats?.totalRevenue || 0}`} sub="Successful payments" color="#22c55e" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Revenue + Bookings line chart */}
        <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, padding: 24 }}>
          <SectionHeader title="Monthly" accent="Overview" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, color: "#f0fdf0" }} />
              <Line type="monotone" dataKey="revenue"  stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue (Rs)" />
              <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sport pie chart */}
        <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, padding: 24 }}>
          <SectionHeader title="Sport" accent="Breakdown" />
          {sportData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={sportData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {sportData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, color: "#f0fdf0" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {sportData.map((s, i) => (
                  <span key={s.name} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                    {s.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 40, textAlign: "center" }}>No booking data yet</p>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, padding: 24 }}>
        <SectionHeader title="Recent" accent="Bookings" />
        {recentBookings.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No bookings yet</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                {["Player", "Ground", "Sport", "Date", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id} style={{ transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={tdStyle}>{b.user?.name || "—"}</td>
                  <td style={tdStyle}>{b.ground?.name || "—"}</td>
                  <td style={tdStyle}>{b.sport || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{b.date ? new Date(b.date).toLocaleDateString() : "—"}</td>
                  <td style={tdStyle}><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── USERS SECTION ───────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/users`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setUsers(d.users) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "ALL" || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div>
      <SectionHeader title="All" accent="Users" />
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: "#0f1610", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, padding: "10px 14px", color: "#f0fdf0", fontSize: 13, outline: "none" }}
        />
        {["ALL","PLAYER","GROUND_OWNER","ADMIN"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.15)", background: roleFilter === r ? "#22c55e" : "#0f1610", color: roleFilter === r ? "#042a0e" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            {r === "ALL" ? "All" : r === "GROUND_OWNER" ? "Owners" : r.charAt(0) + r.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "rgba(255,255,255,0.3)" }}>Loading...</p> : (
          <table style={tableStyle}>
            <thead>
              <tr>{["Name","Email","Role","Phone","Joined"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                  <td style={tdStyle}><StatusBadge status={u.role} /></td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{u.phone || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── GROUNDS SECTION ─────────────────────────────────────────────────────────
function GroundsSection() {
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/grounds`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setGrounds(d.grounds) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = grounds.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.city?.toLowerCase().includes(search.toLowerCase()) ||
    g.owner?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <SectionHeader title="All" accent="Grounds" />
      <input
        placeholder="Search by name, city or owner..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", background: "#0f1610", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, padding: "10px 14px", color: "#f0fdf0", fontSize: 13, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
      />
      <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "rgba(255,255,255,0.3)" }}>Loading...</p> : (
          <table style={tableStyle}>
            <thead>
              <tr>{["Ground Name","Owner","Sport","City","Price/hr","Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{g.name}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)" }}>{g.owner?.name || "—"}</td>
                  <td style={tdStyle}>{g.sport || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{g.city || "—"}</td>
                  <td style={{ ...tdStyle, color: "#22c55e", fontWeight: 600 }}>Rs {g.pricePerHour || 0}</td>
                  <td style={tdStyle}><StatusBadge status={g.status || "ACTIVE"} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No grounds found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── BOOKINGS SECTION ────────────────────────────────────────────────────────
function BookingsSection() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/bookings`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setBookings(d.bookings) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter === "ALL" ? bookings : bookings.filter(b => b.status === statusFilter)

  return (
    <div>
      <SectionHeader title="All" accent="Bookings" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["ALL","CONFIRMED","PENDING","CANCELLED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.15)", background: statusFilter === s ? "#22c55e" : "#0f1610", color: statusFilter === s ? "#042a0e" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "rgba(255,255,255,0.3)" }}>Loading...</p> : (
          <table style={tableStyle}>
            <thead>
              <tr>{["Player","Ground","Sport","Date","Time","Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{b.user?.name || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)" }}>{b.ground?.name || "—"}</td>
                  <td style={tdStyle}>{b.sport || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{b.date ? new Date(b.date).toLocaleDateString() : "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{b.startTime || "—"}</td>
                  <td style={tdStyle}><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No bookings found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── PAYMENTS SECTION ────────────────────────────────────────────────────────
function PaymentsSection() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/payments`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setPayments(d.payments) })
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = payments.filter(p => p.paymentStatus === "SUCCESS").reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalFailed  = payments.filter(p => p.paymentStatus === "FAILED").length
  const totalPending = payments.filter(p => p.paymentStatus === "PENDING").length

  return (
    <div>
      <SectionHeader title="All" accent="Payments" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="✅" label="Total Revenue"   value={`Rs ${totalRevenue}`} color="#22c55e" />
        <StatCard icon="⏳" label="Pending"         value={totalPending}          color="#eab308" />
        <StatCard icon="❌" label="Failed"           value={totalFailed}           color="#ef4444" />
      </div>
      <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "rgba(255,255,255,0.3)" }}>Loading...</p> : (
          <table style={tableStyle}>
            <thead>
              <tr>{["Payment ID","Booking ID","Amount","Method","Status","Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{p.id?.slice(0,8)}...</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{p.bookingId?.slice(0,8) || "—"}...</td>
                  <td style={{ ...tdStyle, color: "#22c55e", fontWeight: 700 }}>Rs {p.amount || 0}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{p.method || "—"}</td>
                  <td style={tdStyle}><StatusBadge status={p.paymentStatus} /></td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No payments found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── DISPUTES SECTION ────────────────────────────────────────────────────────
function DisputesSection() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/disputes`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setDisputes(d.disputes) })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      const res = await fetch(`${BASE_URL}/api/admin/disputes/${id}`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d))
      }
    } finally {
      setUpdating(null)
    }
  }

  const open     = disputes.filter(d => d.status === "OPEN" || d.status === "PENDING").length
  const inReview = disputes.filter(d => d.status === "IN_REVIEW").length
  const resolved = disputes.filter(d => d.status === "RESOLVED").length

  return (
    <div>
      <SectionHeader title="All" accent="Disputes" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🚨" label="Open"      value={open}     color="#ef4444" />
        <StatCard icon="🔍" label="In Review" value={inReview} color="#3b82f6" />
        <StatCard icon="✅" label="Resolved"  value={resolved} color="#22c55e" />
      </div>
      <div style={{ background: "#0f1610", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "rgba(255,255,255,0.3)" }}>Loading...</p> : (
          <table style={tableStyle}>
            <thead>
              <tr>{["Raised By","Ground","Issue","Status","Date","Action"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d.id}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{d.user?.name || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)" }}>{d.ground?.name || "—"}</td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.description || d.issue || "—"}</td>
                  <td style={tdStyle}><StatusBadge status={d.status} /></td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)" }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {d.status !== "RESOLVED" && (
                        <button
                          onClick={() => updateStatus(d.id, "RESOLVED")}
                          disabled={updating === d.id}
                          style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          {updating === d.id ? "..." : "Resolve"}
                        </button>
                      )}
                      {d.status === "OPEN" || d.status === "PENDING" ? (
                        <button
                          onClick={() => updateStatus(d.id, "IN_REVIEW")}
                          disabled={updating === d.id}
                          style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "rgba(59,130,246,0.15)", color: "#3b82f6", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          Review
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No disputes found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [stats, setStats]       = useState(null)
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])

  useEffect(() => {
    const token = getToken()
    if (!token) { window.location.href = "/login"; return }

    // Fetch dashboard stats
    fetch(`${BASE_URL}/api/admin/dashboard`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setStats(d.data) })

    // Fetch bookings + payments for charts
    fetch(`${BASE_URL}/api/admin/bookings`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setBookings(d.bookings) })

    fetch(`${BASE_URL}/api/admin/payments`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setPayments(d.payments) })
  }, [])

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "⬛" },
    { key: "users",     label: "Users",     icon: "👥" },
    { key: "grounds",   label: "Grounds",   icon: "🏟️" },
    { key: "bookings",  label: "Bookings",  icon: "📅" },
    { key: "payments",  label: "Payments",  icon: "💳" },
    { key: "disputes",  label: "Disputes",  icon: "⚠️" },
  ]

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080c08", color: "#f0fdf0", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0b0f0b", borderRight: "1px solid rgba(34,197,94,0.1)", padding: "28px 16px", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0 }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#22c55e", letterSpacing: "0.08em", margin: 0 }}>MAIDAN</h2>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", marginTop: 2 }}>ADMIN PANEL</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveSection(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10, border: "none",
                background: activeSection === item.key ? "rgba(34,197,94,0.12)" : "transparent",
                color: activeSection === item.key ? "#22c55e" : "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: activeSection === item.key ? 600 : 400,
                cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                borderLeft: activeSection === item.key ? "2px solid #22c55e" : "2px solid transparent"
              }}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/admin_login" }}
          style={{ marginTop: "auto", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          Sign Out
        </button>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, padding: 32, minHeight: "100vh" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
              {navItems.find(n => n.key === activeSection)?.label?.toUpperCase()}{" "}
              <span style={{ color: "#22c55e" }}>
                {activeSection === "dashboard" ? "OVERVIEW" : "MANAGEMENT"}
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e", fontWeight: 700, fontSize: 14 }}>
            A
          </div>
        </div>

        {/* Section render */}
        {activeSection === "dashboard" && <DashboardSection stats={stats} bookings={bookings} payments={payments} />}
        {activeSection === "users"     && <UsersSection />}
        {activeSection === "grounds"   && <GroundsSection />}
        {activeSection === "bookings"  && <BookingsSection />}
        {activeSection === "payments"  && <PaymentsSection />}
        {activeSection === "disputes"  && <DisputesSection />}
      </div>
    </div>
  )
}