'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X } from 'lucide-react'
import { CompleteProfileSchema, type CompleteProfileInput } from '@/lib/validations'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { useAppDispatch } from '@/hooks/useRedux'
import { completeProfile } from '@/redux/slices/authSlice'

export default function CompleteProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

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
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: CompleteProfileInput) => {
    setError(null)
    try {
      // Only include allowed fields for profile completion
      const payload: any = {
        profile_photo: profilePhoto || null,
        full_name: data.full_name || null,
        profession: data.profession || null,
        company: data.company || null,
        short_bio: data.short_bio || null,
        about: data.about || null,
        skills: skills.length > 0 ? skills : null,
        experience: data.experience || null,
        location: data.location || null,
      };
      const result = await dispatch(completeProfile(payload));
      if (completeProfile.fulfilled.match(result)) {
        router.push('/dashboard');
      } else if (completeProfile.rejected.match(result)) {
        setError(result.payload as string);
      }
    } catch (err: any) {
      setError(err.message || 'Profile completion failed');
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <Input
            {...register('full_name')}
            type="text"
            placeholder="John Doe"
            label="Full Name"
            error={errors.full_name?.message}
          />

          {/* Profession */}
          <Input
            {...register('profession')}
            type="text"
            placeholder="Software Engineer"
            label="Profession"
            error={errors.profession?.message}
          />

          {/* Company */}
          <Input
            {...register('company')}
            type="text"
            placeholder="Acme Inc."
            label="Company"
            error={errors.company?.message}
          />

          {/* Location */}
          <Input
            {...register('location')}
            type="text"
            placeholder="New York, USA"
            label="Location"
            error={errors.location?.message}
          />


          {/* Short Bio */}
          <Textarea
            {...register('short_bio')}
            placeholder="A short bio about yourself"
            label="Short Bio"
            error={errors.short_bio?.message}
            rows={3}
          />

          {/* About */}
          <Textarea
            {...register('about')}
            placeholder="Tell us more about yourself"
            label="About"
            error={errors.about?.message}
            rows={4}
          />

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
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience */}
          <Textarea
            {...register('experience')}
            placeholder="Describe your work experience"
            label="Experience"
            error={errors.experience?.message}
            rows={4}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting} variant="primary" size="lg">
            Complete Profile
          </Button>
        </form>
      </Card>
    </div>
  )
}
