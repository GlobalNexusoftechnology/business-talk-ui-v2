'use client'

import { useRouter, useParams } from 'next/navigation'
import { Lock, Globe, MessageCircle, Share2, ThumbsUp, ClipboardList, MapPin, X, Check } from 'lucide-react'
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
  requested: boolean
  ownerId: string
  membersList: GroupMember[]
  recentPosts: GroupPost[]
  about: string
}

interface GroupJoinRequest {
  id: string
  user?: {
    id?: string
    full_name?: string
    username?: string
    profile_photo?: string
    profession?: string
    location?: string
  }
  userId?: string
  created_on?: string | number
}

const formatGroup = (
  g: any,
  joined = false,
  requested = false
): Group => ({
  id: g.id,
  name: g.name,
  description: g.description,
  image: g.cover_image || '/placeholder.jpg',
  members: g.memberCount || 0,
  posts: 0,
  type: (g.visibility === 'PRIVATE' ? 'private' : 'public') as 'public' | 'private',
  joined: joined || g.isJoined || false,
  requested: requested || g.isRequested || false,
  ownerId: g.created_by || g.createdBy || g.owner?.id || '',
  category: 'General',
  membersList: (g.members || []).map((m: any) => ({
    id: m.userId,
    name: m.full_name || m.name || 'User',
    avatar: m.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(m.full_name || m.name || 'User')}`,
    title: m.role,
  })),
  recentPosts: [],
  about: g.description,
})

export default function GroupDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [openingChat, setOpeningChat] = useState(false)
  const [postNotice, setPostNotice] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState<string | null>(null)
  const [requests, setRequests] = useState<GroupJoinRequest[]>([])
  const [requestAction, setRequestAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null)

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setCurrentUserId(user.id || '')
    } catch {
      setCurrentUserId('')
    }
  }, [])

  useEffect(() => {
    if (!groupId) return

    const fetchGroup = async () => {
      try {
        const [groupRes, myRes, requestedRes] = await Promise.all([
          apiClient.getGroupById(groupId),
          apiClient.getMyGroups(),
          apiClient.getMyRequestedGroups(),
        ])
        const g = groupRes.data

        const myGroupIds = new Set(
          (myRes.data || []).map((item: any) => (item.group ?? item).id)
        )
        const requestedGroupIds = new Set(
          (requestedRes.data || []).map((item: any) => (item.group ?? item).id)
        )

        const formatted = formatGroup(
          g,
          myGroupIds.has(g.id),
          requestedGroupIds.has(g.id)
        )

        setGroup(formatted)
        setIsJoined(formatted.joined)
        setRequestPending(formatted.requested)
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
        setRequestPending(false)
        setGroup((prev) => (prev ? { ...prev, joined: false, requested: false } : prev))
      } else if (requestPending) {
        // request already sent — no cancel endpoint
        return
      } else if (group.type === 'private') {
        await apiClient.requestToJoinGroup(group.id)
        setRequestPending(true)
        setGroup((prev) => (prev ? { ...prev, requested: true, joined: false } : prev))
      } else {
        await apiClient.joinGroup(group.id)
        setIsJoined(true)
        setRequestPending(false)
        setGroup((prev) => (prev ? { ...prev, joined: true, requested: false } : prev))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isGroupOwner = Boolean(group && currentUserId && (group.ownerId === currentUserId || group.membersList.some((m: any) => m.id === currentUserId && String(m.title || '').toUpperCase() === 'OWNER')))

  const handleCreateGroupPost = async () => {
    if (!group || !postContent.trim()) return

    try {
      setPosting(true)
      setPostNotice(null)

      await apiClient.createGroupPost(group.id, {
        type: 'NORMAL',
        content: postContent.trim(),
        tags: [],
      })

      setPostContent('')
      setPostNotice('Post created successfully.')
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              posts: (prev.posts || 0) + 1,
            }
          : prev
      )
    } catch (err) {
      console.error('Failed to create group post', err)
      setPostNotice('Failed to create post. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const handleOpenGroupMessage = async () => {
    if (!group) return

    try {
      setOpeningChat(true)
      const res = await apiClient.getGroupChat(group.id)

      const conversationId =
        res?.data?.id ||
        res?.data?.conversationId ||
        res?.data?.conversation?.id

      if (conversationId) {
        router.push(`/messages?conversationId=${conversationId}`)
      } else {
        router.push('/messages')
      }
    } catch (err) {
      console.error('Failed to open group chat', err)
      router.push('/messages')
    } finally {
      setOpeningChat(false)
    }
  }

  const fetchGroupRequests = async () => {
    if (!group) return
    try {
      setRequestsLoading(true)
      setRequestsError(null)
      const res = await apiClient.getGroupJoinRequests(group.id)
      setRequests(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch join requests', err)
      setRequestsError('Failed to load requests. Please try again.')
      setRequests([])
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleOpenRequestsModal = async () => {
    setShowRequestsModal(true)
    await fetchGroupRequests()
  }

  const handleApproveFromModal = async (requestId: string) => {
    try {
      setRequestAction({ id: requestId, type: 'approve' })
      await apiClient.approveGroupJoinRequest(requestId)
      setRequests((prev) => prev.filter((r) => String(r.id) !== String(requestId)))
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              members: (prev.members || 0) + 1,
            }
          : prev
      )
    } catch (err) {
      console.error('Failed to approve join request', err)
      setRequestsError('Failed to approve request. Please try again.')
    } finally {
      setRequestAction(null)
    }
  }

  const handleRejectFromModal = async (requestId: string) => {
    try {
      setRequestAction({ id: requestId, type: 'reject' })
      await apiClient.rejectGroupJoinRequest(requestId)
      setRequests((prev) => prev.filter((r) => String(r.id) !== String(requestId)))
    } catch (err) {
      console.error('Failed to reject join request', err)
      setRequestsError('Failed to reject request. Please try again.')
    } finally {
      setRequestAction(null)
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

        {/* Create Group Post */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          style={{ border: '1px solid #E8E8E8' }}
        >
          <h2 className="text-xl font-bold mb-3" style={{ color: '#212529' }}>
            Create Post
          </h2>
          <p className="text-sm mb-4" style={{ color: '#5F6368' }}>
            You can only publish NORMAL posts inside groups.
          </p>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={isJoined ? 'Share something with this group...' : 'Join the group to create a post'}
            disabled={!isJoined || posting}
            className="w-full min-h-[120px] p-4 rounded-xl resize-none bg-gray-50 border"
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs" style={{ color: '#5F6368' }}>
              Post type: NORMAL
            </span>
            <button
              onClick={handleCreateGroupPost}
              disabled={!isJoined || posting || !postContent.trim()}
              className="px-5 py-2 rounded-lg font-medium border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: '#212529',
                color: '#212529',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#212529'
                  e.currentTarget.style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#212529'
              }}
            >
              {posting ? 'Posting...' : 'Create Post'}
            </button>
          </div>

          {postNotice && (
            <p className="text-sm mt-3" style={{ color: postNotice.startsWith('Failed') ? '#DC2626' : '#16A34A' }}>
              {postNotice}
            </p>
          )}
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
          <button
            onClick={handleOpenGroupMessage}
            disabled={openingChat}
            className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1 disabled:opacity-60"
            style={{ backgroundColor: '#F8F9FA', color: '#212529' }}
          >
            <MessageCircle className="w-5 h-5" />
            {openingChat ? 'Opening...' : 'Message'}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1"
            style={{ backgroundColor: '#F8F9FA', color: '#212529' }}
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          {group.type === 'private' && isGroupOwner && (
            <button
              onClick={handleOpenRequestsModal}
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
        contentType="groups"
        contentId={group.id}
      />

      {showRequestsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border max-h-[85vh] flex flex-col" style={{ border: '1px solid #E8E8E8' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#E8E8E8' }}>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#212529' }}>Manage Join Requests</h3>
                <p className="text-sm" style={{ color: '#5F6368' }}>{requests.length} pending</p>
              </div>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {requestsLoading && (
                <p className="text-sm" style={{ color: '#5F6368' }}>Loading requests...</p>
              )}

              {!requestsLoading && requestsError && (
                <div className="text-sm rounded-lg border p-3" style={{ borderColor: '#FCA5A5', color: '#B91C1C', backgroundColor: '#FEF2F2' }}>
                  {requestsError}
                </div>
              )}

              {!requestsLoading && !requestsError && requests.length === 0 && (
                <div className="text-sm rounded-lg border p-4" style={{ borderColor: '#E8E8E8', color: '#5F6368', backgroundColor: '#F8F9FA' }}>
                  No pending requests.
                </div>
              )}

              {!requestsLoading && !requestsError && requests.map((req) => {
                const fullName = req.user?.full_name || req.user?.username || 'Unknown User'
                const profession = req.user?.profession || 'Professional'
                const location = req.user?.location || 'N/A'
                const avatar =
                  req.user?.profile_photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=E8E8E8&color=212529&size=96`

                const isApproving = requestAction?.id === req.id && requestAction?.type === 'approve'
                const isRejecting = requestAction?.id === req.id && requestAction?.type === 'reject'

                return (
                  <div
                    key={req.id}
                    onClick={() => {
                      setShowRequestsModal(false)
                      router.push(`/groups/${group.id}/requests/${req.id}`)
                    }}
                    className="w-full text-left rounded-xl border p-4 transition hover:shadow-sm cursor-pointer"
                    style={{ borderColor: '#E8E8E8', backgroundColor: '#FFFFFF' }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={avatar} alt={fullName} className="w-12 h-12 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate" style={{ color: '#212529' }}>{fullName}</p>
                        <p className="text-sm truncate" style={{ color: '#5F6368' }}>{profession}</p>
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#5F6368' }}>
                          <MapPin className="w-3 h-3" /> {location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRejectFromModal(req.id)}
                          disabled={isApproving || isRejecting}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-60"
                          style={{ borderColor: '#DC2626', color: '#DC2626', backgroundColor: 'transparent' }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleApproveFromModal(req.id)}
                          disabled={isApproving || isRejecting}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-60"
                          style={{ borderColor: '#212529', color: '#212529', backgroundColor: 'transparent' }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {isApproving ? 'Approving...' : 'Approve'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
