'use client'

import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import { useAppDispatch } from '@/hooks/useRedux'
import { fetchNotifications, fetchUnreadCount } from '@/redux/slices/notificationsSlice'

export function useUsers() {
  const dispatch = useAppDispatch()
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

  const getConnectionRequestId = (user: any) => {
    const id = user?.connection_request_id ?? user?.request_id ?? user?.requestId ?? user?.connection_id ?? user?.connectionId ?? user?.id
    return id ? String(id) : ''
  }

  const acceptConnectionRequest = async (user: any) => {
    const requestId = getConnectionRequestId(user)
    if (!requestId) return

    try {
      await apiClient.acceptConnectionRequest(requestId)
      setUsers(prev => prev.filter((item) => String(item.id) !== String(user.id)))
      dispatch(fetchNotifications({ force: true }))
      dispatch(fetchUnreadCount())
    } catch (err) {
      console.error('Accept connection request failed', err)
    }
  }

  const deleteConnectionRequest = async (user: any) => {
    const requestId = getConnectionRequestId(user)
    if (!requestId) return

    try {
      await apiClient.deleteConnectionRequest(requestId)
      setUsers(prev => prev.filter((item) => String(item.id) !== String(user.id)))
      dispatch(fetchNotifications({ force: true }))
      dispatch(fetchUnreadCount())
    } catch (err) {
      console.error('Delete connection request failed', err)
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

  return { users, loading, followUser, unfollowUser, acceptConnectionRequest, deleteConnectionRequest }
}