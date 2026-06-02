export function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Kadaluwarsa';
  const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  if (hours === 0) return `${minutes} menit`;
  return `${hours} jam ${minutes} menit`;
}

export function toNumericId(id: string): number {
  return Number(id.replace(/-/g, '').slice(0, 9)) || 0;
}
