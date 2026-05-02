'use client'

import { useEffect, useState } from 'react'
import adminApi from '@/lib/admin-api'
import {
  Flag,
  User,
  Clock,
  ThumbsUp,
  MessageCircle,
  Eye,
  Play,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'

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

function ReportedContentPreview({ report }: { report: any }) {
  const c = report.reported_content || report.content || {}
  const type: string = (report.content_type || '').toLowerCase()
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const authorName =
    c.user?.full_name || c.user?.username ||
    c.author?.name || c.author?.full_name ||
    report.reported_user?.full_name || report.reported_user?.username || 'Unknown'

  const authorAvatar =
    c.user?.profile_photo || c.author?.avatar || report.reported_user?.profile_photo

  const title = c.title || (type === 'question' ? c.content : undefined)
  const content = c.description || (type === 'question' ? c.description : c.content)
  const coverImage = c.cover_image
  const media: Array<{ url: string; type?: string }> = c.media || []
  const tags: string[] = c.tags || []
  const likes = c.upvotes ?? c.likes ?? 0
  const commentsCount = c.comments_count ?? 0
  const views = c.views
  const createdOn = c.created_on

  const images = media.filter((m) => m.type !== 'video' && m.url)
  const videos = media.filter((m) => m.type === 'video' && m.url)
  const allImages = coverImage ? [{ url: coverImage }, ...images] : images

  if (!c.id && !c.content && !c.title) {
    return (
      <p className="text-xs italic" style={{ color: '#9CA3AF' }}>
        Content details not available
      </p>
    )
  }

  return (
    <div
      className="rounded-xl p-4 mt-3"
      style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8' }}
    >
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={
            authorAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&size=36&background=E8E8E8&color=212529`
          }
          alt={authorName}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#212529' }}>
            {authorName}
          </p>
          {createdOn && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTime(createdOn)}
            </p>
          )}
        </div>
      </div>

      {/* Title */}
      {title && (
        <h4 className="font-semibold text-sm mb-1" style={{ color: '#212529' }}>
          {title}
        </h4>
      )}

      {/* Content text */}
      {content && (
        <p className="text-sm mb-3 whitespace-pre-line" style={{ color: '#374151' }}>
          {content}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((t, i) => (
            <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {allImages.length > 0 && (
        <div
          className={`grid gap-2 mb-3 ${
            allImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {allImages.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className="relative rounded-lg overflow-hidden bg-gray-200"
              style={{ aspectRatio: '16/9' }}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {i === 3 && allImages.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-xl">
                  +{allImages.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.map((v, i) => (
        <div key={i} className="rounded-lg overflow-hidden bg-black mb-3">
          {playingVideo === v.url ? (
            <video src={v.url} controls autoPlay className="w-full max-h-60" />
          ) : (
            <div
              className="relative flex items-center justify-center bg-gray-900 cursor-pointer"
              style={{ aspectRatio: '16/9' }}
              onClick={() => setPlayingVideo(v.url)}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs" style={{ color: '#5F6368' }}>
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-3.5 h-3.5" /> {likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> {commentsCount}
        </span>
        {views !== undefined && (
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {views}
          </span>
        )}
      </div>
    </div>
  )
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')

  useEffect(() => {
    adminApi.getReports().then((res) => {
      const data = res.data?.data ?? res.data ?? []
      setReports(Array.isArray(data) ? data : [])
    }).finally(() => setLoading(false))
  }, [])

  const resolve = (id: string, action: string) => {
    adminApi.resolveReport(id, action).then(() => {
      setReports((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'resolved', _action: action } : r)
      )
    })
  }

  const visible = reports.filter((r) =>
    activeTab === 'pending'
      ? r.status !== 'resolved'
      : r.status === 'resolved'
  )

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>Reports</h1>
            <p className="text-sm mt-1" style={{ color: '#5F6368' }}>
              {reports.filter(r => r.status !== 'resolved').length} pending ·{' '}
              {reports.filter(r => r.status === 'resolved').length} resolved
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true)
              adminApi.getReports().then((res) => {
                const data = res.data?.data ?? res.data ?? []
                setReports(Array.isArray(data) ? data : [])
              }).finally(() => setLoading(false))
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ border: '1px solid #E8E8E8', backgroundColor: '#fff', color: '#5F6368' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
              style={{
                backgroundColor: activeTab === tab ? '#212529' : '#fff',
                color: activeTab === tab ? '#fff' : '#5F6368',
                border: '1px solid #E8E8E8',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading...</div>
        ) : visible.length === 0 ? (
          <div
            className="flex flex-col items-center py-16 gap-3 rounded-2xl"
            style={{ backgroundColor: '#fff', border: '1px solid #E8E8E8' }}
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
            <p className="font-medium" style={{ color: '#212529' }}>
              {activeTab === 'pending' ? 'No pending reports' : 'No resolved reports yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((r) => {
              const type: string = (r.content_type || '').toLowerCase()
              const reporter =
                r.reporter || r.reported_by || r.user || {}
              const reporterName =
                reporter.full_name || reporter.username || 'Anonymous'
              const reporterAvatar = reporter.profile_photo

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-5"
                  style={{ border: '1px solid #E8E8E8' }}
                >
                  {/* Report meta row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#FEF2F2' }}
                      >
                        <Flag className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {type && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {type}
                            </span>
                          )}
                          {r.status === 'resolved' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                              Resolved
                            </span>
                          )}
                        </div>

                        {/* Reason */}
                        <p className="text-sm font-medium" style={{ color: '#212529' }}>
                          &ldquo;{r.reason}&rdquo;
                        </p>

                        {/* Reporter */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <img
                            src={
                              reporterAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(reporterName)}&size=20&background=E8E8E8&color=212529`
                            }
                            alt={reporterName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs" style={{ color: '#5F6368' }}>
                            <User className="inline w-3 h-3 mr-0.5" />
                            Reported by <b>{reporterName}</b>
                          </span>
                        </div>

                        {/* Timestamp */}
                        {(r.created_on || r.createdAt) && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(r.created_on || r.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {r.status !== 'resolved' && (
                      <div className="flex gap-2 flex-wrap shrink-0">
                        <button
                          onClick={() => resolve(r.id, 'REMOVE_POST')}
                          className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                          style={{
                            border: '1px solid #FCA5A5',
                            color: '#991B1B',
                            backgroundColor: '#FEF2F2',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                        >
                          Remove Content
                        </button>
                        <button
                          onClick={() => resolve(r.id, 'WARN_USER')}
                          className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                          style={{
                            border: '1px solid #FCD34D',
                            color: '#92400E',
                            backgroundColor: '#FFFBEB',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3C7')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFBEB')}
                        >
                          Warn User
                        </button>
                        <button
                          onClick={() => resolve(r.id, 'BAN_USER')}
                          className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                          style={{
                            border: '1px solid #FDBA74',
                            color: '#9A3412',
                            backgroundColor: '#FFF7ED',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFEDD5')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFF7ED')}
                        >
                          Ban User
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reported content preview */}
                  <ReportedContentPreview report={r} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}