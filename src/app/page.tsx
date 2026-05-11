'use client'

import { useAuth } from '@/hooks/useRedux'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] redirect', {
          reason: 'root-route-authenticated',
          target: '/dashboard',
        })
      }
      router.replace('/dashboard')
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] redirect', {
          reason: 'root-route-unauthenticated',
          target: '/login',
        })
      }
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
