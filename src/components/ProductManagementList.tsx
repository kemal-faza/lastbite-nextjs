'use client';

import { useRouter } from 'next/navigation';
import { PackageIcon, PencilIcon, TrashIcon, SpinnerIcon, MagnifyingGlassIcon, EyeIcon, EyeClosedIcon } from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import type { ProductData } from '@/lib/api/products';
import { deleteMitraProduct, updateMitraProduct } from '@/lib/api/mitra';
import { getImageUrl } from '@/lib/api/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

type FilterTab = 'all' | 'active' | 'inactive';

interface Props {
  products: ProductData[];
  onProductDeleted: () => void;
}

export default function ProductManagementList({ products, onProductDeleted }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filterTab === 'active') list = list.filter((p) => p.isActive);
    else if (filterTab === 'inactive') list = list.filter((p) => !p.isActive);
    return list;
  }, [products, search, filterTab]);

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

  const handleToggleActive = async (id: string, currentActive: boolean, name: string) => {
    setTogglingId(id);
    try {
      await updateMitraProduct(id, { isActive: !currentActive });
      toast.success(currentActive ? `"${name}" dinonaktifkan` : `"${name}" diaktifkan`);
      onProductDeleted();
    } catch {
      toast.error('Gagal mengubah status produk');
    } finally {
      setTogglingId(null);
    }
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' },
  ];

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
        <CardTitle>Daftar Produk ({filtered.length})</CardTitle>
        <div className="space-y-2 mt-2">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm h-8"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-50 rounded-lg p-0.5">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilterTab(tab.value)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  filterTab === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Tidak ada produk ditemukan</p>
          </div>
        ) : (
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
              {filtered.map((product) => (
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
                      {/* Quick toggle active/inactive */}
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive, product.name)}
                        disabled={togglingId === product.id}
                        title={product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-lg transition-colors disabled:opacity-50 ${
                          product.isActive
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {togglingId === product.id ? (
                          <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                        ) : product.isActive ? (
                          <EyeClosedIcon className="w-3.5 h-3.5" />
                        ) : (
                          <EyeIcon className="w-3.5 h-3.5" />
                        )}
                      </button>
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
        )}
      </CardContent>
    </Card>
  );
}
