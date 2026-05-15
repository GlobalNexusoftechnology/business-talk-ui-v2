'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { ProfileLayout } from '../components/ProfileLayout'
import { useAppSelector } from '@/hooks/useRedux'

function parseIdFromSlug(slug?: string) {
  if (!slug) return ''
  // expect formats like "123" or "123-john-doe" or "john-doe"
  // if there's a dash, take the part before it (e.g. "123-john-doe" -> "123")
    // If slug starts with a UUID, return the full UUID (handles UUIDs with dashes)
    const uuidMatch = slug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)
    if (uuidMatch) return uuidMatch[0]

    // if there's a dash (e.g. "123-john-doe"), take the part before it
    const firstPart = slug.includes('-') ? slug.split('-')[0] : slug
    // if the first part is numeric, return it (numeric id)
    if (/^\d+$/.test(firstPart)) return firstPart
    // otherwise return the first part (could be username)
    return firstPart
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
