'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Grounds: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Bookings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Revenue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  TrendUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const BOOKINGS = [
  { id: 1, player: 'Ali Hassan',   ground: 'Green Turf Arena',  sport: 'Football', date: 'Apr 18', time: '6:00 PM',  status: 'confirmed' },
  { id: 2, player: 'Sara Khan',    ground: 'City Sports Hub',   sport: 'Cricket',  date: 'Apr 19', time: '4:00 PM',  status: 'pending'   },
  { id: 3, player: 'Usman Raza',   ground: 'Green Turf Arena',  sport: 'Futsal',   date: 'Apr 20', time: '8:00 AM',  status: 'confirmed' },
  { id: 4, player: 'Hina Malik',   ground: 'West Ground',       sport: 'Padel',    date: 'Apr 21', time: '5:00 PM',  status: 'pending'   },
  { id: 5, player: 'Bilal Ahmed',  ground: 'City Sports Hub',   sport: 'Cricket',  date: 'Apr 22', time: '7:00 PM',  status: 'confirmed' },
  { id: 6, player: 'Zara Siddiqui',ground: 'Green Turf Arena',  sport: 'Football', date: 'Apr 23', time: '9:00 AM',  status: 'confirmed' },
]

const GROUNDS_REVENUE = [
  { ground: 'Green Turf Arena', sport: 'Football', bookings: 54, revenue: 97200,  share: 41 },
  { ground: 'City Sports Hub',  sport: 'Cricket',  bookings: 41, revenue: 102500, share: 43 },
  { ground: 'West Ground',      sport: 'Padel',    bookings: 12, revenue: 36000,  share: 15 },
  { ground: 'East Arena',       sport: 'Futsal',   bookings: 13, revenue: 4300,   share: 2  },
]

const SPORTS_FILTERS = ['All Sports', 'Football', 'Cricket', 'Padel', 'Futsal']

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCookieValue = (name) => {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, value, label, trend, trendLabel }) {
  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      borderRadius: '14px',
      padding: '1.4rem 1.6rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{label}</div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
          <span style={{ color: '#22c55e' }}><Icon.TrendUp /></span>
          <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: '600' }}>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const isConfirmed = status === 'confirmed'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700',
      background: isConfirmed ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
      color: isConfirmed ? '#22c55e' : '#eab308',
      border: `1px solid ${isConfirmed ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {isConfirmed ? '✓ confirmed' : '⏳ pending'}
    </span>
  )
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function DashboardPage({ userName }) {
  const [activeFilter, setActiveFilter] = useState('All Sports')
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            OWNER <span style={{ color: '#22c55e' }}>DASHBOARD</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
            {today} · Welcome back, {userName || 'Ahmed'}
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#22c55e', color: '#000', border: 'none', borderRadius: '10px',
          padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: '800',
          cursor: 'pointer', letterSpacing: '0.02em',
        }}>
          <Icon.Plus /> Add Ground
        </button>
      </div>

      {/* Sport Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.6rem' }}>
        {SPORTS_FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.15s', border: 'none',
            background: activeFilter === f ? '#22c55e' : '#1a1a1a',
            color: activeFilter === f ? '#000' : '#9ca3af',
          }}>{f}</button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="🏟️" value="5" label="Total Grounds" trend trendLabel="+1 this month" />
        <StatCard icon="📅" value="120" label="Total Bookings" trend trendLabel="+14 this week" />
        <StatCard icon="💰" value="45K" label="Revenue (PKR)" trend trendLabel="+8K this month" />
        <StatCard icon="⭐" value="4.7" label="Avg Rating" trend trendLabel="Based on 98 reviews" />
      </div>

      {/* Recent Bookings */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '18px', background: '#22c55e', borderRadius: '2px' }} />
            <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>Recent Bookings</span>
          </div>
          <button style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#ccc', padding: '0.35rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>
            View All
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d0d0d' }}>
                {['PLAYER', 'GROUND', 'SPORT', 'DATE', 'TIME', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1.2rem', textAlign: 'left', fontSize: '0.72rem', color: '#4b5563', fontWeight: '700', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOOKINGS.slice(0, 5).map((b, i) => (
                <tr key={b.id} style={{ borderTop: '1px solid #1a1a1a', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#e5e7eb', fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.player}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.ground}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem' }}>{b.sport}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.date}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.time}</td>
                  <td style={{ padding: '0.9rem 1.2rem', whiteSpace: 'nowrap' }}><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BookingsPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter)

  return (
    <div>
      <div style={{ marginBottom: '1.8rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          BOOKING <span style={{ color: '#22c55e' }}>MANAGEMENT</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>All reservations across your grounds</p>
      </div>

      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', borderBottom: '1px solid #1e1e1e', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '18px', background: '#22c55e', borderRadius: '2px' }} />
            <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>All Bookings</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[['all', 'All'], ['confirmed', 'Confirmed'], ['pending', 'Pending']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700',
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: filter === val ? '#22c55e' : '#1e1e1e',
                color: filter === val ? '#000' : '#9ca3af',
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d0d0d' }}>
                {['PLAYER', 'GROUND', 'SPORT', 'DATE', 'TIME', 'STATUS', 'ACTION'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1.2rem', textAlign: 'left', fontSize: '0.72rem', color: '#4b5563', fontWeight: '700', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderTop: '1px solid #1a1a1a' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#e5e7eb', fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.player}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.ground}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem' }}>{b.sport}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.date}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.time}</td>
                  <td style={{ padding: '0.9rem 1.2rem', whiteSpace: 'nowrap' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <button style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#9ca3af', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                      <Icon.Eye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RevenuePage() {
  return (
    <div>
      <div style={{ marginBottom: '1.8rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          REVENUE <span style={{ color: '#22c55e' }}>OVERVIEW</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>Track earnings across all your grounds</p>
      </div>

      {/* Revenue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { value: 'PKR 45K', label: 'This Month', trend: '+8K vs last month' },
          { value: 'PKR 12K', label: 'This Week',  trend: '+2K vs last week' },
          { value: 'PKR 3.2K', label: 'Today',    trend: '4 bookings' },
          { value: 'PKR 240K', label: 'All Time',  trend: 'Since launch' },
        ].map(({ value, label, trend }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', padding: '1.4rem 1.6rem' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500', margin: '0.4rem 0' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#22c55e' }}><Icon.TrendUp /></span>
              <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: '600' }}>{trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by Ground */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1.2rem 1.5rem', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ width: '3px', height: '18px', background: '#22c55e', borderRadius: '2px' }} />
          <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>Revenue by Ground</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d0d0d' }}>
                {['GROUND', 'SPORT', 'BOOKINGS', 'REVENUE (PKR)', 'SHARE'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1.2rem', textAlign: 'left', fontSize: '0.72rem', color: '#4b5563', fontWeight: '700', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUNDS_REVENUE.map((r, i) => (
                <tr key={r.ground} style={{ borderTop: '1px solid #1a1a1a' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#e5e7eb', fontWeight: '700', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{r.ground}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem' }}>{r.sport}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#9ca3af', fontSize: '0.875rem' }}>{r.bookings}</td>
                  <td style={{ padding: '0.9rem 1.2rem', color: '#22c55e', fontWeight: '700', fontSize: '0.9rem' }}>
                    {r.revenue.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '4px', background: '#1e1e1e', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.share}%`, height: '100%', background: '#22c55e', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MyGroundsPage() {
  const grounds = [
    { name: 'Green Turf Arena', sport: 'Football', location: 'Lahore', bookings: 54, rating: 4.8, status: 'active' },
    { name: 'City Sports Hub',  sport: 'Cricket',  location: 'Karachi', bookings: 41, rating: 4.6, status: 'active' },
    { name: 'West Ground',      sport: 'Padel',    location: 'Islamabad', bookings: 12, rating: 4.5, status: 'active' },
    { name: 'East Arena',       sport: 'Futsal',   location: 'Rawalpindi', bookings: 13, rating: 4.2, status: 'maintenance' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            MY <span style={{ color: '#22c55e' }}>GROUNDS</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>Manage all your registered grounds</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#22c55e', color: '#000', border: 'none', borderRadius: '10px',
          padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer',
        }}>
          <Icon.Plus /> Add Ground
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {grounds.map(g => (
          <div key={g.name} style={{
            background: '#111', border: '1px solid #222', borderRadius: '14px',
            padding: '1.4rem', transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e33'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{g.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>📍 {g.location}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                background: g.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                color: g.status === 'active' ? '#22c55e' : '#eab308',
                border: `1px solid ${g.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {g.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { label: 'Sport', val: g.sport },
                { label: 'Bookings', val: g.bookings },
                { label: 'Rating', val: `⭐ ${g.rating}` },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#4b5563', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: '0.82rem', color: '#e5e7eb', fontWeight: '600', marginTop: '2px' }}>{val}</div>
                </div>
              ))}
            </div>
            <button style={{
              width: '100%', padding: '0.5rem', border: '1px solid #2a2a2a', borderRadius: '8px',
              background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#9ca3af' }}>
              Manage Ground
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPage({ userName, userEmail }) {
  return (
    <div>
      <div style={{ marginBottom: '1.8rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          ACCOUNT <span style={{ color: '#22c55e' }}>SETTINGS</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>Manage your profile and preferences</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
        {[
          { label: 'Full Name', value: userName || 'Ahmed Khan' },
          { label: 'Email Address', value: userEmail || 'ahmed@example.com' },
          { label: 'Role', value: 'Ground Owner' },
          { label: 'Phone Number', value: '+92 300 1234567' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1rem 1.4rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#4b5563', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ color: '#e5e7eb', fontWeight: '600', fontSize: '0.9rem' }}>{value}</div>
          </div>
        ))}
        <button style={{
          marginTop: '0.5rem', padding: '0.7rem', borderRadius: '10px',
          background: '#22c55e', border: 'none', color: '#000',
          fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '0.02em',
        }}>
          Save Changes
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function GroundOwnerDashboard() {
  const router = useRouter()
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userName = getCookieValue('name') || 'Ahmed Khan'
  const userEmail = getCookieValue('email') || 'ahmed@example.com'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('token')
    router.push('/login')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  Icon: Icon.Dashboard },
    { id: 'grounds',   label: 'My Grounds', Icon: Icon.Grounds   },
    { id: 'bookings',  label: 'Bookings',   Icon: Icon.Bookings  },
    { id: 'revenue',   label: 'Revenue',    Icon: Icon.Revenue   },
    { id: 'settings',  label: 'Settings',   Icon: Icon.Settings  },
  ]

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage userName={userName.split(' ')[0]} />
      case 'grounds':   return <MyGroundsPage />
      case 'bookings':  return <BookingsPage />
      case 'revenue':   return <RevenuePage />
      case 'settings':  return <SettingsPage userName={userName} userEmail={userEmail} />
      default:          return <DashboardPage userName={userName.split(' ')[0]} />
    }
  }

  const SIDEBAR_W = 240

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40,
          display: 'none',
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: `${SIDEBAR_W}px`, minHeight: '100vh',
        background: '#0d0d0d', borderRight: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.4rem 1rem', borderBottom: '1px solid #1a1a1a' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22c55e', letterSpacing: '0.05em' }}>MAIDAN</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '0.65rem', color: '#374151', fontWeight: '700', letterSpacing: '0.12em', padding: '0 0.7rem', margin: '0 0 0.5rem' }}>MENU</p>
          {navItems.map(({ id, label, Icon: NavIcon }) => {
            const active = activePage === id
            return (
              <button key={id} onClick={() => setActivePage(id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.6rem 0.9rem', borderRadius: '10px', border: 'none',
                background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
                color: active ? '#22c55e' : '#6b7280',
                fontWeight: active ? '700' : '500',
                fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left',
                width: '100%', transition: 'all 0.15s',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#161616'; if (!active) e.currentTarget.style.color = '#9ca3af' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = '#6b7280' }}
              >
                <NavIcon />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} />}
              </button>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '1rem 0.9rem', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.7rem', background: '#111', borderRadius: '10px', marginBottom: '0.5rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '800', color: '#000', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Ground Owner</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0.5rem 0.8rem', background: 'none', border: '1px solid #1e1e1e',
            borderRadius: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem',
            fontWeight: '600', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#6b7280' }}>
            <Icon.Logout /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 2rem 3rem', overflowX: 'hidden', minWidth: 0 }}>
        {renderPage()}
      </main>
    </div>
  )
}
