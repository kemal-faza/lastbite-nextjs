'use client';

import { BellIcon } from '@phosphor-icons/react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/lib/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
      aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}`}
    >
      <BellIcon className="w-5 h-5 text-white" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </button>
  );
}
