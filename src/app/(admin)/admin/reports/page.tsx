'use client'

import { useCallback, useEffect, useState } from 'react'
import adminApi from '@/lib/admin-api'
import apiClient from '@/lib/api-client'
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

const POST_LIKE_TYPES = new Set(['post', 'question'])
const BLOG_LIKE_TYPES = new Set(['blog', 'story'])

function isNotFoundError(error: any) {
  return Number(error?.response?.status) === 404
}

function asText(value: any, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    const joined = value
      .map((item) => asText(item, ''))
      .filter(Boolean)
      .join(', ')
    return joined || fallback
  }
  if (typeof value === 'object') {
    const named = value.name || value.title || value.reason || value.label || value.value
    if (named !== undefined && named !== null) return asText(named, fallback)
    try {
      return JSON.stringify(value)
    } catch {
      return fallback
    }
  }
  return fallback
}

function getReportType(report: any) {
  return String(report?.content_type || report?.type || '').toLowerCase()
}

function getReportContentId(report: any) {
  return String(
    report?.content_id ||
      report?.reported_content_id ||
      report?.post_id ||
      report?.blog_id ||
      report?.reported_content?.id ||
      report?.content?.id ||
      ''
  )
}

function getReportedUserId(report: any) {
  const value =
    report?.reported_user_id ||
    report?.reported_user?.id ||
    report?.reported_user ||
    report?.user_id ||
    report?.content_owner_id ||
    report?.reported_content?.user_id ||
    report?.content?.user_id ||
    report?.reported_content?.user?.id ||
    report?.content?.user?.id

  return typeof value === 'string' ? value : ''
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
  const type: string = getReportType(report)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const authorName =
    c.user?.full_name ||
    c.user?.username ||
    c.author?.name ||
    c.author?.full_name ||
    report.reported_user?.full_name ||
    report.reported_user?.username ||
    'Unknown'

  const authorAvatar =
    c.user?.profile_photo || c.author?.avatar || report.reported_user?.profile_photo

  const title = asText(c.title || (type === 'question' ? c.content : undefined), '')
  const content = asText(c.description || (type === 'question' ? c.description : c.content), '')
  const coverImage = c.cover_image
  const media: Array<{ url: string; type?: string }> = c.media || []
  const tags: string[] = Array.isArray(c.tags)
    ? c.tags.map((t: any) => asText(t, '')).filter(Boolean)
    : []
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
      className="rounded-xl p-3 sm:p-4 mt-3"
      style={{ backgroundColor: '#F8F9FA', border: '1px solid #E8E8E8' }}
    >
      <div className="flex items-start sm:items-center gap-2 mb-3">
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

      {title && (
        <h4 className="font-semibold text-sm mb-1" style={{ color: '#212529' }}>
          {title}
        </h4>
      )}

      {content && (
        <p className="text-sm mb-3 whitespace-pre-line" style={{ color: '#374151' }}>
          {content}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((t, i) => (
            <span
              key={i}
              className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

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

      <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: '#5F6368' }}>
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
  const [processingReportId, setProcessingReportId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')

  const hydrateReportsContent = useCallback(async (list: any[]) => {
    return Promise.all(
      list.map(async (report) => {
        const type = getReportType(report)
        const contentId = getReportContentId(report)

        if (!contentId) return report

        try {
          if (POST_LIKE_TYPES.has(type)) {
            const res = await apiClient.getPostById(contentId)
            const content = res.data?.data ?? res.data
            return content ? { ...report, reported_content: content } : report
          }

          if (BLOG_LIKE_TYPES.has(type)) {
            const res = await apiClient.getBlogById(contentId)
            const content = res.data?.data ?? res.data
            return content ? { ...report, reported_content: content } : report
          }

          return report
        } catch (error) {
          // Missing/deleted content can legitimately return 404 for old reports.
          if (!isNotFoundError(error)) {
            console.error('Failed to hydrate report content:', report?.id, error)
          }
          return report
        }
      })
    )
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await adminApi.getReports()
      const data = res.data?.data ?? res.data ?? []
      const baseReports = Array.isArray(data) ? data : []
      const hydratedReports = await hydrateReportsContent(baseReports)
      setReports(hydratedReports)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setErrorMessage('Unable to load reports right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [hydrateReportsContent])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const resolve = async (id: string, action: string) => {
    const response = await adminApi.resolveReport(id, action)
    const updated = response?.data?.data ?? response?.data ?? null

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r

        return {
          ...r,
          ...(updated && typeof updated === 'object' ? updated : {}),
          status: 'resolved',
          resolution_action:
            updated?.resolution_action ??
            updated?.resolved_action ??
            updated?.action_taken ??
            updated?.action ??
            action,
        }
      })
    )
  }

  const handleRemoveContent = async (report: any) => {
    const reportId = String(report?.id || '')
    const type = getReportType(report)
    const contentId = getReportContentId(report)

    if (!reportId || !contentId) {
      setErrorMessage('Missing report/content id. Cannot remove content.')
      return
    }

    setProcessingReportId(reportId)
    setErrorMessage(null)

    try {
      if (POST_LIKE_TYPES.has(type)) {
        await adminApi.deletePost(contentId)
      } else if (BLOG_LIKE_TYPES.has(type)) {
        await adminApi.deleteBlog(contentId)
      } else {
        throw new Error(`Unsupported content type: ${type || 'unknown'}`)
      }

      await resolve(reportId, 'REMOVE_POST')
    } catch (error) {
      console.error('Failed to remove reported content:', error)
      setErrorMessage('Unable to remove content. Please try again.')
    } finally {
      setProcessingReportId(null)
    }
  }

  const handleWarnUser = async (report: any) => {
    const reportId = String(report?.id || '')
    const userId = getReportedUserId(report)

    if (!reportId || !userId) {
      setErrorMessage('Missing reported user id. Cannot warn this user.')
      return
    }

    setProcessingReportId(reportId)
    setErrorMessage(null)

    try {
      await adminApi.warnUser(userId)
      await resolve(reportId, 'WARN_USER')
    } catch (error) {
      console.error('Failed to warn reported user:', error)
      setErrorMessage('Unable to warn user. Please try again.')
    } finally {
      setProcessingReportId(null)
    }
  }

  const handleBanUser = async (report: any) => {
    const reportId = String(report?.id || '')
    const userId = getReportedUserId(report)

    if (!reportId || !userId) {
      setErrorMessage('Missing reported user id. Cannot ban this user.')
      return
    }

    setProcessingReportId(reportId)
    setErrorMessage(null)

    try {
      await adminApi.banUser(userId)
      await resolve(reportId, 'BAN_USER')
    } catch (error) {
      console.error('Failed to ban reported user:', error)
      setErrorMessage('Unable to ban user. Please try again.')
    } finally {
      setProcessingReportId(null)
    }
  }

  const visible = reports.filter((r) =>
    activeTab === 'pending' ? r.status !== 'resolved' : r.status === 'resolved'
  )

  return (
    <div className="p-3 sm:p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>
              Reports
            </h1>
            <p className="text-sm mt-1" style={{ color: '#5F6368' }}>
              {reports.filter((r) => r.status !== 'resolved').length} pending |{' '}
              {reports.filter((r) => r.status === 'resolved').length} resolved
            </p>
            {errorMessage && (
              <p className="text-xs mt-2" style={{ color: '#B91C1C' }}>
                {errorMessage}
              </p>
            )}
          </div>
          <button
            onClick={fetchReports}
            className="w-full sm:w-auto justify-center sm:justify-start flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ border: '1px solid #E8E8E8', backgroundColor: '#fff', color: '#5F6368' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 sm:flex">
          {(['pending', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
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
              const type: string = getReportType(r)
              const reporter = r.reporter || r.reported_by || r.user || {}
              const reporterName = reporter.full_name || reporter.username || 'Anonymous'
              const reporterAvatar = reporter.profile_photo
              const isProcessing = processingReportId === r.id
              const reasonText = asText(r.reason, 'No reason provided')

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-4 sm:p-5"
                  style={{ border: '1px solid #E8E8E8' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
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

                        <p className="text-sm font-medium break-words" style={{ color: '#212529' }}>
                          &ldquo;{reasonText}&rdquo;
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <img
                            src={
                              reporterAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                reporterName
                              )}&size=20&background=E8E8E8&color=212529`
                            }
                            alt={reporterName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs" style={{ color: '#5F6368' }}>
                            <User className="inline w-3 h-3 mr-0.5" />
                            Reported by <b>{reporterName}</b>
                          </span>
                        </div>

                        {(r.created_on || r.createdAt) && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(r.created_on || r.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {r.status !== 'resolved' && (
                      <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => handleRemoveContent(r)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-60"
                          style={{
                            border: '1px solid #FCA5A5',
                            color: '#991B1B',
                            backgroundColor: '#FEF2F2',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                        >
                          {isProcessing ? 'Processing...' : 'Remove Content'}
                        </button>
                        <button
                          onClick={() => handleWarnUser(r)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-60"
                          style={{
                            border: '1px solid #FCD34D',
                            color: '#92400E',
                            backgroundColor: '#FFFBEB',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3C7')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFBEB')}
                        >
                          {isProcessing ? 'Processing...' : 'Warn User'}
                        </button>
                        <button
                          onClick={() => handleBanUser(r)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-60"
                          style={{
                            border: '1px solid #FDBA74',
                            color: '#9A3412',
                            backgroundColor: '#FFF7ED',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFEDD5')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFF7ED')}
                        >
                          {isProcessing ? 'Processing...' : 'Ban User'}
                        </button>
                      </div>
                    )}
                  </div>

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
