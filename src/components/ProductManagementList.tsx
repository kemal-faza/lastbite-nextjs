'use client';

import { useRouter } from 'next/navigation';
import { Package, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ProductData } from '@/lib/api/products';
import { deleteMitraProduct } from '@/lib/api/mitra';
import { getImageUrl } from '@/lib/api/products';

interface Props {
  products: ProductData[];
  onProductDeleted: () => void;
}

export default function ProductManagementList({ products, onProductDeleted }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}" dari daftar produk? Produk tidak akan muncul di pencarian Food Saver.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteMitraProduct(id);
      onProductDeleted();
    } catch {
      alert('Gagal menghapus produk');
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Belum ada produk</p>
        <p className="text-gray-400 text-xs mt-1">Tambahkan produk baru untuk mulai berjualan</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-2xl shadow-sm px-4 py-4">
          <div className="flex items-start gap-3">
            {product.imageUrl ? (
              <img src={getImageUrl(product.imageUrl)!} alt={product.name}
                className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-[var(--primary)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Stok: {product.stock} | Rp{product.discountedPrice.toLocaleString('id-ID')}
              </p>
              {!product.isActive && (
                <span className="text-xs text-[var(--destructive)] mt-1 inline-block">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => router.push(`/seller/edit/${product.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(product.id, product.name)}
              disabled={deletingId === product.id}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deletingId === product.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
