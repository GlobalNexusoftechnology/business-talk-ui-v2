import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { useAppSelector } from '@/hooks/useRedux'

export function useFollow(targetUserId: string) {
  const queryClient = useQueryClient()
  const currentUserId = useAppSelector((state) => String(state.auth?.user?.id || ''))
  const [state, setState] = useState<'connect' | 'pending' | 'connected'>('connect')
  const [loading, setLoading] = useState(false)

  const followingQueryKey = useMemo(
    () => ['my-following', currentUserId],
    [currentUserId],
  )

  const isUUID = (id: string) => id?.length > 10

  // Fetch the current user's following list — shared React Query cache across all instances
  const { data: followingIds } = useQuery<string[]>({
    queryKey: followingQueryKey,
    queryFn: async () => {
      if (!currentUserId) return []
      const res = await apiClient.getFollowing(currentUserId)
      const arr = Array.isArray(res.data)
        ? res.data
        : (res.data?.data ?? res.data?.following ?? [])
      return arr.map((item: any) => {
        const u = item.following ?? item.user ?? item
        return String(u.id || u.userId || '')
      }).filter(Boolean)
    },
    enabled: !!currentUserId && !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 min — shared across all follow buttons
  })

  // Sync local state from API data once resolved
  useEffect(() => {
    if (!targetUserId || followingIds === undefined) return
    setState(followingIds.includes(String(targetUserId)) ? 'connected' : 'connect')
  }, [followingIds, targetUserId])

  const follow = async () => {
    if (!isUUID(targetUserId)) {
      console.error('Invalid UUID:', targetUserId)
      return
    }

    try {
      setLoading(true)
      setState('pending')
      await apiClient.followUserById(targetUserId)

      // Keep connect buttons in sync across people/profile/feed cards.
      queryClient.setQueryData<string[]>(followingQueryKey, (prev) => {
        const next = Array.isArray(prev) ? prev.slice() : []
        if (!next.includes(String(targetUserId))) next.push(String(targetUserId))
        return next
      })

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

      queryClient.setQueryData<string[]>(followingQueryKey, (prev) =>
        (Array.isArray(prev) ? prev : []).filter((id) => id !== String(targetUserId)),
      )

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
    isHydrated: followingIds !== undefined,
  }
}