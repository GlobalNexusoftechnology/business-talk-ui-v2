'use client'

import { MessageCircle, ThumbsUp, Eye, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { ContentData } from '@/hooks/useContentViewer'
import apiClient from '@/lib/api-client'

interface Props {
  data: ContentData
}

export function StoryViewCard({ data }: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(data.likes || 0)

  const [commentsList, setCommentsList] = useState<any[]>([])
  const [commentCount, setCommentCount] = useState(0)

  const [views, setViews] = useState(data.views || 0)

  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')

  const [showShareModal, setShowShareModal] = useState(false)

  // ✅ INIT
  useEffect(() => {
    const init = async () => {
      if (!data?.id) return

      try {
        const res = await apiClient.getPostComments(data.id)

        setCommentsList(res || [])
        setCommentCount((res || []).length)

        // increment views locally since incrementPostView does not exist
        setViews((prev: number) => prev + 1)
      } catch (err) {
        console.error('StoryView init failed')
      }
    }

    init()
  }, [data?.id])

  const handleLike = () => {
    setLiked(prev => {
      setLikeCount((c: number) => prev ? c - 1 : c + 1)
      return !prev
    })
  }

  const handleAddComment = () => {
    if (!commentInput.trim()) return

    const newComment = {
      id: Date.now(),
      content: commentInput,
      likes: 0
    }

    setCommentsList([...commentsList, newComment])
    setCommentCount(prev => prev + 1)
    setCommentInput('')
  }

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold">{data.storyTitle}</h2>

      <p>{data.content}</p>

      {/* Actions */}
      <div className="flex gap-4 border-t pt-3">
        <button onClick={handleLike} className={`flex items-center gap-1 px-2 py-1 rounded ${liked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ThumbsUp /> {likeCount}
        </button>

        <span><Eye /> {views}</span>

        <button onClick={() => setShowComments(!showComments)}>
          <MessageCircle /> {commentCount}
        </button>

        <button onClick={() => setShowShareModal(true)}>
          <Send />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="space-y-3">

          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add comment..."
            className="border p-2 w-full"
          />

          <button onClick={handleAddComment}>Post</button>

          {commentsList.map((c) => (
            <div key={c.id} className="border p-2 rounded">
              {c.content}
            </div>
          ))}
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={data.content}
        contentType="story"
        contentId={data.id}
      />
    </div>
  )
}