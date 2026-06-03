'use client';

import { ShoppingBagIcon, BellIcon, WarningIcon } from '@phosphor-icons/react';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationData } from '@/lib/api/notifications';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function getIcon(type: NotificationData['type']) {
  switch (type) {
    case 'order_status':
      return <ShoppingBagIcon className="w-4 h-4 text-[var(--primary)]" />;
    case 'stock_alert':
      return <WarningIcon className="w-4 h-4 text-amber-500" />;
    default:
      return <BellIcon className="w-4 h-4 text-gray-500" />;
  }
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const { notifications, markAsRead } = useNotifications();
  const router = useRouter();

  const handleClick = (notif: NotificationData) => {
    markAsRead(notif.id);
    if (notif.data?.orderId) {
      router.push(`/orders/${notif.data.orderId}`);
    } else if (notif.data?.productId) {
      router.push(`/product/${notif.data.productId}`);
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b border-gray-100">
          <SheetTitle className="text-lg font-bold text-gray-900">Notifikasi</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <BellIcon className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !notif.isRead ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[var(--secondary)] shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
