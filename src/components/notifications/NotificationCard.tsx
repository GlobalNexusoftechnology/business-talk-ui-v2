import React from 'react';
import { Bell, ThumbsUp, MessageCircle, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface NotificationCardProps {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'group';
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  onClick: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <ThumbsUp className="w-5 h-5" style={{ color: '#1976D2' }} />;
    case 'comment':
      return <MessageCircle className="w-5 h-5" style={{ color: '#388E3C' }} />;
    case 'follow':
      return <Users className="w-5 h-5" style={{ color: '#7B1FA2' }} />;
    case 'mention':
      return <Bell className="w-5 h-5" style={{ color: '#F57C00' }} />;
    case 'group':
      return <TrendingUp className="w-5 h-5" style={{ color: '#4527A0' }} />;
    default:
      return <Bell className="w-5 h-5" style={{ color: '#5F6368' }} />;
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  type,
  user,
  message,
  timestamp,
  isRead,
  onClick,
}) => {
  const router = useRouter();

  return (
    <div
      onClick={() => onClick(id)}
      className={`bg-white dark:bg-black rounded-2xl shadow-sm border p-5 hover:shadow-md transition-all cursor-pointer notification-fade-in ${!isRead ? 'border-blue-600 border-2' : 'border-neutral-800 border'} flex items-start gap-4`}
      style={{ borderLeft: !isRead ? '4px solid #1976D2' : undefined }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-1 shadow-sm">
          {getIcon(type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={`text-base ${!isRead ? 'font-bold' : ''} text-black dark:text-white`}>
            <span className="font-semibold">{user.name}</span> <span className="text-neutral-500">{message}</span>
          </p>
          {!isRead && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-600"></div>}
        </div>
        <p className="text-xs text-neutral-400">{timestamp}</p>
      </div>
    </div>
  );
};
