'use client'

import {
  ThumbsUp,
  MessageCircle,
  Send,
  MoreVertical,
  // BookOpen,
  Eye,
  Bookmark,
  Users,
  EyeOff,
  Flag,
} from 'lucide-react'

import { useEffect, useRef, useState } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { useOpenContent } from '@/hooks/useOpenContent'
import { useStoryComments } from '@/hooks/useStoryComments'
import { useStoryLike } from '@/hooks/useStoryLike'
import { ReportModal } from '../shared/ReportModal'
import apiClient from '@/lib/api-client'

interface StoryPostProps {
  id?: string
  author: {
    name: string
    title: string
    avatar: string
  }
  storyTitle: string
  excerpt: string
  coverImage?: string
  timestamp: string
  likes: number
  comments: number
  views: number
  readTime: string
  category: string
}

export function StoryPost({
  id = '',
  author,
  storyTitle,
  excerpt,
  coverImage,
  timestamp,
  likes,
  views,
  // readTime,
  // category,
}: StoryPostProps) {
  const { openStory } = useOpenContent()

  const [showShareModal, setShowShareModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  // ✅ HOOKS (STANDARDIZED)
  const { comments, addComment, likeComment } = useStoryComments(id)
  const { likeStory } = useStoryLike(id)

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setShowActionMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // =========================
  // 🧠 NEST COMMENTS
  // =========================
  const nestComments = (comments: any[]) => {
    const map: Record<string, any> = {}
    const roots: any[] = []

    comments.forEach((c) => {
      map[c.id] = {
        id: c.id,
        content: c.content,
        likes: c.likes || 0,
        timestamp: new Date(Number(c.created_on)).toLocaleString(),
        author: {
          name:
            c.user?.full_name ||
            c.user?.username ||
            'Unknown',
          avatar: c.user?.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(c.user?.full_name || 'User')}`,
        },
        replies: [],
        parent: c.parent,
      }
    })

    comments.forEach((c) => {
      if (c.parent && c.parent.id && map[c.parent.id]) {
        map[c.parent.id].replies.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    })

    return roots
  }

  const nestedComments = nestComments(comments)

  // =========================
  // 🔖 SAVE STORY
  // =========================
  const handleSave = async () => {
    try {
      if (saved) {
        await apiClient.unsaveContent(id, 'blog')
        setSaved(false)
      } else {
        await apiClient.saveContent(id, 'blog')
        setSaved(true)
        setShowSavedToast(true)
        setTimeout(() => setShowSavedToast(false), 2500)
      }
      setShowActionMenu(false)
    } catch {
      // ignore
    }
  }

  // =========================
  // ❤️ LIKE STORY
  // =========================
  const handleLike = () => {
    likeStory()
    setAnimatingId('story')
    setTimeout(() => setAnimatingId(null), 300)
  }

  // =========================
  // 💬 ADD COMMENT
  // =========================
  const handleAddComment = () => {
    if (!commentInput.trim()) return

    addComment({ content: commentInput })
    setCommentInput('')
  }

  // =========================
  // 🔁 ADD REPLY
  // =========================
  const handleAddReply = (parentId: string) => {
    if (!replyInput.trim()) return

    addComment({
      content: replyInput,
      parent_id: parentId,
    })

    setReplyInput('')
    setReplyingTo(null)
  }

  // =========================
  // 👍 LIKE COMMENT
  // =========================
  const handleLikeComment = (id: string) => {
    setAnimatingId(id)
    setTimeout(() => setAnimatingId(null), 300)
    likeComment(id)
  }

  // =========================
  // 🔁 RENDER REPLIES
  // =========================
  const renderReplies = (replies: any[]) => {
    if (!replies?.length) return null

    return (
      <div className="ml-8 mt-3 space-y-3">
        {replies.map((reply) => (
          <div key={reply.id}>
            <div className="flex gap-2">
              <img
                src={reply.author.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(reply.author.name || 'User')}`}
                alt={reply.author.name}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <p className="text-xs font-semibold">
                    {reply.author.name}
                  </p>
                  <p className="text-xs">{reply.content}</p>
                </div>

                <div className="flex gap-3 text-xs mt-1">
                  <button
                    onClick={() => handleLikeComment(reply.id)}
                    className="flex items-center gap-1"
                    style={{ color: animatingId === reply.id ? '#1d9bf0' : undefined }}
                  >
                    <ThumbsUp
                        className={`w-5 h-5 transition-all duration-200 ${
                          animatingId === reply.id ? 'scale-150 rotate-12' : ''
                        }`}
                      />
                    {reply.likes}
                  </button>

                  <button
                    onClick={() =>
                      setReplyingTo(reply.id)
                    }
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {replyingTo === reply.id && (
              <div className="ml-8 mt-2 flex gap-2">
                <input
                  value={replyInput}
                  onChange={(e) =>
                    setReplyInput(e.target.value)
                  }
                  className="flex-1 border rounded-full px-3 py-1 text-xs"
                />
                <button
                  onClick={() =>
                    handleAddReply(reply.id)
                  }
                >
                  Send
                </button>
              </div>
            )}

            {renderReplies(reply.replies)}
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // UI
  // =========================
  return (
    <>
      {/* Instagram-style saved toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
          <Bookmark className="w-4 h-4 fill-white" />
          Saved to your collection
        </div>
      )}
      <div className="bg-white rounded-2xl border p-6 mb-4">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">
                {author.name}
              </h3>
              <p className="text-sm text-gray-500">
                {author.title}
              </p>
              <p className="text-xs text-gray-400">
                {timestamp}
              </p>
            </div>
          </div>
          <div ref={actionMenuRef} className="relative">
            <button onClick={() => setShowActionMenu(!showActionMenu)}>
              <MoreVertical />
            </button>

            {showActionMenu && (
              <div className="absolute right-0 bg-white border rounded shadow p-2 flex gap-1">
                <button
                  onClick={handleSave}
                  className="p-2 rounded transition flex items-center gap-1 text-xs hover:bg-gray-100"
                  title={saved ? 'Unsave' : 'Save post'}
                  style={{ color: saved ? '#1d9bf0' : '#374151' }}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#1d9bf0]' : ''}`} />
                </button>
                <button className="text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition flex items-center gap-1 text-xs" title="Disconnect">
                  <Users className="w-4 h-4" />
                </button>
                <button className="text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition flex items-center gap-1 text-xs" title="Not interested">
                  <EyeOff className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(true)
                    setShowActionMenu(false)
                  }}
                  className="flex items-center gap-2 text-red-600 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* IMAGE */}
        {coverImage && (
          <img
            src={coverImage}
            alt={storyTitle}
            className="rounded-xl mb-4 cursor-pointer"
            onClick={() =>
              openStory({ id, storyTitle })
            }
          />
        )}

        {/* CONTENT */}
        <h2
          className="font-semibold text-lg cursor-pointer"
          onClick={() =>
            openStory({ id, storyTitle })
          }
        >
          {storyTitle}
        </h2>

        <p className="text-sm text-gray-500">
          {excerpt}
        </p>

        {/* ACTION BAR */}
        <div className="flex gap-4 mt-4 border-y py-3">

          <button
            onClick={handleLike}
            className="flex gap-1"
          >
            <ThumbsUp
                        className={`w-5 h-5 transition-all duration-200 ${
                          animatingId === 'story' ? 'scale-150 rotate-12' : ''
                        }`}
                      />
            {likes}
          </button>

          <div>
            <Eye className="w-4 h-4 inline" /> {views}
          </div>

          <button
            onClick={() =>
              setShowComments(!showComments)
            }
          >
            <MessageCircle className="w-4 h-4 inline" />{' '}
            {nestedComments.length}
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="ml-auto"
          >
            <Send />
          </button>
        </div>

        {/* COMMENTS */}
        {showComments && (
          <div className="mt-4 space-y-3">

            <div className="flex gap-2">
              <input
                value={commentInput}
                onChange={(e) =>
                  setCommentInput(e.target.value)
                }
                className="flex-1 border rounded-full px-3 py-1"
              />
              <button onClick={handleAddComment}>
                Post
              </button>
            </div>

            {nestedComments.map((c) => (
              <div key={c.id}>
                <p className="font-semibold">
                  {c.author.name}
                </p>
                <p>{c.content}</p>

                <button
                  onClick={() =>
                    handleLikeComment(c.id)
                  }
                  style={{ color: animatingId === c.id ? '#1d9bf0' : undefined }}
                >
                  <ThumbsUp
                        className={`w-5 h-5 transition-all duration-200 ${
                          animatingId === c.id ? 'scale-150 rotate-12' : ''
                        }`}
                      /> {c.likes}
                </button>

                <button
                  onClick={() =>
                    setReplyingTo(c.id)
                  }
                >
                  Reply
                </button>

                {replyingTo === c.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyInput}
                      onChange={(e) =>
                        setReplyInput(
                          e.target.value
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        handleAddReply(c.id)
                      }
                    >
                      Send
                    </button>
                  </div>
                )}

                {renderReplies(c.replies)}
              </div>
            ))}
          </div>
        )}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={excerpt}
        contentType="story"
        contentId={id}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={id}
        contentType="story"
      />
    </>
  )
}