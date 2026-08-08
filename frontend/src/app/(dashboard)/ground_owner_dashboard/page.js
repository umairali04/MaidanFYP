'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import OwnerStats from './components/OwnerStats'
import { useRouter } from "next/navigation";
import SettingsPage from "./components/SettingsPage";
import BookingsPage from "./components/BookingsPage";

// ---------------- ICON ----------------
const Plus = () => <span className="font-bold text-lg">+</span>

// ---------------- COOKIE ----------------
const getCookieValue = (name) => {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : ''
}

const getToken = () =>
  getCookieValue('token') || localStorage.getItem('token')

const SPORT_TYPES = ['CRICKET', 'FOOTBALL', 'HOCKEY', 'BADMINTON', 'TENNIS', 'SQUASH']
const SPORT_ICONS = { CRICKET: '🏏', FOOTBALL: '⚽', HOCKEY: '🏑', BADMINTON: '🏸', TENNIS: '🎾', SQUASH: '🟡' }
const FACILITIES_OPTIONS = ['Parking', 'Floodlights', 'Washrooms', 'Changing Rooms', 'Cafeteria', 'Water Cooler', 'First Aid', 'WiFi', 'Seating Area', 'Security']

const BOOKING_STATUS_STYLES = {
  PENDING:   { badge: 'bg-yellow-50 border-yellow-300 text-yellow-700', dot: 'bg-yellow-400' },
  CONFIRMED: { badge: 'bg-blue-50 border-blue-300 text-blue-700', dot: 'bg-blue-400' },
  CANCELLED: { badge: 'bg-red-50 border-red-300 text-red-600', dot: 'bg-red-400' },
  COMPLETED: { badge: 'bg-green-50 border-green-300 text-green-700', dot: 'bg-green-500' },
}

const BOOKING_STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

const inputClass = 'w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-colors'

/* =========================================================
   SECTION + FIELD HELPERS
========================================================= */
function Section({ title, children, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-green-600 uppercase tracking-wider">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  )
}

/* =========================================================
   MY GROUNDS VIEW
========================================================= */
function MyGrounds({ onEdit }) {
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/grounds`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setGrounds(data.grounds)
      } catch (err) {
        setError(err.message || 'Failed to load your grounds.')
      } finally {
        setLoading(false)
      }
    }
    fetchGrounds()
  }, [])

  // ── Filtered grounds based on search query ──────────────────────────────────
  const filteredGrounds = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return grounds

    return grounds.filter(ground => {
      const name = ground.name?.toLowerCase() || ''
      const location = `${ground.location || ''} ${ground.city || ''}`.toLowerCase()
      const sportType = ground.sportType?.toLowerCase() || ''
      return name.includes(query) || location.includes(query) || sportType.includes(query)
    })
  }, [grounds, search])

  if (loading) {
    return (
      <div>
        <div className="h-14 bg-gray-100 rounded-xl w-full max-w-xl mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse h-20 shadow-sm"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-600 px-5 py-4 rounded-xl text-sm">
        ❌ {error}
      </div>
    )
  }

  if (grounds.length === 0) {
    return (
      <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <p className="text-5xl mb-4">🏟️</p>
        <p className="text-gray-700 text-lg font-semibold mb-1">No grounds yet</p>
        <p className="text-gray-500 text-sm">Add your first ground using the button in the Dashboard.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6 w-full max-w-xl">
  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-base z-10">
    🔍
  </span>

  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by ground name, location, or sport type..."
    className="w-full h-14 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-sm"
    style={{
      paddingLeft: '58px',
      paddingRight: search ? '48px' : '16px',
    }}
  />

  {search && (
    <button
      onClick={() => setSearch('')}
      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 text-sm"
    >
      ✕
    </button>
  )}
</div>

      {/* Result count */}
      <p className="text-gray-500 text-sm mb-4">
        {filteredGrounds.length} ground{filteredGrounds.length !== 1 ? 's' : ''}{search ? ' found' : ' registered'}
      </p>

      {/* No search matches */}
      {filteredGrounds.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-700 text-lg font-semibold mb-1">No matches found</p>
          <p className="text-gray-500 text-sm">Try a different name, location, or sport.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGrounds.map(ground => {
            const icon = SPORT_ICONS[ground.sportType] || '🏟️'
            const coverImage = ground.images?.[0] || null
            const avgRating = ground.reviews?.length
              ? (ground.reviews.reduce((s, r) => s + r.rating, 0) / ground.reviews.length).toFixed(1)
              : null

            return (
              <div key={ground.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-md transition-all group flex items-center gap-4 p-3 shadow-sm">

                {/* Thumbnail */}
                <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={ground.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-2xl opacity-40">{icon}</span>
                  )}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-gray-900 truncate">{ground.name}</h3>
                    {avgRating && (
                      <span className="text-xs text-yellow-600 font-semibold whitespace-nowrap">
                        ⭐ {avgRating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {icon} {ground.sportType.charAt(0) + ground.sportType.slice(1).toLowerCase()} · 📍 {ground.city}, {ground.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    🕐 {ground.openTime} – {ground.closeTime}
                    {ground._count && (
                      <span> · 📋 {ground._count.bookings} booking{ground._count.bookings !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-sm font-bold text-green-600">₨ {Number(ground.pricePerHour).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">/ hour</p>
                </div>

                {/* Status badge */}
                <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap ${ground.isActive ? 'bg-green-50 border-green-300 text-green-600' : 'bg-red-50 border-red-300 text-red-600'}`}>
                  {ground.isActive ? 'Active' : 'Inactive'}
                </span>

                {/* Edit button */}
                <button
                  onClick={() => onEdit(ground.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-black transition-colors whitespace-nowrap"
                >
                  ✏️ Edit
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   EDIT GROUND VIEW
========================================================= */
function EditGround({ groundId, onBack }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')

  const [form, setForm] = useState({
    name: '', description: '', sportType: 'CRICKET',
    location: '', city: '', latitude: '', longitude: '',
    pricePerHour: '', openTime: '', closeTime: '',
    slotDuration: 60, isActive: true, facilities: [], images: [],
  })

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/grounds/${groundId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setForm({
          name: data.name || '',
          description: data.description || '',
          sportType: data.sportType || 'CRICKET',
          location: data.location || '',
          city: data.city || '',
          latitude: data.latitude ?? '',
          longitude: data.longitude ?? '',
          pricePerHour: data.pricePerHour || '',
          openTime: data.openTime || '',
          closeTime: data.closeTime || '',
          slotDuration: data.slotDuration || 60,
          isActive: data.isActive ?? true,
          facilities: data.facilities || [],
          images: data.images || [],
        })
      } catch (err) {
        setError(err.message || 'Failed to load ground.')
      } finally {
        setLoading(false)
      }
    }
    fetchGround()
  }, [groundId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleFacility = (facility) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }))
  }

  const addImageUrl = () => {
    const trimmed = newImageUrl.trim()
    if (!trimmed) return
    if (form.images.includes(trimmed)) { setError('This image URL is already added.'); return }
    setForm(prev => ({ ...prev, images: [...prev.images, trimmed] }))
    setNewImageUrl('')
    setError('')
  }

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = getToken()
      const payload = {
        ...form,
        pricePerHour: parseFloat(form.pricePerHour),
        slotDuration: parseInt(form.slotDuration),
        latitude: form.latitude !== '' ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== '' ? parseFloat(form.longitude) : null,
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/grounds/${groundId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess('Ground updated successfully!')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl"></div>)}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-900 transition-colors text-2xl leading-none">←</button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Edit Ground</h1>
          <p className="text-gray-500 text-sm mt-1">Update your ground details below</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-300 text-red-600 px-5 py-4 rounded-xl text-sm">❌ {error}</div>}
      {success && <div className="mb-6 bg-green-50 border border-green-300 text-green-600 px-5 py-4 rounded-xl text-sm">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <Section title="Basic Information">
          <Field label="Ground Name *">
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Green Valley Cricket Ground" className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe your ground..." className={`${inputClass} h-auto py-3 resize-none`} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Sport Type *">
              <select name="sportType" value={form.sportType} onChange={handleChange} required className={inputClass}>
                {SPORT_TYPES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Price Per Hour (₨) *">
              <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} required min="0" placeholder="e.g. 2500" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Slot Duration (minutes)">
              <select name="slotDuration" value={form.slotDuration} onChange={handleChange} className={inputClass}>
                <option value={30}>30 min</option>
                <option value={60}>60 min (1 hr)</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min (2 hrs)</option>
              </select>
            </Field>
            <Field label="Status">
              <div className="flex items-center gap-3 h-12 px-4 bg-gray-50 border border-gray-300 rounded-xl">
                <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-green-500 cursor-pointer" />
                <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer select-none">
                  Ground is <span className={form.isActive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{form.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <Field label="Full Address *">
            <input type="text" name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Street 5, Model Town" className={inputClass} />
          </Field>
          <Field label="City *">
            <input type="text" name="city" value={form.city} onChange={handleChange} required placeholder="e.g. Lahore" className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Latitude (optional)">
              <input type="number" name="latitude" value={form.latitude} onChange={handleChange} step="any" placeholder="e.g. 31.5204" className={inputClass} />
            </Field>
            <Field label="Longitude (optional)">
              <input type="number" name="longitude" value={form.longitude} onChange={handleChange} step="any" placeholder="e.g. 74.3587" className={inputClass} />
            </Field>
          </div>
        </Section>

        {/* Timing */}
        <Section title="Timing">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Opening Time *">
              <input type="time" name="openTime" value={form.openTime} onChange={handleChange} required className={inputClass} />
            </Field>
            <Field label="Closing Time *">
              <input type="time" name="closeTime" value={form.closeTime} onChange={handleChange} required className={inputClass} />
            </Field>
          </div>
        </Section>

        {/* Facilities */}
        <Section title="Facilities">
          <div className="flex flex-wrap gap-2">
            {FACILITIES_OPTIONS.map(facility => {
              const active = form.facilities.includes(facility)
              return (
                <button key={facility} type="button" onClick={() => toggleFacility(facility)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${active ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400'}`}>
                  {active ? '✓ ' : ''}{facility}
                </button>
              )
            })}
          </div>
          {form.facilities.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">{form.facilities.length} facilit{form.facilities.length === 1 ? 'y' : 'ies'} selected</p>
          )}
        </Section>

        {/* Images */}
        <Section title="Ground Images">
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {form.images.map((url, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-300">
                  <img src={url} alt={`Ground image ${index + 1}`} className="w-full h-28 object-cover"
                    onError={e => { e.target.src = 'https://placehold.co/300x200/eee/999?text=Image' }} />
                  <button type="button" onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL and click Add" className={`${inputClass} flex-1`}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }} />
            <button type="button" onClick={addImageUrl}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap">
              + Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Hover over an image to remove it</p>
        </Section>

        {/* Submit */}
        <div className="flex gap-4 pt-2 pb-10">
          <button type="button" onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 font-bold transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-200 disabled:cursor-not-allowed text-white font-black text-base transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  )
}

/* =========================================================
   ADD GROUND MODAL
========================================================= */
function AddGroundModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    city: '',
    location: '',
    sportType: 'FOOTBALL',
    pricePerHour: '',
    facilities: [],
  })

  const [facilityInput, setFacilityInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [images, setImages] = useState([]) 
  const fileInputRef = useRef(null)

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    return data.url
  }

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const addFacility = () => {
    if (!facilityInput.trim()) return
    setForm((prev) => ({ ...prev, facilities: [...prev.facilities, facilityInput.trim()] }))
    setFacilityInput('')
  }

  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setLoading(true)
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          if (file.size > 5 * 1024 * 1024) throw new Error(`File ${file.name} too large (max 5MB)`)
          return await uploadImage(file)
        })
      )
      setImages(prev => [...prev, ...uploadedUrls])
      e.target.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index))
  const removeFacility = (index) => setForm(prev => ({ ...prev, facilities: prev.facilities.filter((_, i) => i !== index) }))

  const handleSubmit = async () => {
    setError('')
    if (!form.name.trim() || !form.city.trim() || !form.location.trim()) {
      return setError('Name, City, and Location are required')
    }
    if (form.pricePerHour && (isNaN(form.pricePerHour) || Number(form.pricePerHour) <= 0)) {
      return setError('Please enter a valid price per hour')
    }
    setLoading(true)
    try {
      const token = getToken()
      const payload = { ...form, pricePerHour: Number(form.pricePerHour) || 0, images }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grounds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create ground')
      setForm({ name: '', city: '', location: '', sportType: 'FOOTBALL', pricePerHour: '', facilities: [] })
      setImages([])
      setFacilityInput('')
      setError('')
      onSuccess?.(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <div className="flex justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-gray-900 font-bold text-2xl">ADD <span className="text-green-600">GROUND</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-xl p-1 hover:bg-gray-100 rounded-full transition-all">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-gray-900 text-sm">
          <div>
            <label className="block text-xs mb-1 font-medium text-gray-600">Ground Name</label>
            <input className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" placeholder="e.g., Green Park Stadium" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium text-gray-600">City</label>
            <input className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" placeholder="e.g., Lahore" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1 font-medium text-gray-600">Full Address</label>
            <input className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" placeholder="e.g., 123 Main Street, Gulberg, Lahore" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium text-gray-600">Price Per Hour (PKR)</label>
            <input type="number" min="0" step="50" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" placeholder="500" value={form.pricePerHour} onChange={(e) => set('pricePerHour', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium text-gray-600">Sport Type</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" value={form.sportType} onChange={(e) => set('sportType', e.target.value)}>
              <option value="FOOTBALL">Football</option>
              <option value="CRICKET">Cricket</option>
              <option value="TENNIS">Tennis</option>
              <option value="BADMINTON">Badminton</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-2 font-medium text-gray-600">Facilities</label>
            <div className="flex gap-2">
              <input className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" placeholder="e.g., Parking, Floodlights, Showers" value={facilityInput} onChange={(e) => setFacilityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFacility()} />
              <button onClick={addFacility} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap" disabled={!facilityInput.trim()}>Add Facility</button>
            </div>
          </div>
          {form.facilities.length > 0 && (
            <div className="col-span-2">
              <label className="block text-xs mb-2 font-medium text-gray-600">Added Facilities</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {form.facilities.map((facility, i) => (
                  <span key={i} className="bg-white px-3 py-2 rounded-full text-sm flex items-center gap-1 border border-gray-300">
                    {facility}
                    <button onClick={() => removeFacility(i)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition-all ml-1">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="col-span-2">
            <label className="block text-xs mb-2 font-medium text-gray-600">Ground Images</label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none file:bg-gray-200 file:text-gray-900 file:border-0 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-gray-300 transition-colors"
              onChange={handleImageUpload} disabled={loading} />
            {images.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500 w-full mb-2">Uploaded Images ({images.length})</p>
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Preview ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 hover:border-green-500 transition-all shadow-sm" loading="lazy" />
                    <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && (
            <div className="col-span-2 p-4 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">{error}</div>
          )}
          <div className="col-span-2 flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button onClick={onClose} className="flex-1 border border-gray-300 hover:border-gray-400 bg-white p-4 rounded-xl transition-all font-medium hover:bg-gray-50 text-gray-700" disabled={loading}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading || !form.name.trim() || !form.city.trim() || !form.location.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 disabled:cursor-not-allowed text-white p-4 rounded-xl font-bold text-lg shadow-lg transition-all">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Ground'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   BOOKINGS VIEW
   Pulls every booking made against any ground this owner owns.
   GET /api/owner/bookings
   PATCH /api/owner/bookings/:id/status
========================================================= */

/* =========================================================
   SETTINGS VIEW
   GET  /api/owner/profile
   PUT  /api/owner/profile
   PUT  /api/owner/profile/password
========================================================= */
{/* <SettingsPage /> */}

/* =========================================================
   MAIN PAGE
========================================================= */
export default function Page() {
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [editingGroundId, setEditingGroundId] = useState(null)
  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const router = useRouter();

  const handleGroundCreated = (data) => {
    console.log('✅ GROUND CREATED:', data)
    setShowModal(false)
    setPage('my-grounds')
  }

  const handleEditGround = (id) => {
    setEditingGroundId(id)
    setPage('edit-ground')
  }

  const handleBackFromEdit = () => {
    setEditingGroundId(null)
    setPage('my-grounds')
  }

   const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "role=; Max-Age=0; path=/";
    document.cookie = "email=; Max-Age=0; path=/";
    document.cookie = "name=; Max-Age=0; path=/";

    router.push("/");
  };

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    if (!token) {
      setUser(null)
      setUserName('Guest')
      setLoadingUser(false)
      return
    }
    try {
      const payload = JSON.parse(
        decodeURIComponent(
          atob(token.split('.')[1]).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        )
      )
      const email = document.cookie.split('; ').find(row => row.startsWith('email='))?.split('=')[1]
      const name = document.cookie.split('; ').find(row => row.startsWith('name='))?.split('=')[1]
      const decodedName = name ? decodeURIComponent(name) : 'User'
      setUser({ name: decodedName, email: email ? decodeURIComponent(email) : '', role: payload.role })
      setUserName(decodedName)
    } catch (e) {
      setUser(null)
      setUserName('Guest')
    }
    setLoadingUser(false)
  }, [])

  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'my-grounds', label: 'My Grounds', icon: '⚽', matches: ['my-grounds', 'edit-ground'] },
    { key: 'bookings', label: 'Bookings', icon: '🗓️' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (item) => (item.matches ? item.matches.includes(page) : page === item.key)

  const PAGE_TITLES = {
    'my-grounds': { title: 'My Grounds', subtitle: 'Manage and edit your registered grounds' },
    'bookings': { title: 'Bookings', subtitle: 'All bookings made across your grounds' },
    'settings': { title: 'Settings', subtitle: 'Manage your account details and password' },
  }

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen"
      style={{
        backgroundColor: '#fafafa',
        backgroundImage:
          'radial-gradient(circle at 12% 8%, rgba(34, 197, 94, 0.09), transparent 42%), radial-gradient(circle at 88% 15%, rgba(0, 255, 136, 0.07), transparent 40%), radial-gradient(circle at 50% 100%, rgba(34, 197, 94, 0.04), transparent 55%)',
      }}
    >

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 p-4 md:p-8 text-gray-700 flex md:flex-col flex-row md:items-start items-center justify-between md:justify-start md:sticky md:top-0 md:h-screen">

        {/* Logo / brand */}
        <div className="p-4 md:p-6 md:pb-4 flex items-center gap-3 md:border-b md:border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-green-500/25 flex-shrink-0">
            M
          </div>
          <div className="hidden md:block">
            <h1 className="text-gray-900 font-black text-lg tracking-tight leading-tight">MAIDAN</h1>
            <p className="text-[11px] text-gray-400 font-medium">Ground Management</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col justify-between md:w-full md:px-4 md:py-6 px-2">
          <div>
            <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Menu</p>
            <div className="space-y-1">
              {NAV_ITEMS.map(item => {
                const active = isActive(item)
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (item.key === 'my-grounds') setEditingGroundId(null)
                      setPage(item.key)
                    }}
                    className={`relative w-full text-left px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all text-sm md:text-base flex items-center gap-3 ${active ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {active && (
                      <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-r-full" />
                    )}
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${active ? 'bg-green-100' : 'bg-gray-100'}`}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* User profile + logout */}
          <div className="hidden md:block mt-6 pt-4 border-t border-gray-100">
            {loadingUser ? (
              <div className="flex items-center gap-3 px-2 py-2 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setPage('settings')}
                className="w-full flex items-center gap-3 px-2 py-2 mb-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || 'Ground Owner'}</p>
                </div>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-base flex-shrink-0">🚪</span>
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile-only compact logout */}
          <button
            onClick={handleLogout}
            className="md:hidden text-left px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm flex items-center gap-2"
          >
            <span>🚪</span> <span>Logout</span>
          </button>

        </nav>

      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">

        {/* DASHBOARD PAGE */}
        {page === 'dashboard' && (
          <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-gray-900 text-xl md:text-2xl font-black tracking-tight">
                    OWNER DASHBOARD
                  </h1>
                </div>
                <p className="text-gray-500 text-sm md:text-md font-medium">Welcome back, {userName}!</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 w-full md:w-auto"
              >
                <Plus /> Add Ground
              </button>
            </div>
            <OwnerStats />
          </>
        )}

        {/* MY GROUNDS PAGE */}
        {page === 'my-grounds' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{PAGE_TITLES['my-grounds'].title}</h1>
                <p className="text-gray-500 text-sm mt-1">{PAGE_TITLES['my-grounds'].subtitle}</p>
              </div>
            </div>
            <MyGrounds onEdit={handleEditGround} />
          </>
        )}

        {/* EDIT GROUND PAGE */}
        {page === 'edit-ground' && editingGroundId && (
          <EditGround groundId={editingGroundId} onBack={handleBackFromEdit} />
        )}

        {/* BOOKINGS PAGE */}
        {page === 'bookings' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{PAGE_TITLES['bookings'].title}</h1>
                <p className="text-gray-500 text-sm mt-1">{PAGE_TITLES['bookings'].subtitle}</p>
              </div>
            </div>
            <BookingsPage />
          </>
        )}

        {/* SETTINGS PAGE */}
        {page === 'settings' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{PAGE_TITLES['settings'].title}</h1>
                <p className="text-gray-500 text-sm mt-1">{PAGE_TITLES['settings'].subtitle}</p>
              </div>
            </div>
            <SettingsPage />
          </>
        )}

      </div>

      {/* MODAL */}
      {showModal && (
        <AddGroundModal onClose={() => setShowModal(false)} onSuccess={handleGroundCreated} />
      )}
    </div>
  )
}