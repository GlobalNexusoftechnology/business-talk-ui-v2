'use client'

import { useEffect, useState } from 'react'
import adminApi from '@/lib/admin-api'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { CheckCircle, MessageSquare, Lightbulb, Bug } from 'lucide-react'

type FeedbackType = 'all' | 'issue' | 'suggestion' | 'bug'

interface FeedbackItem {
  id: string
  type: 'issue' | 'suggestion' | 'bug'
  message: string
  status: 'pending' | 'resolved'
  user?: { username?: string; email?: string }
  created_at?: string
  created_on?: string
}

const TYPE_TABS: { label: string; value: FeedbackType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Issues', value: 'issue' },
  { label: 'Suggestions', value: 'suggestion' },
  { label: 'Bugs', value: 'bug' },
]

const TYPE_ICON: Record<string, React.ReactNode> = {
  issue: <MessageSquare className="w-4 h-4 text-blue-500" />,
  suggestion: <Lightbulb className="w-4 h-4 text-yellow-500" />,
  bug: <Bug className="w-4 h-4 text-red-500" />,
}

const TYPE_BADGE: Record<string, string> = {
  issue: 'bg-blue-100 text-blue-700',
  suggestion: 'bg-yellow-100 text-yellow-700',
  bug: 'bg-red-100 text-red-700',
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FeedbackType>('all')
  const [resolving, setResolving] = useState<string | null>(null)

  const fetchFeedback = async (type: FeedbackType) => {
    setLoading(true)
    try {
      const res = await adminApi.getFeedback(type === 'all' ? undefined : type)
      const data = res.data
      const list: FeedbackItem[] = Array.isArray(data)
        ? data
        : (data?.items ?? data?.data ?? [])
      setItems(list)
      setTotal(data?.total ?? list.length)
    } catch (err) {
      console.error('Failed to fetch feedback', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback(activeTab)
  }, [activeTab])

  const handleResolve = async (id: string) => {
    setResolving(id)
    try {
      await adminApi.resolveFeedback(id)
      setItems(prev =>
        prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f)
      )
    } catch (err) {
      console.error('Resolve failed', err)
    } finally {
      setResolving(null)
    }
  }

  const pending = items.filter(f => f.status !== 'resolved')
  const resolved = items.filter(f => f.status === 'resolved')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Support</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total submissions</p>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          Loading feedback...
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <MessageSquare className="w-10 h-10" />
            <p className="text-sm">No feedback found for this filter.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Pending ({pending.length})
              </h2>
              <Card>
                <div className="divide-y">
                  {pending.map(f => (
                    <FeedbackRow
                      key={f.id}
                      item={f}
                      resolving={resolving}
                      onResolve={handleResolve}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Resolved ({resolved.length})
              </h2>
              <Card>
                <div className="divide-y opacity-60">
                  {resolved.map(f => (
                    <FeedbackRow
                      key={f.id}
                      item={f}
                      resolving={resolving}
                      onResolve={handleResolve}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FeedbackRow({
  item,
  resolving,
  onResolve,
}: {
  item: FeedbackItem
  resolving: string | null
  onResolve: (id: string) => void
}) {
  const dateStr = item.created_at || item.created_on
  const date = dateStr
    ? new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr)).toLocaleDateString()
    : null

  return (
    <div className="flex items-start justify-between gap-4 py-4 px-2">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5">{TYPE_ICON[item.type] ?? <MessageSquare className="w-4 h-4 text-gray-400" />}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                TYPE_BADGE[item.type] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.type}
            </span>
            {item.user?.username && (
              <span className="text-xs text-gray-500">by {item.user.username}</span>
            )}
            {item.user?.email && !item.user.username && (
              <span className="text-xs text-gray-500">{item.user.email}</span>
            )}
            {date && <span className="text-xs text-gray-400">{date}</span>}
            {item.status === 'resolved' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" /> Resolved
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 break-words">{item.message}</p>
        </div>
      </div>

      {item.status !== 'resolved' && (
        <Button
          onClick={() => onResolve(item.id)}
          disabled={resolving === item.id}
          className="shrink-0 text-xs"
        >
          {resolving === item.id ? 'Resolving...' : 'Mark Resolved'}
        </Button>
      )}
    </div>
  )
}
