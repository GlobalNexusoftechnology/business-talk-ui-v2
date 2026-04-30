'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Download,
  Eye,
  AlertTriangle,
  Ban,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react'

import apiClient from '@/lib/api-client'
import adminApi from '@/lib/admin-api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'reported'>('all')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ================= CURRENT USER =================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
  }, [])

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getAllUsers()

        const normalized = res.data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username || 'User',
          email: u.email,
          company: u.company || 'N/A',
          role: u.profession || 'User',

          posts: 0,
          followers: 0,
          lastActive: 'N/A',

          status: u.is_banned
            ? 'suspended'
            : u.warning_count > 0
            ? 'reported'
            : 'active',

          verified: u.is_verified || false,
          is_banned: u.is_banned,
          warning_count: u.warning_count,
        }))

        setUsers(normalized)
        setFilteredUsers(normalized)
      } catch (err) {
        console.error(err)
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
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(temp)
  }, [searchQuery, filter, users])

  // ================= HELPERS =================
  const isSameUser = (user: any) => currentUser?.id === user.id

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  // ================= ACTIONS =================

  const handleWarn = async (id: string) => {
    await adminApi.warnUser(id)

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, warning_count: u.warning_count + 1, status: 'reported' }
          : u
      )
    )
  }

  const handleBanToggle = async (user: any) => {
    if (user.is_banned) await adminApi.unbanUser(user.id)
    else await adminApi.banUser(user.id)

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              is_banned: !u.is_banned,
              status: !u.is_banned ? 'suspended' : 'active',
            }
          : u
      )
    )
  }

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/user/${id}`)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  // ================= STATS =================
  const total = users.length
  const active = users.filter((u) => u.status === 'active').length
  const suspended = users.filter((u) => u.status === 'suspended').length
  const reported = users.filter((u) => u.status === 'reported').length

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Users Management</h1>
        <p className="text-sm text-gray-500">Manage platform users</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat title="Total Users" value={total} />
        <Stat title="Active Users" value={active} green />
        <Stat title="Suspended" value={suspended} red />
        <Stat title="Reported" value={reported} yellow />
      </div>

      {/* FILTERS */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex gap-3 flex-wrap">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-full"
              placeholder="Search users..."
            />
          </div>

          {/* TABS */}
          {['all', 'active', 'suspended', 'reported'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-4 py-2 rounded ${
                filter === t ? 'bg-blue-600 text-white' : 'bg-white border'
              }`}
            >
              {t}
            </button>
          ))}

          <button className="px-4 py-2 border rounded flex gap-2">
            <Download size={16} /> Export
          </button>
        </div>

        {/* BULK */}
        {selectedUsers.length > 0 && (
          <div className="mt-3 flex gap-2">
            <button className="bg-yellow-600 text-white px-3 py-1 rounded">
              Suspend
            </button>
            <button className="bg-red-600 text-white px-3 py-1 rounded">
              Delete
            </button>
          </div>
        )}
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
                  onChange={toggleSelectAll}
                />
              </th>
              <th>User</th>
              <th>Company</th>
              <th>Activity</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">

                {/* SELECT */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => toggleUserSelection(u.id)}
                  />
                </td>

                {/* USER */}
                <td className="p-3 flex gap-3 items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white">
                    {u.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      {u.name}
                      {u.verified && <CheckCircle size={14} />}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </td>

                {/* COMPANY */}
                <td>{u.company}</td>

                {/* ACTIVITY */}
                <td>
                  <div>{u.posts} posts</div>
                  <div className="text-xs text-gray-500">{u.followers} followers</div>
                </td>

                {/* STATUS */}
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : u.status === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {u.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="flex gap-2 justify-end p-3">

                  <button onClick={() => setSelectedUser(u)}>
                    <Eye size={16} />
                  </button>

                  <button onClick={() => handleWarn(u.id)}>
                    <AlertTriangle size={16} />
                  </button>

                  {!isSameUser(u) && (
                    <button onClick={() => handleBanToggle(u)}>
                      <Ban size={16} />
                    </button>
                  )}

                  {!isSameUser(u) && (
                    <button onClick={() => handleDelete(u.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[400px] relative">

            <button onClick={() => setSelectedUser(null)} className="absolute top-2 right-2">
              <X />
            </button>

            <h2 className="font-bold text-lg mb-4">User Details</h2>

            <p><b>Name:</b> {selectedUser.name}</p>
            <p><b>Email:</b> {selectedUser.email}</p>

            <div className="flex gap-2 mt-4">

              <button onClick={() => handleWarn(selectedUser.id)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                Warn
              </button>

              {!isSameUser(selectedUser) && (
                <button
                  onClick={() => handleBanToggle(selectedUser)}
                  className={`px-3 py-1 rounded text-white ${
                    selectedUser.is_banned ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {selectedUser.is_banned ? 'Unban' : 'Ban'}
                </button>
              )}

              {!isSameUser(selectedUser) && (
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="bg-black text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  )
}

// ================= STAT COMPONENT =================
function Stat({ title, value, green, red, yellow }: any) {
  return (
    <div className={`p-4 rounded border ${
      green ? 'bg-green-50 border-green-200'
      : red ? 'bg-red-50 border-red-200'
      : yellow ? 'bg-yellow-50 border-yellow-200'
      : 'bg-gray-50'
    }`}>
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}