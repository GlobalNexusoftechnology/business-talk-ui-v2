import React from 'react'
import { NotificationCard } from './NotificationCard'

interface NotificationListProps {
  notifications: Array<{
    id: string;
    type: string;
    user: { name: string; avatar: string };
    message: string;
    createdAt: number;
    isRead: boolean;
    requestId?: string;
    canAct?: boolean;
  }>;
  loading?: boolean;
  onNotificationClick: (id: string) => void;
  onConnectionRequestAction?: (notificationId: string, requestId: string, action: 'accept' | 'delete') => Promise<void> | void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications, loading, onNotificationClick, onConnectionRequestAction }) => {
  if (loading) {
    return <div className="p-4 text-neutral-400">Loading...</div>
  }

  if (!notifications.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-12 text-center border-neutral-800">
        <p className="text-neutral-500">
          No notifications
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          id={n.id}
          type={n.type as any}
          user={n.user}
          message={n.message}
          createdAt={n.createdAt}
          isRead={n.isRead}
          requestId={n.requestId}
          canAct={n.canAct}
          onClick={onNotificationClick}
          onConnectionRequestAction={onConnectionRequestAction}
        />
      ))}
    </div>
  )
}