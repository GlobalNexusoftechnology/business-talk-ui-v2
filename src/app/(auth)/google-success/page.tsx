'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { useAppDispatch } from '@/hooks/useRedux'
import { setUser } from '@/redux/slices/authSlice'

export default function GoogleSuccessPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ cookies already set by backend
        const res = await apiClient.getMyProfile()

        dispatch(setUser(res.data))

        router.replace('/dashboard')
      } catch (err) {
        router.replace('/login')
      }
    }

    init()
  }, [dispatch, router])

  return (
    <div className="h-screen flex items-center justify-center">
      <p>Signing you in...</p>
    </div>
  )
}