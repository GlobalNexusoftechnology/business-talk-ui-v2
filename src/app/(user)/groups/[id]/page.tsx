'use client'

import { useRouter, useParams } from 'next/navigation'
import { Lock, Globe, MessageCircle, Share2, ThumbsUp, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { useEffect } from 'react'
import apiClient from '@/lib/api-client'

interface GroupMember {
  id: string
  name: string
  avatar: string
  title: string
}

interface GroupPost {
  id: string
  author: GroupMember
  content: string
  timestamp: string
  likes: number
  comments: number
}

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
  membersList: GroupMember[]
  recentPosts: GroupPost[]
  about: string
}

export default function GroupDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [requestPending, setRequestPending] = useState(false)

  useEffect(() => {
    if (!groupId) return

    const fetchGroup = async () => {
      try {
        const res = await apiClient.getGroupById(groupId)
        const g = res.data

        const formatted = {
          id: g.id,
          name: g.name,
          description: g.description,
          image: g.cover_image || '/placeholder.jpg',
          members: g.memberCount || 0,
          posts: 0,
          type: (g.visibility === 'PRIVATE' ? 'private' : 'public') as 'public' | 'private',
          joined: g.isJoined || false, // optional
          category: 'General',
          membersList: (g.members || []).map((m: any) => ({
            id: m.userId,
            name: m.full_name || m.name || 'User',
            avatar: m.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(m.full_name || m.name || 'User')}`,
            title: m.role,
          })),
          recentPosts: [],
          about: g.description,
        }

        setGroup(formatted)
        setIsJoined(formatted.joined)
        setRequestPending(g.isRequested || false)
      } catch (err) {
        console.error('Group fetch error', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [groupId])

  if (loading) {
    return <div className="p-6">Loading group...</div>
  }

  const handleJoin = async () => {
    if (!group) return

    try {
      if (isJoined) {
        await apiClient.leaveGroup(group.id)
        setIsJoined(false)
      } else if (requestPending) {
        // request already sent — no cancel endpoint
        return
      } else if (group.type === 'private') {
        await apiClient.requestToJoinGroup(group.id)
        setRequestPending(true)
      } else {
        await apiClient.joinGroup(group.id)
        setIsJoined(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!group) {
    return (
      <div className="p-6 text-center" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
        <p style={{ color: '#5F6368' }}>Group not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        {/* <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#212529' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E8E8E8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to groups
        </button> */}

        {/* Group Card with Header */}
        <div
          className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8"
          style={{ border: '1px solid #E8E8E8' }}
        >
          {/* Hero Image */}
          <img src={group.image} alt={group.name} className="w-full h-72 object-cover" />

          {/* Group Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold" style={{ color: '#212529' }}>
                    {group.name}
                  </h1>
                  <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#F8F9FA', color: '#5F6368' }}>
                    {group.type === 'public' ? <Globe className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />}
                    {' '}{group.type === 'public' ? 'Public' : 'Private'}
                  </span>
                </div>
                <p style={{ color: '#5F6368' }}>{group.description}</p>
              </div>

              <button
                onClick={handleJoin}
                disabled={requestPending && !isJoined}
                className={`px-6 py-2 rounded-lg font-medium border transition-all whitespace-nowrap active:scale-95 ${requestPending && !isJoined ? 'cursor-not-allowed opacity-70' : ''}`}
                style={{
                  backgroundColor: 'transparent',
                  color: isJoined ? '#DC2626' : requestPending ? '#5F6368' : '#212529',
                  borderColor: isJoined ? '#DC2626' : requestPending ? '#9CA3AF' : '#212529',
                }}
                onMouseEnter={(e) => {
                  if (isJoined) {
                    e.currentTarget.style.backgroundColor = '#DC2626'
                    e.currentTarget.style.color = '#FFFFFF'
                  } else if (!requestPending) {
                    e.currentTarget.style.backgroundColor = '#212529'
                    e.currentTarget.style.color = '#FFFFFF'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isJoined) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#DC2626'
                  } else if (!requestPending) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#212529'
                  }
                }}
              >
                {isJoined ? 'Leave Group' : requestPending ? 'Requested' : group.type === 'private' ? 'Request to Join' : 'Join Group'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b" style={{ borderColor: '#E8E8E8' }}>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.members.toLocaleString()}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Members
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.posts.toLocaleString()}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Posts
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.membersList.length}+
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Admins
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#212529' }}>
                  {group.category}
                </p>
                <p className="text-sm" style={{ color: '#5F6368' }}>
                  Category
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#212529' }}>
            About
          </h2>
          <p style={{ color: '#5F6368', lineHeight: '1.8' }}>
            {group.about}
          </p>
        </div>

        {/* Members Section */}
        {group.membersList.length > 0 && (
          <div
            className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
            style={{ border: '1px solid #E8E8E8' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#212529' }}>
              Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.membersList.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium" style={{ color: '#212529' }}>
                      {member.name}
                    </p>
                    <p className="text-sm" style={{ color: '#5F6368' }}>
                      {member.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts Section */}
        {group.recentPosts.length > 0 && (
          <div
            className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
            style={{ border: '1px solid #E8E8E8' }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#212529' }}>
              Recent Posts
            </h2>
            <div className="space-y-6">
              {group.recentPosts.map((post) => (
                <div key={post.id} className="pb-6 border-b" style={{ borderColor: '#E8E8E8' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium" style={{ color: '#212529' }}>
                        {post.author.name}
                      </p>
                      <p className="text-xs" style={{ color: '#5F6368' }}>
                        {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4" style={{ color: '#5F6368' }}>
                    {post.content}
                  </p>
                  <div className="flex items-center gap-6" style={{ color: '#5F6368' }}>
                    <button className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors">
                      <ThumbsUp className="inline w-4 h-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6 flex gap-3"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1" style={{ backgroundColor: '#F8F9FA', color: '#212529' }}>
            <MessageCircle className="w-5 h-5" />
            Message
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1"
            style={{ backgroundColor: '#F8F9FA', color: '#212529' }}
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          {group.type === 'private' && (
            <button
              onClick={() => router.push(`/groups/${group.id}/requests`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1 transition-colors"
              style={{ backgroundColor: '#212529', color: '#FFFFFF' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
            >
              <ClipboardList className="w-5 h-5" />
              Manage Requests
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={group.description}
        title={group.name}
        contentType="group"
        contentId={group.id}
      />
    </div>
  )
}
