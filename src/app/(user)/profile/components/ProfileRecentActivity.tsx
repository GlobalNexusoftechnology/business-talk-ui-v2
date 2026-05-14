'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import {
  MessageSquare,
  ThumbsUp,
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

function PostCard({ post, onNavigate }: { post: any; onNavigate: (path: string) => void }) {
  return (
    <div
      className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => post.id && onNavigate(`/posts/${post.id}`)}
    >
      <p className="text-sm text-gray-800 line-clamp-3 mb-2">
        {post.content || post.title || 'No content'}
      </p>
      {(() => {
        // API returns media as array: [{url, type: 'image'|'video'}]
        const mediaArr: any[] = Array.isArray(post.media) ? post.media : []
        const videoItem = mediaArr.find((m: any) => m.type === 'video') ||
          (post.video_url || post.video ? { url: post.video_url || post.video } : null)
        const imageItem = mediaArr.find((m: any) => m.type === 'image') ||
          (post.media_url || post.image_url || post.image ? { url: post.media_url || post.image_url || post.image } : null)
        if (videoItem?.url) return (
          <video src={videoItem.url} className="rounded-lg w-full max-h-40 object-cover mb-2" controls />
        )
        if (imageItem?.url) return (
          <img src={imageItem.url} alt="" className="rounded-lg w-full max-h-40 object-cover mb-2"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        )
        return null
      })()}
      <div className="flex items-center gap-4 mt-1">
        <StatPill icon={<ThumbsUp className="w-3 h-3" />} count={post.upvotes ?? post.likes_count ?? post.likes} />
        <StatPill icon={<MessageSquare className="w-3 h-3" />} count={post.comments_count ?? post.comments} />
        <StatPill icon={<Share2 className="w-3 h-3" />} count={post.shares_count ?? post.shares} />
        <span className="ml-auto text-xs text-gray-400">
          {timeAgo(post.created_on ?? post.created_at)}
        </span>
      </div>
    </div>
  )
}

function QuestionCard({ item, onNavigate }: { item: any; onNavigate: (path: string) => void }) {
  return (
    <div
      className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => item.id && onNavigate(`/questions/${item.id}`)}
    >
      <div className="flex items-start gap-2 mb-1">
        <FileQuestion className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.content || item.title}</p>
      </div>
      {item.description && (
        <p className="text-xs text-gray-500 ml-6 line-clamp-2 mb-2">{item.description}</p>
      )}
      <div className="flex items-center gap-4 ml-6">
        <StatPill icon={<ThumbsUp className="w-3 h-3" />} count={item.upvotes ?? item.likes_count ?? item.likes} />
        <StatPill icon={<MessageSquare className="w-3 h-3" />} count={item.comments_count ?? item.comments} />
        <span className="ml-auto text-xs text-gray-400">{timeAgo(item.created_on ?? item.created_at)}</span>
      </div>
    </div>
  )
}

function StoryCard({ item, onNavigate }: { item: any; onNavigate: (path: string) => void }) {
  const storyPath = item.type?.toUpperCase() === 'BLOG' ? `/blogs/${item.id}` : `/stories/${item.id}`
  return (
    <div
      className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => item.id && onNavigate(storyPath)}
    >
      <div className="flex gap-3">
        {item.cover_image && (
          <img
            src={item.cover_image}
            alt=""
            className="w-16 h-16 rounded-lg object-cover shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-0.5">
            {item.title || 'Untitled'}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2">{item.content || item.excerpt}</p>
          <div className="flex items-center gap-3 mt-2">
            <StatPill icon={<ThumbsUp className="w-3 h-3" />} count={item.likes_count ?? item.likes} />
            <StatPill icon={<MessageSquare className="w-3 h-3" />} count={item.comments_count ?? item.comments} />
            <span className="ml-auto text-xs text-gray-400">{timeAgo(item.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentCard({ item, onNavigate }: { item: any; onNavigate: (path: string) => void }) {
  const handleClick = () => {
    // API returns item.post: { id, type, content }
    const postId = item.post?.id || item.post_id
    const postType = (item.post?.type || item.post_type || '').toUpperCase()
    if (postId) {
      onNavigate(postType === 'QUESTION' ? `/questions/${postId}` : `/posts/${postId}`)
      return
    }
    if (item.blog_id) {
      const t = (item.blog_type || '').toUpperCase()
      onNavigate(t === 'STORY' ? `/stories/${item.blog_id}` : `/blogs/${item.blog_id}`)
      return
    }
    const parentId = item.parent_id || item.content_id
    if (parentId) onNavigate(`/posts/${parentId}`)
  }
  // Show snippet of the parent post content as context
  const parentSnippet = item.post?.content || item.post_title || item.blog_title
  return (
    <div
      className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {parentSnippet ? (
            <p className="text-xs text-gray-400 mb-1 truncate">
              On: <span className="font-medium text-gray-600">{parentSnippet}</span>
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
  const router = useRouter()
  const navigate = (path: string) => router.push(path)
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
    posts: false, questions: false, stories: false, comments: false,
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
        data = data.filter((p: any) => p.type !== 'QUESTION')
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
            {activeTab === 'posts' && current.map((p, i) => <PostCard key={p.id ?? i} post={p} onNavigate={navigate} />)}
            {activeTab === 'questions' && current.map((p, i) => <QuestionCard key={p.id ?? i} item={p} onNavigate={navigate} />)}
            {activeTab === 'stories' && current.map((p, i) => <StoryCard key={p.id ?? i} item={p} onNavigate={navigate} />)}
            {activeTab === 'comments' && current.map((p, i) => <CommentCard key={p.id ?? i} item={p} onNavigate={navigate} />)}

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
