'use client'

import { useState } from 'react'
import { Card, Badge } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Search, ChevronDown, Trash2, Edit2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  joinDate: string
  status: 'active' | 'inactive' | 'banned'
  posts: number
  followers: number
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2024-01-15',
    status: 'active',
    posts: 45,
    followers: 240,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    joinDate: '2024-02-20',
    status: 'active',
    posts: 28,
    followers: 180,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    joinDate: '2024-03-10',
    status: 'active',
    posts: 12,
    followers: 95,
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    joinDate: '2024-01-05',
    status: 'inactive',
    posts: 8,
    followers: 65,
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    joinDate: '2024-04-15',
    status: 'banned',
    posts: 0,
    followers: 0,
  },
]

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'followers'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all')

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      case 'followers':
        return b.followers - a.followers
      default:
        return 0
    }
  })

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'warning'
      case 'banned':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Users Management</h1>
        <p className="text-secondary-600">Manage platform users and permissions</p>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-secondary-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-secondary-900">9,900</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">8,750</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-yellow-600">1,050</p>
        </Card>
        <Card>
          <p className="text-sm text-secondary-600 mb-1">Banned</p>
          <p className="text-2xl font-bold text-red-600">100</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => setSortBy('name')}
                    className="flex items-center gap-2 font-semibold text-secondary-900"
                  >
                    Name
                    {sortBy === 'name' && <ChevronDown className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-secondary-900">Email</th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => setSortBy('date')}
                    className="flex items-center gap-2 font-semibold text-secondary-900"
                  >
                    Joined
                    {sortBy === 'date' && <ChevronDown className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-secondary-900">Status</th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => setSortBy('followers')}
                    className="flex items-center gap-2 font-semibold text-secondary-900"
                  >
                    Followers
                    {sortBy === 'followers' && <ChevronDown className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-secondary-900">Posts</th>
                <th className="px-6 py-4 text-right font-semibold text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-secondary-200 hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-secondary-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{user.email}</td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-secondary-900 font-medium">{user.followers}</td>
                  <td className="px-6 py-4 text-secondary-900">{user.posts}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4 text-secondary-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Showing <span className="font-medium">{sortedUsers.length}</span> results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
