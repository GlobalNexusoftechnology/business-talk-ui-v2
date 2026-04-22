'use client'

import { Search, Users, Lock, Globe, TrendingUp, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Startup Founders India',
    description: 'A community of startup founders sharing insights, challenges, and success stories',
    image: 'https://images.unsplash.com/photo-1759310610480-48649b55fbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBncm91cCUyMG1lZXRpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 12450,
    posts: 3420,
    type: 'public',
    joined: true,
    category: 'Entrepreneurship',
  },
  {
    id: '2',
    name: 'Digital Marketing Professionals',
    description: 'Learn and share the latest trends in digital marketing, SEO, and growth hacking',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 8920,
    posts: 2150,
    type: 'public',
    joined: true,
    category: 'Marketing',
  },
  {
    id: '3',
    name: 'SaaS Product Managers',
    description: 'Exclusive community for product managers in the SaaS industry',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwbWFuYWdlbWVudCUyMG1lZXRpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 5640,
    posts: 1820,
    type: 'private',
    joined: false,
    category: 'Product',
  },
  {
    id: '4',
    name: 'FinTech Innovators',
    description: 'Discussing the future of financial technology and banking disruption',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwdGVjaG5vbG9neSUyMG1lZXRpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 7230,
    posts: 1950,
    type: 'public',
    joined: false,
    category: 'Finance',
  },
  {
    id: '5',
    name: 'AI & Machine Learning Hub',
    description: 'Exploring artificial intelligence and its business applications',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaCUyMG1lZXRpbmd8ZW58MXx8fHwxNzc1MDUzOTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 15320,
    posts: 4580,
    type: 'public',
    joined: true,
    category: 'Technology',
  },
  {
    id: '6',
    name: 'Women in Business',
    description: 'Empowering women leaders and entrepreneurs in the business world',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJ1c2luZXNzJTIwbGVhZGVyc3xlbnwxfHx8fDE3NzUwNTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    members: 9870,
    posts: 2640,
    type: 'public',
    joined: false,
    category: 'Leadership',
  },
]

export default function GroupsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups'>('all')
  const [groups, setGroups] = useState(mockGroups)

  const handleJoinToggle = (groupId: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, joined: !g.joined } : g))
  }

  const handleGroupClick = (group: Group) => {
    router.push(`/groups/${group.id}`)
  }

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
              onClick={() => handleGroupClick(group)}
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
      </div>
    </div>
  )
}
