'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFcmToken, onForegroundMessage } from '@/lib/firebase';
import { registerDeviceToken } from '@/lib/api/devices';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setIsSupported(false);
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    const unsub = onForegroundMessage(async (payload) => {
      const { title, body } = payload.notification || {};
      toast(title || 'Notifikasi Baru', {
        description: body,
        action: {
          label: 'Lihat',
          onClick: () => router.push('/notifications'),
        },
        duration: 8000,
      });
    });
    return () => { if (unsub) unsub(); };
  }, [router]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setIsSupported(false);
      return null;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const token = await getFcmToken();
        if (token) {
          setFcmToken(token);
          await registerDeviceToken(token);
        }
      }
      return result;
    } catch {
      setIsSupported(false);
      return null;
    }
  }, []);

  return { permission, fcmToken, isSupported, requestPermission };
}
