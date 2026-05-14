'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { ProfileLayout } from '../components/ProfileLayout'
import { useAppSelector } from '@/hooks/useRedux'

function parseIdFromSlug(slug?: string) {
  if (!slug) return ''
  // expect formats like "123" or "123-john-doe" or "john-doe"
  if (slug.includes('-')) {
    const parts = slug.split('-')
    // if first part is numeric, treat as id
    if (/^\d+$/.test(parts[0])) return parts[0]
  }
  // fallback: assume slug itself might be id
  return slug
}

export default function UserProfilePage() {
  const params = useParams()
  const slug = params.slug as string
  const id = parseIdFromSlug(slug)

  const [profile, setProfile] = useState<any>(null)
  const currentUserId = useAppSelector((state) => String(state.auth?.user?.id || ''))
  const isOwnProfile = currentUserId !== '' && currentUserId === String(id)

  useEffect(() => {
    if (!id) return
    apiClient.getUserById(id as string).then((res) => {
      const p = res.data

      setProfile({
        name: p.full_name || p.username,
        cover_image: p.cover_image,
        avatar: p.profile_photo,
        title: p.profession,
        location: p.location,
        company: p.company,
        email: p.email,
        phone_number: p.phone_number,
        about: p.about || p.short_bio,
        experience: p.experience,
        education: p.education,
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
