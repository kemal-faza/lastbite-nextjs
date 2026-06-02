import { apiFetch } from './client';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'order_status' | 'stock_alert' | 'general' | 'promo';
  data: Record<string, string> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationData[];
  unreadCount: number;
}

export async function fetchNotifications(options?: { unread?: boolean; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.unread) params.set('unread', 'true');
  if (options?.limit) params.set('limit', String(options.limit));
  const query = params.toString();
  return apiFetch<NotificationsResponse>(
    `/notifications${query ? `?${query}` : ''}`,
    { auth: true }
  );
}

export async function markNotificationRead(id: string) {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH', auth: true });
}
