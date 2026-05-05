'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X, Plus, Pencil, Briefcase, GraduationCap } from 'lucide-react'
import { CompleteProfileSchema, type CompleteProfileInput } from '@/lib/validations'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { useAppDispatch } from '@/hooks/useRedux'
import { completeProfile } from '@/redux/slices/authSlice'
import { validateImageFile } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
type ExperienceEntry = {
  title: string
  employment_type: string
  company: string
  location: string
  location_type: string
  start_month: string
  start_year: string
  currently_working: boolean
  end_month: string
  end_year: string
  description: string
  skills: string[]
}

type EducationEntry = {
  school: string
  degree: string
  field_of_study: string
  start_month: string
  start_year: string
  end_month: string
  end_year: string
  grade: string
  activities: string
  description: string
  skills: string[]
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => String(CURRENT_YEAR - i))

const EMPTY_EXP: ExperienceEntry = {
  title: '', employment_type: '', company: '', location: '',
  location_type: '', start_month: '', start_year: '',
  currently_working: false, end_month: '', end_year: '', description: '', skills: [],
}
const EMPTY_EDU: EducationEntry = {
  school: '', degree: '', field_of_study: '',
  start_month: '', start_year: '', end_month: '', end_year: '',
  grade: '', activities: '', description: '', skills: [],
}

// ── Tiny shared field components ──────────────────────────────────────────────
function MField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function MSelect({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; placeholder?: string
}) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function MTextarea({ label, value, onChange, placeholder, rows = 4, maxLength }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number; maxLength?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows} maxLength={maxLength}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      {maxLength && <p className="text-right text-xs text-gray-400 mt-0.5">{value.length}/{maxLength}</p>}
    </div>
  )
}

// ── Experience Modal ──────────────────────────────────────────────────────────
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
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Add a skill (e.g., AutoCAD)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

function ExperienceModal({ initial, onSave, onClose }: {
  initial: ExperienceEntry
  onSave: (e: ExperienceEntry) => void
  onClose: () => void
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

          <MField label="Title" value={form.title} onChange={v => set('title', v)}
            placeholder="Ex: Senior Engineer" required />

          <MSelect label="Employment type" value={form.employment_type}
            onChange={v => set('employment_type', v)} placeholder="Please select"
            options={['Full-time','Part-time','Self-employed','Freelance','Contract','Internship','Apprenticeship','Seasonal']} />

          <MField label="Company name" value={form.company} onChange={v => set('company', v)}
            placeholder="Ex: Microsoft" required />

          <MField label="Location" value={form.location} onChange={v => set('location', v)}
            placeholder="Ex: London, United Kingdom" />

          <MSelect label="Location type" value={form.location_type}
            onChange={v => set('location_type', v)} placeholder="Please select"
            options={['On-site','Remote','Hybrid']} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
            <div className="grid grid-cols-2 gap-3">
              <MSelect label="" value={form.start_month} onChange={v => set('start_month', v)}
                options={MONTHS} placeholder="Month" />
              <MSelect label="" value={form.start_year} onChange={v => set('start_year', v)}
                options={YEARS} placeholder="Year" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="currently_working" checked={form.currently_working}
              onChange={e => set('currently_working', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="currently_working" className="text-sm text-gray-700">I currently work here</label>
          </div>

          {!form.currently_working && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <div className="grid grid-cols-2 gap-3">
                <MSelect label="" value={form.end_month} onChange={v => set('end_month', v)}
                  options={MONTHS} placeholder="Month" />
                <MSelect label="" value={form.end_year} onChange={v => set('end_year', v)}
                  options={YEARS} placeholder="Year" />
              </div>
            </div>
          )}

          <MTextarea label="Description" value={form.description}
            onChange={v => set('description', v)}
            placeholder="Describe your role and achievements..." rows={4} />

          <SkillsInput skills={form.skills} onChange={v => set('skills', v)} />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
            Cancel
          </button>
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

// ── Education Modal ───────────────────────────────────────────────────────────
function EducationModal({ initial, onSave, onClose }: {
  initial: EducationEntry
  onSave: (e: EducationEntry) => void
  onClose: () => void
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
            placeholder="Ex: California State University, Fullerton" required />

          <MField label="Degree" value={form.degree} onChange={v => set('degree', v)}
            placeholder="Ex: Bachelor of Science - BS, Cum Laude" />

          <MField label="Field of study" value={form.field_of_study}
            onChange={v => set('field_of_study', v)} placeholder="Ex: Mechanical Engineering" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
            <div className="grid grid-cols-2 gap-3">
              <MSelect label="" value={form.start_month} onChange={v => set('start_month', v)}
                options={MONTHS} placeholder="Month" />
              <MSelect label="" value={form.start_year} onChange={v => set('start_year', v)}
                options={YEARS} placeholder="Year" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End date (or expected)</label>
            <div className="grid grid-cols-2 gap-3">
              <MSelect label="" value={form.end_month} onChange={v => set('end_month', v)}
                options={MONTHS} placeholder="Month" />
              <MSelect label="" value={form.end_year} onChange={v => set('end_year', v)}
                options={YEARS} placeholder="Year" />
            </div>
          </div>

          <MField label="Grade" value={form.grade} onChange={v => set('grade', v)}
            placeholder="Ex: 3.58" />

          <MTextarea label="Activities and societies" value={form.activities}
            onChange={v => set('activities', v)}
            placeholder="Ex: Tau Beta Pi, Society of Automotive Engineers, BAJA"
            rows={3} maxLength={500} />

          <MTextarea label="Description" value={form.description}
            onChange={v => set('description', v)}
            placeholder="Describe your studies and achievements..." rows={4} maxLength={1000} />

          <SkillsInput skills={form.skills} onChange={v => set('skills', v)} />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
            Cancel
          </button>
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CompleteProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Experience
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [expModal, setExpModal] = useState(false)
  const [editExpIndex, setEditExpIndex] = useState<number | null>(null)

  // Education
  const [educations, setEducations] = useState<EducationEntry[]>([])
  const [eduModal, setEduModal] = useState(false)
  const [editEduIndex, setEditEduIndex] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(CompleteProfileSchema),
  })

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const err = validateImageFile(file); if (err) { alert(err); return }
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onload = (event) => setPreviewImage(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const err = validateImageFile(file); if (err) { alert(err); return }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = (event) => setCoverPreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Experience handlers
  const handleSaveExp = (entry: ExperienceEntry) => {
    if (editExpIndex !== null) {
      setExperiences(prev => prev.map((e, i) => i === editExpIndex ? entry : e))
    } else {
      setExperiences(prev => [...prev, entry])
    }
    setExpModal(false)
    setEditExpIndex(null)
  }

  // Education handlers
  const handleSaveEdu = (entry: EducationEntry) => {
    if (editEduIndex !== null) {
      setEducations(prev => prev.map((e, i) => i === editEduIndex ? entry : e))
    } else {
      setEducations(prev => [...prev, entry])
    }
    setEduModal(false)
    setEditEduIndex(null)
  }

  const onSubmit = async (data: CompleteProfileInput) => {
    setError(null)
    try {
      const payload: any = {
        profile_photo: profilePhoto || null,
        cover_image: coverImage || null,
        full_name: data.full_name || null,
        profession: data.profession || null,
        company: data.company || null,
        short_bio: data.short_bio || null,
        about: data.about || null,
        skills: skills.length > 0 ? skills : null,
        location: data.location || null,
        experience: experiences.length > 0 ? experiences : null,
        education: educations.length > 0 ? educations : null,
      }
      const result = await dispatch(completeProfile(payload))
      if (completeProfile.fulfilled.match(result)) {
        router.push('/dashboard')
      } else if (completeProfile.rejected.match(result)) {
        setError(result.payload as string)
      }
    } catch (err: any) {
      setError(err.message || 'Profile completion failed')
    }
  }

  return (
    <div className="py-12">
      <Card className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Complete Your Profile</h1>
          <p className="text-secondary-600">Let's set up your professional profile to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Cover Image Upload */}
          <div>
            <label className="label">Cover Image</label>
            <p className="text-xs text-gray-400 mb-2">Recommended: horizontal banner (16:5 ratio, e.g. 1584×396px)</p>
            <label className="block cursor-pointer">
              <div
                className="w-full rounded-xl overflow-hidden border-2 border-dashed border-secondary-300 hover:border-primary-400 transition-colors flex items-center justify-center bg-gray-50"
                style={{ aspectRatio: '16/5' }}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 py-6">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Click to upload cover image</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
            {coverPreview && (
              <button
                type="button"
                onClick={() => { setCoverImage(null); setCoverPreview(null) }}
                className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove cover image
              </button>
            )}
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="label">Profile Photo</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-secondary-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                  <span className="text-secondary-600">Click to upload or drag and drop</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <Input {...register('full_name')} type="text" placeholder="John Doe" label="Full Name" error={errors.full_name?.message} />
          <Input {...register('profession')} type="text" placeholder="Software Engineer" label="Profession" error={errors.profession?.message} />
          <Input {...register('company')} type="text" placeholder="Acme Inc." label="Company" error={errors.company?.message} />
          <Input {...register('location')} type="text" placeholder="New York, USA" label="Location" error={errors.location?.message} />
          <Textarea {...register('short_bio')} placeholder="A short bio about yourself" label="Short Bio" error={errors.short_bio?.message} rows={3} />
          <Textarea {...register('about')} placeholder="Tell us more about yourself" label="About" error={errors.about?.message} rows={4} />

          {/* Skills */}
          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                placeholder="Add a skill (e.g., React, Python)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddSkill() }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-primary-900">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Experience ─────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Experience
              </label>
              <button
                type="button"
                onClick={() => { setEditExpIndex(null); setExpModal(true) }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              >
                <Plus className="w-4 h-4" /> Add experience
              </button>
            </div>

            {experiences.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
                No experience added yet. Click &ldquo;Add experience&rdquo; to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 group">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{exp.title}</p>
                      <p className="text-sm text-gray-600">{exp.company}{exp.employment_type ? ` · ${exp.employment_type}` : ''}</p>
                      {(exp.start_year || exp.currently_working) && (
                        <p className="text-xs text-gray-400">
                          {exp.start_month} {exp.start_year} – {exp.currently_working ? 'Present' : `${exp.end_month} ${exp.end_year}`}
                          {exp.location ? ` · ${exp.location}` : ''}
                        </p>
                      )}
                      {exp.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{exp.description}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button type="button" onClick={() => { setEditExpIndex(i); setExpModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setExperiences(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-500 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Education ──────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education
              </label>
              <button
                type="button"
                onClick={() => { setEditEduIndex(null); setEduModal(true) }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              >
                <Plus className="w-4 h-4" /> Add education
              </button>
            </div>

            {educations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
                No education added yet. Click &ldquo;Add education&rdquo; to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {educations.map((edu, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 group">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{edu.degree || edu.school}</p>
                      <p className="text-sm text-gray-600">{edu.school}</p>
                      {edu.field_of_study && <p className="text-xs text-gray-500">{edu.field_of_study}</p>}
                      {(edu.start_year || edu.end_year) && (
                        <p className="text-xs text-gray-400">{edu.start_year} – {edu.end_year || 'Present'}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button type="button" onClick={() => { setEditEduIndex(i); setEduModal(true) }}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setEducations(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-500 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting} variant="primary" size="lg">
            Complete Profile
          </Button>
        </form>
      </Card>

      {/* Experience Modal */}
      {expModal && (
        <ExperienceModal
          initial={editExpIndex !== null ? experiences[editExpIndex] : EMPTY_EXP}
          onSave={handleSaveExp}
          onClose={() => { setExpModal(false); setEditExpIndex(null) }}
        />
      )}

      {/* Education Modal */}
      {eduModal && (
        <EducationModal
          initial={editEduIndex !== null ? educations[editEduIndex] : EMPTY_EDU}
          onSave={handleSaveEdu}
          onClose={() => { setEduModal(false); setEditEduIndex(null) }}
        />
      )}
    </div>
  )
}
