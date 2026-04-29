// 'use client'

// import { Card } from '@/components/shared/Card'

// export default function AdminNotificationsPage() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-secondary-900 mb-6">Notifications</h1>
//       <Card>
//         <p className="text-secondary-600">Notifications management interface coming soon</p>
//       </Card>
//     </div>
//   )
// }
'use client'

import { CheckCheck } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { useRouter } from 'next/navigation'
import { NotificationList } from '@/components/notifications/NotificationList'
import apiClient from '@/lib/api-client'

// ✅ UPDATED TYPE
export interface Notification {
  id: string
  type: string

  user: {
    name: string
    avatar: string
  }

  message: string

  timestamp: string // formatted
  rawTimestamp: number // 🔥 used for sorting

  is_read: boolean

  entity_id: string
  entity_type: string
}

// ✅ TIME FORMATTER
const getTimeAgo = (ts: string) => {
  const diff = Date.now() - Number(ts)

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(diff / 604800000)
  const months = Math.floor(diff / 2629800000)
  const years = Math.floor(diff / 31557600000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  if (weeks < 4) return `${weeks}w`
  if (months < 12) return `${months}mo`
  return `${years}y`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' >('all') /*| 'mentions' if mention is added in future */
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { wsManager } = useWebSocket()

  // =========================
  // 🔥 FETCH + MAP FIXED
  // =========================
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)

      try {
        const res = await apiClient.getMyNotifications()

        const mapped = await Promise.all(
          (res.data || []).map(async (n: any) => {
            let userData = null

            try {
              const userRes = await apiClient.getUserById(n.actor_id)
              userData = userRes.data
            } catch {
              userData = null
            }

            return {
              id: n.id,
              type: n.type,

              user: {
                name:
                  userData?.full_name ||
                  userData?.name ||
                  userData?.username ||
                  'Unknown',

                avatar:
                  userData?.profile_photo ||
                  userData?.avatar ||
                  '/assets/images/default-avatar.png',
              },

              message: n.message,

              timestamp: getTimeAgo(n.created_on),
              rawTimestamp: Number(n.created_on),

              is_read: n.is_read === true,

              entity_id: n.entity_id,
              entity_type: n.entity_type,
            }
          })
        )

        // ✅ FIXED SORT (IMPORTANT)
        mapped.sort((a, b) => b.rawTimestamp - a.rawTimestamp)

        setNotifications(mapped)
      } catch (e) {
        console.error('Notification fetch failed', e)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // =========================
  // 🔥 WEBSOCKET FIXED
  // =========================
  useEffect(() => {
    if (!wsManager) return

    const handler = async (data: any) => {
      let userData = null

      try {
        const userRes = await apiClient.getUserById(data.actor_id)
        userData = userRes.data
      } catch {}

      const newNotification: Notification = {
        id: data.id,
        type: data.type,

        user: {
          name:
            userData?.full_name ||
            userData?.name ||
            userData?.username ||
            'Unknown',

          avatar:
            userData?.profile_photo ||
            userData?.avatar ||
            '/assets/images/default-avatar.png',
        },

        message: data.message,

        timestamp: getTimeAgo(data.created_on),
        rawTimestamp: Number(data.created_on),

        is_read: false,

        entity_id: data.entity_id,
        entity_type: data.entity_type,
      }

      setNotifications((prev) => [newNotification, ...prev])
    }

    const unsubscribe = wsManager.on('notification', handler)

    return () => unsubscribe && unsubscribe()
  }, [wsManager])

  // =========================
  // MARK READ
  // =========================
  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    )

    try {
      await apiClient.markNotificationAsRead(id)
    } catch {}
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    )

    try {
      await apiClient.markAllNotificationsRead()
    } catch {}
  }

  // =========================
  // 🔥 ROUTING LOGIC (FIXED)
  // =========================
  const handleNotificationClick = (id: string) => {
    const n = notifications.find((x) => x.id === id)
    if (!n) return

    handleMarkAsRead(id)

    const { entity_id, entity_type, type } = n

    switch (entity_type) {
      case 'user':
        router.push(`/profile/${entity_id}`)
        break

      case 'post':
        if (type === 'question') {
          router.push(`/question/${entity_id}`)
        } else {
          router.push(`/post/${entity_id}`)
        }
        break

      case 'blog':
        if (type === 'story') {
          router.push(`/story/${entity_id}`)
        } else {
          router.push(`/blog/${entity_id}`)
        }
        break

      case 'comment':
        router.push(`/post/${entity_id}?highlight=comment`)
        break

      case 'conversation':
        router.push(`/messages/${entity_id}`)
        break

      default:
        console.warn('Unknown notification type')
    }
  }

  // =========================
  // FILTERS
  // =========================
  const filteredNotifications = useMemo(() => {
    if (filter === 'unread')
      return notifications.filter((n) => !n.is_read)

    // NOTE: Mentions filter can be added in future when mention notifications are supported by backend
    // if (filter === 'mentions')
    //   return notifications.filter((n) => n.type === 'mention')

    return notifications
  }, [notifications, filter])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 overflow-y-auto min-h-screen bg-gray-50 text-white">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-black">
                Notifications
              </h1>

              <p className="text-neutral-400">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : "You're all caught up!"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-black text-black hover:bg-neutral-100"
              >
                <CheckCheck className="w-5 h-5" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm border p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 rounded-lg ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'text-neutral-700'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2.5 rounded-lg ${
              filter === 'unread'
                ? 'bg-black text-white'
                : 'text-neutral-700'
            }`}
          >
            Unread ({unreadCount})
          </button>

          {/* Note: Mentions filter can be added in future when mention notifications are supported by backend */}
          {/* <button
            onClick={() => setFilter('mentions')}
            className={`flex-1 py-2.5 rounded-lg ${
              filter === 'mentions'
                ? 'bg-black text-white'
                : 'text-neutral-700'
            }`}
          >
            Mentions
          </button> */}
        </div>

        {/* LIST */}
        <NotificationList
          notifications={filteredNotifications}
          loading={loading}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  )
}