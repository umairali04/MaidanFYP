'use client'

import { useState, useEffect } from 'react'


const inputClass = 'w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-colors'
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  )
}
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


export default function SettingsPage() {
   const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
     const [loading, setLoading] = useState(true)
     const [saving, setSaving] = useState(false)
     const [error, setError] = useState('')
     const [success, setSuccess] = useState('')
   
     const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
     const [changingPassword, setChangingPassword] = useState(false)
     const [passwordError, setPasswordError] = useState('')
     const [passwordSuccess, setPasswordSuccess] = useState('')
   
     useEffect(() => {
       const fetchProfile = async () => {
         try {
           const token = getToken()
           const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/profile`, {
             headers: { Authorization: `Bearer ${token}` },
           })
           const data = await res.json()
           if (!res.ok) throw new Error(data.message)
           setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '' })
         } catch (err) {
           setError(err.message || 'Failed to load your profile.')
         } finally {
           setLoading(false)
         }
       }
       fetchProfile()
     }, [])
   
     const handleChange = (e) => {
       const { name, value } = e.target
       setProfile(prev => ({ ...prev, [name]: value }))
     }
   
     const handleSave = async (e) => {
       e.preventDefault()
       setSaving(true)
       setError('')
       setSuccess('')
       try {
         const token = getToken()
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/profile`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           body: JSON.stringify(profile),
         })
         const data = await res.json()
         if (!res.ok) throw new Error(data.message)
         setSuccess('Profile updated successfully!')
       } catch (err) {
         setError(err.message || 'Something went wrong.')
       } finally {
         setSaving(false)
       }
     }
   
     const handlePasswordChange = async (e) => {
       e.preventDefault()
       setPasswordError('')
       setPasswordSuccess('')
   
       if (passwordForm.newPassword !== passwordForm.confirmPassword) {
         setPasswordError('New passwords do not match.')
         return
       }
       if (passwordForm.newPassword.length < 6) {
         setPasswordError('New password must be at least 6 characters.')
         return
       }
   
       setChangingPassword(true)
       try {
         const token = getToken()
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/owner/profile/password`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           body: JSON.stringify({
             currentPassword: passwordForm.currentPassword,
             newPassword: passwordForm.newPassword,
           }),
         })
         const data = await res.json()
         if (!res.ok) throw new Error(data.message)
         setPasswordSuccess('Password updated successfully!')
         setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
       } catch (err) {
         setPasswordError(err.message || 'Failed to update password.')
       } finally {
         setChangingPassword(false)
       }
     }
   
     if (loading) {
       return (
         <div className="max-w-2xl space-y-6 animate-pulse">
           <div className="h-40 bg-gray-100 rounded-2xl"></div>
           <div className="h-40 bg-gray-100 rounded-2xl"></div>
         </div>
       )
     }
   
     return (
       <div className="max-w-2xl space-y-6 pb-10">
   
         {/* Profile info */}
         <Section title="Profile Information">
           {error && <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-sm">❌ {error}</div>}
           {success && <div className="bg-green-50 border border-green-300 text-green-600 px-4 py-3 rounded-xl text-sm">✅ {success}</div>}
   
           <form onSubmit={handleSave} className="space-y-4">
             <div className="flex items-center gap-4 mb-2">
               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                 {(profile.name || 'U').charAt(0).toUpperCase()}
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-900">{profile.name || 'Your name'}</p>
                 <p className="text-xs text-gray-400">Ground Owner</p>
               </div>
             </div>
   
             <Field label="Full Name">
               <input type="text" name="name" value={profile.name} onChange={handleChange} required placeholder="Your name" className={inputClass} />
             </Field>
             <Field label="Email Address">
               <input type="email" name="email" value={profile.email} onChange={handleChange} required placeholder="you@example.com" className={inputClass} />
             </Field>
             <Field label="Phone Number">
               <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="e.g. 03xx-xxxxxxx" className={inputClass} />
             </Field>
   
             <div className="flex justify-end pt-2">
               <button type="submit" disabled={saving}
                 className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-200 disabled:cursor-not-allowed text-white font-black text-sm transition-all">
                 {saving ? 'Saving...' : 'Save Changes'}
               </button>
             </div>
           </form>
         </Section>
   
         {/* Password */}
         <Section title="Change Password">
           {passwordError && <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-sm">❌ {passwordError}</div>}
           {passwordSuccess && <div className="bg-green-50 border border-green-300 text-green-600 px-4 py-3 rounded-xl text-sm">✅ {passwordSuccess}</div>}
   
           <form onSubmit={handlePasswordChange} className="space-y-4">
             <Field label="Current Password">
               <input type="password" value={passwordForm.currentPassword}
                 onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                 required placeholder="••••••••" className={inputClass} />
             </Field>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Field label="New Password">
                 <input type="password" value={passwordForm.newPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                   required placeholder="••••••••" className={inputClass} />
               </Field>
               <Field label="Confirm New Password">
                 <input type="password" value={passwordForm.confirmPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                   required placeholder="••••••••" className={inputClass} />
               </Field>
             </div>
             <div className="flex justify-end pt-2">
               <button type="submit" disabled={changingPassword}
                 className="px-6 py-3 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 font-bold text-sm transition-all disabled:opacity-50">
                 {changingPassword ? 'Updating...' : 'Update Password'}
               </button>
             </div>
           </form>
         </Section>
       </div>
     )
}