'use client'

import { MessageCircle, Send, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { ContentData } from '@/hooks/useContentViewer'



interface QuestionViewCardProps {
  data: ContentData;
}

export function QuestionViewCard({ data }: QuestionViewCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(data.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [commentsList, setCommentsList] = useState<any[]>(data.commentsList || [])
  const [showShareModal, setShowShareModal] = useState(false)
  const [, forceUpdate] = useState(0)

  // Helper function to recursively render infinite nested replies
  const renderNestedReplies = (replies: any[], parentId: number, parentReplyId?: number, ancestry: Array<number> = []): JSX.Element => {
    if (!replies || replies.length === 0) return <></>;
    return (
      <div className="mt-3 ml-8 space-y-3">
        {replies.map((nestedReply) => {
          const newAncestry = [...ancestry, nestedReply.id];
          const replyPath = newAncestry.join('-');
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
          );
        })}
      </div>
    );
  };

                  // Like/Unlike a comment or reply at any depth using unique path
                  const handleLikeComment = (commentId: number, parentId?: number, replyPath?: string) => {
                    const itemId = replyPath || (parentId ? `${parentId}-reply-${commentId}` : `comment-${commentId}`)
                    const isLiked = likedComments.has(itemId)
                    const newLikedComments = new Set(likedComments)

                    if (isLiked) {
                      newLikedComments.delete(itemId)
                    } else {
                      newLikedComments.add(itemId)
                    }
                    setLikedComments(newLikedComments)

                    // Helper to immutably update likes for the correct reply by path (using numeric IDs)
                    function updateLikesByPathImmutable(replies: any[], pathArr: (string|number)[]): any[] {
                      if (!replies || pathArr.length === 0) return replies
                      const [current, ...rest] = pathArr
                      const currentId = typeof current === 'string' ? parseInt(current, 10) : current
                      return replies.map(r => {
                        if (r.id === currentId) {
                          if (rest.length === 0) {
                            return {
                              ...r,
                              likes: isLiked ? r.likes - 1 : r.likes + 1
                            }
                          } else {
                            return {
                              ...r,
                              replies: updateLikesByPathImmutable(r.replies || [], rest)
                            }
                          }
                        }
                        return r
                      })
                    }

                    if (replyPath) {
                      // replyPath is like '1-2-4', split to get the id chain as numbers
                      const idChain = replyPath.split('-').map(Number)
                      setCommentsList(prev => {
                        const updated = prev.map(comment => {
                          if (comment.id === idChain[0]) {
                            return {
                              ...comment,
                              replies: updateLikesByPathImmutable(comment.replies || [], idChain.slice(1))
                            }
                          }
                          return comment
                        })
                        forceUpdate(n => n + 1)
                        return updated
                      })
                    } else if (parentId) {
                      // Like/Unlike a reply at first level
                      setCommentsList(prev => {
                        const updated = prev.map(comment => {
                          if (comment.id === parentId && comment.replies) {
                            return {
                              ...comment,
                              replies: comment.replies.map((reply: any) =>
                                reply.id === commentId
                                  ? { ...reply, likes: isLiked ? reply.likes - 1 : reply.likes + 1 }
                                  : reply
                              )
                            }
                          }
                          return comment
                        })
                        forceUpdate(n => n + 1)
                        return updated
                      })
                    } else {
                      // Like/Unlike a comment
                      setCommentsList(prev => {
                        const updated = prev.map(comment =>
                          comment.id === commentId 
                            ? { ...comment, likes: isLiked ? comment.likes - 1 : comment.likes + 1 } 
                            : comment
                        )
                        forceUpdate(n => n + 1)
                        return updated
                      })
                    }
                  }

                  const handleLike = () => {
                    if (liked) {
                      setLiked(false)
                      setLikeCount(likeCount - 1)
                    } else {
                      setLiked(true)
                      setLikeCount(likeCount + 1)
                    }
                  }

                  const handleAddComment = () => {
                    if (commentInput.trim()) {
                      const newComment = {
                        id: Math.max(...commentsList.map((c: any) => c.id), 0) + 1,
                        author: { name: 'You', avatar: '/avatar.png', title: 'Your Title' },
                        content: commentInput,
                        created_at: new Date().toISOString(),
                        likes: 0,
                        replies: [],
                      }
                      setCommentsList([...commentsList, newComment])
                      setCommentInput('')
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

                  const handleAddReply = (commentId: number, parentReplyId?: number) => {
                    if (replyInput.trim()) {
                      // Get all ids in the tree to avoid duplicates
                      const allIds = getAllReplyIds(commentsList)
                      const newId = (allIds.length > 0 ? Math.max(...allIds) : 0) + 1
                      const newReply = {
                        id: newId,
                        author: { name: 'You', avatar: '/avatar.png', title: 'Your Title' },
                        content: replyInput,
                        created_at: new Date().toISOString(),
                        likes: 0,
                        replies: []
                      }

                      // Recursive function to add reply at any depth
                      const addReplyAtDepth = (replies: any[], targetId: number): boolean => {
                        for (let reply of replies) {
                          if (reply.id === targetId) {
                            reply.replies = [...(reply.replies || []), newReply]
                            return true
                          }
                          if (reply.replies && addReplyAtDepth(reply.replies, targetId)) {
                            return true
                          }
                        }
                        return false
                      }

                      if (parentReplyId) {
                        // Adding a reply to a reply (at any depth)
                        setCommentsList(
                          commentsList.map(comment => {
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
                        setCommentsList(
                          commentsList.map(comment => {
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={data.author?.avatar || '/avatar.png'}
          alt={data.author?.name || 'Author'}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{data.author?.name}</h3>
          <p className="text-sm text-gray-500">{data.author?.title || 'User'}</p>
          <p className="text-xs text-gray-400">{data.timestamp || 'just now'}</p>
        </div>
      </div>

      {/* Question Title */}
      <h2 className="text-2xl font-bold text-gray-900">{data.question}</h2>

      {/* Description */}
      {data.description && (
        <p className="text-gray-700 leading-relaxed">{data.description}</p>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag}
            </span>
          ))}
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
            <span className="text-sm font-medium">{data.sends ?? 0}</span>
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={data.content}
        contentType="post"
        contentId={data.id}
      />

      {/* Sample Answer Preview if available */}
      {data.answersList && data.answersList.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="font-semibold mb-4 text-gray-900">Sample Answer</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start gap-3">
              <img
                src={data.answersList[0].author?.avatar || '/avatar.png'}
                alt={data.answersList[0].author?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {data.answersList[0].author?.name}
                </p>
                <p className="text-sm text-gray-700 mt-1">{data.answersList[0].content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
