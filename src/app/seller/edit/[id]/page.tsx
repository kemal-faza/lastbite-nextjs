'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Upload, X, Loader2, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateMitraProduct, fetchMitraProducts } from '@/lib/api/mitra';
import { uploadImage } from '@/lib/api/products';
import type { ProductData } from '@/lib/api/products';

const CATEGORIES = [
  { value: 'meals', label: 'Makanan' },
  { value: 'bakery', label: 'Roti & Kue' },
  { value: 'drinks', label: 'Minuman' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('meals');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMitraProducts()
      .then((res) => {
        const found = res.products.find((p) => p.id === productId);
        if (found) {
          setProduct(found);
          setName(found.name);
          setDescription(found.description || '');
          setCategory(found.category);
          setOriginalPrice(String(found.originalPrice));
          setDiscountedPrice(String(found.discountedPrice));
          setStock(String(found.stock));
          setStoreName(found.storeName);
          setStoreAddress(found.storeAddress || '');
          setExpiresAt(found.expiresAt.slice(0, 16));
          if (found.imageUrl) setImagePreview(found.imageUrl);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let imageUrl = product?.imageUrl || null;
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      await updateMitraProduct(productId, {
        name,
        description: description || null,
        category,
        originalPrice: parseInt(originalPrice),
        discountedPrice: parseInt(discountedPrice),
        stock: parseInt(stock),
        imageUrl,
        storeName,
        storeAddress: storeAddress || null,
        expiresAt: new Date(expiresAt).toISOString(),
      });

      router.push('/seller');
    } catch (err: any) {
      setError(err.message || 'Gagal mengupdate produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-[var(--background)] gap-3">
        <p className="text-gray-500">Produk tidak ditemukan</p>
        <button onClick={() => router.push('/seller')} className="text-sm text-[var(--primary)] font-medium">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/seller')} className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Edit Produk</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Produk</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Harga Normal (Rp)</label>
              <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Harga Diskon (Rp)</label>
              <Input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Jumlah Stok</label>
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Toko</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Alamat Toko</label>
            <Input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Batas Waktu Pengambilan</label>
            <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi Produk</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Foto Produk</label>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(product?.imageUrl || null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl px-4 py-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 transition-colors">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Ketuk untuk mengganti foto</span>
              </button>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-[var(--primary)] text-white font-semibold py-4 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-5 h-5" /> Simpan Perubahan</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
