'use client'

import { useEffect, useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { ProfileLayout } from '@/app/(user)/profile/components/ProfileLayout'

export default function MyProfilePage() {
  const {
    profile,
    stats,
    activity,
    loading,

    loadMoreActivity,
    loadingMoreActivity,
    hasMoreActivity,
  } = useProfile()

  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      if (u?.id) setUserId(u.id)
    } catch {
      // ignore
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>No profile</div>

  const normalized = {
    username: profile.username,
    name: profile.full_name,
    cover_image: profile.cover_image,
    avatar: profile.profile_photo,
    title: profile.profession,
    location: profile.location,
    company: profile.company,
    email: profile.email,
    phone_number: profile.phone_number,
    about: profile.about || profile.short_bio,
    experience: profile.experience,
    education: profile.education,
  }

  return (
    <ProfileLayout
      profile={normalized}
      userId={userId || profile.id}
      isOwnProfile={true}
      stats={stats}
      activity={activity}
      loadMoreActivity={loadMoreActivity}
      loadingMoreActivity={loadingMoreActivity}
      hasMoreActivity={hasMoreActivity}
    />
  )
}