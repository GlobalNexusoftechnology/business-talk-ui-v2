import React from 'react';
import { NotificationCard } from './NotificationCard';

export interface NotificationListNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'group';
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationListProps {
  notifications: NotificationListNotification[];
  onNotificationClick: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications, onNotificationClick }) => {
  if (!notifications.length) {
    return (
      <div className="bg-white dark:bg-black rounded-2xl shadow-sm border p-12 text-center border-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">No notifications</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} {...notification} onClick={onNotificationClick} />
      ))}
    </div>
  );
};
