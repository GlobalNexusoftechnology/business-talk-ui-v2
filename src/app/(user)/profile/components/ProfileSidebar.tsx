'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone, Users, Newspaper, MessageSquare, TrendingUp } from 'lucide-react'
import apiClient from '@/lib/api-client'

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        {label}
      </div>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  )
}

export function ProfileSidebar({
  profile,
  userId,
  statsProp,
}: {
  profile: any
  userId?: string
  statsProp?: any
}) {
  const [stats, setStats] = useState<{
    followers: number
    posts: number
    comments: number
    engagement: number
  } | null>(null)

  useEffect(() => {
    // Use pre-loaded dashboard stats if available (own profile)
    if (statsProp) {
      setStats({
        followers: statsProp.followersCount ?? statsProp.followers_count ?? statsProp.followers ?? 0,
        posts:     statsProp.postsCount    ?? statsProp.posts_count    ?? statsProp.posts    ?? 0,
        comments:  statsProp.commentsCount ?? statsProp.comments_count ?? statsProp.comments ?? 0,
        engagement:statsProp.engagement    ?? 0,
      })
      return
    }

    // Other user's profile — fetch via dedicated stats endpoint
    if (!userId) return

    const fetchStats = async () => {
      try {
        const res = await apiClient.getUserStats(userId)
        const d = res.data
        setStats({
          followers:  d.followersCount ?? d.followers_count ?? d.followers ?? 0,
          posts:      d.postsCount    ?? d.posts_count    ?? d.posts    ?? 0,
          comments:   d.commentsCount ?? d.comments_count ?? d.comments ?? 0,
          engagement: d.engagement    ?? 0,
        })
      } catch {
        // Fall back: count follower array length
        try {
          const res = await apiClient.getFollowers(userId)
          const followers = Array.isArray(res.data) ? res.data.length : (res.data?.count ?? 0)
          setStats({ followers, posts: 0, comments: 0, engagement: 0 })
        } catch {
          // silently ignore
        }
      }
    }

    fetchStats()
  }, [userId, statsProp])

  return (
    <div className="space-y-6">

      {/* CONTACT */}
      <div className="bg-white p-6 rounded-2xl border">
        <h2 className="font-semibold mb-4">Contact</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-2 items-center">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{profile.email || 'N/A'}</span>
          </div>
          <div className="flex gap-2 items-center">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{profile.phone_number || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="font-semibold mb-3">Stats</h2>
          <div>
            <StatRow icon={<Users className="w-4 h-4 text-blue-500" />} label="Followers" value={stats.followers} />
            {stats.posts > 0 && (
              <StatRow icon={<Newspaper className="w-4 h-4 text-orange-400" />} label="Posts" value={stats.posts} />
            )}
            {stats.comments > 0 && (
              <StatRow icon={<MessageSquare className="w-4 h-4 text-teal-500" />} label="Comments" value={stats.comments} />
            )}
            {stats.engagement > 0 && (
              <StatRow icon={<TrendingUp className="w-4 h-4 text-purple-500" />} label="Engagement" value={stats.engagement} />
            )}
          </div>
        </div>
      )}

    </div>
  )
}