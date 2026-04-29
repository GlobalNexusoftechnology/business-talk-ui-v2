'use client'

import { useProfile } from '@/hooks/useProfile'
import { ProfileLayout } from '@/app/(user)/profile/components/ProfileLayout'

export default function MyProfilePage() {
  const { profile, loading } = useProfile()

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>No profile</div>

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const normalized = {
    name: profile.full_name,
    avatar: profile.profile_photo,
    title: profile.profession,
    location: profile.location,
    company: profile.company,
    email: profile.email,
    phone_number: profile.phone_number,
    about: profile.about || profile.short_bio,
  }

  return (
    <ProfileLayout
      profile={normalized}
      userId={currentUser?.id}
      isOwnProfile={true}
    />
  )
}