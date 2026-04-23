'use client'

import { ThumbsUp, MessageCircle, Send, MoreVertical, Bookmark, Users, EyeOff, Flag } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { useOpenContent } from '@/hooks/useOpenContent'
import apiClient from '@/lib/api-client'

interface FeedPostProps {
  id?: string
  author: {
    name: string
    title: string
    avatar: string
  }
  content: string
  image?: string
  video?: string
  timestamp: string
  likes: number
  dislikes: number
  comments: number
  sends: number
}

export function FeedPost({ id = Date.now().toString(), author, content, image, video, timestamp, likes, comments, sends }: FeedPostProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [commentsList, setCommentsList] = useState<any[]>([])
  // forceUpdate removed (was unused)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const { openPost } = useOpenContent()

  // Helper function to recursively render infinite nested replies
  // Helper to generate a unique key for each reply based on its ancestry
  const renderNestedReplies = (replies: any[], parentId: number, parentReplyId?: number, ancestry: Array<number> = []): JSX.Element => {
    if (!replies || replies.length === 0) return <></>

    return (
      <div className="mt-3 ml-8 space-y-3">
        {replies.map((nestedReply) => {
          const newAncestry = [...ancestry, nestedReply.id]
          const replyPath = newAncestry.join('-')
          // DEBUG: Log replyPath and like count
          console.log('DEBUG: renderNestedReplies', { replyPath, likes: nestedReply.likes, nestedReply })
          return (
            <div key={replyPath}>
              <div className="flex gap-2">
                <img
                  src={nestedReply.author.avatar}
                  className="w-6 h-6 rounded-full object-cover"
                  alt={nestedReply.author.name}
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="font-semibold text-xs text-gray-900">{nestedReply.author.name}</p>
                    <p className="text-xs text-gray-700">{nestedReply.content}</p>
                  </div>
                  <div className="flex gap-3 mt-1 px-3 text-xs text-gray-500">
                    <button 
                      onClick={() => handleLikeComment(nestedReply.id, parentReplyId || parentId, replyPath)}
                      className="hover:opacity-70 transition-all font-medium flex items-center gap-1"
                      style={{ color: likedComments.has(replyPath) ? '#1d9bf0' : '#5F6368' }}>
                      <ThumbsUp className="w-4 h-4" />
                      <span>{nestedReply.likes}</span>
                    </button>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === `reply-${nestedReply.id}` ? null : `reply-${nestedReply.id}`)}
                      className="hover:opacity-70 transition-all">
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply to Nested Reply Input */}
              {replyingTo === `reply-${nestedReply.id}` && (
                <div className="flex gap-2 mt-2 ml-8">
                  <img
                    src="/avatar.png"
                    className="w-6 h-6 rounded-full object-cover"
                    alt="Your avatar"
                  />
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddReply(parentId, nestedReply.id)}
                    className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddReply(parentId, nestedReply.id)}
                    className="text-blue-600 hover:text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    Send
                  </button>
                </div>
              )}

              {/* Recursively render deeper nested replies */}
              {nestedReply.replies && nestedReply.replies.length > 0 && 
                renderNestedReplies(nestedReply.replies, parentId, nestedReply.id, newAncestry)
              }
            </div>
          )
        })}
      </div>
    )
  }

  // Like/Unlike a comment or reply using API
  const handleLikeComment = async (commentId: number, parentId?: number, replyPath?: string) => {
    const itemId = replyPath || (parentId ? `${parentId}-reply-${commentId}` : `comment-${commentId}`)
    const isLiked = likedComments.has(itemId)
    const newLikedComments = new Set(likedComments)
    try {
      // Call comment vote API (toggle up)
      const res = await apiClient.voteComment(commentId.toString(), isLiked ? 'down' : 'up')
      // API returns updated vote counts and user's vote
      // Update UI state accordingly
      if (isLiked) {
        newLikedComments.delete(itemId)
      } else {
        newLikedComments.add(itemId)
      }
      setLikedComments(newLikedComments)
      // Optionally update comment likes in UI (refetch or optimistic)
      setCommentsList(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: res.upvotes }
        }
        // Update nested replies if needed (not implemented for deep nesting here)
        return comment
      }))
    } catch (err) {
      // fallback: do nothing or show error
    }
  }

  // Like/Unlike post using API
  const handleLike = async () => {
    try {
      // Call vote API (toggle UP)
      const postId = id?.toString() || ''
      const res = await apiClient.votePost(postId, 'up')
      // API returns updated vote counts and user's vote
      const { upvotes, userVote } = res
      setLikeCount(upvotes)
      setLiked(userVote === 'up')
    } catch (err) {
      // fallback to optimistic UI
      if (liked) {
        setLiked(false)
        setLikeCount(likeCount - 1)
      } else {
        setLiked(true)
        setLikeCount(likeCount + 1)
      }
    }
  }

  const handleOpenViewer = () => {
    const postData = {
      id,
      author,
      content,
      image,
      video,
      timestamp,
      likes: likeCount,
      comments,
      sends
    }
    openPost(postData)
  }

  // Add comment using API
  const handleAddComment = async () => {
    if (!commentInput.trim()) return
    try {
      const postId = id?.toString() || ''
      const res = await apiClient.addPostComment(postId, commentInput)
      // Map API response to UI structure
      const newComment = mapApiCommentToUi(res)
      setCommentsList([...commentsList, newComment])
      setCommentInput('')
    } catch (err) {
      // fallback: do nothing or show error
    }
  }

  // Helper to get all reply ids recursively
  const getAllReplyIds = (comments: any[]): number[] => {
    let ids: number[] = []
    for (const comment of comments) {
      ids.push(comment.id)
      if (comment.replies && comment.replies.length > 0) {
        ids = ids.concat(getAllReplyIds(comment.replies))
      }
    }
    return ids
  }

  // Add reply using API
  const handleAddReply = async (commentId: number, parentReplyId?: number) => {
    if (!replyInput.trim()) return
    try {
      const postId = id?.toString() || ''
      await apiClient.addPostComment(postId, replyInput, parentReplyId ? parentReplyId.toString() : commentId.toString())
      setReplyInput('')
      setReplyingTo(null)
      // Refetch comments for latest state
      const updatedComments = await apiClient.getPostComments(postId)
      setCommentsList(nestComments(updatedComments))
    } catch (err) {
      // fallback: do nothing or show error
    }
  }

  // Fetch comments from API when comments section is opened
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActionMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper to map API comment to UI comment structure
  const mapApiCommentToUi = (apiComment: any) => ({
    id: apiComment.id,
    author: {
      name: apiComment.user?.full_name || apiComment.user?.username || 'Unknown',
      avatar: apiComment.user?.profile_photo || '/avatar.png',
      title: apiComment.user?.profession || '',
    },
    content: apiComment.comment,
    created_at: apiComment.created_on,
    likes: apiComment.likes || 0,
    replies: [], // Flat API, no nested replies in response
    parent: apiComment.parent || null,
  })

  // Convert flat API comments to nested structure
  const nestComments = (comments: any[]) => {
    const map: Record<string, any> = {}
    const roots: any[] = []
    comments.forEach((c) => {
      map[c.id] = { ...mapApiCommentToUi(c), replies: [] }
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

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return
      try {
        const res = await apiClient.getPostComments(id)
        // Map and nest comments for UI
        setCommentsList(nestComments(res))
      } catch (err) {
        // fallback: keep mock comments
      }
    }
    if (showComments) fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, id])

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{author.name}</h3>
              <p className="text-sm text-gray-500">{author.title}</p>
              <p className="text-xs text-gray-400">{timestamp}</p>
            </div>
          </div>

          {/* Action Menu Button */}
          <div className="relative" ref={actionMenuRef}>
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Action Menu Dropdown */}
            {showActionMenu && (
              <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 px-3 py-2 flex items-center gap-1 whitespace-nowrap">
                <button className="text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition flex items-center gap-1 text-xs" title="Save post">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition flex items-center gap-1 text-xs" title="Disconnect">
                  <Users className="w-4 h-4" />
                </button>
                <button className="text-gray-700 hover:text-black hover:bg-gray-100 p-2 rounded transition flex items-center gap-1 text-xs" title="Not interested">
                  <EyeOff className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition flex items-center gap-1 text-xs" title="Report post">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div 
          className="mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleOpenViewer}
        >
          <p className="text-gray-800 leading-relaxed">{content}</p>
        </div>

        {/* Post Image */}
        {image && (
          <div 
            className="mb-4 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleOpenViewer}
          >
            <img
              src={image}
              alt="Post content"
              className="w-full h-80 object-contain"
            />
          </div>
        )}

        {/* Post Video */}
        {video && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <video
              src={video}
              className="w-full h-80 object-contain"
              controls
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              liked
                ? 'bg-gray-100 text-black'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{commentsList.length}</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all ml-auto cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span className="text-sm font-medium">{sends}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* Comment Input */}
            <div className="flex gap-2">
              <img
                src="/avatar.png"
                className="w-8 h-8 rounded-full object-cover"
                alt="Your avatar"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comments List */}
            {commentsList.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {commentsList.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-gray-900">{comment.author.name}</p>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      <div className="flex gap-2 mt-1 px-3 text-xs text-gray-500">
                        <button 
                          onClick={() => handleLikeComment(comment.id)}
                          className="hover:text-blue-600 flex items-center gap-1 font-medium"
                          style={{ color: likedComments.has(`comment-${comment.id}`) ? '#1d9bf0' : '#5F6368' }}>
                          <ThumbsUp className="w-3 h-3" /> {comment.likes}
                        </button>
                        <button onClick={() => setReplyingTo(replyingTo === `comment-${comment.id}` ? null : `comment-${comment.id}`)} className="hover:text-blue-600">
                          Reply
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === `comment-${comment.id}` && (
                        <div className="flex gap-2 mt-2 ml-6">
                          <img
                            src="/avatar.png"
                            className="w-6 h-6 rounded-full object-cover"
                            alt="Your avatar"
                          />
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                            className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddReply(comment.id)}
                            className="text-blue-600 hover:text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            Reply
                          </button>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && renderNestedReplies(comment.replies, comment.id)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={content}
        contentType="post"
        contentId={id}
      />
    </>
  )
}
