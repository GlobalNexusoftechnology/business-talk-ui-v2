'use client'

import { CheckCheck } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useRouter } from 'next/navigation';
import { NotificationList } from '@/components/notifications/NotificationList';
import apiClient from '@/lib/api-client';


export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'group';
export interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  redirectUrl?: string;
}




export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { wsManager } = useWebSocket();

  // Fetch notifications from API
  // Initial fetch
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getMyNotifications();
        const mapped = (res.data || []).map((n: any) => ({
          id: n.id,
          type: n.type,
          user: {
            name: n.user?.name || 'Unknown',
            avatar: n.user?.avatar || '/assets/images/default-avatar.png',
          },
          message: n.message,
          timestamp: n.timestamp || n.createdAt || '',
          isRead: n.isRead || n.read || false,
          redirectUrl: n.redirectUrl || n.url || undefined,
        }));
        setNotifications(mapped);
      } catch (e) {
        // Optionally show error toast
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // WebSocket: Listen for real-time notifications
  useEffect(() => {
    if (!wsManager) return;
    // Handler for new notification
    const handler = (data: any) => {
      // Map backend notification to UI type
      const newNotification = {
        id: data.id,
        type: data.type,
        user: {
          name: data.user?.name || 'Unknown',
          avatar: data.user?.avatar || '/assets/images/default-avatar.png',
        },
        message: data.message,
        timestamp: data.timestamp || data.createdAt || '',
        isRead: false,
        redirectUrl: data.redirectUrl || data.url || undefined,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    };
    // Subscribe to 'notification' event
    const unsubscribe = wsManager.on('notification', handler);
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [wsManager]);

  // Mark as read (single)
  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await apiClient.markNotificationAsRead(id);
    } catch {}
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient.markAllNotificationsRead();
    } catch {}
  };

  // Routing logic
  const handleNotificationClick = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      handleMarkAsRead(id);
      if (notification.redirectUrl) {
        router.push(notification.redirectUrl);
      }
    }
  };

  // Tabs/Filters
  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    if (filter === 'mentions') return notifications.filter((n) => n.type === 'mention');
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 overflow-y-auto min-h-screen bg-gray-50 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Notifications</h1>
              <p className="text-neutral-400">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : "You're all caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-white border border-black text-black hover:bg-neutral-100"
              >
                <CheckCheck className="w-5 h-5 text-black" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-black text-white' : 'text-neutral-700 bg-white'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${filter === 'unread' ? 'bg-black text-white' : 'text-neutral-700 bg-white'}`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('mentions')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${filter === 'mentions' ? 'bg-black text-white' : 'text-neutral-700 bg-white'}`}
          >
            Mentions
          </button>
        </div>

        {/* Notifications List */}
        <NotificationList
          notifications={filteredNotifications}
          loading={loading}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  );
}
