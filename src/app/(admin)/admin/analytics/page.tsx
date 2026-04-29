'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import apiClient from '@/lib/api-client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export default function AdminAnalyticsPage() {
  const [activity, setActivity] = useState<any[]>([])
  const [engagement, setEngagement] = useState<any[]>([])
  const [growth, setGrowth] = useState<any>(null)
  const [topPosts, setTopPosts] = useState<any[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [
          activityRes,
          engagementRes,
          growthRes,
          postsRes,
          usersRes,
        ] = await Promise.all([
          apiClient.getActivityAnalytics(7),
          apiClient.getEngagementAnalytics(7),
          apiClient.getGrowthAnalytics(7),
          apiClient.getTopPosts(),
          apiClient.getTopUsers(),
        ])

        setActivity(activityRes.data || [])
        setEngagement(engagementRes.data || [])
        setGrowth(growthRes.data || {})
        setTopPosts(postsRes.data || [])
        setTopUsers(usersRes.data || [])
      } catch (err) {
        console.error('Analytics fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return <div>Loading analytics...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">
        Analytics Dashboard
      </h1>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-secondary-600">New Users</p>
          <h2 className="text-2xl font-bold">{growth?.newUsers || 0}</h2>
        </Card>

        <Card>
          <p className="text-sm text-secondary-600">New Posts</p>
          <h2 className="text-2xl font-bold">{growth?.newPosts || 0}</h2>
        </Card>

        <Card>
          <p className="text-sm text-secondary-600">Period</p>
          <h2 className="text-2xl font-bold">{growth?.period || '7 days'}</h2>
        </Card>
      </div>

      {/* ================= ACTIVITY CHART ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-bold mb-4">Posts & Comments Activity</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              <Line type="monotone" dataKey="posts" stroke="#0284c7" />
              <Line type="monotone" dataKey="comments" stroke="#06b6d4" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ================= ENGAGEMENT CHART ================= */}
        <Card>
          <h3 className="font-bold mb-4">Engagement</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="engagement" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ================= TOP POSTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-bold mb-4">Top Posts</h3>

          <div className="space-y-3">
            {topPosts.length === 0 ? (
              <p className="text-sm text-secondary-500">No data</p>
            ) : (
              topPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="border-b pb-2 flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {post.content?.slice(0, 60) || 'Post'}
                    </p>
                    <p className="text-xs text-secondary-500">
                      by {post.user?.username || 'User'}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    👍 {post.upvotes || 0}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* ================= TOP USERS ================= */}
        <Card>
          <h3 className="font-bold mb-4">Top Users</h3>

          <div className="space-y-3">
            {topUsers.length === 0 ? (
              <p className="text-sm text-secondary-500">No data</p>
            ) : (
              topUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex justify-between border-b pb-2"
                >
                  <p>{user.username || user.full_name || 'User'}</p>
                  <p className="text-sm text-secondary-500">
                    warnings: {user.warning_count}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}