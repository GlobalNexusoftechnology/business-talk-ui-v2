'use client'

import { useEffect, useState, useCallback } from 'react'
import apiClient from '@/lib/api-client'

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const isGuest =
      typeof window !== 'undefined' &&
      !localStorage.getItem('user')

    if (isGuest) {
      setLoading(false)
      return
    }

    try {
      const [
        profileRes,
        statsRes,
        activityRes,
      ] = await Promise.all([
        apiClient.getMyProfileinfo(),
        apiClient.getDashboardStats(),
        apiClient.getUserActivity(),
      ])

      setProfile(profileRes.data)
      setStats(statsRes.data)
      setActivity(activityRes.data)
    } catch (err) {
      console.error(
        'Profile fetch error:',
        err
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    profile,
    stats,
    activity,
    loading,
    refetch: fetchAll,
  }
}