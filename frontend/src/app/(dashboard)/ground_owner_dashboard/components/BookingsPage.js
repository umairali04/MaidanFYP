'use client'

import { useState, useEffect, useMemo } from 'react'


const getCookieValue = (name) => {
  if (typeof document === 'undefined') return '';

  const match = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  );

  return match ? decodeURIComponent(match[2]) : '';
};

const getToken = () =>
  getCookieValue('token') || localStorage.getItem('token');

const SPORT_ICONS = {
  CRICKET: '🏏',
  FOOTBALL: '⚽',
  HOCKEY: '🏑',
  BADMINTON: '🏸',
  TENNIS: '🎾',
  SQUASH: '🟡',
};

const BOOKING_STATUS_FILTERS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

const BOOKING_STATUS_STYLES = {
  PENDING: {
    badge: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    dot: 'bg-yellow-400',
  },
  CONFIRMED: {
    badge: 'bg-blue-50 border-blue-300 text-blue-700',
    dot: 'bg-blue-400',
  },
  COMPLETED: {
    badge: 'bg-green-50 border-green-300 text-green-700',
    dot: 'bg-green-500',
  },
  CANCELLED: {
    badge: 'bg-red-50 border-red-300 text-red-600',
    dot: 'bg-red-400',
  },
};

export default function BookingsPage() {
     const [bookings, setBookings] = useState([])
     const [loading, setLoading] = useState(true)
     const [error, setError] = useState('')
     const [search, setSearch] = useState('')
     const [statusFilter, setStatusFilter] = useState('ALL')
     const [updatingId, setUpdatingId] = useState(null)

     const fetchBookings = async () => {
  try {
    const token = getToken()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/owner/bookings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await res.json()

    if (!res.ok) throw new Error(data.message)

    setBookings(data.bookings || [])
  } catch (err) {
    setError(err.message || "Failed to load bookings.")
  } finally {
    setLoading(false)
  }
}
   
     useEffect(() => { fetchBookings() }, [])
   
     const handleStatusChange = async (bookingId, newStatus) => {
       setUpdatingId(bookingId)
       try {
         const token = getToken()
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/bookings/${bookingId}/status`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           body: JSON.stringify({ status: newStatus }),
         })
         const data = await res.json()
         if (!res.ok) throw new Error(data.message)
         setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b)))
       } catch (err) {
         setError(err.message || 'Failed to update booking.')
       } finally {
         setUpdatingId(null)
       }
     }
   
     const counts = useMemo(() => {
       const c = { ALL: bookings.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 }
       bookings.forEach(b => { if (c[b.status] !== undefined) c[b.status]++ })
       return c
     }, [bookings])
   
     const filtered = useMemo(() => {
       let list = bookings
       if (statusFilter !== 'ALL') list = list.filter(b => b.status === statusFilter)
       const q = search.trim().toLowerCase()
       if (q) {
         list = list.filter(b =>
           b.ground?.name?.toLowerCase().includes(q) ||
           b.ground?.city?.toLowerCase().includes(q) ||
           b.user?.name?.toLowerCase().includes(q)
         )
       }
       return [...list].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
     }, [bookings, statusFilter, search])

          const StatusBadge = ({ status }) => {
       const style = BOOKING_STATUS_STYLES[status] || BOOKING_STATUS_STYLES.PENDING
       return (
         <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap ${style.badge}`}>
           <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
           {status.charAt(0) + status.slice(1).toLowerCase()}
         </span>
       )
     }
 
     const UpdateSelect = ({ booking }) => {
       if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') return null
       return (
         <select
           disabled={updatingId === booking.id}
           value=""
           onChange={(e) => e.target.value && handleStatusChange(booking.id, e.target.value)}
           className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 cursor-pointer hover:border-gray-400 transition-colors"
         >
           <option value="">{updatingId === booking.id ? 'Updating…' : 'Update…'}</option>
           {booking.status === 'PENDING' && <option value="CONFIRMED">Confirm</option>}
           {booking.status === 'CONFIRMED' && <option value="COMPLETED">Mark Completed</option>}
           <option value="CANCELLED">Cancel</option>
         </select>
       )
     }
   
     if (loading) {
       return (
         <div className="space-y-3">
           {Array(4).fill(0).map((_, i) => (
             <div key={i} className="bg-white border border-gray-200 rounded-xl h-24 animate-pulse shadow-sm"></div>
           ))}
         </div>
       )
     }
   
     if (error) {
       return <div className="bg-red-50 border border-red-300 text-red-600 px-5 py-4 rounded-xl text-sm">❌ {error}</div>
     }
   
     return (
       <div>
         {/* Filter tabs */}
         <div className="flex flex-wrap gap-2 mb-5">
           {BOOKING_STATUS_FILTERS.map(status => (
             <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                 statusFilter === status
                   ? 'bg-green-600 border-green-600 text-white shadow-sm'
                   : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
               }`}
             >
               {status.charAt(0) + status.slice(1).toLowerCase()}
               <span className={`ml-1.5 ${statusFilter === status ? 'text-green-100' : 'text-gray-400'}`}>
                 {counts[status] ?? 0}
               </span>
             </button>
           ))}
         </div>
   
         {/* Search */}
         <div className="relative mb-6 w-full max-w-xl">
           <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-base z-10">🔍</span>
           <input
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search by ground, city, or customer name..."
             className="w-full h-12 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-sm"
             style={{ paddingLeft: '48px', paddingRight: '16px' }}
           />
         </div>
   
         {filtered.length === 0 ? (
           <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
             <p className="text-5xl mb-4">📋</p>
             <p className="text-gray-700 text-lg font-semibold mb-1">No bookings found</p>
             <p className="text-gray-500 text-sm">Bookings made against your grounds will show up here.</p>
           </div>
         ) : (
            <>
             {/* Desktop: table */}
             <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-200 text-left">
                     <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ground</th>
                     <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                     <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date &amp; Time</th>
                     <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Price</th>
                     <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                     <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {filtered.map(booking => {
                     const icon = SPORT_ICONS[booking.ground?.sportType] || '🏟️'
                     const dateLabel = booking.bookingDate
                       ? new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                       : ''
                     return (
                       <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-5 py-3.5">
                           <div className="flex items-center gap-2.5 min-w-0">
                             <span className="w-8 h-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-base flex-shrink-0">
                               {icon}
                             </span>
                             <span className="font-semibold text-gray-900 truncate">{booking.ground?.name || 'Ground'}</span>
                           </div>
                         </td>
                         <td className="px-5 py-3.5 text-gray-600">
                           <div className="truncate max-w-[220px]">
                             <p className="font-medium text-gray-800">{booking.user?.name || 'Guest'}</p>
                             {booking.user?.email && <p className="text-xs text-gray-400 truncate">{booking.user.email}</p>}
                           </div>
                         </td>
                         <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                           <p className="font-medium text-gray-700">{dateLabel}</p>
                           <p className="text-xs text-gray-400">{booking.startTime} – {booking.endTime}</p>
                         </td>
                         <td className="px-5 py-3.5 text-right whitespace-nowrap">
                           <p className="font-semibold text-gray-900">₨ {Number(booking.totalPrice || 0).toLocaleString()}</p>
                           <p className="text-xs text-gray-400">{booking.duration}h</p>
                         </td>
                         <td className="px-5 py-3.5">
                           <StatusBadge status={booking.status} />
                         </td>
                         <td className="px-5 py-3.5 text-right">
                           <UpdateSelect booking={booking} />
                         </td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
             </div>
 
             {/* Mobile: cards */}
             <div className="md:hidden space-y-2.5">
               {filtered.map(booking => {
                 const icon = SPORT_ICONS[booking.ground?.sportType] || '🏟️'
                 const dateLabel = booking.bookingDate
                   ? new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                   : ''
                 return (
                   <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4">
                     <div className="flex items-start justify-between gap-3 mb-3">
                       <div className="flex items-center gap-2.5 min-w-0">
                         <span className="w-9 h-9 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-base flex-shrink-0">
                           {icon}
                         </span>
                         <div className="min-w-0">
                           <p className="font-semibold text-gray-900 text-sm truncate">{booking.ground?.name || 'Ground'}</p>
                           <p className="text-xs text-gray-500 truncate">{booking.user?.name || 'Guest'}</p>
                         </div>
                       </div>
                       <StatusBadge status={booking.status} />
                     </div>
 
                     <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                       <div>
                         <p className="font-medium text-gray-700">{dateLabel}</p>
                         <p>{booking.startTime} – {booking.endTime}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-semibold text-gray-900 text-sm">₨ {Number(booking.totalPrice || 0).toLocaleString()}</p>
                         <p>{booking.duration}h</p>
                       </div>
                     </div>
 
                     <div className="flex justify-end mt-3">
                       <UpdateSelect booking={booking} />
                     </div>
                   </div>
                 )
               })}
             </div>
           </>
         )}
       </div>
     )
}