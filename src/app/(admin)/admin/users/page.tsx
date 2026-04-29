'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Download,
  Eye,
  AlertTriangle,
  Ban,
  Trash2,
  Mail,
  CheckCircle,
} from 'lucide-react'

import apiClient from '@/lib/api-client'
import adminApi from '@/lib/admin-api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'reported'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getAllUsers()

        const data = res.data || []

        const normalized = data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username,
          email: u.email,
          company: u.company || 'N/A',
          role: u.profession || 'User',
          posts: u.posts_count || 0,
          followers: u.followers_count || 0,
          status: u.is_banned
            ? 'suspended'
            : u.warning_count > 0
            ? 'reported'
            : 'active',
          verified: u.is_verified || false,
          lastActive: u.last_active || 'N/A',
        }))

        setUsers(normalized)
        setFilteredUsers(normalized)
      } catch (err) {
        console.error('Fetch users error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // ================= FILTER =================
  useEffect(() => {
    let temp = users

    if (filter !== 'all') {
      temp = temp.filter((u) => u.status === filter)
    }

    if (searchQuery) {
      temp = temp.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.company?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(temp)
  }, [searchQuery, filter, users])

  // ================= ACTIONS =================
  const handleWarn = async (id: string) => {
    try {
      await adminApi.warnUser(id)

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 'reported' } : u
        )
      )
    } catch (err) {
      console.error('Warn failed', err)
    }
  }

  const handleBan = async (id: string) => {
    try {
      await adminApi.banUser(id)

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 'suspended' } : u
        )
      )
    } catch (err) {
      console.error('Ban failed', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/user/${id}`)

      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  // ================= SELECTION =================
  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  if (loading) return <div className="p-6">Loading users...</div>

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Users Management
        </h1>
        <p className="text-sm text-gray-500">
          Manage and monitor platform users
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 border rounded">
          <p className="text-sm">Total Users</p>
          <p className="text-xl font-semibold">{users.length}</p>
        </div>

        <div className="bg-green-50 p-4 border rounded">
          <p className="text-sm">Active</p>
          <p className="text-xl font-semibold">
            {users.filter((u) => u.status === 'active').length}
          </p>
        </div>

        <div className="bg-red-50 p-4 border rounded">
          <p className="text-sm">Suspended</p>
          <p className="text-xl font-semibold">
            {users.filter((u) => u.status === 'suspended').length}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 border rounded">
          <p className="text-sm">Reported</p>
          <p className="text-xl font-semibold">
            {users.filter((u) => u.status === 'reported').length}
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-gray-50 border rounded p-4 flex flex-col sm:flex-row gap-4 items-center">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            className="pl-10 pr-3 py-2 border rounded w-full text-sm"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {['all', 'active', 'suspended', 'reported'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded text-sm ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'border bg-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 px-3 py-2 border rounded text-sm">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white border-b">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length}
                  onChange={toggleAll}
                />
              </th>
              <th>User</th>
              <th>Company</th>
              <th>Activity</th>
              <th>Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">

                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => toggleUser(u.id)}
                  />
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center text-sm">
                      {u.name?.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1 font-medium">
                        {u.name}
                        {u.verified && <CheckCircle size={14} />}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>

                <td>{u.company}</td>

                <td>
                  <div>{u.posts} posts</div>
                  <div className="text-xs text-gray-500">
                    {u.followers} followers
                  </div>
                </td>

                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      u.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : u.status === 'suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                <td className="text-right pr-4">
                  <div className="flex justify-end gap-2">

                    <button title="View">
                      <Eye size={16} />
                    </button>

                    <button title="Email">
                      <Mail size={16} />
                    </button>

                    <button
                      title="Warn"
                      onClick={() => handleWarn(u.id)}
                    >
                      <AlertTriangle size={16} />
                    </button>

                    <button
                      title="Ban"
                      onClick={() => handleBan(u.id)}
                    >
                      <Ban size={16} />
                    </button>

                    <button
                      title="Delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between text-sm text-gray-500">
        <p>
          Showing {filteredUsers.length} of {users.length}
        </p>
      </div>
    </div>
  )
}