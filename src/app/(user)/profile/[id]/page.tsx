'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { ProfileLayout } from '../components/ProfileLayout'

export default function UserProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isOwnProfile = currentUser?.id === id

  useEffect(() => {
    apiClient.getUserById(id as string).then((res) => {
      const p = res.data

      setProfile({
        name: p.full_name || p.username,
        avatar: p.profile_photo,
        title: p.profession,
        location: p.location,
        company: p.company,
        email: p.email,
        phone_number: p.phone_number,
        about: p.about || p.short_bio,
      })
    })
  }, [id])

  if (!profile) return <div>Loading...</div>

  return (
    <ProfileLayout
      profile={profile}
      userId={id as string}
      isOwnProfile={isOwnProfile}
    />
  )
}