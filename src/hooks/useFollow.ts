import { useState } from 'react'
import apiClient from '@/lib/api-client'

export function useFollow(targetUserId: string) {
  const [state, setState] = useState<'connect' | 'pending' | 'connected'>('connect')
  const [loading, setLoading] = useState(false)

  const isUUID = (id: string) => id?.length > 10

  const follow = async () => {
    if (!isUUID(targetUserId)) {
      console.error('Invalid UUID:', targetUserId)
      return
    }

    try {
      setLoading(true)
      setState('pending')

      await apiClient.followUserById(targetUserId)

      setState('connected')
    } catch (err) {
      console.error('Follow error:', err)
      setState('connect')
    } finally {
      setLoading(false)
    }
  }

  const unfollow = async () => {
    try {
      setLoading(true)
      await apiClient.unfollowUserById(targetUserId)
      setState('connect')
    } catch (err) {
      console.error('Unfollow error:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    state,
    loading,
    follow,
    unfollow,
  }
}