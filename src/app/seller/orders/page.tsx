'use client';

import { ArrowLeft, Package, Clock, Loader2, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchMitraOrders, updateMitraOrderStatus, type MitraOrder } from '@/lib/api/mitra';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const NEXT_STATUS_MAP: Record<string, { label: string; next: string }> = {
  PENDING: { label: 'Proses Pesanan', next: 'PROCESSED' },
  PROCESSED: { label: 'Tandai Siap Diambil', next: 'READY' },
  READY: { label: 'Konfirmasi Sudah Diambil', next: 'PICKED_UP' },
};

export default function MitraOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MitraOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetchMitraOrders();
      setOrders(res.orders);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setActioningId(orderId);
    try {
      await updateMitraOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal update status');
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Batalkan pesanan ini? Stok produk akan dikembalikan.')) return;
    setActioningId(orderId);
    try {
      await updateMitraOrderStatus(orderId, 'CANCELLED');
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pesanan');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED');
  const completedOrders = orders.filter((o) => o.status === 'PICKED_UP' || o.status === 'CANCELLED');

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/seller')} className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Pesanan Masuk</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-6">
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Belum ada pesanan</p>
          </div>
        )}

        {pendingOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Perlu Tindakan ({pendingOrders.length})
            </h2>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actioningId={actioningId}
                  onStatusUpdate={handleStatusUpdate}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          </section>
        )}

        {completedOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Riwayat ({completedOrders.length})
            </h2>
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actioningId={null}
                  onStatusUpdate={() => {}}
                  onCancel={() => {}}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  actioningId,
  onStatusUpdate,
  onCancel,
}: {
  order: MitraOrder;
  actioningId: string | null;
  onStatusUpdate: (id: string, status: string) => void;
  onCancel: (id: string) => void;
}) {
  const nextAction = NEXT_STATUS_MAP[order.status];
  const isActioning = actioningId === order.id;
  const isCompleted = order.status === 'PICKED_UP' || order.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400">Kode Pickup</p>
          <p className="font-mono font-bold text-sm text-[var(--primary)]">{order.pickupCode}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">{item.quantity}x {item.name}</span>
            <span className="text-gray-500">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-semibold text-gray-800">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3 h-3" />
          {order.buyerName} &middot; {order.buyerPhone}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Batas ambil: {new Date(order.pickupExpiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {order.notes && (
          <div className="flex items-start gap-1.5">
            <span className="text-gray-300">Note:</span>
            <span>{order.notes}</span>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="flex gap-2 pt-1">
          {nextAction && (
            <button
              onClick={() => onStatusUpdate(order.id, nextAction.next)}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {nextAction.label}
            </button>
          )}
          <button
            onClick={() => onCancel(order.id)}
            disabled={isActioning}
            className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Batalkan
          </button>
        </div>
      )}
    </div>
  );
}
