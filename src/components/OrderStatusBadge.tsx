import { Badge } from '@/components/ui/badge';

const LABEL_MAP: Record<string, string> = {
  PENDING: 'Menunggu',
  PROCESSED: 'Diproses',
  READY: 'Siap Diambil',
  PICKED_UP: 'Sudah Diambil',
  CANCELLED: 'Dibatalkan',
};

const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Menunggu: 'secondary',
  Diproses: 'default',
  'Siap Diambil': 'default',
  'Sudah Diambil': 'outline',
  Dibatalkan: 'destructive',
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const label = LABEL_MAP[status] ?? status;
  return (
    <Badge variant={variantMap[label] ?? 'secondary'}>
      {label}
    </Badge>
  );
}
