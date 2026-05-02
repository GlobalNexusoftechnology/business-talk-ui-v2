'use client'

import { useEffect, useState, useCallback } from 'react'
import apiClient from '@/lib/api-client'
import {
  MessageSquare,
  Heart,
  Share2,
  FileQuestion,
  BookOpen,
  Newspaper,
  Loader2,
  ChevronDown,
} from 'lucide-react'

type ActivityTab = 'posts' | 'questions' | 'stories' | 'comments'

function timeAgo(dateInput: string | number | undefined) {
  if (!dateInput) return ''
  // Handle epoch ms timestamps (number or numeric string like "1777701362840")
  let ts: number
  if (typeof dateInput === 'number') {
    ts = dateInput
  } else if (/^\d{10,}$/.test(String(dateInput))) {
    ts = parseInt(dateInput as string, 10)
  } else {
    ts = new Date(dateInput).getTime()
  }
  if (isNaN(ts)) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatPill({ icon, count }: { icon: React.ReactNode; count?: number }) {
  if (count === undefined || count === null) return null
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      {icon}
      {count}
    </span>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <p className="text-sm text-gray-800 line-clamp-3 mb-2">
        {post.content || post.title || 'No content'}
      </p>
      {post.media_url && (
        <img
          src={post.media_url}
          alt=""
          className="rounded-lg w-full max-h-40 object-cover mb-2"
        />
      )}
      <div className="flex items-center gap-4 mt-1">
        {/* API returns upvotes/downvotes; fall back to likes_count for other sources */}
        <StatPill icon={<Heart className="w-3 h-3" />} count={post.upvotes ?? post.likes_count ?? post.likes} />
        <StatPill icon={<MessageSquare className="w-3 h-3" />} count={post.comments_count ?? post.comments} />
        <StatPill icon={<Share2 className="w-3 h-3" />} count={post.shares_count ?? post.shares} />
        <span className="ml-auto text-xs text-gray-400">
          {timeAgo(post.created_on ?? post.created_at)}
        </span>
      </div>
    </div>
  )
}

function QuestionCard({ item }: { item: any }) {
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-2 mb-1">
        <FileQuestion className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.content || item.title}</p>
      </div>
      {item.description && (
        <p className="text-xs text-gray-500 ml-6 line-clamp-2 mb-2">{item.description}</p>
      )}
      <div className="flex items-center gap-4 ml-6">
        <StatPill icon={<Heart className="w-3 h-3" />} count={item.likes_count ?? item.likes} />
        <StatPill icon={<MessageSquare className="w-3 h-3" />} count={item.comments_count ?? item.comments} />
        <span className="ml-auto text-xs text-gray-400">{timeAgo(item.created_at)}</span>
      </div>
    </div>
  )
}

function StoryCard({ item }: { item: any }) {
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        {item.cover_image && (
          <img
            src={item.cover_image}
            alt=""
            className="w-16 h-16 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-0.5">
            {item.title || 'Untitled'}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2">{item.content || item.excerpt}</p>
          <div className="flex items-center gap-3 mt-2">
            <StatPill icon={<Heart className="w-3 h-3" />} count={item.likes_count ?? item.likes} />
            <StatPill icon={<MessageSquare className="w-3 h-3" />} count={item.comments_count ?? item.comments} />
            <span className="ml-auto text-xs text-gray-400">{timeAgo(item.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentCard({ item }: { item: any }) {
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {item.post_title || item.blog_title ? (
            <p className="text-xs text-gray-400 mb-1 truncate">
              On: <span className="font-medium text-gray-600">{item.post_title || item.blog_title}</span>
            </p>
          ) : null}
          <p className="text-sm text-gray-800 line-clamp-3">{item.comment || item.content}</p>
          <span className="text-xs text-gray-400 mt-1 block">{timeAgo(item.created_on ?? item.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

const TABS: { key: ActivityTab; label: string; icon: React.ReactNode }[] = [
  { key: 'posts', label: 'Posts', icon: <Newspaper className="w-3.5 h-3.5" /> },
  { key: 'questions', label: 'Questions', icon: <FileQuestion className="w-3.5 h-3.5" /> },
  { key: 'stories', label: 'Stories', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: 'comments', label: 'Comments', icon: <MessageSquare className="w-3.5 h-3.5" /> },
]

export function ProfileRecentActivity({
  userId,
  activity,
}: {
  userId: string
  activity?: {
    recentPosts?: any[]
    recentComments?: any[]
    recentBlogPosts?: any[]
    recentFollows?: any[]
  } | null
}) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('posts')
  const [items, setItems] = useState<Record<ActivityTab, any[]>>({
    posts: [], questions: [], stories: [], comments: [],
  })
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState<Set<ActivityTab>>(new Set())
  const [page, setPage] = useState<Record<ActivityTab, number>>({
    posts: 1, questions: 1, stories: 1, comments: 1,
  })
  const [hasMore, setHasMore] = useState<Record<ActivityTab, boolean>>({
    posts: true, questions: true, stories: true, comments: true,
  })

  // Pre-populate from the /user/activity API response
  useEffect(() => {
    if (!activity) return

    const allPosts = activity.recentPosts ?? []
    const posts     = allPosts.filter((p: any) => p.type !== 'QUESTION' && !p.is_question)
    const questions = allPosts.filter((p: any) => p.type === 'QUESTION' || p.is_question)
    const comments  = activity.recentComments ?? []
    const stories   = (activity.recentBlogPosts ?? []).filter((b: any) => b.type === 'STORY')

    setItems(prev => ({
      ...prev,
      posts:     posts.length     ? posts     : prev.posts,
      questions: questions.length ? questions : prev.questions,
      comments:  comments.length  ? comments  : prev.comments,
      stories:   stories.length   ? stories   : prev.stories,
    }))
    setLoaded(prev => {
      const next = new Set(prev)
      if (posts.length)     next.add('posts')
      if (questions.length) next.add('questions')
      if (comments.length)  next.add('comments')
      if (stories.length)   next.add('stories')
      return next
    })
  }, [activity])

  const fetchTab = useCallback(async (tab: ActivityTab, pg: number) => {
    if (!userId) return
    setLoading(true)
    try {
      let data: any[] = []

      if (tab === 'posts') {
        const res = await apiClient.getUserPosts(userId, pg)
        const raw = res.data
        data = Array.isArray(raw) ? raw : raw?.data ?? raw?.posts ?? []
        // Posts that are not QUESTION type
        data = data.filter((p: any) => !p.type || p.type === 'POST' || p.type === 'TEXT' || p.type === 'MEDIA')
      } else if (tab === 'questions') {
        const res = await apiClient.getUserPosts(userId, pg)
        const raw = res.data
        const all = Array.isArray(raw) ? raw : raw?.data ?? raw?.posts ?? []
        data = all.filter((p: any) => p.type === 'QUESTION' || p.is_question)
      } else if (tab === 'stories') {
        const res = await apiClient.getUserBlogs(userId, pg)
        const raw = res.data
        const all = Array.isArray(raw) ? raw : raw?.data ?? raw?.blogs ?? []
        data = all.filter((b: any) => b.type === 'STORY')
      } else if (tab === 'comments') {
        const res = await apiClient.getUserComments(userId, pg)
        const raw = res.data
        data = Array.isArray(raw) ? raw : raw?.data ?? raw?.comments ?? []
      }

      setItems(prev => ({
        ...prev,
        [tab]: pg === 1 ? data : [...prev[tab], ...data],
      }))
      setPage(prev => ({ ...prev, [tab]: pg }))
      setHasMore(prev => ({ ...prev, [tab]: data.length === 5 || data.length === 10 }))
      setLoaded(prev => new Set(prev).add(tab))
    } catch {
      setLoaded(prev => new Set(prev).add(tab))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId || loaded.has(activeTab)) return
    fetchTab(activeTab, 1)
  }, [activeTab, userId, loaded, fetchTab])

  const current = items[activeTab]

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors
              ${activeTab === t.key
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {loading && current.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : current.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No {activeTab} yet
          </div>
        ) : (
          <>
            {activeTab === 'posts' && current.map((p, i) => <PostCard key={p.id ?? i} post={p} />)}
            {activeTab === 'questions' && current.map((p, i) => <QuestionCard key={p.id ?? i} item={p} />)}
            {activeTab === 'stories' && current.map((p, i) => <StoryCard key={p.id ?? i} item={p} />)}
            {activeTab === 'comments' && current.map((p, i) => <CommentCard key={p.id ?? i} item={p} />)}

            {hasMore[activeTab] && (
              <button
                onClick={() => fetchTab(activeTab, page[activeTab] + 1)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><ChevronDown className="w-4 h-4" /> Load more</>
                }
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
