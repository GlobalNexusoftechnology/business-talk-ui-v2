'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import apiClient from '@/lib/api-client'

interface Author {
  name: string
  avatar: string
  title: string
}

interface Blog {
  id: string
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
  content: string
  createdAt: string
  user: {
    name: string
    avatar: string
  }
  replies?: Comment[]
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

  /* ================== 🆕 ADDED: Comment States ================== */
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [showReplyBox, setShowReplyBox] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!blogId) return

    const fetchBlog = async () => {
      try {
        const res = await apiClient.getBlogById(blogId)
        const b = res.data

        const formatted: Blog = {
          id: b.id,
          title: b.title,
          excerpt: b.content?.slice(0, 150) || '',
          content: b.content,
          author: {
            name: b.user?.username || 'Unknown',
            avatar: b.user?.profile_photo || '/avatar.png',
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
        const res = await apiClient.getBlogComments(blogId)
        setComments(res.data || [])
      } catch (err) {
        console.error('Comments fetch error', err)
      }
    }

    fetchBlog()
    fetchComments()
  }, [blogId])

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
    if (!newComment.trim() || !blog) return

    try {
      const res = await apiClient.addBlogComment(blog.id, newComment)
      setComments(prev => [res.data, ...prev])
      setNewComment('')
    } catch (err) {
      console.error('Add comment error', err)
    }
  }

  /* ================== 🆕 ADDED: Reply Logic ================== */
  const handleReply = async (commentId: string) => {
    const text = replyText[commentId]
    if (!text || !blog) return

    try {
      const res = await apiClient.addBlogComment(blog.id, text, commentId)

      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        )
      )

      setReplyText(prev => ({ ...prev, [commentId]: '' }))
      setShowReplyBox(prev => ({ ...prev, [commentId]: false }))
    } catch (err) {
      console.error('Reply error', err)
    }
  }

  if (loading) return <div className="p-6">Loading blog...</div>
  if (!blog) return <div className="p-6">Blog not found</div>

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* BACK */}
        <button onClick={() => router.back()} className="mb-6 flex gap-2">
          <ArrowLeft /> Back to blogs
        </button>

        {/* IMAGE */}
        <img src={blog.image} alt={blog.title} className="w-full h-80 object-cover rounded-xl mb-6" />

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

        {/* CONTENT */}
        <p className="mb-8">{blog.content}</p>

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

        {/* ================== 🆕 COMMENTS LIST ================== */}
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white p-4 rounded-xl">

              {/* COMMENT */}
              <div className="flex gap-3">
                <img src={comment.user.avatar || '/avatar.png'} alt={comment.user.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium">{comment.user.name}</p>
                  <p className="text-sm text-gray-600">{comment.content}</p>

                  <button
                    className="text-blue-600 text-sm mt-2"
                    onClick={() =>
                      setShowReplyBox(prev => ({
                        ...prev,
                        [comment.id]: !prev[comment.id],
                      }))
                    }
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* REPLY BOX */}
              {showReplyBox[comment.id] && (
                <div className="ml-12 mt-3">
                  <input
                    value={replyText[comment.id] || ''}
                    onChange={(e) =>
                      setReplyText(prev => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* REPLIES */}
              <div className="ml-12 mt-3 space-y-2">
                {comment.replies?.map(reply => (
                  <div key={reply.id} className="flex gap-2">
                    <img src={reply.user.avatar || '/avatar.png'} alt={reply.user.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{reply.user.name}</p>
                      <p className="text-sm text-gray-600">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ================== UPDATED LIKE BUTTON ================== */}
        {/* <button onClick={handleLike} className="mt-6 flex gap-2">
          <ThumbsUp /> {blog.likes}
        </button> */}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={blog.excerpt}
        title={blog.title}
        contentType="blog"
        contentId={blog.id}
      />
    </div>
  )
}