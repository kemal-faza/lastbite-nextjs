import { apiFetch } from './client';

export async function registerDeviceToken(token: string, platform = 'web') {
  return apiFetch<{ device: { id: string; token: string; platform: string } }>(
    '/devices',
    { method: 'POST', auth: true, body: JSON.stringify({ token, platform }) }
  );
}
