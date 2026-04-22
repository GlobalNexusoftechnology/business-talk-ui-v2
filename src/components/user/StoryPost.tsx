'use client'

import { ThumbsUp, MessageCircle, Send, MoreVertical, BookOpen, Eye } from 'lucide-react'
import { useState } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { useOpenContent } from '@/hooks/useOpenContent'

interface Comment {
  id: string
  author: {
    name: string
    title: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  replies?: Comment[]
}

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
  commentsList?: Comment[]
}

export function StoryPost({ 
  id = Date.now().toString(),
  author, 
  storyTitle, 
  excerpt, 
  coverImage, 
  timestamp, 
  likes, 
  comments,
  views,
  readTime,
  category,
  commentsList = []
}: StoryPostProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const { openStory } = useOpenContent()
  const [commentsList_state, setCommentsList_state] = useState<Comment[]>(
    commentsList.map(c => ({
      id: c.id,
      author: c.author,
      content: c.content,
      timestamp: c.timestamp,
      likes: c.likes,
      replies: c.replies || []
    }))
  )

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount(likeCount - 1)
    } else {
      setLiked(true)
      setLikeCount(likeCount + 1)
    }
  }

  const handleOpenViewer = () => {
    const storyData = {
      id,
      author,
      storyTitle,
      excerpt,
      coverImage,
      timestamp,
      likes: likeCount,
      comments,
      views,
      readTime,
      category
    }
    openStory(storyData)
  }

  // Helper function to recursively render infinite nested replies
  const renderNestedReplies = (replies: Comment[], parentId: string, parentReplyId?: string): JSX.Element => {
    if (!replies || replies.length === 0) return <></>

    return (
      <div className="mt-3 ml-8 space-y-3">
        {replies.map((nestedReply) => (
          <div key={nestedReply.id}>
            <div className="flex gap-2">
              <img
                src={nestedReply.author.avatar}
                className="w-6 h-6 rounded-full object-cover"
                alt={nestedReply.author.name}
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="font-semibold text-xs text-gray-900">
                    {nestedReply.author.name}
                  </p>
                  <p className="text-xs text-gray-700">
                    {nestedReply.content}
                  </p>
                </div>
                <div className="flex gap-3 mt-1 px-3 text-xs text-gray-500">
                  <button 
                    onClick={() => handleLikeComment(nestedReply.id, parentReplyId || parentId)}
                    className="hover:opacity-70 transition-all font-medium flex items-center gap-1"
                    style={{ color: likedComments.has(`${parentReplyId || parentId}-reply-${nestedReply.id}`) ? '#1d9bf0' : '#5F6368' }}>
                    <ThumbsUp className="w-4 h-4" />
                    <span>{nestedReply.likes}</span>
                  </button>
                  <button 
                    onClick={() => setReplyingTo(replyingTo === `reply-${nestedReply.id}` ? null : `reply-${nestedReply.id}`)}
                    className="hover:opacity-70 transition-all">
                    Reply
                  </button>
                  <span>
                    {nestedReply.timestamp}
                  </span>
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
                  className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-all"
                  autoFocus
                />
                <button 
                  onClick={() => handleAddReply(parentId, nestedReply.id)}
                  className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition text-xs">
                  Send
                </button>
              </div>
            )}

            {/* Recursively render deeper nested replies */}
            {nestedReply.replies && nestedReply.replies.length > 0 && 
              renderNestedReplies(nestedReply.replies, parentId, nestedReply.id)
            }
          </div>
        ))}
      </div>
    )
  }

  const handleAddComment = () => {
    if (commentInput.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: { name: 'You', avatar: '/avatar.png', title: 'Your Title' },
        content: commentInput,
        timestamp: 'just now',
        likes: 0,
        replies: []
      }
      setCommentsList_state([...commentsList_state, newComment])
      setCommentInput('')
    }
  }

  const handleLikeComment = (commentId: string, parentId?: string) => {
    const itemId = parentId ? `${parentId}-reply-${commentId}` : `comment-${commentId}`
    const isLiked = likedComments.has(itemId)
    const newLikedComments = new Set(likedComments)

    if (isLiked) {
      newLikedComments.delete(itemId)
    } else {
      newLikedComments.add(itemId)
    }
    setLikedComments(newLikedComments)

    if (parentId) {
      // Like/Unlike a reply at any depth
      const likeDelta = isLiked ? -1 : 1

      // Recursive function that updates reply only at the exact depth/path
      const findAndUpdateReplyAtPath = (replies: Comment[], targetParentId: string): boolean => {
        for (let reply of replies) {
          // Direct match - this reply is the one we want to like (for first-level replies)
          if (reply.id === commentId) {
            reply.likes += likeDelta
            return true
          }
          
          // If this is the parent we're looking for, search only in its children
          if (reply.id === targetParentId) {
            // Now search for the target reply ONLY in this parent's direct children
            if (reply.replies) {
              for (let childReply of reply.replies) {
                if (childReply.id === commentId) {
                  childReply.likes += likeDelta
                  return true
                }
                // Recursively search deeper, but still with the correct parent tracking
                if (childReply.replies && findAndUpdateReplyAtPath(childReply.replies, commentId)) {
                  return true
                }
              }
            }
            return false
          }
          // Keep searching for the parent in sibling replies
          if (reply.replies && findAndUpdateReplyAtPath(reply.replies, targetParentId)) {
            return true
          }
        }
        return false
      }

      setCommentsList_state(
        commentsList_state.map(comment => {
          const updatedComment = { ...comment }
          // Search and update within this comment's entire reply tree with parent tracking
          findAndUpdateReplyAtPath(updatedComment.replies || [], parentId)
          return updatedComment
        })
      )
    } else {
      // Like/Unlike a comment
      setCommentsList_state(
        commentsList_state.map(comment =>
          comment.id === commentId 
            ? { ...comment, likes: isLiked ? comment.likes - 1 : comment.likes + 1 } 
            : comment
        )
      )
    }
  }

  const handleAddReply = (commentId: string, parentReplyId?: string) => {
    if (replyInput.trim()) {
      const newReply: Comment = {
        id: Date.now().toString(),
        author: { name: 'You', avatar: '/avatar.png', title: 'Your Title' },
        content: replyInput,
        timestamp: 'just now',
        likes: 0,
        replies: []
      }

      // Recursive function to add reply at any depth
      const addReplyAtDepth = (replies: Comment[], targetId: string): boolean => {
        for (let reply of replies) {
          if (reply.id === targetId) {
            reply.replies = [...(reply.replies || []), newReply]
            return true
          }
          // Recursively search deeper
          if (reply.replies && addReplyAtDepth(reply.replies, targetId)) {
            return true
          }
        }
        return false
      }

      if (parentReplyId) {
        // Adding a reply to a reply (at any depth)
        setCommentsList_state(
          commentsList_state.map(comment => {
            if (comment.id === commentId) {
              const updatedComment = { ...comment }
              addReplyAtDepth(updatedComment.replies || [], parentReplyId)
              return updatedComment
            }
            return comment
          })
        )
      } else {
        // Adding a reply to a comment
        setCommentsList_state(
          commentsList_state.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              }
            }
            return comment
          })
        )
      }
      setReplyInput('')
      setReplyingTo(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-all">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={author?.avatar || '/avatar.png'}
            alt={author?.name || 'User'}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{author?.name || 'User'}</h3>
            <p className="text-sm text-gray-500">{author?.title || 'Professional Title'}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{timestamp}</span>
              <span>·</span>
              <BookOpen className="w-3 h-3" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Cover Image */}
      {coverImage && (
        <div 
          className="mb-4 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleOpenViewer}
        >
          <img
            src={coverImage}
            alt={storyTitle}
            className="w-full h-64 object-contain"
          />
        </div>
      )}

      {/* Story Content */}
      <div className="mb-4">
        <div className="mb-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
        <h2 
          onClick={handleOpenViewer}
          className="text-xl font-semibold text-gray-900 mb-2 leading-relaxed cursor-pointer hover:opacity-80 transition-opacity"
        >
          {storyTitle}
        </h2>
        <p 
          onClick={handleOpenViewer}
          className="text-gray-600 leading-relaxed cursor-pointer hover:opacity-80 transition-opacity"
        >
          {excerpt}
        </p>
        <button className="text-black font-medium text-sm mt-2 hover:text-gray-700 transition-colors">
          Read more →
        </button>
      </div>

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

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
          <Eye className="w-5 h-5" />
          <span className="text-sm font-medium">{views.toLocaleString()}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentsList_state.length}</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all ml-auto cursor-pointer"
        >
          <Send className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
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
          {commentsList_state.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {commentsList_state.map((comment) => (
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
                        style={{ color: likedComments.has(`comment-${comment.id}`) ? '#1d9bf0' : '#5F6368' }}
                      >
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
      postContent={excerpt}
      contentType="story"
      contentId={id}
    />
    </>
  )
}
