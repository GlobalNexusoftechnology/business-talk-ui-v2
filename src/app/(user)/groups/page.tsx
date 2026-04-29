'use client'

import { Search, Users, Lock, Globe, TrendingUp, Plus } from 'lucide-react'
import { useState } from 'react'
// import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import apiClient from '@/lib/api-client'

interface Group {
  id: string
  name: string
  description: string
  image: string
  members: number
  posts: number
  type: 'public' | 'private'
  joined: boolean
  category: string
}

export default function GroupsPage() {
  // const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups'>('all')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [newGroup, setNewGroup] = useState<{
    name: string
    description: string
    visibility: 'PUBLIC' | 'PRIVATE'
    cover_image: string | File
  }>({
    name: '',
    description: '',
    visibility: 'PUBLIC',
    cover_image: '',
  })

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await apiClient.getGroups()
        const data = res.data || []

        const formatted = data.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          image: g.cover_image || '/placeholder.jpg',
          members: g.members_count || 0,
          posts: 0,
          type: g.visibility === 'PRIVATE' ? 'private' : 'public',
          joined: g.isJoined || false,
          category: 'General',
        }))

        setGroups(formatted)
      } catch (err) {
        console.error('Groups fetch error', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return

    try {
      const formData = new FormData()

      formData.append('name', newGroup.name.trim())
      formData.append('description', newGroup.description.trim())
      formData.append('visibility', newGroup.visibility)

      if (newGroup.cover_image instanceof File) {
        formData.append('cover_image', newGroup.cover_image)
      }

      const res = await apiClient.createGroup(formData)

      const g = res.data

      const formatted: Group = {
        id: g.id,
        name: g.name,
        description: g.description,
        image: g.cover_image || '/placeholder.jpg',
        members: 1,
        posts: 0,
        type: g.visibility === 'PRIVATE' ? 'private' : 'public',
        joined: true,
        category: 'General',
      }

      setGroups(prev => [formatted, ...prev])
      setShowCreateModal(false)

    } catch (err) {
      console.error('Create group error', err)
    }
  }

  const handleJoinToggle = async (groupId: string) => {
    try {
      const group = groups.find(g => g.id === groupId)

      if (!group) return

      if (group.joined) {
        await apiClient.leaveGroup(groupId)
      } else {
        await apiClient.joinGroup(groupId)
      }

      setGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, joined: !g.joined } : g
        )
      )
    } catch (err) {
      console.error('Join/Leave error', err)
    }
  }

  if (loading) {
    return <div className="p-6">Loading groups...</div>
  }

  // const handleGroupClick = (group: Group) => {
  //   router.push(`/groups/${group.id}`)
  // }

  const filteredGroups = activeTab === 'my-groups' ? groups.filter(g => g.joined) : groups

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#212529' }}>
            Groups
          </h1>
          <p style={{ color: '#5F6368' }}>Join professional communities and expand your network</p>
        </div>

        {/* Tabs & Search */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ border: '1px solid #E8E8E8' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'all' ? '#212529' : '#F8F9FA',
                  color: activeTab === 'all' ? '#FFFFFF' : '#5F6368',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'all') {
                    e.currentTarget.style.backgroundColor = '#E8E8E8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F8F9FA'
                  }
                }}
              >
                Discover Groups
              </button>
              <button
                onClick={() => setActiveTab('my-groups')}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'my-groups' ? '#212529' : '#F8F9FA',
                  color: activeTab === 'my-groups' ? '#FFFFFF' : '#5F6368',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'my-groups') {
                    e.currentTarget.style.backgroundColor = '#E8E8E8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'my-groups') {
                    e.currentTarget.style.backgroundColor = '#F8F9FA'
                  }
                }}
              >
                My Groups
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ backgroundColor: '#212529', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#5F6368' }} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: '#F8F9FA',
                border: '1px solid #E8E8E8',
                color: '#212529',
              }}
              onFocus={(e) => (e.currentTarget.style.outlineColor = '#212529')}
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              // onClick={() => handleGroupClick(group)}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              style={{ border: '1px solid #E8E8E8' }}
            >
              <img src={group.image} alt={group.name} className="w-full h-40 object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#212529' }}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm mb-2" style={{ color: '#5F6368' }}>
                      {group.type === 'public' ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <span className="capitalize">{group.type} Group</span>
                      <span>•</span>
                      <span>{group.category}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: '#5F6368' }}>
                  {group.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#5F6368' }}>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.members.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{group.posts.toLocaleString()} posts</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinToggle(group.id)}
                  className="w-full py-2.5 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: group.joined ? '#F8F9FA' : '#212529',
                    color: group.joined ? '#5F6368' : '#FFFFFF',
                  }}
                  onMouseEnter={(e) => {
                    if (group.joined) {
                      e.currentTarget.style.backgroundColor = '#E8E8E8'
                    } else {
                      e.currentTarget.style.backgroundColor = '#3D3D3D'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (group.joined) {
                      e.currentTarget.style.backgroundColor = '#F8F9FA'
                    } else {
                      e.currentTarget.style.backgroundColor = '#212529'
                    }
                  }}
                >
                  {group.joined ? 'Joined' : group.type === 'private' ? 'Request to Join' : 'Join Group'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Group</h2>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            {/* FORM */}
            <div className="space-y-4">

              {/* NAME */}
              <input
                type="text"
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border"
              />

              {/* DESCRIPTION */}
              <textarea
                placeholder="Group Description"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border"
              />

              {/* IMAGE */}
              <input
                type="file"
                id="media-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewGroup({ ...newGroup, cover_image: file })
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border"
              />

              {/* VISIBILITY */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setNewGroup({ ...newGroup, visibility: 'PUBLIC' })
                  }
                  className={`flex-1 py-2 rounded-lg ${
                    newGroup.visibility === 'PUBLIC'
                      ? 'bg-black text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Public
                </button>

                <button
                  onClick={() =>
                    setNewGroup({ ...newGroup, visibility: 'PRIVATE' })
                  }
                  className={`flex-1 py-2 rounded-lg ${
                    newGroup.visibility === 'PRIVATE'
                      ? 'bg-black text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 rounded-lg bg-black text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
