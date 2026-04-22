'use client'

import { CheckCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationList } from '@/components/notifications/NotificationList';


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

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    message: 'liked your post',
    timestamp: '5 minutes ago',
    isRead: false,
    redirectUrl: '/posts/1',
  },
  {
    id: '2',
    type: 'comment',
    user: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    message: 'commented on your post',
    timestamp: '1 hour ago',
    isRead: false,
    redirectUrl: '/posts/2',
  },
  {
    id: '3',
    type: 'follow',
    user: {
      name: 'Ankit Verma',
      avatar: 'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    message: 'started following you',
    timestamp: '2 hours ago',
    isRead: false,
    redirectUrl: '/profile/ankit-verma',
  },
  {
    id: '4',
    type: 'mention',
    user: {
      name: 'Sarah Thompson',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMjkwNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    message: 'mentioned you in a post',
    timestamp: '3 hours ago',
    isRead: true,
    redirectUrl: '/posts/3',
  },
  {
    id: '5',
    type: 'group',
    user: {
      name: 'Startup Founders India',
      avatar: 'https://images.unsplash.com/photo-1759310610480-48649b55fbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBncm91cCUyMG1lZXRpbmd8ZW58MXx8fHx8MTc3NTA1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    message: 'New post in group',
    timestamp: '5 hours ago',
    isRead: true,
    redirectUrl: '/groups/startup-founders-india',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const router = useRouter();

  // Mark as read (single)
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        <NotificationList notifications={filteredNotifications as any} onNotificationClick={handleNotificationClick} />
      </div>
    </div>
  );
}
