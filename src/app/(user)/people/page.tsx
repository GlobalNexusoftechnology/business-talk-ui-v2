'use client'

import Link from 'next/link'
import {
  Search,
  Users,
  Filter,
  MapPin,
  Briefcase,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useFollow } from '@/hooks/useFollow'
import { useAppSelector } from '@/hooks/useRedux'

const categories = [
  'All',
  'Entrepreneurs',
  'Investors',
  'Marketing',
  'Technology',
  'Finance',
  'Consulting',
]

function PeopleCard({ user }: { user: any }) {
  const currentUserId = useAppSelector((state) => String(state.auth?.user?.id || ''))
  const {
    state: followState,
    loading: followLoading,
    follow,
    unfollow,
    isHydrated,
  } = useFollow(String(user.id || ''))

  const isSelf = currentUserId === String(user.id || '')

  const handleConnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSelf || followLoading || !isHydrated) return

    if (followState === 'connected') {
      await unfollow()
      return
    }

    if (followState === 'connect') {
      await follow()
    }
  }

  const buttonLabel =
    !isHydrated ? 'Loading...' :
    followState === 'connected' ? 'Connected' :
    followState === 'pending' || followLoading ? 'Connecting...' :
    'Connect'

  return (
    <Link
      href={`/profile/${user.id}`}
      className="block group"
    >
      <div className="bg-white rounded-2xl border p-6 transition hover:shadow-md hover:scale-[1.02]">

        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-4">
          <img
            src={user.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(user.full_name || 'User')}`}
            alt={user.full_name || 'User Avatar'}
            className="w-20 h-20 rounded-full object-cover mb-3 border"
          />

          <h3 className="font-semibold text-lg">
            {user.full_name}
          </h3>

          <p className="text-sm text-gray-500">
            {user.profession || 'Professional'}
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin className="w-3 h-3" />
            <span>{user.location || 'India'}</span>
          </div>
        </div>

        {/* Company */}
        {user.company && (
          <div className="text-center text-xs text-gray-500 mb-3">
            {user.company}
          </div>
        )}

        {/* Skills */}
        {user.skills && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {(Array.isArray(user.skills)
              ? user.skills
              : typeof user.skills === 'string'
              ? user.skills.split(',')
              : []
            )
              .slice(0, 3)
              .map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs rounded-full bg-[#F8F9FA]"
                >
                  {skill.trim()}
                </span>
              ))}
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isSelf || !isHydrated || followLoading || followState === 'pending'}
          className={`w-full px-3 py-2 text-xs font-medium rounded-lg 
            transition-all duration-200 flex-shrink-0 border active:scale-95 
            ${followState === 'connected'
              ? 'border-green-500 text-green-700 bg-green-50 cursor-default'
              : 'border-[#212529] text-[#212529]'
            }
            ${isSelf || !isHydrated || followLoading || followState === 'pending'
              ? 'opacity-70 cursor-not-allowed'
              : ''
            }`}
          onMouseEnter={(e) => {
            if (followState === 'connect' && !followLoading && isHydrated && !isSelf) {
              e.currentTarget.style.backgroundColor = '#F8F9FA'
            }
          }}
          onMouseLeave={(e) => {
            if (followState === 'connect') {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          {isSelf ? 'You' : buttonLabel}
        </button>

      </div>
    </Link>
  )
}

export default function PeoplePage() {
  const { users, loading } = useUsers()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // 🔥 Filter users
  const filteredUsers = users.filter((u) =>
    `${u.full_name || ''} ${u.profession || ''} ${u.company || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-6">Loading users...</div>

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#212529' }}>
            Discover People
          </h1>
          <p style={{ color: '#5F6368' }}>
            Connect with professionals and expand your network
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ border: '1px solid #E8E8E8' }}>
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, title, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-[#F8F9FA]"
              />
            </div>

            {/* Filter Button */}
            <button className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 text-gray-500 hover:bg-[#F8F9FA]">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                style={{
                  backgroundColor: selectedCategory === category ? '#212529' : '#F8F9FA',
                  color: selectedCategory === category ? '#FFF' : '#5F6368',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border flex gap-4">
            <Users className="w-6 h-6" />
            <div>
              <p className="text-xl font-semibold">{users.length}</p>
              <p className="text-sm text-gray-500">People to discover</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border flex gap-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-xl font-semibold">--</p>
              <p className="text-sm text-gray-500">Mutual connections</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border flex gap-4">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-xl font-semibold">--</p>
              <p className="text-sm text-gray-500">In your industry</p>
            </div>
          </div>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredUsers.map((user) => (
            <PeopleCard key={user.id} user={user} />
          ))}

        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 border rounded-xl text-gray-500 hover:bg-[#F8F9FA]">
            Load More People
          </button>
        </div>

      </div>
    </div>
  )
}