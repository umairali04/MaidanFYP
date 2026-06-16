'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const SPORT_TYPES = ['CRICKET', 'FOOTBALL', 'HOCKEY', 'BADMINTON', 'TENNIS', 'SQUASH']

const FACILITIES_OPTIONS = [
  'Parking', 'Floodlights', 'Washrooms', 'Changing Rooms',
  'Cafeteria', 'Water Cooler', 'First Aid', 'WiFi', 'Seating Area', 'Security'
]

export default function EditGround() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    sportType: 'CRICKET',
    location: '',
    city: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    openTime: '',
    closeTime: '',
    slotDuration: 60,
    isActive: true,
    facilities: [],
    images: [],
  })

  const [newImageUrl, setNewImageUrl] = useState('')

  const getToken = () =>
    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] ||
    localStorage.getItem('token')

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/grounds/${id}`, {
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
        setError(err.message || 'Failed to load ground details.')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchGround()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
    if (form.images.includes(trimmed)) {
      setError('This image URL is already added.')
      return
    }
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/grounds/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setSuccess('Ground updated successfully!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // ─── LOADING SKELETON ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-14 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  // ─── MAIN FORM ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Edit Ground</h1>
            <p className="text-gray-400 text-sm mt-1">Update your ground details below</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-400 px-5 py-4 rounded-xl text-sm">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/40 text-green-400 px-5 py-4 rounded-xl text-sm">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section: Basic Info ── */}
          <Section title="Basic Information">

            <Field label="Ground Name *">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Green Valley Cricket Ground"
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your ground..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sport Type *">
                <select
                  name="sportType"
                  value={form.sportType}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  {SPORT_TYPES.map(s => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </Field>

              <Field label="Price Per Hour (₨) *">
                <input
                  type="number"
                  name="pricePerHour"
                  value={form.pricePerHour}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 2500"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Slot Duration (minutes) *">
                <select
                  name="slotDuration"
                  value={form.slotDuration}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value={30}>30 min</option>
                  <option value={60}>60 min (1 hr)</option>
                  <option value={90}>90 min</option>
                  <option value={120}>120 min (2 hrs)</option>
                </select>
              </Field>

              <Field label="Status">
                <div className="flex items-center gap-3 h-12 px-4 bg-[#1a1a1a] border border-gray-700 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 accent-green-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300 cursor-pointer select-none">
                    Ground is <span className={form.isActive ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </Field>
            </div>

          </Section>

          {/* ── Section: Location ── */}
          <Section title="Location">

            <Field label="Full Address *">
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Street 5, Model Town"
                className={inputClass}
              />
            </Field>

            <Field label="City *">
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="e.g. Lahore"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Latitude (optional)">
                <input
                  type="number"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  step="any"
                  placeholder="e.g. 31.5204"
                  className={inputClass}
                />
              </Field>
              <Field label="Longitude (optional)">
                <input
                  type="number"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  step="any"
                  placeholder="e.g. 74.3587"
                  className={inputClass}
                />
              </Field>
            </div>

          </Section>

          {/* ── Section: Timing ── */}
          <Section title="Timing">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Opening Time *">
                <input
                  type="time"
                  name="openTime"
                  value={form.openTime}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Closing Time *">
                <input
                  type="time"
                  name="closeTime"
                  value={form.closeTime}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section: Facilities ── */}
          <Section title="Facilities">
            <div className="flex flex-wrap gap-2">
              {FACILITIES_OPTIONS.map(facility => {
                const active = form.facilities.includes(facility)
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      active
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {active ? '✓ ' : ''}{facility}
                  </button>
                )
              })}
            </div>
            {form.facilities.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {form.facilities.length} facilit{form.facilities.length === 1 ? 'y' : 'ies'} selected
              </p>
            )}
          </Section>

          {/* ── Section: Images ── */}
          <Section title="Ground Images">

            {/* Existing images */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {form.images.map((url, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-700">
                    <img
                      src={url}
                      alt={`Ground image ${index + 1}`}
                      className="w-full h-28 object-cover"
                      onError={e => { e.target.src = 'https://placehold.co/300x200/111/444?text=Image' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add image URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Paste image URL and click Add"
                className={`${inputClass} flex-1`}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }}
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                + Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Hover over an image to remove it</p>

          </Section>

          {/* ── Submit ── */}
          <div className="flex gap-4 pt-2 pb-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-black text-base transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ─── Reusable helpers ────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8 space-y-4">
      <h2 className="text-base font-bold text-green-400 uppercase tracking-wider mb-2">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-300">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full h-12 px-4 bg-[#1a1a1a] border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 transition-colors'