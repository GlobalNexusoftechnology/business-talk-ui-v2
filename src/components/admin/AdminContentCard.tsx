'use client'

import { useState } from 'react'
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  // Play,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Ban,
  Trash2,
  Tag,
  Pencil,
} from 'lucide-react'
import ExpandableText from '@/components/common/ExpandableText'
import apiClient from '@/lib/api-client'
import { MediaGrid, MediaItem } from '@/components/shared/MediaGrid'

export interface AdminContentCardProps {
  id: string
  type: 'post' | 'blog' | 'question' | 'story'
  author: { id: string; name: string; avatar?: string; title?: string }
  title?: string
  content?: string
  coverImage?: string
  media?: Array<{ url: string; type?: string }>
  tags?: string[]
  likes: number
  commentsCount: number
  views?: number
  createdOn: string | number
  onWarn?: (userId: string) => void
  onBan?: (userId: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  post: 'bg-blue-100 text-blue-700',
  blog: 'bg-purple-100 text-purple-700',
  question: 'bg-yellow-100 text-yellow-700',
  story: 'bg-pink-100 text-pink-700',
}

function formatTime(ts: string | number) {
  if (!ts) return ''
  const ms = isNaN(Number(ts)) ? Date.parse(String(ts)) : Number(ts)
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CommentRow({ comment, depth = 0 }: { comment: any; depth?: number }) {
  const name =
    comment.user?.full_name ||
    comment.user?.username ||
    comment.author?.name ||
    'User'
  const avatar = comment.user?.profile_photo || comment.author?.avatar
  const text = comment.comment || comment.content || ''
  const replies: any[] = comment.replies || []

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex gap-2 mb-2">
        <img
          src={
            avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=28&background=E8E8E8&color=212529`
          }
          alt={name}
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
        <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-xs font-semibold">{name}</p>
            {comment.created_on && (
              <span className="text-xs text-gray-400">
                {formatTime(comment.created_on)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">{text}</p>
          {(comment.likes > 0 || comment.upvotes > 0) && (
            <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <ThumbsUp className="w-3 h-3" />
              {comment.likes || comment.upvotes}
            </span>
          )}
        </div>
      </div>
      {replies.map((r: any) => (
        <CommentRow key={r.id} comment={r} depth={depth + 1} />
      ))}
    </div>
  )
}

export function AdminContentCard({
  id,
  type,
  author,
  title,
  content,
  coverImage,
  media = [],
  tags = [],
  likes,
  commentsCount,
  views,
  createdOn,
  onWarn,
  onBan,
  onDelete,
  onEdit,
}: AdminContentCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false)
      return
    }
    setShowComments(true)
    if (comments.length > 0) return
    setLoadingComments(true)
    try {
      if (type === 'post' || type === 'question') {
        const data = await apiClient.getPostComments(id)
        setComments(Array.isArray(data) ? data : [])
      } else {
        const data = await apiClient.getBlogComments(id)
        setComments(Array.isArray(data) ? data : [])
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingComments(false)
    }
  }

  return (
    <div
      className="bg-white rounded-xl p-5 mb-4"
      style={{ border: '1px solid #E8E8E8' }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* ── Left: content ── */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                author.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=40&background=E8E8E8&color=212529`
              }
              alt={author.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" style={{ color: '#212529' }}>
                  {author.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[type]}`}
                >
                  {type}
                </span>
              </div>
              {author.title && (
                <p className="text-xs" style={{ color: '#5F6368' }}>
                  {author.title}
                </p>
              )}
              <p className="text-xs text-gray-400">{formatTime(createdOn)}</p>
            </div>
          </div>

          {/* Title (blogs / questions) */}
          {title && (
            <h3 className="font-semibold text-base mb-2" style={{ color: '#212529' }}>
              {title}
            </h3>
          )}

          {/* Content text */}
          {content && (
            <ExpandableText className="text-sm mb-3 whitespace-pre-wrap break-words" lines={4}>{content}</ExpandableText>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((t: any, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {typeof t === 'string' ? t : t?.name || ''}
                </span>
              ))}
            </div>
          )}

          {/* Media Grid */}
          {(() => {
            const mediaItems: MediaItem[] = [
              ...(coverImage ? [{ url: coverImage, type: 'image' as const }] : []),
              ...media.map((m) => ({ url: m.url, type: (m.type === 'video' ? 'video' : 'image') as 'image' | 'video' })),
            ].filter((m) => m.url)
            return mediaItems.length > 0 ? <MediaGrid media={mediaItems} /> : null
          })()}

          {/* Stats bar */}
          <div
            className="flex items-center gap-5 text-xs pt-3 mt-1"
            style={{ borderTop: '1px solid #F0F0F0', color: '#5F6368' }}
          >
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" /> {likes}
            </span>
            <button
              onClick={loadComments}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {commentsCount}
              {showComments ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> {views}
              </span>
            )}
          </div>

          {/* Comments section */}
          {showComments && (
            <div
              className="mt-3 pt-3 space-y-1"
              style={{ borderTop: '1px solid #F0F0F0' }}
            >
              {loadingComments ? (
                <p className="text-xs text-gray-400">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-gray-400">No comments yet.</p>
              ) : (
                comments.map((c: any) => <CommentRow key={c.id} comment={c} />)
              )}
            </div>
          )}
        </div>

        {/* ── Right: admin action buttons ── */}
        <div className="flex sm:flex-col gap-2 shrink-0 pt-1">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                backgroundColor: '#EFF6FF',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#DBEAFE')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#EFF6FF')
              }
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {onWarn && (
            <button
              onClick={() => author.id && onWarn(author.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{
                border: '1px solid #FCD34D',
                color: '#92400E',
                backgroundColor: '#FFFBEB',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#FEF3C7')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#FFFBEB')
              }
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Warn
            </button>
          )}
          {onBan && (
            <button
              onClick={() => author.id && onBan(author.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
              style={{
                border: '1px solid #FDBA74',
                color: '#9A3412',
                backgroundColor: '#FFF7ED',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#FFEDD5')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#FFF7ED')
              }
            >
              <Ban className="w-3.5 h-3.5" /> Ban
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              backgroundColor: '#FEF2F2',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#FEE2E2')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#FEF2F2')
            }
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
