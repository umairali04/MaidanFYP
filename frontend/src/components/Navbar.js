'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NotificationBell from './NotificationBell'
import MessagesBell from './MessagesBell'


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const dropdownRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
  async function loadUser() {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setUser(null);
    }
  }

  loadUser();
}, []);

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
    router.push('/login')
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
  { name: 'Search Players', path: '/search_players' },
  { name: 'Connections', path: '/connections' },
  { name: 'Contact Us', path: '/contact' },
  
];

  return (
    <nav className="sticky top-0 z-[1000] bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <img
            src="/Maidaan-logo-colored.jpg"
            alt="Maidan"
            className="h-12 w-40 object-contain"
          />
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
              
              <button onClick={() => router.push("/sports")} className="px-5 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-200 cursor-pointer shadow-sm shadow-emerald-100">
                Book Now
              </button>
              
            </>
          ) : (
            <>
             {user?.role !== "GROUND_OWNER" && (
                <>
                  <MessagesBell />
                  <NotificationBell />
                </>
              )}

              {user?.role === "GROUND_OWNER" && (
                <Link href="/ground_owner_dashboard">
                  <button className="px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    Dashboard
                  </button>
                </Link>
              )}
              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-xs font-bold text-white ring-2 ring-emerald-100 transition-all hover:bg-emerald-700"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
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
                    <Link href="/edit_profile" onClick={() => setDropdownOpen(false)}>
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

              <button onClick={() => router.push("/sports")} className="px-5 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-200 cursor-pointer shadow-sm shadow-emerald-100">
                Book Now
              </button>
            </>
          )}
        </div>

  
        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className="relative flex h-5 w-5 flex-col justify-center">
            <span className={`absolute left-0 block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? "rotate-45" : "-translate-y-[6px]"}`} />
            <span className={`absolute left-0 block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? "-rotate-45" : "translate-y-[6px]"}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {/* Mobile Menu */}
<div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[calc(100vh-80px)] opacity-100" : "max-h-0 opacity-0"}`}>
  <div className="border-t border-gray-100 bg-white">
    <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-5 py-4">

      {/* Navigation Links */}
      <div className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            onClick={() => setMenuOpen(false)}
            className="flex items-center min-h-[46px] px-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 active:bg-gray-100 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-gray-100" />

      {!user ? (
        /* Logged Out */
        <div className="flex flex-col gap-3">

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
          >
            Login
          </Link>

          <button
            onClick={() => {
              setMenuOpen(false)
              router.push("/sports")
            }}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm shadow-emerald-100 hover:bg-emerald-700 transition-colors"
          >
            Book Now
          </button>

        </div>
      ) : (
        /* Logged In */
        <div className="flex flex-col">

          {/* User Information */}
          <div className="flex items-center justify-between px-3 py-2">
              {/* User Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-gray-900">
                  {user.name}
                </p>

                <p className="mt-1 truncate text-xs text-gray-400">
                  {user.email}
                </p>
              </div>

              {/* Messages & Notifications */}
              {user?.role !== "GROUND_OWNER" && (
                <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-50 transition-colors">
                    <MessagesBell />
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-50 transition-colors">
                    <NotificationBell />
                  </div>

                </div>
              )}

            </div>

          {/* Ground Owner Dashboard */}
          {user?.role === "GROUND_OWNER" && (
            <Link
              href="/ground_owner_dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center min-h-[46px] px-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
            >
              Dashboard
            </Link>
          )}

          {/* My Profile */}
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center min-h-[46px] px-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
          >
            My Profile
          </Link>

          {/* Edit Profile */}
          <Link
            href="/edit_profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center min-h-[46px] px-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
          >
            Edit Profile
          </Link>

          {/* My Bookings */}
          <Link
            href="/bookings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center min-h-[46px] px-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
          >
            My Bookings
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center min-h-[46px] w-full px-3 rounded-xl text-left text-[15px] font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>

        </div>
      )}

    </div>
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