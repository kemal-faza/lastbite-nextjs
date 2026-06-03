'use client';

import { useRouter } from 'next/navigation';
import { PackageIcon, PencilIcon, TrashIcon, SpinnerIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import type { ProductData } from '@/lib/api/products';
import { deleteMitraProduct } from '@/lib/api/mitra';
import { getImageUrl } from '@/lib/api/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
        <PackageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Belum ada produk</p>
        <p className="text-gray-400 text-xs mt-1">Tambahkan produk baru untuk mulai berjualan</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Produk</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img src={getImageUrl(product.imageUrl)!} alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                        <PackageIcon className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      {!product.isActive && (
                        <span className="text-xs text-[var(--destructive)]">Nonaktif</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  Rp{product.discountedPrice.toLocaleString('id-ID')}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/seller/edit/${product.id}`)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deletingId === product.id}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === product.id ? (
                        <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <TrashIcon className="w-3.5 h-3.5" />
                      )}
                      Hapus
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
