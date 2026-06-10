'use client'

import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'

export function useUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isGuest =
      typeof window !== 'undefined' &&
      !localStorage.getItem('user')

    if (isGuest) {
      setLoading(false)
      return
    }

    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await apiClient.getFollowSuggestions()
      setUsers(res.data || [])
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }

  const followUser = async (id: string) => {
    try {
      await apiClient.followUserById(id)

      // 🔥 instant UI update
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      console.error('Follow failed', err)
    }
  }

  const unfollowUser = async (id: string) => {
    try {
      await apiClient.unfollowUserById(id)
      fetchUsers()
    } catch (err) {
      console.error('Unfollow failed', err)
    }
  }

  return { users, loading, followUser, unfollowUser }
}