'use client';

import { Clock, CheckCircle, Package, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/lib/context/OrderContext';

export default function OrdersPage() {
  const { pendingOrders, orders } = useOrders();
  const router = useRouter();

  const allOrders = orders.length > 0 ? orders : [];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={() => router.push('/profile')}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Kembali ke Profil"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pesanan Saya</h1>
        {pendingOrders.length > 0 && (
          <span className="bg-[var(--secondary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pendingOrders.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28 space-y-4">
        {allOrders.length > 0 ? (
          allOrders.map((order) => {
            const isPending = order.status === 'pending-pickup';
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {order.items.length > 1
                      ? order.items[0].name + ' +' + (order.items.length - 1) + ' lainnya'
                      : order.items[0].name}
                  </h3>
                  <span
                    className={
                      'text-xs font-medium px-3 py-1 rounded-full ' +
                      (isPending
                        ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]'
                        : 'bg-green-100 text-green-700')
                    }
                  >
                    {isPending ? 'Menunggu Diambil' : 'Selesai'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <ShoppingBag className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{item.quantity}x {item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-400 pl-5">
                      +{order.items.length - 3} item lainnya
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="font-bold text-[var(--secondary)]">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 font-mono">{order.pickupCode}</span>
                  </div>
                </div>
                {isPending && (
                  <button
                    onClick={() => router.push('/order/confirm/' + order.id)}
                    className="w-full py-3 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-[#0d5254] transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Ambil Pesanan
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {!isPending && (
                  <div className="flex items-center gap-1.5 text-green-600 text-xs justify-center pt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Sudah diambil</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">Belum ada pesanan</p>
            <p className="text-gray-400 text-sm">
              Pesanan yang sudah dikonfirmasi akan muncul di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
