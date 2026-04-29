'use client'

import { useEffect, useState } from 'react'
import adminApi from '@/lib/admin-api'
import { Card } from '@/components/shared/Card'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      setData(res.data)
    })
  }, [])

  if (!data) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card><p>Total Users</p><h2>{data.totalUsers}</h2></Card>
        <Card><p>Active Users</p><h2>{data.activeUsers24h}</h2></Card>
        <Card><p>Total Posts</p><h2>{data.totalPosts}</h2></Card>
        <Card><p>New Signups</p><h2>{data.newSignups}</h2></Card>
        <Card><p>Flagged</p><h2>{data.flaggedContent}</h2></Card>
      </div>
    </div>
  )
}