'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2, Send } from 'lucide-react'
import { profileHref } from '@/lib/profile-link'
import { useState, useEffect } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import apiClient from '@/lib/api-client'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import RichTextContent from '@/components/common/RichTextContent'

interface Author {
  name: string
  avatar: string
  title: string
}

interface Blog {
  id: string
  authorId: string
  title: string
  excerpt: string
  content: string
  author: Author
  image: string
  category: string
  readTime: string
  publishedAt: string
  views: number
  bookmarks: number
  likes: number
  comments: number
}

/* ================== 🆕 ADDED: Comment Type ================== */
interface Comment {
  id: string
  authorId: string
  content: string
  createdAt: string
  user: {
    name: string
    avatar: string
  }
  replies?: Comment[]
}

function normalizeComment(c: any): Comment {
  const u = c.user ?? c.author ?? {}
  return {
    id: String(c.id),
    authorId: String(u.id ?? u.user_id ?? ''),
    content: c.content ?? c.comment ?? '',
    createdAt: c.created_on ?? c.createdAt ?? '',
    user: {
      name: u.full_name ?? u.username ?? u.name ?? 'Unknown',
      avatar: u.profile_photo ?? u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name ?? u.username ?? u.name ?? 'Unknown')}&background=E8E8E8&color=212529&size=24`,
    },
    replies: (c.replies ?? []).map(normalizeComment),
  }
}

function BlogCommentItem({
  comment,
  blogId,
  currentUserId,
  onReplyAdded,
  onCommentDeleted,
}: {
  comment: Comment
  blogId: string
  currentUserId: string
  onReplyAdded: (parentId: string, reply: Comment) => void
  onCommentDeleted: (commentId: string) => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const data = await apiClient.addBlogComment(blogId, replyText.trim(), comment.id)
      onReplyAdded(comment.id, normalizeComment(data))
      setReplyText('')
      setShowReply(false)
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await apiClient.deleteBlogComment(comment.id)
      onCommentDeleted(comment.id)
    } catch { /* silent */ }
  }

  return (
    <div>
      <div className="flex gap-3">
        <img
          src={comment.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=E8E8E8&color=212529&size=40`}
          alt={comment.user.name}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
        <div className="flex-1">
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8' }}>
            <p className="text-sm font-semibold" style={{ color: '#212529' }}>{comment.user.name}</p>
            <p className="text-sm mt-0.5 leading-relaxed whitespace-pre-wrap break-words" style={{ color: '#3D3D3D' }}>{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-1 px-2">
            <button
              className="text-xs font-medium transition-colors"
              style={{ color: '#5F6368' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1976D2')}
              onMouseLeave={e => (e.currentTarget.style.color = '#5F6368')}
              onClick={() => setShowReply(v => !v)}
            >
              Reply
            </button>
            {currentUserId && currentUserId === comment.authorId && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                title="Delete comment"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
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
                {submitting ? '...' : 'Reply'}
              </button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 space-y-3" style={{ borderLeft: '2px solid #E8E8E8' }}>
              {comment.replies.map(reply => (
                <BlogCommentItem key={reply.id} comment={reply} blogId={blogId} currentUserId={currentUserId} onReplyAdded={onReplyAdded} onCommentDeleted={onCommentDeleted} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BlogDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  // const [isBookmarked, setIsBookmarked] = useState(false)
  // const [isLiked, setIsLiked] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [isDeleted, setIsDeleted] = useState(false)
  const requireAuth = useRequireAuth()

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      setCurrentUserId(String(u.id || ''))
    } catch {}
  }, [])

  useEffect(() => {
    if (!blogId) return

    const fetchBlog = async () => {
      try {
        const res = await apiClient.getBlogById(blogId)
        const b = res.data

        if (b.type === 'STORY') {
          router.replace(`/stories/${blogId}`)
          return
        }

        const formatted: Blog = {
          id: b.id,
          authorId: b.user?.id || '',
          title: b.title,
          excerpt: b.content?.slice(0, 150) || '',
          content: b.content,
          author: {
            name: b.user?.full_name || b.user?.username || 'Unknown',
            avatar: b.user?.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(b.user?.full_name || b.user?.username || 'Unknown')}`,
            title: b.user?.profession || 'User',
          },
          image:
            b.cover_image && b.cover_image.startsWith('http')
              ? b.cover_image
              : '/placeholder.jpg',
          category: (b.tags || []).map((t: any) => t.name).join(', '),
          readTime: '5 min read',
          publishedAt: b.created_on
            ? new Date(Number(b.created_on)).toDateString()
            : 'Recently',
          views: Number(b.views) || 0,
          bookmarks: 0,
          likes: Number(b.likes) || 0,
          comments: 0,
        }

        setBlog(formatted)
      } catch (err) {
        console.error('Blog fetch error', err)
      } finally {
        setLoading(false)
      }
    }

    /* ================== 🆕 ADDED: Fetch Comments ================== */
    const fetchComments = async () => {
      try {
        // getBlogComments returns res.data directly
        const data = await apiClient.getBlogComments(blogId)
        const items: any[] = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])
        setComments(items.map(normalizeComment))
      } catch (err) {
        console.error('Comments fetch error', err)
      }
    }

    fetchBlog()
    fetchComments()
  }, [blogId, router])

  /* ================== 🆕 ADDED: Like Logic ================== */
  // const handleLike = async () => {
  //   if (!blog) return

  //   try {
  //     setIsLiked(!isLiked)

  //     if (!isLiked) {
  //       await apiClient.likeBlog(blog.id)
  //       setBlog(prev => prev && { ...prev, likes: prev.likes + 1 })
  //     } else {

  //     }
  //   } catch (err) {
  //     console.error('Like error', err)
  //   }
  // }

  /* ================== 🆕 ADDED: Add Comment ================== */
  const handleAddComment = async () => {
    if (!requireAuth()) return
    if (!newComment.trim() || !blog) return

    try {
      // addBlogComment returns res.data directly
      const data = await apiClient.addBlogComment(blog.id, newComment)
      setComments(prev => [normalizeComment(data), ...prev])
      setNewComment('')
    } catch (err) {
      console.error('Add comment error', err)
    }
  }

  /* ================== 🆕 ADDED: Reply Logic ================== */
  const handleReplyAdded = (parentId: string, reply: Comment) => {
    if (!requireAuth()) return
    const addReply = (list: Comment[]): Comment[] =>
      list.map(c =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : { ...c, replies: c.replies ? addReply(c.replies) : [] }
      )
    setComments(prev => addReply(prev))
  }

  /* ================== 🆕 ADDED: Delete Blog ================== */
  const handleDeleteBlog = async () => {
    if (!blog || !window.confirm('Delete this blog? This cannot be undone.')) return
    try {
      await apiClient.deleteBlog(blog.id)
      setIsDeleted(true)
    } catch (err) {
      console.error('Failed to delete blog', err)
    }
  }

  /* ================== 🆕 ADDED: Delete Comment ================== */
  const handleCommentDeleted = (commentId: string) => {
    const remove = (list: Comment[]): Comment[] =>
      list
        .filter(c => c.id !== commentId)
        .map(c => ({ ...c, replies: c.replies ? remove(c.replies) : [] }))
    setComments(prev => remove(prev))
  }

  if (loading) return <div className="p-6">Loading blog...</div>
  if (!blog) return <div className="p-6">Blog not found</div>
  if (isDeleted) return <div className="p-6">Blog deleted.</div>

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* BACK */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex gap-2">
            <ArrowLeft /> Back to blogs
          </button>
          {currentUserId && currentUserId === String(blog.authorId) && (
            <button
              onClick={handleDeleteBlog}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-sm"
              title="Delete blog"
            >
              <Trash2 className="w-4 h-4" />
              Delete blog
            </button>
          )}
        </div>

        {/* IMAGE */}
        <img src={blog.image} alt={blog.title} className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl mb-6" />

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-4 whitespace-pre-wrap break-words">{blog.title}</h1>

        {/* AUTHOR */}
        <div
          className="flex items-center gap-3 mb-8 cursor-pointer"
          onClick={() => blog.authorId && router.push(profileHref(blog.authorId, blog.author?.name))}
        >
          <img
            src={blog.author.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(blog.author.name)}`}
            alt={blog.author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold hover:underline" style={{ color: '#212529' }}>{blog.author.name}</p>
            <p className="text-sm" style={{ color: '#5F6368' }}>{blog.author.title} · {blog.publishedAt}</p>
          </div>
          <div className="align-self-end contents">
            {/* ================== SHARE BUTTON ================== */}
            <button
              onClick={() => setShowShareModal(true)}
              className="ml-auto"
            >
              <Send />
            </button>
          </div>
        </div>
        <RichTextContent className="mb-8 whitespace-pre-wrap break-words" html={blog.content} />

        {/* ================== 🆕 COMMENTS LIST ================== */}
        {comments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6 mb-6">
            {comments.map(comment => (
              <BlogCommentItem
                key={comment.id}
                comment={comment}
                blogId={blogId}
                currentUserId={currentUserId}
                onReplyAdded={handleReplyAdded}
                onCommentDeleted={handleCommentDeleted}
              />
            ))}
          </div>
        )}

        {/* ================== 🆕 COMMENT INPUT ================== */}
        <div className="bg-white p-6 rounded-xl mb-6">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />
          <button onClick={handleAddComment} className="bg-black text-white px-4 py-2 rounded">
            Post Comment
          </button>
        </div>

        {/* ================== UPDATED LIKE BUTTON ================== */}
        {/* <button onClick={handleLike} className="mt-6 flex gap-2">
          <ThumbsUp /> {blog.likes}
        </button> */}

        {/* ================== SHARE BUTTON ================== */}
        <button
          onClick={() => setShowShareModal(true)}
          className="ml-auto"
        >
          <Send />
        </button>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={blog.excerpt}
        title={blog.title}
        contentType="blogs"
        contentId={blog.id}
      />
    </div>
  )
}