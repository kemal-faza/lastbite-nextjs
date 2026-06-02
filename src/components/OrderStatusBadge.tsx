interface Props {
  status: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  PROCESSED: { label: 'Diproses', bg: 'bg-blue-100', text: 'text-blue-800' },
  READY: { label: 'Siap Diambil', bg: 'bg-green-100', text: 'text-green-800' },
  PICKED_UP: { label: 'Sudah Diambil', bg: 'bg-gray-100', text: 'text-gray-800' },
  CANCELLED: { label: 'Dibatalkan', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function OrderStatusBadge({ status }: Props) {
  const info = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${info.bg} ${info.text}`}>
      {info.label}
    </span>
  );
}
