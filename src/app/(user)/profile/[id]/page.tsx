'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import apiClient from '@/lib/api-client'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function UserProfileRedirect() {
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    let mounted = true
    apiClient
      .getUserById(id as string)
      .then((res) => {
        if (!mounted) return
        const p = res.data
        const name = p.full_name || p.username || String(id)
        const slug = `${id}-${slugify(name)}`
        router.replace(`/profile/${slug}`)
      })
      .catch(() => {
        // If fetch fails, keep current page (could show 404 later)
      })
    return () => {
      mounted = false
    }
  }, [id, router])

  return <div>Redirecting to profile...</div>
}