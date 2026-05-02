'use client'



import {

  User, Lock, Bell, Shield, Mail, Smartphone, Eye, Globe,

  Upload, X, Briefcase, GraduationCap, Plus, Pencil, Trash2,

} from 'lucide-react'

import { useState, useEffect } from 'react'

import apiClient from '@/lib/api-client'



// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ExperienceEntry = {

  title: string; employment_type: string; company: string; location: string

  location_type: string; start_month: string; start_year: string

  currently_working: boolean; end_month: string; end_year: string

  description: string; skills: string[]

}

type EducationEntry = {

  school: string; degree: string; field_of_study: string

  start_month: string; start_year: string; end_month: string; end_year: string

  grade: string; activities: string; description: string; skills: string[]

}



const MONTHS = ['January','February','March','April','May','June',

  'July','August','September','October','November','December']

const YEARS = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i))



const EMPTY_EXP: ExperienceEntry = {

  title: '', employment_type: '', company: '', location: '', location_type: '',

  start_month: '', start_year: '', currently_working: false,

  end_month: '', end_year: '', description: '', skills: [],

}

const EMPTY_EDU: EducationEntry = {

  school: '', degree: '', field_of_study: '',

  start_month: '', start_year: '', end_month: '', end_year: '',

  grade: '', activities: '', description: '', skills: [],

}



function parseMaybeJson(val: any): any[] {

  if (!val) return []

  if (Array.isArray(val)) return val

  try { return JSON.parse(val) } catch { return [] }

}



// â”€â”€ Shared field helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MField({ label, value, onChange, placeholder, required, type = 'text' }: {

  label?: string; value: string; onChange: (v: string) => void

  placeholder?: string; required?: boolean; type?: string

}) {

  return (

    <div>

      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}

      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}

        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

    </div>

  )

}

function MSelect({ label, value, onChange, options, placeholder }: {

  label?: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string

}) {

  return (

    <div>

      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <select value={value} onChange={e => onChange(e.target.value)}

        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">

        {placeholder && <option value="">{placeholder}</option>}

        {options.map(o => <option key={o} value={o}>{o}</option>)}

      </select>

    </div>

  )

}

function MTextarea({ label, value, onChange, placeholder, rows = 3, maxLength }: {

  label?: string; value: string; onChange: (v: string) => void

  placeholder?: string; rows?: number; maxLength?: number

}) {

  return (

    <div>

      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}

        rows={rows} maxLength={maxLength}

        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />

    </div>

  )

}

function SkillsInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {

  const [input, setInput] = useState('')

  const add = () => {

    const v = input.trim()

    if (v && !skills.includes(v)) { onChange([...skills, v]); setInput('') }

  }

  return (

    <div>

      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>

      <div className="flex gap-2 mb-2">

        <input type="text" value={input} onChange={e => setInput(e.target.value)}

          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}

          placeholder="Add a skill (press Enter)"

          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <button type="button" onClick={add}

          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition">

          + Add

        </button>

      </div>

      {skills.length > 0 && (

        <div className="flex flex-wrap gap-2">

          {skills.map(s => (

            <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">

              {s}

              <button type="button" onClick={() => onChange(skills.filter(x => x !== s))}

                className="hover:text-blue-900"><X className="w-3 h-3" /></button>

            </span>

          ))}

        </div>

      )}

    </div>

  )

}



// â”€â”€ Experience Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ExperienceModal({ initial, onSave, onClose }: {

  initial: ExperienceEntry; onSave: (e: ExperienceEntry) => void; onClose: () => void

}) {

  const [form, setForm] = useState<ExperienceEntry>(initial)

  const set = (field: keyof ExperienceEntry, value: string | boolean | string[]) =>

    setForm(f => ({ ...f, [field]: value }))

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b">

          <h2 className="text-lg font-semibold">{initial.title ? 'Edit experience' : 'Add experience'}</h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>

        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">

          <p className="text-xs text-gray-500">* Indicates required</p>

          <MField label="Title" value={form.title} onChange={v => set('title', v)} placeholder="Ex: Senior Engineer" required />

          <MSelect label="Employment type" value={form.employment_type} onChange={v => set('employment_type', v)}

            placeholder="Please select" options={['Full-time','Part-time','Self-employed','Freelance','Contract','Internship','Apprenticeship','Seasonal']} />

          <MField label="Company name" value={form.company} onChange={v => set('company', v)} placeholder="Ex: Microsoft" required />

          <MField label="Location" value={form.location} onChange={v => set('location', v)} placeholder="Ex: London, United Kingdom" />

          <MSelect label="Location type" value={form.location_type} onChange={v => set('location_type', v)}

            placeholder="Please select" options={['On-site','Remote','Hybrid']} />

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>

            <div className="grid grid-cols-2 gap-3">

              <MSelect value={form.start_month} onChange={v => set('start_month', v)} options={MONTHS} placeholder="Month" />

              <MSelect value={form.start_year} onChange={v => set('start_year', v)} options={YEARS} placeholder="Year" />

            </div>

          </div>

          <div className="flex items-center gap-3">

            <input type="checkbox" id="cw_settings" checked={form.currently_working}

              onChange={e => set('currently_working', e.target.checked)}

              className="w-4 h-4 rounded border-gray-300 text-blue-600" />

            <label htmlFor="cw_settings" className="text-sm text-gray-700">I currently work here</label>

          </div>

          {!form.currently_working && (

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>

              <div className="grid grid-cols-2 gap-3">

                <MSelect value={form.end_month} onChange={v => set('end_month', v)} options={MONTHS} placeholder="Month" />

                <MSelect value={form.end_year} onChange={v => set('end_year', v)} options={YEARS} placeholder="Year" />

              </div>

            </div>

          )}

          <MTextarea label="Description" value={form.description} onChange={v => set('description', v)}

            placeholder="Describe your role and achievements..." rows={4} />

          <SkillsInput skills={form.skills} onChange={v => set('skills', v)} />

        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t">

          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>

          <button onClick={() => { if (form.title.trim() && form.company.trim()) onSave(form) }}

            disabled={!form.title.trim() || !form.company.trim()}

            className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition">

            Save

          </button>

        </div>

      </div>

    </div>

  )

}



// â”€â”€ Education Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EducationModal({ initial, onSave, onClose }: {

  initial: EducationEntry; onSave: (e: EducationEntry) => void; onClose: () => void

}) {

  const [form, setForm] = useState<EducationEntry>(initial)

  const set = (field: keyof EducationEntry, value: string | string[]) =>

    setForm(f => ({ ...f, [field]: value }))

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b">

          <h2 className="text-lg font-semibold">{initial.school ? 'Edit education' : 'Add education'}</h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>

        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">

          <p className="text-xs text-gray-500">* Indicates required</p>

          <MField label="School" value={form.school} onChange={v => set('school', v)}

            placeholder="Ex: California State University" required />

          <MField label="Degree" value={form.degree} onChange={v => set('degree', v)} placeholder="Ex: Bachelor of Science" />

          <MField label="Field of study" value={form.field_of_study} onChange={v => set('field_of_study', v)}

            placeholder="Ex: Mechanical Engineering" />

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>

            <div className="grid grid-cols-2 gap-3">

              <MSelect value={form.start_month} onChange={v => set('start_month', v)} options={MONTHS} placeholder="Month" />

              <MSelect value={form.start_year} onChange={v => set('start_year', v)} options={YEARS} placeholder="Year" />

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">End date (or expected)</label>

            <div className="grid grid-cols-2 gap-3">

              <MSelect value={form.end_month} onChange={v => set('end_month', v)} options={MONTHS} placeholder="Month" />

              <MSelect value={form.end_year} onChange={v => set('end_year', v)} options={YEARS} placeholder="Year" />

            </div>

          </div>

          <MField label="Grade" value={form.grade} onChange={v => set('grade', v)} placeholder="Ex: 3.58" />

          <MTextarea label="Activities and societies" value={form.activities} onChange={v => set('activities', v)}

            placeholder="Ex: Tau Beta Pi, Society of Automotive Engineers" rows={3} maxLength={500} />

          <MTextarea label="Description" value={form.description} onChange={v => set('description', v)}

            placeholder="Describe your studies and achievements..." rows={4} maxLength={1000} />

          <SkillsInput skills={form.skills} onChange={v => set('skills', v)} />

        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t">

          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>

          <button onClick={() => { if (form.school.trim()) onSave(form) }}

            disabled={!form.school.trim()}

            className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition">

            Save

          </button>

        </div>

      </div>

    </div>

  )

}



// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SettingsPage() {

  const [activeTab, setActiveTab] = useState('profile')



  // â”€â”€ Profile state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const [profile, setProfile] = useState({

    full_name: '', profession: '', company: '',

    location: '', phone_number: '', short_bio: '',

  })

  const [profileSkills, setProfileSkills] = useState<string[]>([])

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [coverImage, setCoverImage] = useState<File | null>(null)

  const [coverPreview, setCoverPreview] = useState<string | null>(null)



  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])

  const [expModal, setExpModal] = useState(false)

  const [editExpIndex, setEditExpIndex] = useState<number | null>(null)



  const [educations, setEducations] = useState<EducationEntry[]>([])

  const [eduModal, setEduModal] = useState(false)

  const [editEduIndex, setEditEduIndex] = useState<number | null>(null)



  const [loading, setLoading] = useState(false)

  const [saving, setSaving] = useState(false)

  const [success, setSuccess] = useState('')

  const [error, setError] = useState('')



  // â”€â”€ Account/Security state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const [email, setEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')

  const [newPassword, setNewPassword] = useState('')

  const [confirmPassword, setConfirmPassword] = useState('')

  const [pwLoading, setPwLoading] = useState(false)

  const [pwSuccess, setPwSuccess] = useState('')

  const [pwError, setPwError] = useState('')

  const [twoFactorAuth, setTwoFactorAuth] = useState(false)



  // â”€â”€ Notification / Privacy state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const [emailNotifications, setEmailNotifications] = useState(true)

  const [pushNotifications, setPushNotifications] = useState(true)

  const [profileVisibility, setProfileVisibility] = useState('public')



  useEffect(() => {

    setLoading(true)

    apiClient.getMyProfileinfo().then(res => {

      const d = res.data

      setProfile({

        full_name:    d.full_name    || '',

        profession:   d.profession   || '',

        company:      d.company      || '',

        location:     d.location     || '',

        phone_number: d.phone_number || '',

        short_bio:    d.short_bio || d.about || '',

      })

      setEmail(d.email || '')

      setProfileSkills(Array.isArray(d.skills) ? d.skills : parseMaybeJson(d.skills))

      setExperiences(parseMaybeJson(d.experience))

      setEducations(parseMaybeJson(d.education))

      if (d.profile_photo) setPhotoPreview(d.profile_photo)

      if (d.cover_image)   setCoverPreview(d.cover_image)

    }).catch(() => setError('Failed to load profile'))

      .finally(() => setLoading(false))

  }, [])



  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]; if (!file) return

    setProfilePhoto(file)

    const r = new FileReader(); r.onload = ev => setPhotoPreview(ev.target?.result as string); r.readAsDataURL(file)

  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]; if (!file) return

    setCoverImage(file)

    const r = new FileReader(); r.onload = ev => setCoverPreview(ev.target?.result as string); r.readAsDataURL(file)

  }



  const handleSaveProfile = async () => {

    setSaving(true); setError(''); setSuccess('')

    try {

      const form = new FormData()

      if (profilePhoto) form.append('profile_photo', profilePhoto)

      if (coverImage)   form.append('cover_image', coverImage)

      Object.entries(profile).forEach(([k, v]) => { if (v) form.append(k, v) })

      profileSkills.forEach(s => form.append('skills', s))

      form.append('experience', JSON.stringify(experiences))

      form.append('education',  JSON.stringify(educations))

      await apiClient.updateProfile(form)

      setSuccess('Profile updated successfully!')

      setProfilePhoto(null); setCoverImage(null)

    } catch (err: any) {

      setError(err?.message || 'Failed to update profile')

    } finally { setSaving(false) }

  }



  const handleChangePassword = async () => {

    if (!newPassword)                         { setPwError('New password is required'); return }

    if (newPassword !== confirmPassword)       { setPwError('Passwords do not match'); return }

    if (newPassword.length < 8)               { setPwError('Password must be at least 8 characters'); return }

    setPwLoading(true); setPwError(''); setPwSuccess('')

    try {

      await apiClient.changePassword({ password: newPassword })

      setPwSuccess('Password changed successfully!')

      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')

    } catch (err: any) {

      setPwError(err?.message || 'Failed to change password')

    } finally { setPwLoading(false) }

  }



  const tabs = [

    { id: 'profile',       label: 'Profile Settings',   icon: User },

    { id: 'account',       label: 'Account & Security', icon: Lock },

    { id: 'notifications', label: 'Notifications',      icon: Bell },

    { id: 'privacy',       label: 'Privacy',            icon: Shield },

  ]



  // Reusable styled input for the profile tab (keeps existing style)

  const SInput = ({ label, stateKey, type }: {

    label: string; stateKey: keyof typeof profile; type?: string

  }) => (

    <div>

      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>{label}</label>

      <input type={type ?? 'text'} value={profile[stateKey]}

        onChange={e => setProfile(p => ({ ...p, [stateKey]: e.target.value }))}

        placeholder={profile[stateKey] || undefined}

        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"

        style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8', color: '#212529' }}

        onFocus={e => (e.currentTarget.style.outlineColor = '#1976D2')} />

    </div>

  )



  return (

    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>

      <div className="max-w-5xl mx-auto">

        <div className="mb-6">

          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#212529' }}>Settings</h1>

          <p style={{ color: '#5F6368' }}>Manage your account settings and preferences</p>

        </div>



        <div className="grid md:grid-cols-4 gap-6">

          {/* Sidebar */}

          <div className="md:col-span-1">

            <div className="bg-white rounded-2xl shadow-sm border p-2" style={{ border: '1px solid #E8E8E8' }}>

              {tabs.map(tab => {

                const Icon = tab.icon

                return (

                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}

                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1"

                    style={{ backgroundColor: activeTab === tab.id ? '#E3F2FD' : 'transparent', color: activeTab === tab.id ? '#1976D2' : '#5F6368' }}

                    onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = '#F8F9FA' }}

                    onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent' }}>

                    <Icon className="w-5 h-5" />

                    <span className="font-medium text-sm">{tab.label}</span>

                  </button>

                )

              })}

            </div>

          </div>



          {/* Content */}

          <div className="md:col-span-3">



            {/* â”€â”€ PROFILE TAB â”€â”€ */}

            {activeTab === 'profile' && (

              <div className="space-y-6">

                {loading && <div className="text-sm text-gray-500 bg-white rounded-xl p-4 border">Loading profile...</div>}

                {error   && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">{error}</div>}

                {success && <div className="text-sm text-green-700 bg-green-50 rounded-xl p-4 border border-green-200">{success}</div>}



                {/* Cover image */}

                <div className="bg-white rounded-2xl border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold mb-1" style={{ color: '#212529' }}>Cover Image</h2>

                  <p className="text-xs text-gray-400 mb-3">Recommended: 1584Ã—396px (16:5 ratio)</p>

                  <label className="block cursor-pointer">

                    <div className="w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center bg-gray-50"

                      style={{ aspectRatio: '16/5' }}>

                      {coverPreview

                        ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />

                        : <div className="flex flex-col items-center gap-2 text-gray-400 py-6">

                            <Upload className="w-8 h-8" />

                            <span className="text-sm">Click to upload cover image</span>

                          </div>

                      }

                    </div>

                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />

                  </label>

                  {coverImage && (

                    <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(null) }}

                      className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">

                      <X className="w-3 h-3" /> Remove

                    </button>

                  )}

                </div>



                {/* Profile photo */}

                <div className="bg-white rounded-2xl border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>Profile Photo</h2>

                  <div className="flex items-center gap-6">

                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">

                      {photoPreview

                        ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />

                        : <User className="w-10 h-10 text-gray-400" />

                      }

                    </div>

                    <div className="flex-1">

                      <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">

                        <Upload className="w-4 h-4 mr-2 text-gray-500" />

                        <span className="text-sm text-gray-600">Click to upload or drag and drop</span>

                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

                      </label>

                      {profilePhoto && (

                        <button type="button" onClick={() => { setProfilePhoto(null); setPhotoPreview(null) }}

                          className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">

                          <X className="w-3 h-3" /> Remove

                        </button>

                      )}

                    </div>

                  </div>

                </div>



                {/* Basic info */}

                <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold" style={{ color: '#212529' }}>Basic Information</h2>

                  <SInput label="Full Name"           stateKey="full_name" />

                  <SInput label="Professional Title"  stateKey="profession" />

                  <SInput label="Company"             stateKey="company" />

                  <SInput label="Location"            stateKey="location" />

                  <SInput label="Phone Number"        stateKey="phone_number" type="tel" />

                  <div>

                    <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>Bio</label>

                    <textarea rows={4} value={profile.short_bio}

                      onChange={e => setProfile(p => ({ ...p, short_bio: e.target.value }))}

                      placeholder={profile.short_bio || 'Tell us about yourself...'}

                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"

                      style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8', color: '#212529' }}

                      onFocus={e => (e.currentTarget.style.outlineColor = '#1976D2')} />

                  </div>

                </div>



                {/* Skills */}

                <div className="bg-white rounded-2xl border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>Skills</h2>

                  <SkillsInput skills={profileSkills} onChange={setProfileSkills} />

                </div>



                {/* Experience */}

                <div className="bg-white rounded-2xl border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-xl font-semibold" style={{ color: '#212529' }}>Experience</h2>

                    <button onClick={() => { setEditExpIndex(null); setExpModal(true) }}

                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition">

                      <Plus className="w-4 h-4" /> Add more experience

                    </button>

                  </div>

                  {experiences.length === 0

                    ? <p className="text-sm text-gray-400">No experience added yet.</p>

                    : (

                      <div className="space-y-3">

                        {experiences.map((exp, i) => (

                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">

                            <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />

                            <div className="flex-1 min-w-0">

                              <p className="text-sm font-semibold text-gray-800">{exp.title}</p>

                              <p className="text-xs text-gray-500">{exp.company}{exp.employment_type ? ` Â· ${exp.employment_type}` : ''}</p>

                              <p className="text-xs text-gray-400">

                                {exp.start_month} {exp.start_year} â€“ {exp.currently_working ? 'Present' : `${exp.end_month} ${exp.end_year}`}

                              </p>

                            </div>

                            <div className="flex gap-1 shrink-0">

                              <button onClick={() => { setEditExpIndex(i); setExpModal(true) }}

                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition">

                                <Pencil className="w-3.5 h-3.5" />

                              </button>

                              <button onClick={() => setExperiences(prev => prev.filter((_, j) => j !== i))}

                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition">

                                <Trash2 className="w-3.5 h-3.5" />

                              </button>

                            </div>

                          </div>

                        ))}

                      </div>

                    )

                  }

                </div>



                {/* Education */}

                <div className="bg-white rounded-2xl border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <div className="flex items-center justify-between mb-4">

                    <h2 className="text-xl font-semibold" style={{ color: '#212529' }}>Education</h2>

                    <button onClick={() => { setEditEduIndex(null); setEduModal(true) }}

                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition">

                      <Plus className="w-4 h-4" /> Add more education

                    </button>

                  </div>

                  {educations.length === 0

                    ? <p className="text-sm text-gray-400">No education added yet.</p>

                    : (

                      <div className="space-y-3">

                        {educations.map((edu, i) => (

                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">

                            <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />

                            <div className="flex-1 min-w-0">

                              <p className="text-sm font-semibold text-gray-800">{edu.school}</p>

                              <p className="text-xs text-gray-500">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</p>

                              <p className="text-xs text-gray-400">

                                {edu.start_month} {edu.start_year}{edu.end_year ? ` â€“ ${edu.end_month} ${edu.end_year}` : ''}

                              </p>

                            </div>

                            <div className="flex gap-1 shrink-0">

                              <button onClick={() => { setEditEduIndex(i); setEduModal(true) }}

                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition">

                                <Pencil className="w-3.5 h-3.5" />

                              </button>

                              <button onClick={() => setEducations(prev => prev.filter((_, j) => j !== i))}

                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition">

                                <Trash2 className="w-3.5 h-3.5" />

                              </button>

                            </div>

                          </div>

                        ))}

                      </div>

                    )

                  }

                </div>



                {/* Save all */}

                <button onClick={handleSaveProfile} disabled={saving}

                  className="px-6 py-3 text-white rounded-lg transition-all font-medium"

                  style={{ backgroundColor: '#212529' }}

                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3D3D3D')}

                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212529')}>

                  {saving ? 'Saving...' : 'Save All Changes'}

                </button>

              </div>

            )}



            {/* â”€â”€ ACCOUNT TAB â”€â”€ */}

            {activeTab === 'account' && (

              <div className="space-y-6">

                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>Account Security</h2>



                  {pwError   && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4 border border-red-200">{pwError}</div>}

                  {pwSuccess && <div className="text-sm text-green-700 bg-green-50 rounded-xl p-3 mb-4 border border-green-200">{pwSuccess}</div>}



                  <div className="space-y-4">

                    <div>

                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>Email Address</label>

                      <input type="email" value={email} readOnly

                        className="w-full px-4 py-3 rounded-lg cursor-not-allowed"

                        style={{ backgroundColor: '#F0F0F0', border: '1px solid #E8E8E8', color: '#5F6368' }} />

                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>

                    </div>



                    <hr style={{ borderColor: '#E8E8E8' }} />

                    <p className="text-sm font-semibold" style={{ color: '#212529' }}>Change Password</p>



                    <div>

                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>Current Password</label>

                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}

                        placeholder="Enter current password"

                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"

                        style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8', color: '#212529' }}

                        onFocus={e => (e.currentTarget.style.outlineColor = '#1976D2')} />

                    </div>

                    <div>

                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>New Password</label>

                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}

                        placeholder="Enter new password (min. 8 characters)"

                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"

                        style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8', color: '#212529' }}

                        onFocus={e => (e.currentTarget.style.outlineColor = '#1976D2')} />

                    </div>

                    <div>

                      <label className="block text-sm font-medium mb-2" style={{ color: '#212529' }}>Confirm New Password</label>

                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}

                        placeholder="Re-enter new password"

                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"

                        style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8', color: '#212529' }}

                        onFocus={e => (e.currentTarget.style.outlineColor = '#1976D2')} />

                    </div>



                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>

                      <div className="flex items-center gap-3">

                        <Smartphone className="w-5 h-5" style={{ color: '#5F6368' }} />

                        <div>

                          <p className="font-medium" style={{ color: '#212529' }}>Two-Factor Authentication</p>

                          <p className="text-sm" style={{ color: '#5F6368' }}>Add an extra layer of security</p>

                        </div>

                      </div>

                      <button onClick={() => setTwoFactorAuth(!twoFactorAuth)}

                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"

                        style={{ backgroundColor: twoFactorAuth ? '#1976D2' : '#BDBDBD' }}>

                        <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"

                          style={{ transform: twoFactorAuth ? 'translateX(24px)' : 'translateX(4px)' }} />

                      </button>

                    </div>



                    <button onClick={handleChangePassword} disabled={pwLoading}

                      className="px-6 py-3 text-white rounded-lg transition-all font-medium"

                      style={{ backgroundColor: '#212529' }}

                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3D3D3D')}

                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212529')}>

                      {pwLoading ? 'Updating...' : 'Update Password'}

                    </button>

                  </div>

                </div>

              </div>

            )}



            {/* â”€â”€ NOTIFICATIONS TAB â”€â”€ */}

            {activeTab === 'notifications' && (

              <div className="space-y-6">

                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>Notification Preferences</h2>

                  <div className="space-y-4">

                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>

                      <div className="flex items-center gap-3">

                        <Mail className="w-5 h-5" style={{ color: '#5F6368' }} />

                        <div>

                          <p className="font-medium" style={{ color: '#212529' }}>Email Notifications</p>

                          <p className="text-sm" style={{ color: '#5F6368' }}>Receive notifications via email</p>

                        </div>

                      </div>

                      <button onClick={() => setEmailNotifications(!emailNotifications)}

                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"

                        style={{ backgroundColor: emailNotifications ? '#1976D2' : '#BDBDBD' }}>

                        <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"

                          style={{ transform: emailNotifications ? 'translateX(24px)' : 'translateX(4px)' }} />

                      </button>

                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>

                      <div className="flex items-center gap-3">

                        <Bell className="w-5 h-5" style={{ color: '#5F6368' }} />

                        <div>

                          <p className="font-medium" style={{ color: '#212529' }}>Push Notifications</p>

                          <p className="text-sm" style={{ color: '#5F6368' }}>Receive push notifications on your device</p>

                        </div>

                      </div>

                      <button onClick={() => setPushNotifications(!pushNotifications)}

                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"

                        style={{ backgroundColor: pushNotifications ? '#1976D2' : '#BDBDBD' }}>

                        <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"

                          style={{ transform: pushNotifications ? 'translateX(24px)' : 'translateX(4px)' }} />

                      </button>

                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>

                      <p className="font-medium mb-3" style={{ color: '#212529' }}>Email me about:</p>

                      <div className="space-y-2">

                        {['New connections','Post likes and comments','Messages','Group activity','Weekly summary'].map(item => (

                          <label key={item} className="flex items-center gap-2 cursor-pointer">

                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#1976D2' }} />

                            <span className="text-sm" style={{ color: '#212529' }}>{item}</span>

                          </label>

                        ))}

                      </div>

                    </div>

                    <button className="px-6 py-3 text-white rounded-lg transition-all"

                      style={{ backgroundColor: '#212529' }}

                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3D3D3D')}

                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212529')}>

                      Save Preferences

                    </button>

                  </div>

                </div>

              </div>

            )}



            {/* â”€â”€ PRIVACY TAB â”€â”€ */}

            {activeTab === 'privacy' && (

              <div className="space-y-6">

                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ border: '1px solid #E8E8E8' }}>

                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>Privacy Settings</h2>

                  <div className="space-y-4">

                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>

                      <div className="flex items-center gap-3 mb-3">

                        <Eye className="w-5 h-5" style={{ color: '#5F6368' }} />

                        <p className="font-medium" style={{ color: '#212529' }}>Profile Visibility</p>

                      </div>

                      <div className="space-y-2">

                        {[

                          { value: 'public',      label: 'Public - Anyone can see your profile' },

                          { value: 'connections', label: 'Connections Only - Only your connections can see your full profile' },

                          { value: 'private',     label: 'Private - Only you can see your profile' },

                        ].map(option => (

                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">

                            <input type="radio" name="visibility" value={option.value}

                              checked={profileVisibility === option.value}

                              onChange={e => setProfileVisibility(e.target.value)}

                              className="w-4 h-4" style={{ accentColor: '#1976D2' }} />

                            <span className="text-sm" style={{ color: '#212529' }}>{option.label}</span>

                          </label>

                        ))}

                      </div>

                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>

                      <div className="flex items-center gap-3 mb-3">

                        <Globe className="w-5 h-5" style={{ color: '#5F6368' }} />

                        <p className="font-medium" style={{ color: '#212529' }}>Who can see your:</p>

                      </div>

                      <div className="space-y-3">

                        {['Connections list','Email address','Phone number','Posts and activity'].map(item => (

                          <div key={item} className="flex items-center justify-between">

                            <span className="text-sm" style={{ color: '#212529' }}>{item}</span>

                            <select className="px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"

                              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E8', color: '#212529' }}

                              onFocus={e => (e.currentTarget.style.outlineColor = '#1976D2')}>

                              <option>Everyone</option>

                              <option>Connections</option>

                              <option>Only me</option>

                            </select>

                          </div>

                        ))}

                      </div>

                    </div>

                    <button className="px-6 py-3 text-white rounded-lg transition-all"

                      style={{ backgroundColor: '#212529' }}

                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3D3D3D')}

                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212529')}>

                      Save Privacy Settings

                    </button>

                  </div>

                </div>

              </div>

            )}



          </div>

        </div>

      </div>



      {/* Experience modal */}

      {expModal && (

        <ExperienceModal

          initial={editExpIndex !== null ? experiences[editExpIndex] : EMPTY_EXP}

          onSave={entry => {

            setExperiences(prev => editExpIndex !== null

              ? prev.map((e, i) => i === editExpIndex ? entry : e)

              : [...prev, entry])

            setExpModal(false); setEditExpIndex(null)

          }}

          onClose={() => { setExpModal(false); setEditExpIndex(null) }}

        />

      )}



      {/* Education modal */}

      {eduModal && (

        <EducationModal

          initial={editEduIndex !== null ? educations[editEduIndex] : EMPTY_EDU}

          onSave={entry => {

            setEducations(prev => editEduIndex !== null

              ? prev.map((e, i) => i === editEduIndex ? entry : e)

              : [...prev, entry])

            setEduModal(false); setEditEduIndex(null)

          }}

          onClose={() => { setEduModal(false); setEditEduIndex(null) }}

        />

      )}

    </div>

  )

}

