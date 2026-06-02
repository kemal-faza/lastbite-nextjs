'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/lib/context/AuthContext';

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
      <Bell className="w-5 h-5 text-white" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-[var(--secondary)] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
