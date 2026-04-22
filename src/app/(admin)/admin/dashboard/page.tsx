'use client'

import { Card } from '@/components/shared/Card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, FileText, AlertCircle } from 'lucide-react'

const data = [
  { name: 'Jan', users: 400, posts: 240, revenue: 2400 },
  { name: 'Feb', users: 520, posts: 290, revenue: 2210 },
  { name: 'Mar', users: 680, posts: 320, revenue: 2290 },
  { name: 'Apr', users: 750, posts: 380, revenue: 2380 },
  { name: 'May', users: 890, posts: 430, revenue: 2500 },
  { name: 'Jun', users: 1200, posts: 520, revenue: 2800 },
]

const roles = [
  { name: 'Admin', value: 12 },
  { name: 'Moderator', value: 28 },
  { name: 'User', value: 9860 },
]

const colors = ['#0284c7', '#06b6d4', '#0ea5e9']

export default function AdminDashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's your platform overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-secondary-900">9,900</p>
              <p className="text-xs text-green-600 font-medium mt-1">+12% from last month</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Total Posts</p>
              <p className="text-2xl font-bold text-secondary-900">2,430</p>
              <p className="text-xs text-green-600 font-medium mt-1">+8% from last month</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-secondary-900">3,420</p>
              <p className="text-xs text-green-600 font-medium mt-1">+5% from yesterday</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Pending Reports</p>
              <p className="text-2xl font-bold text-secondary-900">24</p>
              <p className="text-xs text-red-600 font-medium mt-1">4 critical</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-secondary-900 mb-6">User Growth & Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: 'solid 1px #cbd5e1' }} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ fill: '#0284c7', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* User Roles Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-secondary-900 mb-6">User Roles</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: { name?: string; value?: number }) => `${name || 'Unknown'} (${value || 0})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roles.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-bold text-secondary-900 mb-6">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: 'solid 1px #cbd5e1' }} />
              <Bar dataKey="revenue" fill="#0284c7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-bold text-secondary-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'New user sign up', user: 'Jane Doe', time: '2 min ago' },
              { action: 'Post reported', user: 'Violating content', time: '15 min ago' },
              { action: 'User banned', user: 'johndoe123', time: '1 hour ago' },
              { action: 'System maintenance', user: 'Scheduled', time: '3 hours ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-secondary-200 last:border-0">
                <div>
                  <p className="font-medium text-secondary-900">{activity.action}</p>
                  <p className="text-xs text-secondary-500">{activity.user}</p>
                </div>
                <p className="text-xs text-secondary-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
