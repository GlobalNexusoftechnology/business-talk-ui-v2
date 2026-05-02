'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
//   MessageCircle,
  Send,
  Tag,
  CheckCircle,
} from 'lucide-react'
import apiClient from '@/lib/api-client'

/* ── Types ─────────────────────────────────────────── */
interface Author {
  id: string
  name: string
  avatar: string
  profession: string
}

interface Question {
  id: string
  title: string
  content: string
  author: Author
  createdAt: string
  upvotes: number
  downvotes: number
  views: number
  tags: string[]
}

interface Answer {
  id: string
  comment: string
  created_on: string
  user: { id: string; username: string; profile_photo?: string }
  replies?: Answer[]
}

/* ── Helpers ────────────────────────────────────────── */
function timeAgo(value: string | number): string {
  const ms = typeof value === 'number' ? value : Number(value)
  const diff = Date.now() - (ms < 1e12 ? ms * 1000 : ms)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`
  return new Date(ms < 1e12 ? ms * 1000 : ms).toLocaleDateString()
}

/* ── Answer component ───────────────────────────────── */
function AnswerItem({
  answer,
  postId,
  onReplyAdded,
}: {
  answer: Answer
  postId: string
  onReplyAdded: (parentId: string, reply: Answer) => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const data = await apiClient.addPostComment(postId, replyText.trim(), answer.id)
      onReplyAdded(answer.id, data)
      setReplyText('')
      setShowReply(false)
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="flex gap-3">
        <img
          src={answer.user.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(answer.user.username)}&background=E8E8E8&color=212529&size=40`}
          alt={answer.user.username}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <div className="flex-1">
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8' }}>
            <p className="text-sm font-semibold" style={{ color: '#212529' }}>{answer.user.username}</p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: '#3D3D3D' }}>{answer.comment}</p>
          </div>
          <div className="flex items-center gap-4 mt-1 px-2">
            <span className="text-xs" style={{ color: '#5F6368' }}>{timeAgo(answer.created_on)}</span>
            <button
              className="text-xs font-medium transition-colors"
              style={{ color: '#5F6368' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1976D2')}
              onMouseLeave={e => (e.currentTarget.style.color = '#5F6368')}
              onClick={() => setShowReply(v => !v)}
            >
              Reply
            </button>
          </div>

          {showReply && (
            <div className="mt-2 flex gap-2 pl-2">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
                style={{ border: '1px solid #E8E8E8', backgroundColor: '#F8F9FA', color: '#212529' }}
              />
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="self-end px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50"
                style={{ backgroundColor: '#212529' }}
              >
                {submitting ? '...' : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}

          {answer.replies && answer.replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 space-y-3" style={{ borderLeft: '2px solid #E8E8E8' }}>
              {answer.replies.map(reply => (
                <div key={reply.id} className="flex gap-3">
                  <img
                    src={reply.user.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user.username)}&background=E8E8E8&color=212529&size=32`}
                    alt={reply.user.username}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 rounded-xl px-3 py-2" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8' }}>
                    <p className="text-xs font-semibold" style={{ color: '#212529' }}>{reply.user.username}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#3D3D3D' }}>{reply.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────── */
export default function QuestionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)

  const [answers, setAnswers] = useState<Answer[]>([])
  const [answerText, setAnswerText] = useState('')
  const [answerSubmitting, setAnswerSubmitting] = useState(false)

  /* fetch question (it's a post with type=QUESTION) */
  useEffect(() => {
    if (!postId) return
    const load = async () => {
      try {
        const res = await apiClient.getPostById(postId)
        const d = res.data
        const formatted: Question = {
          id: d.id,
          title: d.question || d.content?.split('\n')[0] || 'Question',
          content: d.description || d.content || '',
          author: {
            id: d.user?.id || '',
            name: d.user?.username || 'Unknown',
            avatar: d.user?.profile_photo || '',
            profession: d.user?.profession || '',
          },
          createdAt: d.created_on || '',
          upvotes: Number(d.upvotes) || 0,
          downvotes: Number(d.downvotes) || 0,
          views: Number(d.views) || 0,
          tags: (d.tags || []).map((t: any) => (typeof t === 'string' ? t : t.name)),
        }
        setQuestion(formatted)
        setUpvotes(formatted.upvotes)
        setDownvotes(formatted.downvotes)
      } catch (err: any) {
        if (err?.response?.status === 404) setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postId])

  /* fetch answers (comments on a question) */
  useEffect(() => {
    if (!postId) return
    const load = async () => {
      try {
        const data = await apiClient.getPostComments(postId)
        setAnswers(Array.isArray(data) ? data : data?.data || [])
      } catch { /* silent */ }
    }
    load()
  }, [postId])

  const handleVote = async (dir: 'up' | 'down') => {
    if (!question) return
    try {
      await apiClient.votePost(question.id, dir)
      if (dir === 'up') {
        setUpvoted(v => !v); setUpvotes(c => upvoted ? c - 1 : c + 1)
        if (downvoted) { setDownvoted(false); setDownvotes(c => c - 1) }
      } else {
        setDownvoted(v => !v); setDownvotes(c => downvoted ? c - 1 : c + 1)
        if (upvoted) { setUpvoted(false); setUpvotes(c => c - 1) }
      }
    } catch { /* silent */ }
  }

  const handlePostAnswer = async () => {
    if (!answerText.trim() || !question) return
    setAnswerSubmitting(true)
    try {
      const data = await apiClient.addPostComment(question.id, answerText.trim())
      setAnswers(prev => [data, ...prev])
      setAnswerText('')
    } catch { /* silent */ }
    finally { setAnswerSubmitting(false) }
  }

  const handleReplyAdded = (parentId: string, reply: Answer) => {
    setAnswers(prev =>
      prev.map(a => a.id === parentId ? { ...a, replies: [...(a.replies || []), reply] } : a)
    )
  }

  if (loading) return (
    <div className="p-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: '#E8E8E8', borderTopColor: '#212529' }} />
    </div>
  )

  if (notFound || !question) return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F8F9FA' }}>
      <p className="text-lg font-semibold" style={{ color: '#212529' }}>Question not found</p>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm" style={{ color: '#1976D2' }}>
        <ArrowLeft className="w-4 h-4" /> Go back
      </button>
    </div>
  )

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium transition-colors mb-2"
          style={{ color: '#5F6368' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#212529')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5F6368')}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Question card */}
        <div className="bg-white rounded-2xl border p-6" style={{ border: '1px solid #E8E8E8' }}>
          {/* Author */}
          <div className="flex items-start gap-3 mb-5">
            <img
              src={question.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author.name)}&background=E8E8E8&color=212529&size=48`}
              alt={question.author.name}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold" style={{ color: '#212529' }}>{question.author.name}</p>
              {question.author.profession && (
                <p className="text-sm" style={{ color: '#5F6368' }}>{question.author.profession}</p>
              )}
              <p className="text-xs mt-0.5" style={{ color: '#9E9E9E' }}>{timeAgo(question.createdAt)}</p>
            </div>
          </div>

          {/* Question heading */}
          <h1 className="text-xl font-bold mb-3 leading-snug" style={{ color: '#212529' }}>
            {question.title}
          </h1>

          {/* Description */}
          {question.content && question.content !== question.title && (
            <p className="text-base leading-relaxed whitespace-pre-wrap mb-4" style={{ color: '#3D3D3D' }}>
              {question.content}
            </p>
          )}

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {question.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}>
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Vote + stats row */}
          <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid #F0F0F0' }}>
            <button
              onClick={() => handleVote('up')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: upvoted ? '#E3F2FD' : '#F8F9FA', color: upvoted ? '#1976D2' : '#5F6368' }}
            >
              <ThumbsUp className="w-4 h-4" /> {upvotes}
            </button>
            <button
              onClick={() => handleVote('down')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: downvoted ? '#FFF3E0' : '#F8F9FA', color: downvoted ? '#E65100' : '#5F6368' }}
            >
              <ThumbsDown className="w-4 h-4" /> {downvotes}
            </button>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#5F6368' }}>
              <CheckCircle className="w-4 h-4" />
              <span>{answers.length} Answer{answers.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Answer input */}
        <div className="bg-white rounded-2xl border p-5" style={{ border: '1px solid #E8E8E8' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: '#212529' }}>Your Answer</p>
          <textarea
            value={answerText}
            onChange={e => setAnswerText(e.target.value)}
            rows={4}
            placeholder="Share your knowledge or experience..."
            className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 mb-3"
            style={{ border: '1px solid #E8E8E8', backgroundColor: '#F8F9FA', color: '#212529' }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePostAnswer() }}
          />
          <div className="flex justify-end">
            <button
              onClick={handlePostAnswer}
              disabled={answerSubmitting || !answerText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ backgroundColor: '#212529' }}
              onMouseEnter={e => { if (!answerSubmitting && answerText.trim()) e.currentTarget.style.backgroundColor = '#3D3D3D' }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#212529')}
            >
              <Send className="w-4 h-4" />
              {answerSubmitting ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </div>

        {/* Answers list */}
        {answers.length > 0 && (
          <div className="bg-white rounded-2xl border p-5 space-y-5" style={{ border: '1px solid #E8E8E8' }}>
            <p className="text-sm font-semibold" style={{ color: '#212529' }}>
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </p>
            {answers.map(a => (
              <AnswerItem key={a.id} answer={a} postId={question.id} onReplyAdded={handleReplyAdded} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
