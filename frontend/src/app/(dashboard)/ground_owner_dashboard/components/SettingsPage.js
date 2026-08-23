'use client'

import { useEffect, useRef, useState } from 'react'
import { getTokenFromCookie } from '../../../../lib/connectionsApi'

const inputClass =
  'w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500'

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-gray-800 sm:text-sm">
          {label}
        </label>

        {hint && (
          <span className="shrink-0 text-[10px] font-medium text-gray-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base sm:h-10 sm:w-10">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-black tracking-tight text-gray-900 sm:text-base">
            {title}
          </h2>

          <p className="mt-0.5 text-[11px] leading-4 text-gray-400 sm:text-xs">
            {description}
          </p>
        </div>
      </div>

      {action && (
        <div className="w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  )
}

function Message({ type, children }) {
  if (!children) return null

  const styles =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-red-200 bg-red-50 text-red-600'

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${styles}`}
    >
      <span className="mt-0.5 shrink-0">
        {type === 'success' ? '✓' : '!'}
      </span>

      <span className="break-words">
        {children}
      </span>
    </div>
  )
}

export default function SettingsPage() {
  const fileInputRef = useRef(null)

  // ============================================================
  // PROFILE
  // ============================================================

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
  })

  const [originalProfile, setOriginalProfile] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
  })

  const [editing, setEditing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ============================================================
  // PASSWORD
  // ============================================================

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // ============================================================
  // FETCH PROFILE
  // ============================================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('')

        const token = getTokenFromCookie()

        if (!token) {
          throw new Error('Authentication token not found.')
        }

        const url =
          `${process.env.NEXT_PUBLIC_API_URL}/api/owner/profile`

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const contentType =
          res.headers.get('content-type') || ''

        const responseText = await res.text()

        if (!contentType.includes('application/json')) {
          throw new Error(
            `Profile API returned ${res.status} instead of JSON.`
          )
        }

        const data = JSON.parse(responseText)

        if (!res.ok) {
          throw new Error(
            data.message || 'Failed to load profile.'
          )
        }

        const loadedProfile = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          image: data.image || '',
        }

        setProfile(loadedProfile)
        setOriginalProfile(loadedProfile)
        setPreviewImage(loadedProfile.image)
      } catch (err) {
        console.error('PROFILE FETCH ERROR:', err)

        setError(
          err.message || 'Failed to load your profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // ============================================================
  // FIELD CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = () => {
    setEditing(true)
    setError('')
    setSuccess('')
  }

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    setProfile(originalProfile)

    setSelectedImage(null)
    setPreviewImage(originalProfile.image || '')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setEditing(false)
    setError('')
    setSuccess('')
  }

  // ============================================================
  // IMAGE SELECT
  // ============================================================

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setError('')
    setSuccess('')

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be smaller than 5MB.')
      return
    }

    setSelectedImage(file)

    const objectUrl = URL.createObjectURL(file)
    setPreviewImage(objectUrl)
  }

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleSave = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = getTokenFromCookie()

      if (!token) {
        throw new Error('Authentication token not found.')
      }

      const formData = new FormData()

      formData.append('name', profile.name)
      formData.append('email', profile.email)
      formData.append('phone', profile.phone)

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/profile`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const contentType =
        res.headers.get('content-type') || ''

      const responseText = await res.text()

      if (!contentType.includes('application/json')) {
        throw new Error(
          `Profile API returned ${res.status} instead of JSON.`
        )
      }

      const data = JSON.parse(responseText)

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to update profile.'
        )
      }

      const updatedUser = data.user || data

      const updatedProfile = {
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        image: updatedUser.image || '',
      }

      setProfile(updatedProfile)
      setOriginalProfile(updatedProfile)

      setSelectedImage(null)
      setPreviewImage(updatedProfile.image)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setEditing(false)

      setSuccess(
        'Your profile has been updated successfully.'
      )
    } catch (err) {
      console.error('PROFILE UPDATE ERROR:', err)

      setError(
        err.message || 'Failed to update your profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // PASSWORD
  // ============================================================

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    setPasswordError('')
    setPasswordSuccess('')

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        'New passwords do not match.'
      )
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(
        'New password must be at least 6 characters.'
      )
      return
    }

    setChangingPassword(true)

    try {
      const token = getTokenFromCookie()

      if (!token) {
        throw new Error(
          'Authentication token not found.'
        )
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/owner/profile/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword:
              passwordForm.currentPassword,
            newPassword:
              passwordForm.newPassword,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message ||
            'Failed to update password.'
        )
      }

      setPasswordSuccess(
        'Your password has been updated successfully.'
      )

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      console.error(
        'PASSWORD UPDATE ERROR:',
        err
      )

      setPasswordError(
        err.message ||
          'Failed to update password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />

        <div className="h-[470px] animate-pulse rounded-xl bg-gray-100" />

        <div className="h-[350px] animate-pulse rounded-xl bg-gray-100" />
      </div>
    )
  }

  const initial =
    (profile.name || 'U')
      .charAt(0)
      .toUpperCase()

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="mb-5 sm:mb-6">

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-gray-400">
          <span>Dashboard</span>
          <span>/</span>

          <span className="text-emerald-600">
            Settings
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Account Settings
        </h1>

        <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm">
          Manage your profile information and account
          security.
        </p>

      </div>

      {/* ======================================================
          PROFILE
      ======================================================= */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-white px-4 py-4 sm:px-5">

          <SectionHeader
            icon="👤"
            title="Profile Information"
            description="Update your ground owner account information."
            action={
              !editing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 sm:w-auto"
                >
                  <span>✎</span>
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>
              )
            }
          />

        </div>

        <div className="p-4 sm:p-5 md:p-6">

          {/* Messages */}

          <div className="space-y-2">

            <Message type="error">
              {error}
            </Message>

            <Message type="success">
              {success}
            </Message>

          </div>

          {/* ==================================================
              PROFILE SUMMARY
          =================================================== */}

          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center">

            {/* IMAGE */}

            <div className="flex justify-center sm:block">

              <div className="relative">

                <div className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md">

                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={
                        profile.name ||
                        'Profile image'
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                      {initial}
                    </div>
                  )}

                </div>

                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[2px] border-white bg-emerald-500" />

                {editing && (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-3 border-white bg-emerald-600 text-xs text-white shadow-md transition hover:bg-emerald-700"
                    title="Change profile photo"
                  >
                    📷
                  </button>
                )}

              </div>

            </div>

            {/* INFO */}

            <div className="min-w-0 flex-1 text-center sm:text-left">

              <h3 className="truncate text-base font-black text-gray-900 sm:text-lg">
                {profile.name ||
                  'Your name'}
              </h3>

              <p className="mt-0.5 text-[11px] font-semibold text-gray-400 sm:text-xs">
                Ground Owner
              </p>

              <p className="mt-0.5 truncate text-[11px] text-gray-500 sm:text-xs">
                {profile.email ||
                  'No email address'}
              </p>

              {editing && (
                <div className="mt-2 flex flex-col items-center gap-1.5 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-600 transition hover:bg-emerald-50"
                  >
                    {selectedImage
                      ? 'Change Photo'
                      : 'Upload Photo'}
                  </button>

                  <span className="text-[10px] text-gray-400">
                    JPG, PNG or WEBP · Max 5MB
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleImageSelect
                    }
                    className="hidden"
                  />

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              PROFILE FORM
          =================================================== */}

          <form
            onSubmit={handleSave}
            className="mt-5 space-y-4"
          >

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <Field
                label="Full Name"
                hint="Required"
              >
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  placeholder="Your full name"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Email Address"
                hint="Required"
              >
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>

            </div>

            <Field
              label="Phone Number"
              hint="Optional"
            >
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="e.g. 0300-1234567"
                className={inputClass}
              />
            </Field>

            {/* SAVE */}

            {editing && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-center text-[11px] text-gray-400 sm:text-left">
                  Your changes will be saved to your
                  account.
                </p>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-6 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {saving ? (
                      <>
                        <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <span className="ml-2">
                          →
                        </span>
                      </>
                    )}
                  </button>

                </div>

              </div>
            )}

          </form>

        </div>
      </section>

      {/* ======================================================
          PASSWORD
      ======================================================= */}

      <section className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:mt-5">

        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-white px-4 py-4 sm:px-5">

          <SectionHeader
            icon="🔐"
            title="Password & Security"
            description="Keep your account secure with a strong password."
          />

        </div>

        <div className="p-4 sm:p-5 md:p-6">

          <div className="space-y-2">

            <Message type="error">
              {passwordError}
            </Message>

            <Message type="success">
              {passwordSuccess}
            </Message>

          </div>

          <form
            onSubmit={handlePasswordChange}
            className="mt-4 space-y-4"
          >

            <Field
              label="Current Password"
              hint="Required"
            >
              <input
                type="password"
                value={
                  passwordForm.currentPassword
                }
                onChange={(e) =>
                  setPasswordForm(
                    (prev) => ({
                      ...prev,
                      currentPassword:
                        e.target.value,
                    })
                  )
                }
                required
                placeholder="Enter your current password"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <Field
                label="New Password"
                hint="Minimum 6 characters"
              >
                <input
                  type="password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={(e) =>
                    setPasswordForm(
                      (prev) => ({
                        ...prev,
                        newPassword:
                          e.target.value,
                      })
                    )
                  }
                  required
                  placeholder="Create a new password"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Confirm New Password"
                hint="Required"
              >
                <input
                  type="password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={(e) =>
                    setPasswordForm(
                      (prev) => ({
                        ...prev,
                        confirmPassword:
                          e.target.value,
                      })
                    )
                  }
                  required
                  placeholder="Repeat your new password"
                  className={inputClass}
                />
              </Field>

            </div>

            {/* SECURITY NOTICE */}

            <div className="flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50/70 p-3">

              <div className="mt-0.5 shrink-0 text-sm text-blue-500">
                🔒
              </div>

              <div className="min-w-0">

                <p className="text-[11px] font-bold text-blue-800">
                  Keep your account secure
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-blue-600/80">
                  Use a strong password that you
                  don't use on other websites.
                </p>

              </div>

            </div>

            {/* PASSWORD BUTTON */}

            <div className="flex justify-end border-t border-gray-100 pt-4">

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-xs font-bold text-gray-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {changingPassword ? (
                  <>
                    <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
                    Updating...
                  </>
                ) : (
                  <>
                    Update Password
                    <span className="ml-2">
                      →
                    </span>
                  </>
                )}
              </button>

            </div>

          </form>

        </div>
      </section>

      {/* ======================================================
          ACCOUNT INFO
      ======================================================= */}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2">

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm text-emerald-600">
              ✓
            </div>

            <div>
              <p className="text-xs font-bold text-gray-900">
                Account Status
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                Active
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-600">
              🛡
            </div>

            <div>
              <p className="text-xs font-bold text-gray-900">
                Account Type
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-gray-500">
                Ground Owner
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}