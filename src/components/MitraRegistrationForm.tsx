'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { registerMitra } from '@/lib/api/mitra';

export default function MitraRegistrationForm() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError('Nama toko wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      await registerMitra({
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim() || undefined,
        storeAddress: storeAddress.trim() || undefined,
      });
      router.push('/seller');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan Mitra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Daftar Menjadi Mitra</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Gratis selamanya. Tidak ada biaya platform. Jual Makanan Surplus dan bantu kurangi food waste.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Nama Toko <span className="text-[var(--destructive)]">*</span>
        </label>
        <Input
          type="text"
          placeholder="Contoh: Roti Ibu Tutik"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Alamat Toko</label>
        <Input
          type="text"
          placeholder="Contoh: Jl. Melati No. 8, Jakarta Selatan"
          value={storeAddress}
          onChange={(e) => setStoreAddress(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Deskripsi Toko</label>
        <Textarea
          placeholder="Ceritakan tentang toko kamu..."
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[var(--primary)] text-white font-semibold py-4 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Mendaftarkan...
          </>
        ) : (
          'Daftar Sebagai Mitra'
        )}
      </button>
    </form>
  );
}
