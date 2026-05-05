'use client'

import { useEffect, useState } from 'react'
import adminApi from '@/lib/admin-api'
// import apiClient from '@/lib/api-client'

import {
  Users,
  UserCheck,
  FileText,
  Flag,
  // AlertTriangle,
  TrendingUp,
} from 'lucide-react'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [engagement, setEngagement] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          dashboardRes,
          activityRes,
          engagementRes,
          usersRes,
          reportsRes,
        ] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getActivity(),
          adminApi.getEngagement(),
          adminApi.getAllUsers(),
          adminApi.getReports(),
        ])

        setStats(dashboardRes.data)

        setActivity(activityRes.data || [])
        setEngagement(engagementRes.data || [])

        setRecentUsers((usersRes.data || []).slice(0, 5))
        setReports((reportsRes.data?.data || []).slice(0, 5))

      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) return <div className="p-6">Loading dashboard...</div>

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers,
      icon: Users,
    },
    {
      name: 'Active Users',
      value: stats?.activeUsers24h,
      icon: UserCheck,
    },
    {
      name: 'Total Posts',
      value: stats?.totalPosts,
      icon: FileText,
    },
    {
      name: 'Reports',
      value: stats?.reportedcontent,
      icon: Flag,
    },
  ]

  const activityChartData = activity.map((item: any) => ({
    date: item?.date,
    posts: Number(item?.posts || 0),
    comments: Number(item?.comments || 0),
  }))

  const getUserStatus = (u: any): 'active' | 'reported' | 'suspended' => {
    if (u?.is_banned) return 'suspended'
    if (u?.is_reported || u?.isReported || Number(u?.warning_count || 0) > 0) {
      return 'reported'
    }
    return 'active'
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">
          Platform insights & moderation
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.name} className="bg-gray-50 p-5 rounded border">
              <div className="flex justify-between mb-3">
                <Icon className="text-blue-600" />
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-500">{s.name}</p>
            </div>
          )
        })}
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ACTIVITY */}
        <div className="bg-gray-50 p-6 rounded border">
          <h2 className="font-semibold mb-4">Platform Activity</h2>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="posts"
                name="Posts"
                stroke="#2563EB"
                fill="#60A5FA"
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="comments"
                name="Comments"
                stroke="#10B981"
                fill="#34D399"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ENGAGEMENT */}
        <div className="bg-gray-50 p-6 rounded border">
          <h2 className="font-semibold mb-4">Engagement</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={engagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="engagement" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================= TABLES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* USERS */}
        <div className="bg-gray-50 rounded border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Users</h2>
          </div>

          <div className="p-4 space-y-3">
            {recentUsers.map((u: any) => {
              const status = getUserStatus(u)

              return (
                <div key={u.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {u.full_name || u.username}
                    </p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>

                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={
                      status === 'suspended'
                        ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                        : status === 'reported'
                        ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                        : { backgroundColor: '#DCFCE7', color: '#166534' }
                    }
                  >
                    {status === 'suspended'
                      ? 'Suspended'
                      : status === 'reported'
                      ? 'Reported'
                      : 'Active'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* REPORTS */}
        <div className="bg-gray-50 rounded border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Reported Content</h2>
          </div>

          <div className="p-4 space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="border p-3 rounded bg-white">
                <p className="text-sm">{r.reason}</p>
                <p className="text-xs text-gray-500">
                  {r.content_type}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() =>
                      adminApi.resolveReport(r.id, 'IGNORE')
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() =>
                      adminApi.resolveReport(r.id, 'REMOVE_POST')
                    }
                  >
                    Delete
                  </button>

                  <button
                    className="bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() =>
                      adminApi.resolveReport(r.id, 'WARN_USER')
                    }
                  >
                    Warn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}