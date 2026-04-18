'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    // Read token cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) return

    try {
      // Decode JWT payload (middle part)
      const payload = JSON.parse(atob(token.split('.')[1]))
      // payload has: id, role, iat, exp
      // Read email & name from separate cookies if you store them,
      // or from the token if you include them when signing
      const email = document.cookie
        .split('; ')
        .find(row => row.startsWith('email='))
        ?.split('=')[1]

      const name = document.cookie
        .split('; ')
        .find(row => row.startsWith('name='))
        ?.split('=')[1]

      setUser({
        name: name ? decodeURIComponent(name) : 'User',
        email: email ? decodeURIComponent(email) : '',
        role: payload.role,
      })
    } catch (e) {
      // Invalid token
      setUser(null)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    document.cookie = 'token=; Max-Age=0; path=/'
    document.cookie = 'role=; Max-Age=0; path=/'
    document.cookie = 'email=; Max-Age=0; path=/'
    document.cookie = 'name=; Max-Age=0; path=/'
    setUser(null)
    setDropdownOpen(false)
    // router.push('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <nav className="sticky top-0 z-[1000] bg-[#0f0f0f]">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">

        {/* Logo */}
        <h2 className="text-[#00ff88] text-2xl font-bold tracking-tight">Maidan</h2>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Home</a>
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Facilities</a>
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Events</a>
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Contact</a>

          {!user ? (
            <Link href="/login">
              <button className="px-4 py-2 text-sm text-white border border-white rounded-md hover:bg-white hover:text-black transition-colors cursor-pointer">
                Login
              </button>
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-[#00ff88] text-[#0f0f0f] font-bold text-sm flex items-center justify-center border-2 border-[#00ff88] hover:brightness-110 transition-all cursor-pointer"
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-[#2a2a2a]">
                    <p className="text-white text-sm font-semibold">{user.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                  </div>

                  <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                    <DropdownItem icon={<UserIcon />} label="My Profile" />
                  </Link>
                  <Link href="/change-password" onClick={() => setDropdownOpen(false)}>
                    <DropdownItem icon={<LockIcon />} label="Change Password" />
                  </Link>
                  <Link href="/edit-profile" onClick={() => setDropdownOpen(false)}>
                    <DropdownItem icon={<EditIcon />} label="Edit Profile" />
                  </Link>
                  <Link href="/bookings" onClick={() => setDropdownOpen(false)}>
                    <DropdownItem icon={<BookingIcon />} label="My Bookings" />
                  </Link>

                  <div className="border-t border-[#2a2a2a]" />

                  <button onClick={handleLogout} className="w-full">
                    <DropdownItem icon={<LogoutIcon />} label="Logout" danger />
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="px-5 py-2 text-sm bg-[#00ff88] text-black font-bold rounded-md hover:brightness-110 transition-all cursor-pointer">
            Book Now
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-screen pb-4' : 'max-h-0'}`}>
        <div className="flex flex-col items-start gap-4 px-6 pt-2 border-t border-white/10">
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Home</a>
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Facilities</a>
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Events</a>
          <a href="#" className="text-white text-sm hover:text-[#00ff88] transition-colors">Contact</a>

          {user ? (
            <div className="w-full border-t border-white/10 pt-3 flex flex-col gap-1">
              <p className="text-white text-sm font-semibold">{user.name}</p>
              <p className="text-gray-400 text-xs mb-2">{user.email}</p>
              <Link href="/profile" className="text-gray-300 text-sm py-1 hover:text-[#00ff88]">My Profile</Link>
              <Link href="/change-password" className="text-gray-300 text-sm py-1 hover:text-[#00ff88]">Change Password</Link>
              <Link href="/edit-profile" className="text-gray-300 text-sm py-1 hover:text-[#00ff88]">Edit Profile</Link>
              <Link href="/bookings" className="text-gray-300 text-sm py-1 hover:text-[#00ff88]">My Bookings</Link>
              <button onClick={handleLogout} className="text-left text-red-400 text-sm py-1 hover:text-red-300 mt-1">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/login">
                <button className="px-4 py-2 text-sm text-white border border-white rounded-md hover:bg-white hover:text-black transition-colors cursor-pointer">
                  Login
                </button>
              </Link>
              <button className="px-5 py-2 text-sm bg-[#00ff88] text-black font-bold rounded-md cursor-pointer">
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function DropdownItem({ icon, label, danger = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors
      ${danger
        ? 'text-red-400 hover:bg-[#2a1a1a] hover:text-red-300'
        : 'text-gray-300 hover:bg-[#252525] hover:text-white'
      }`}>
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </div>
  )
}

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)
const BookingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)