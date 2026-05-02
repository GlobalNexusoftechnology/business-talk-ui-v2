'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import {
  FileText,
  BookOpen,
  HelpCircle,
  BookMarked,
  Trash2,
  Send,
  Clock,
  RefreshCw,
} from 'lucide-react'

type DraftType = 'post' | 'blog' | 'question' | 'story'

interface Draft {
  id: string
  type: DraftType
  autoSaved: boolean
  content: {
    title?: string
    content?: string
    type?: string
    cover_image?: string
    tags?: string[]
  }
  created_on: string
  modifiedOn: string
}

const TYPE_META: Record<DraftType, { label: string; icon: React.ReactNode; badge: string }> = {
  post: {
    label: 'Post',
    icon: <FileText className="w-4 h-4 text-blue-500" />,
    badge: 'bg-blue-100 text-blue-700',
  },
  blog: {
    label: 'Blog',
    icon: <BookOpen className="w-4 h-4 text-purple-500" />,
    badge: 'bg-purple-100 text-purple-700',
  },
  question: {
    label: 'Question',
    icon: <HelpCircle className="w-4 h-4 text-yellow-500" />,
    badge: 'bg-yellow-100 text-yellow-700',
  },
  story: {
    label: 'Story',
    icon: <BookMarked className="w-4 h-4 text-pink-500" />,
    badge: 'bg-pink-100 text-pink-700',
  },
}

function formatDate(value: string | number) {
  if (!value) return ''
  const ms = isNaN(Number(value)) ? Date.parse(String(value)) : Number(value)
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<'all' | DraftType>('all')
  const [publishing, setPublishing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchDrafts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.getDrafts()
      const data: Draft[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
      // newest first
      data.sort((a, b) => Number(b.modifiedOn || b.created_on) - Number(a.modifiedOn || a.created_on))
      setDrafts(data)
    } catch (err) {
      console.error('Failed to load drafts', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  const handlePublish = async (draft: Draft) => {
    setPublishing(draft.id)
    try {
      await apiClient.publishDraft(draft.id)
      setDrafts(prev => prev.filter(d => d.id !== draft.id))
      showToast(`${TYPE_META[draft.type]?.label ?? 'Draft'} published successfully!`)
    } catch (err) {
      console.error('Publish failed', err)
      showToast('Failed to publish. Check content requirements.')
    } finally {
      setPublishing(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft? This cannot be undone.')) return
    setDeleting(id)
    try {
      await apiClient.deleteDraft(id)
      setDrafts(prev => prev.filter(d => d.id !== id))
      showToast('Draft deleted.')
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = activeType === 'all' ? drafts : drafts.filter(d => d.type === activeType)
  const counts = drafts.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1
    return acc
  }, {})

  const tabs: { value: 'all' | DraftType; label: string }[] = [
    { value: 'all', label: `All (${drafts.length})` },
    { value: 'post', label: `Posts (${counts.post ?? 0})` },
    { value: 'blog', label: `Blogs (${counts.blog ?? 0})` },
    { value: 'question', label: `Questions (${counts.question ?? 0})` },
    { value: 'story', label: `Stories (${counts.story ?? 0})` },
  ]

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>My Drafts</h1>
            <p className="text-sm mt-1" style={{ color: '#5F6368' }}>
              {drafts.length} saved draft{drafts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={fetchDrafts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ border: '1px solid #E8E8E8', backgroundColor: '#fff', color: '#5F6368' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeType === tab.value ? '#212529' : '#fff',
                color: activeType === tab.value ? '#fff' : '#5F6368',
                border: '1px solid #E8E8E8',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ color: '#5F6368' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading drafts...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-2xl gap-3"
            style={{ backgroundColor: '#fff', border: '1px solid #E8E8E8' }}
          >
            <FileText className="w-10 h-10" style={{ color: '#BDBDBD' }} />
            <p className="font-medium" style={{ color: '#212529' }}>No drafts here</p>
            <p className="text-sm" style={{ color: '#5F6368' }}>
              {activeType === 'all'
                ? 'Start writing and save your drafts to see them here.'
                : `No ${activeType} drafts saved yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(draft => {
              const meta = TYPE_META[draft.type] ?? TYPE_META.post
              const title =
                draft.content?.title ||
                draft.content?.content?.slice(0, 80) ||
                'Untitled draft'
              const preview =
                draft.content?.title && draft.content?.content
                  ? draft.content.content.slice(0, 120)
                  : null
              const tags: string[] = draft.content?.tags ?? []

              return (
                <div
                  key={draft.id}
                  className="bg-white rounded-2xl p-5"
                  style={{ border: '1px solid #E8E8E8' }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {meta.icon}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${meta.badge}`}>
                        {meta.label}
                      </span>
                      {draft.autoSaved && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                          Auto-saved
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs shrink-0" style={{ color: '#5F6368' }}>
                      <Clock className="w-3 h-3" />
                      {formatDate(draft.modifiedOn || draft.created_on)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold mb-1 line-clamp-1" style={{ color: '#212529' }}>
                    {title}
                  </h3>

                  {/* Preview */}
                  {preview && (
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: '#5F6368' }}>
                      {preview}
                    </p>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: '#F8F9FA', color: '#5F6368', border: '1px solid #E8E8E8' }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    className="flex items-center gap-3 pt-3"
                    style={{ borderTop: '1px solid #F0F0F0' }}
                  >
                    <button
                      onClick={() => handlePublish(draft)}
                      disabled={publishing === draft.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: '#212529' }}
                    >
                      <Send className="w-4 h-4" />
                      {publishing === draft.id ? 'Publishing...' : 'Publish'}
                    </button>

                    <button
                      onClick={() => handleDelete(draft.id)}
                      disabled={deleting === draft.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      style={{
                        border: '1px solid #E8E8E8',
                        color: '#DC2626',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting === draft.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
