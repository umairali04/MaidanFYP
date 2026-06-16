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
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
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
      setUser(null)
    }
  }, [])

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
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  // const navLinks = ['Home', 'Facilities', 'Events', 'Contact']
  const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Facilities', path: '/sports' },
  // { name: 'Events', path: '/events' },
  { name: 'Contact Us', path: '/contact' },
];

  return (
    <nav className="sticky top-0 z-[1000] bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#1a6b3c"/>
              <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="4" stroke="#fff" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="text-gray-900 text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Maidan
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
                  {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="relative px-4 py-2 text-sm text-gray-500 font-medium rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
          {!user ? (
            <>
              <Link href="/login">
                <button className="px-4 py-2 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-all duration-200 cursor-pointer bg-white">
                  Login
                </button>
              </Link>
              <button className="px-5 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-200 cursor-pointer shadow-sm shadow-emerald-100">
                Book Now
              </button>
            </>
          ) : (
            <>
              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center hover:bg-emerald-700 transition-all cursor-pointer ring-2 ring-emerald-100"
                >
                  {initials}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-gray-100/80 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-gray-900 text-sm font-semibold">{user.name}</p>
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

                    <div className="border-t border-gray-50" />
                    <button onClick={handleLogout} className="w-full">
                      <DropdownItem icon={<LogoutIcon />} label="Logout" danger />
                    </button>
                  </div>
                )}
              </div>

              <button className="px-5 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-200 cursor-pointer shadow-sm shadow-emerald-100">
                Book Now
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-screen pb-4 border-t border-gray-100' : 'max-h-0'}`}>
        <div className="flex flex-col px-6 pt-4 gap-1">
          {navLinks.map((link) => (
  <Link
    key={link.name}
    href={link.path}
    className="px-3 py-2.5 text-sm text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
    onClick={() => setMenuOpen(false)}
  >
    {link.name}
  </Link>
))}

          {user ? (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
              <div className="px-3 py-2">
                <p className="text-gray-900 text-sm font-semibold">{user.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
              </div>
              <Link href="/profile" className="px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">My Profile</Link>
              <Link href="/change-password" className="px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">Change Password</Link>
              <Link href="/edit-profile" className="px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">Edit Profile</Link>
              <Link href="/bookings" className="px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">My Bookings</Link>
              <button onClick={handleLogout} className="text-left px-3 py-2.5 text-sm text-red-500 rounded-lg hover:bg-red-50 transition-colors mt-1">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
              <Link href="/login">
                <button className="px-4 py-2.5 text-sm text-gray-700 font-semibold border border-gray-200 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-all cursor-pointer">
                  Login
                </button>
              </Link>
              <button className="px-5 py-2.5 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer">
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
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
      ${danger
        ? 'text-red-500 hover:bg-red-50'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}>
      <span className="w-4 h-4 flex-shrink-0 opacity-70">{icon}</span>
      {label}
    </div>
  )
}

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)
const BookingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
