'use client';

import { ArrowLeftIcon, ShoppingBagIcon, BellIcon, WarningIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationData } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

function getIcon(type: NotificationData['type']) {
  switch (type) {
    case 'order_status':
      return <ShoppingBagIcon className="w-5 h-5 text-[var(--primary)]" />;
    case 'stock_alert':
      return <WarningIcon className="w-5 h-5 text-amber-500" />;
    default:
      return <BellIcon className="w-5 h-5 text-gray-500" />;
  }
}

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-full bg-[var(--background)]">
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Notifikasi</h1>
      </div>

      <div className="flex-1 p-4 pb-28">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BellIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Notifikasi</h2>
            <p className="text-gray-500 max-w-[250px]">
              Notifikasi pesanan, stok favorit, dan promo akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.data?.orderId) router.push(`/orders/${notif.data.orderId}`);
                  else if (notif.data?.productId) router.push(`/product/${notif.data.productId}`);
                }}
                className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border ${
                  !notif.isRead ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[var(--secondary)] shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notif.body}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
