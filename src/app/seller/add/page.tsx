'use client';

import { useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const menuOptions = [
  'Pilih menu',
  'Roti Coklat',
  'Roti Keju',
  'Roti Pisang',
  'Ayam Geprek',
];

export default function AddProductPage() {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !quantity || !price) {
      alert('Mohon isi nama produk, jumlah, dan harga!');
      return;
    }
    const saved = JSON.parse(localStorage.getItem('lastbite-seller-products') || '[]');
    saved.push({
      id: Date.now(),
      name: productName,
      quantity: parseInt(quantity) || 0,
      price: parseInt(price) || 0,
      sold: 0,
      notes: notes,
    });
    localStorage.setItem('lastbite-seller-products', JSON.stringify(saved));
    router.push('/seller');
  };

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/seller')}
            className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Tambah Produk</h1>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Produk */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nama Produk <span className="text-[var(--destructive)]">*</span>
            </label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="flex h-9 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            >
              {menuOptions.map((opt) => (
                <option key={opt} value={opt === 'Pilih menu' ? '' : opt} disabled={opt === 'Pilih menu'}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah Sisa */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Jumlah Sisa <span className="text-[var(--destructive)]">*</span>
            </label>
            <Input
              type="number"
              placeholder="8"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
            />
          </div>

          {/* Harga Diskon */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Harga Diskon (per pcs) <span className="text-[var(--destructive)]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                Rp
              </span>
              <Input
                type="number"
                placeholder="3.000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-10"
                min="0"
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Catatan</label>
            <Textarea
              placeholder="Tanpa bahan pengawet, dipanggang pagi ini"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Upload Foto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Foto</label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl px-4 py-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 transition-colors">
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-sm">Ketuk untuk mengunggah foto</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white font-semibold py-4 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
          >
            Upload Produk
          </button>
        </form>
      </div>
    </div>
  );
}
