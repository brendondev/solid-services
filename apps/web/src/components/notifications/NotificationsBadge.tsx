'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/notifications/NotificationsContext';

interface NotificationsBadgeProps {
  onClick?: () => void;
}

export default function NotificationsBadge({ onClick }: NotificationsBadgeProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label={`${unreadCount} notificações não lidas`}
    >
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
