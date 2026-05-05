'use client'

import {
  Eye,
  MessageCircle,
  Send,
  Tag,
  PenLine,
  ThumbsUp,
  ThumbsDown,
  UserCheck, 
  UserMinus, 
  UserPlus ,
  Bookmark,
  Trash2
} from 'lucide-react'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShareModal } from '@/components/shared/ShareModal'
import { useOpenContent } from '@/hooks/useOpenContent'
import apiClient from '@/lib/api-client'
import { MoreVertical, Flag } from 'lucide-react'
import { ReportModal } from '@/components/shared/ReportModal'
import { useFollow } from '@/hooks/useFollow'
import { useSavedStatus } from '@/hooks/useSavedStatus'
import { useAccountStatus, useAppSelector } from '@/hooks/useRedux'
import { getTimeAgo } from '@/lib/utils'

interface Answer {
  id: string
  authorId?: string
  author: {
    name: string
    title: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies?: Answer[]
  parent?: any
}

interface QuestionPostProps {
  id?: string
  authorId?: string
  author: {
    name: string
    title: string
    avatar: string
  }
  question?: string
  content?: string
  description?: string
  tags?: string[]
  timestamp: string
  answers?: number
  views?: number
  likes?: number
  liked?: boolean
  dislikes?: number
}

export function QuestionPost({
  id = '',
  authorId = '',
  author,
  question,
  content,
  description,
  tags = [],
  timestamp,
  // answers,
  views,
  likes = 0,
  liked = false,
  // dislikes = 0
}: QuestionPostProps) {

  const { openQuestion } = useOpenContent()
  const router = useRouter()
  const { state: followState, follow, unfollow } = useFollow(authorId)
  const { isSaved, toggle: toggleSave, showToast: showSavedToast } = useSavedStatus(id || undefined, 'post')
  const { isBanned } = useAccountStatus()

  const [answersList, setAnswersList] = useState<Answer[]>([])
  const [answerText, setAnswerText] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showAnswerBox, setShowAnswerBox] = useState(false)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const [likeCount, setLikeCount] = useState(likes || 0)
  // const [dislikeCount, setDislikeCount] = useState(dislikes || 0)

  const [isLiked, setIsLiked] = useState(liked)
  const [disliked, setDisliked] = useState(false)
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set())
  const [dislikedAnswers, setDislikedAnswers] = useState<Set<string>>(new Set())
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [dislikeAnimatingId, setDislikeAnimatingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [isDeleted, setIsDeleted] = useState(false)
  const [deleteToast, setDeleteToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const reduxUser = useAppSelector((state: any) => state.auth.user)

  useEffect(() => {
    if (reduxUser?.id) {
      setCurrentUserId(String(reduxUser.id))
    } else {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        setCurrentUserId(String(u.id || ''))
      } catch {}
    }
  }, [reduxUser])

  useEffect(() => {
    setIsLiked(Boolean(liked))
  }, [liked])

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setShowActionMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayQuestion = question || content || ''


  // =========================
  // 🔖 SAVE QUESTION — handled by useSavedStatus hook
  // =========================

  const handleSave = async () => {
    await toggleSave(() => setShowActionMenu(false))
  }

  // =========================
  // �🗳️ VOTE QUESTION
  // =========================

  const handleLikeQuestion = async () => {
    if (isBanned) return
    setAnimatingId('question')
    setTimeout(() => setAnimatingId(null), 300)

    try {
      const res = await apiClient.votePost(id, 'up')

      setLikeCount(res.upvotes)
      // setDislikeCount(res.downvotes)

      setIsLiked(res.myVote === 'up' || Boolean(res.liked))
      setDisliked(false)
    } catch {
      // fallback
      if (isLiked) {
        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      } else {
        setIsLiked(true)
        setLikeCount(prev => prev + 1)

        if (disliked) {
          setDisliked(false)
          // setDislikeCount(prev => prev - 1)
        }
      }
    }
  }

  // =========================
  // 🔄 FETCH ANSWERS
  // =========================

  useEffect(() => {
    const fetchAnswers = async () => {
      if (!id) return
      try {
        const res = await apiClient.getPostComments(id)
        setAnswersList(nestAnswers(res))
      } catch (err) {
        console.error('Failed to fetch answers')
      }
    }

    fetchAnswers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // =========================
  // 🧠 MAPPING
  // =========================

  const mapApiAnswerToUi = (apiComment: any): Answer => ({
    id: apiComment.id,
    authorId: String(apiComment.user?.id || ''),
    author: {
      name: apiComment.user?.full_name || apiComment.user?.username || 'Unknown',
      avatar: apiComment.user?.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(apiComment.user?.full_name || 'User')}`,
      title: apiComment.user?.profession || '',
    },
    content: apiComment.comment,
    timestamp: new Date(Number(apiComment.created_on)).toLocaleString(),
    likes: apiComment.likes || 0,
    dislikes: apiComment.dislikes || 0,
    replies: [],
    parent: apiComment.parent || null,
  })

  const nestAnswers = (comments: any[]): Answer[] => {
    const map: Record<string, Answer> = {}
    const roots: Answer[] = []

    comments.forEach((c) => {
      map[c.id] = { ...mapApiAnswerToUi(c), replies: [] }
    })

    comments.forEach((c) => {
      if (c.parent && c.parent.id && map[c.parent.id]) {
        map[c.parent.id].replies!.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    })

    return roots
  }

  // =========================
  // ➕ ADD ANSWER
  // =========================

  const handlePostAnswer = async () => {
    if (!answerText.trim() || isBanned) return

    try {
      await apiClient.addPostComment(id, answerText)

      const updated = await apiClient.getPostComments(id)
      setAnswersList(nestAnswers(updated))

      setAnswerText('')
      setShowAnswerBox(false)
    } catch (err) {
      console.error('Failed to post answer')
    }
  }

  // =========================
  // 💬 REPLY
  // =========================

  const handleAddReply = async (answerId: string, parentReplyId?: string) => {
    if (!replyInput.trim() || isBanned) return

    try {
      await apiClient.addPostComment(
        id,
        replyInput,
        parentReplyId || answerId
      )

      const updated = await apiClient.getPostComments(id)
      setAnswersList(nestAnswers(updated))

      setReplyInput('')
      setReplyingTo(null)
    } catch (err) {
      console.error('Reply failed')
    }
  }

  const showDeleteToast = (message: string, type: 'success' | 'error') => {
    setDeleteToast({ message, type })
    setTimeout(() => setDeleteToast(null), 3000)
  }

  // Delete this question (only shown to author)
  const handleDeleteQuestion = async () => {
    if (!window.confirm('Delete this question? This cannot be undone.')) return
    try {
      await apiClient.deletePost(id)
      setIsDeleted(true)
      showDeleteToast('Question deleted successfully', 'success')
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 403) {
        showDeleteToast('You can only delete your own content', 'error')
      } else if (status === 401) {
        showDeleteToast('Session expired. Please log in again.', 'error')
      } else {
        showDeleteToast(err?.response?.data?.message || 'Failed to delete question', 'error')
      }
    }
  }

  // Delete an answer/comment (only shown to answer author)
  const removeAnswerRecursive = (list: Answer[], targetId: string): Answer[] =>
    list
      .filter((a) => String(a.id) !== targetId)
      .map((a) => ({
        ...a,
        replies: removeAnswerRecursive(a.replies || [], targetId),
      }))

  const handleDeleteAnswer = async (answerId: string) => {
    // Optimistic update
    const prevList = answersList
    setAnswersList(prev => removeAnswerRecursive(prev, String(answerId)))
    try {
      await apiClient.deletePostComment(answerId)
      showDeleteToast('Answer deleted', 'success')
    } catch (err: any) {
      // Rollback on failure
      setAnswersList(prevList)
      const status = err?.response?.status
      if (status === 403) {
        showDeleteToast('You can only delete your own content', 'error')
      } else if (status === 401) {
        showDeleteToast('Session expired. Please log in again.', 'error')
      } else {
        showDeleteToast(err?.response?.data?.message || 'Failed to delete answer', 'error')
      }
    }
  }

  // Recursively update vote counts at any depth in the answers tree
  const updateAnswerVotesRecursive = (
    list: Answer[],
    targetId: string,
    upvotes?: number,
    downvotes?: number
  ): Answer[] =>
    list.map(a =>
      a.id === targetId
        ? {
            ...a,
            ...(upvotes !== undefined ? { likes: upvotes } : {}),
            ...(downvotes !== undefined ? { dislikes: downvotes } : {}),
          }
        : { ...a, replies: updateAnswerVotesRecursive(a.replies || [], targetId, upvotes, downvotes) }
    )

  // =========================
  // 👍 VOTE (AGREE/DISAGREE)
  // =========================

  const handleVoteAnswer = async (answerId: string, vote: 'up' | 'down') => {
    if (vote === 'up') {
      setAnimatingId(answerId)
      setTimeout(() => setAnimatingId(null), 300)
      setLikedAnswers(prev => {
        const next = new Set(prev)
        next.has(answerId) ? next.delete(answerId) : next.add(answerId)
        return next
      })
      // clear dislike if switching
      setDislikedAnswers(prev => {
        if (!prev.has(answerId)) return prev
        const next = new Set(prev)
        next.delete(answerId)
        return next
      })
    } else {
      setDislikeAnimatingId(answerId)
      setTimeout(() => setDislikeAnimatingId(null), 300)
      setDislikedAnswers(prev => {
        const next = new Set(prev)
        next.has(answerId) ? next.delete(answerId) : next.add(answerId)
        return next
      })
      // clear like if switching
      setLikedAnswers(prev => {
        if (!prev.has(answerId)) return prev
        const next = new Set(prev)
        next.delete(answerId)
        return next
      })
    }

    try {
      const res = await apiClient.voteComment(answerId, vote)
      if (res?.upvotes !== undefined || res?.downvotes !== undefined) {
        setAnswersList(prev => updateAnswerVotesRecursive(prev, answerId, res.upvotes, res.downvotes))
      } else {
        // fallback: refetch if API doesn't return vote counts
        const updated = await apiClient.getPostComments(id)
        setAnswersList(nestAnswers(updated))
      }
    } catch (err) {
      console.error('Vote failed')
    }
  }

  // =========================
  // 🔁 RECURSIVE REPLIES
  // =========================

  const renderReplies = (replies: Answer[], parentId: string) => {
    if (!replies || replies.length === 0) return null

    return (
      <div className="ml-8 mt-3 space-y-3">
        {replies.map((reply) => (
          <div key={reply.id}>
            <div className="flex gap-2">
              <img src={reply.author.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(reply.author.name || 'User')}`} alt={reply.author.name} className="w-6 h-6 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <p className="text-xs font-semibold">{reply.author.name}</p>
                  <p className="text-xs">{reply.content}</p>
                </div>

                <div className="flex gap-3 text-xs mt-1">
                  <button
                    onClick={() => handleVoteAnswer(reply.id, 'up')}
                    className="flex items-center gap-1 transition-colors"
                    style={{ color: likedAnswers.has(reply.id) ? '#1d9bf0' : '#5F6368' }}
                  >
                    <ThumbsUp
                      className={`inline w-4 h-4 transition-all duration-200 ${
                        animatingId === reply.id ? 'scale-150 rotate-12' : ''
                      }`}
                    /> {reply.likes}
                  </button>
                  <button
                    onClick={() => handleVoteAnswer(reply.id, 'down')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all duration-200 active:scale-90 hover:scale-105 ${
                      dislikedAnswers.has(reply.id)
                        ? 'bg-red-50 text-red-500 scale-105'
                        : 'text-gray-500 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown
                      className={`inline w-4 h-4 transition-all duration-200 ${
                        dislikeAnimatingId === reply.id ? 'scale-150 -rotate-12' : ''
                      }`}
                    /> {reply.dislikes}
                  </button>
                  <button onClick={() => setReplyingTo(reply.id)}>
                    Reply
                  </button>
                  {currentUserId && currentUserId === reply.authorId && (
                    <button
                      onClick={() => handleDeleteAnswer(reply.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete answer"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {replyingTo === reply.id && (
              <div className="ml-8 mt-2 flex gap-2">
                <input
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  disabled={isBanned}
                  className="flex-1 border rounded-full px-3 py-1 text-xs disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button onClick={() => handleAddReply(parentId, reply.id)} disabled={isBanned} className="disabled:opacity-50 disabled:cursor-not-allowed">
                  Send
                </button>
              </div>
            )}

            {renderReplies(reply.replies || [], parentId)}
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // 🎯 UI
  // =========================

  return (
    <>
      {/* Delete toast */}
      {deleteToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl ${
          deleteToast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
        }`}>
          {deleteToast.message}
        </div>
      )}
      {/* Instagram-style saved toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
          <Bookmark className="w-4 h-4 fill-white" />
          Saved to your collection
        </div>
      )}
      {isDeleted ? null : (
      <div className="bg-white rounded-2xl border p-3 sm:p-6 mb-4">

        {/* HEADER */}
        <div className="flex gap-3 mb-4 justify-between items-start">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => authorId && router.push(`/profile/${authorId}`)}
          >
          <img src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=E8E8E8&color=212529&size=48`} alt={author.name} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-semibold hover:underline">{author.name}</h3>
            <p className="text-sm text-gray-500">{author.title}</p>
            <p className="text-xs text-gray-400">{getTimeAgo(timestamp)}</p>
          </div>
          </div>

          <div ref={actionMenuRef} className="relative">
            <button onClick={() => setShowActionMenu(!showActionMenu)} className="text-gray-400 hover:text-gray-600 p-1 transition">
              <MoreVertical className="w-5 h-5" />
            </button>

            {showActionMenu && (
              <div className="absolute right-0 bg-white border rounded shadow p-2 row-gap-2 flex flex-col text-sm z-10">
                <button
                  onClick={handleSave}
                  className="group p-2 rounded transition-all duration-200 flex items-center gap-1 text-xs hover:bg-gray-100 hover:gap-2"
                  title={isSaved ? 'Unsave' : 'Save post'}
                  style={{ color: isSaved ? '#1d9bf0' : '#374151' }}
                >
                  {/* Bookmark Icon */}
                  <Bookmark
                    className={`w-4 h-4 transition-all duration-200 ${
                      isSaved ? 'fill-[#1d9bf0]' : ''
                    }`}
                  />

                  {/* Text (only on hover) */}
                  <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-200 whitespace-nowrap">
                    {isSaved ? 'Unsave' : 'Save'}
                  </span>
                </button>
                <button
                  onClick={followState === 'connected' ? unfollow : follow}
                  disabled={isBanned}
                  className="group p-2 rounded transition flex items-center gap-1 text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: '#374151' }}
                  title={
                    followState === 'connected'
                      ? 'Disconnect'
                      : followState === 'pending'
                      ? 'Requested'
                      : 'Connect'
                  }
                >
                  {/* Icon based on state */}
                  {followState === 'connected' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : followState === 'pending' ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}

                  {/* Text appears only on hover */}
                  <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-200 whitespace-nowrap">
                    {followState === 'connected'
                      ? 'Disconnect'
                      : followState === 'pending'
                      ? 'Requested'
                      : 'Connect'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(true)
                    setShowActionMenu(false)
                  }}
                  title='Report'
                  className="group flex items-center gap-1 text-red-600 hover:bg-gray-100 px-2 py-1 rounded transition-all duration-200 hover:gap-2"
                >
                <Flag className="w-4 h-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-200 whitespace-nowrap">
                  Report
                </span>
                </button>
                {currentUserId && currentUserId === authorId && (
                  <button
                    onClick={handleDeleteQuestion}
                    title='Delete question'
                    className="group flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-all duration-200 hover:gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-200 whitespace-nowrap">
                      Delete
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* QUESTION */}
        <h2
          onClick={() =>
            openQuestion({
              id,
              question: displayQuestion,
              content: displayQuestion,
              description,
              tags,
              author,
              authorId,
              timestamp,
              likes: likeCount,
              liked: isLiked,
              views,
            })
          }
          className="text-lg font-semibold cursor-pointer"
        >
          {displayQuestion}
        </h2>

        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}

        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4" />
              <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: '#F3F4F6',
                    color: '#5F6368' 
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex flex-wrap gap-3 sm:gap-6 mt-4 border-y py-3 text-sm text-gray-500">
          {/* 👍 LIKE */}
          <button
            onClick={handleLikeQuestion}
            disabled={isBanned}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg 
              transition-all duration-200
              active:scale-90 hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
              ${
                isLiked
                  ? 'bg-blue-50 text-blue-600 scale-105'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            <ThumbsUp
              className={`w-5 h-5 transition-all duration-200 ${
                animatingId === 'question' ? 'scale-150 rotate-12' : ''
              }`}
            />
            {likeCount}
          </button>
          <button onClick={() => setShowAllAnswers(!showAllAnswers)} className="flex items-center gap-1">
            <MessageCircle className="inline w-4 h-4" /> {answersList.length}
          </button>

          <div  className="flex items-center gap-1">
            <Eye className="inline w-5 h-5" /> {views}
          </div>

          <button className="ml-auto" onClick={() => setShowShareModal(true)}>
            <Send className="inline w-5 h-5" />
          </button>
        </div>

        {/* ANSWER INPUT */}
        {!showAnswerBox ? (
          <button
            onClick={() => setShowAnswerBox(true)}
            disabled={isBanned}
            className="mt-4 w-full border rounded-full py-3 flex items-center gap-1 justify-center text-gray-500 transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PenLine className="inline w-4 h-4" /> Write your answer
          </button>
        ) : (
          <div className="mt-4">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isBanned}
              placeholder={isBanned ? 'Your account is restricted' : undefined}
              className="w-full border rounded-xl p-3 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button onClick={handlePostAnswer} disabled={isBanned} className="mt-2 px-4 py-2 bg-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
              Post Answer
            </button>
          </div>
        )}

        {/* ANSWERS */}
        {showAllAnswers && (
          <div className="mt-6 space-y-4">
            {answersList.map((answer) => (
              <div key={answer.id} className="bg-gray-50 p-4 rounded-xl">
                <p className="font-semibold">{answer.author.name}</p>
                <p className="text-sm">{answer.content}</p>

                <div className="flex gap-3 mt-2 text-sm">
                  <button
                    onClick={() => handleVoteAnswer(answer.id, 'up')}
                    className="flex items-center gap-1 transition-colors"
                    style={{ color: likedAnswers.has(answer.id) ? '#1d9bf0' : '#5F6368' }}
                  >
                    <ThumbsUp
                      className={`inline w-4 h-4 transition-all duration-200 ${
                        animatingId === answer.id ? 'scale-150 rotate-12' : ''
                      }`}
                    /> Agree ({answer.likes})
                  </button>
                  <button
                    onClick={() => handleVoteAnswer(answer.id, 'down')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-90 hover:scale-105 ${
                      dislikedAnswers.has(answer.id)
                        ? 'bg-red-50 text-red-500 scale-105'
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown
                      className={`inline w-4 h-4 transition-all duration-200 ${
                        dislikeAnimatingId === answer.id ? 'scale-150 -rotate-12' : ''
                      }`}
                    /> Disagree ({answer.dislikes})
                  </button>
                  <button onClick={() => setReplyingTo(answer.id)}>
                    Reply
                  </button>
                  {currentUserId && currentUserId === answer.authorId && (
                    <button
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete answer"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>

                {replyingTo === answer.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      disabled={isBanned}
                      className="flex-1 border rounded-full px-3 py-1 text-xs disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button onClick={() => handleAddReply(answer.id)} disabled={isBanned} className="disabled:opacity-50 disabled:cursor-not-allowed">
                      Send
                    </button>
                  </div>
                )}

                {renderReplies(answer.replies || [], answer.id)}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={displayQuestion}
        contentType="questions"
        contentId={id}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={id}
        contentType="post"
      />
    </>
  )
}