# PLAN.md — Perbaikan 5 Bug

## Bug #4: Layout Card Homepage — 1 Card/Row

**File:** `src/components/ProductGrid.tsx`

**Akar masalah:** Grid menggunakan `grid-cols-1 sm:grid-cols-2` yang berubah jadi 2 kolom di layar >=640px. Seharusnya tetap 1 kolom (mobile-first, sesuai desain awal).

**Perbaikan:**
```
- grid grid-cols-1 sm:grid-cols-2 gap-3
+ grid grid-cols-1 gap-3
```
Hapus `sm:grid-cols-2`, biarkan hanya `grid-cols-1`. Skeleton loading di atasnya juga sudah benar (3 skeleton card full-width), jadi konsisten.

**Risiko:** Tidak ada. Hanya mempengaruhi breakpoint sm ke atas.

---

## Bug #5: Standardisasi Style Select + Placeholder dalam Option

**Referensi:** `src/app/admin/users/page.tsx` (halaman Manajemen Pengguna)

**Style target dari admin/users:**
- `SelectTrigger` pakai class `bg-accent min-h-full` (atau varian lebar seperti `w-45`)
- `SelectContent` dibungkus `SelectGroup` dengan `SelectLabel`
- Placeholder value (`"Semua Role"`) ikut jadi option item

### 5a. `src/app/admin/users/page.tsx`
**Kondisi saat ini:** `SelectGroup` ada, tapi `SelectLabel` tidak ada, dan "Semua Role" tidak ada di dalam option.

**Perbaikan:**
1. Tambahkan `<SelectLabel>Filter Role</SelectLabel>` di dalam `<SelectGroup>`
2. Tambahkan `<SelectItem value="all">Semua Role</SelectItem>` sebagai item pertama
3. Ubah `onValueChange` dari `setRoleFilter(val || '')` menjadi `setRoleFilter(val === 'all' ? '' : val)` agar "all" tidak dikirim ke API sebagai role filter
4. Ubah `value` Select dari `roleFilter || ''` menjadi `roleFilter || 'all'`

### 5b. `src/app/admin/products/page.tsx`
**Kondisi saat ini:** Style mirip, sudah ada "Semua Status" sebagai option. Tapi tidak ada `SelectGroup`/`SelectLabel` dan class `SelectTrigger` berbeda.

**Perbaikan:**
1. Tambahkan class `bg-accent min-h-full` ke `SelectTrigger` (ubah `w-44` jadi `w-44 bg-accent min-h-full`)
2. Bungkus `SelectItem` dalam `<SelectGroup>` + `<SelectLabel>Filter Status</SelectLabel>`

### 5c. `src/app/seller/add/page.tsx` & `src/app/seller/edit/[id]/page.tsx`
**Kondisi saat ini:** `SelectTrigger className="w-full"`, tidak ada `SelectGroup`, placeholder tidak jadi option.

**Perbaikan (kedua file):**
1. Ubah `SelectTrigger className="w-full"` menjadi `SelectTrigger className="w-full bg-accent min-h-full"`
2. Bungkus items dalam `<SelectGroup>` + `<SelectLabel>Kategori</SelectLabel>`
3. Tambahkan `<SelectItem value="placeholder">Pilih kategori</SelectItem>` sebagai item pertama (disabled)
4. Ubah `onValueChange` agar skip value "placeholder" (default ke "meals")

**Catatan:** Karena seller add/edit menggunakan kategori yang available (meals, bakery, drinks), tidak seperti admin yang punya "Semua" filter, pendekatannya berbeda. Placeholder sebagai disabled option (bukan selectable item).

---

## Bug #3: Feedback Setelah Konfirmasi Keranjang

**File:** `src/app/(main)/cart/page.tsx`

**Akar masalah:** Fungsi `handleConfirmOrder` (line 76-95) memanggil `createOrder()` lalu redirect ke `/order/confirm/{id}`. Tidak ada toast sukses atau indikator visual bahwa pesanan berhasil sebelum redirect. User hanya melihat tombol "Memproses..." lalu tiba-tiba halaman berubah.

**Detail flow saat ini:**
1. User klik "Konfirmasi Pesanan" → tombol jadi "Memproses..." (disabled)
2. `createOrder()` dipanggil (bisa 1-3 detik)
3. `clearCart()` dipanggil
4. `router.push('/order/confirm/' + orderId)` — redirect instan

**Perbaikan:**
1. Import `toast` dari `'sonner'` (sonner sudah terinstall dan digunakan di `OrderContext`, `CartContext`, `wishlist/page.tsx`)
2. Setelah `createOrder()` sukses, tampilkan `toast.success('Pesanan berhasil dibuat!')` SEBELUM redirect
3. Tambahkan state `orderSuccess` untuk menampilkan UI sukses sesaat sebelum redirect:
   - Tampilkan animasi/icon sukses + teks "Pesanan Berhasil Dibuat! Mengarahkan..."
   - Beri jeda ~800ms dengan `setTimeout` sebelum `router.push`
4. Ganti teks tombol saat `isSubmitting` dari "Memproses..." menjadi "Membuat Pesanan..." (lebih deskriptif)

**Pseudocode perbaikan `handleConfirmOrder`:**
```ts
const handleConfirmOrder = async () => {
  if (isSubmittingRef.current || items.length === 0) return;
  isSubmittingRef.current = true;
  setIsSubmitting(true);
  try {
    const orderId = await createOrder({...});
    if (orderId) {
      clearCart();
      toast.success('Pesanan berhasil dibuat!');          // ← NEW
      setOrderSuccess(true);                                // ← NEW
      setTimeout(() => {                                    // ← NEW
        router.push('/order/confirm/' + orderId);
      }, 800);                                              // ← NEW
    }
  } finally {
    isSubmittingRef.current = false;
    setIsSubmitting(false);
  }
};
```

**State baru:** `const [orderSuccess, setOrderSuccess] = useState(false);`

**UI sukses:** Anggota baru di render — overlay atau konten yang menampilkan centang hijau + teks sukses + spinner.

---

## Bug #2: Mitra Terverifikasi Tetap Diminta Daftar

**File:** `src/app/seller/page.tsx`

**Akar masalah:** Di line 48-53, `getMitraProfile()` yang gagal (404 / `MITRA_NOT_FOUND`) di-catch dan return `null`. Lalu di line 164, `!profile` menampilkan halaman "Jadi Mitra LastBite" dengan tombol "Daftar Sebagai Mitra". Ini terjadi meskipun:
- User sudah login dengan role MITRA (cookie `user-role=MITRA`)
- User sudah punya produk (verified)

**Mengapa ini terjadi:** Ada race condition atau inkonsistensi data:
1. Cookie `user-role=MITRA` diset saat registrasi/login
2. Tapi `MitraProfile` di database mungkin belum dibuat / gagal dibuat
3. Atau token access kadaluarsa → `getMitraProfile()` return 401, yang TIDAK ditangkap oleh catch `MITRA_NOT_FOUND`, tapi throw error → `loadError` terisi → halaman error

**Analisis lebih dalam:** Di `Promise.all`, jika `getMitraProfile()` throw error (bukan MITRA_NOT_FOUND), seluruh Promise.all reject → `loadError` terisi → halaman error. Tapi jika return null (MITRA_NOT_FOUND), profile jadi null → halaman registrasi. Masalah: user yang sudah verified dan punya produk seharusnya TIDAK mendapat MITRA_NOT_FOUND.

**Skenario realistis:**
- Network error pada API call `/mitra/me` → `getMitraProfile()` throw → loadError → user lihat error, bukan registrasi
- Token expired → `apiFetch` coba refresh → jika gagal, redirect ke `/login` (via `ApiError` 401)
- Backend return 404 MITRA_NOT_FOUND padahal user verified → ini BUG di backend atau data inconsistency

**Perbaikan (defense-in-depth):**

1. **Layer frontend:** Gunakan `fetchMitraProducts()` sebagai fallback. Jika profile null TAPI products ada (length > 0), maka user adalah mitra valid. Jangan tampilkan halaman registrasi.

2. **Perbaiki logic di `loadData`:**
   ```ts
   // Setelah Promise.all selesai:
   setProfile(profileRes?.profile ?? null);
   setProducts(productsRes.products);
   
   // Jika profile null tapi ada produk → mitra valid dengan profile issue
   // Load stats juga jika produk ada
   if (!profileRes?.profile && productsRes.products.length > 0) {
     // Coba fetch stats ulang (mungkin gagal sebelumnya)
     fetchMitraStats().then(r => setStats(r?.stats ?? null)).catch(() => null);
   }
   ```

3. **Di render logic (line 164):**
   ```tsx
   // BEFORE: if (!profile) { ... registration prompt ... }
   // AFTER:
   if (!profile && products.length === 0) {
     // benar-benar tidak terdaftar
   } else if (!profile && products.length > 0) {
     // Mitra punya produk, tapi profile tidak ditemukan
     // Tampilkan dashboard dengan banner warning, jangan registrasi
   }
   ```

4. **Perbaiki middleware `src/middleware.ts` (line 37-38):**
   Saat ini middleware redirect `/seller/*` non-MITRA ke `/`. Tapi jika user role cookie MITRA tapi `/seller/register` diakses, tidak ada redirect (pathname !== '/seller/register'). Ini benar, MITRA boleh akses register page (meski tidak ideal). Tapi tidak ada masalah di sini.

**File yang perlu diubah:**
- `src/app/seller/page.tsx` — logic `loadData` dan render condition

---

## Bug #1: Dashboard Mitra Kurang Interaktif

**File:** `src/app/seller/page.tsx`, `src/app/seller/layout.tsx` (baru)

**Akar masalah:** Dashboard mitra adalah single page dengan tab overview/analytics. Tidak ada sidebar navigasi seperti dashboard admin. Semua fitur (produk, pesanan, statistik) ditampilkan inline atau via router.push, bukan navigasi terstruktur.

**Bandingkan dengan Admin Dashboard:**
| Fitur | Admin | Mitra (saat ini) |
|-------|-------|-----------------|
| Sidebar navigasi | Ya (`admin/layout.tsx`) | Tidak ada |
| Stat cards interaktif | Card-based, clean | Card-based, clean (sama) |
| Product management | Halaman terpisah `/admin/products` | Inline di overview tab |
| Order management | Tidak ada di admin | `/seller/orders` (halaman terpisah) |
| Analytics | Tidak ada | Ada (tab analytics) |
| Empty states | Loading text | Loading spinner, error states |
| Search/filter | Ada (search + select filter) | Tidak ada |

### Rencana Perbaikan:

#### 1. Buat SellerLayout dengan sidebar navigasi

**File baru:** `src/app/seller/layout.tsx`

Mirip dengan `src/app/admin/layout.tsx`, tapi dengan navigasi spesifik mitra:

```tsx
const navItems = [
  { href: '/seller', label: 'Ringkasan', icon: SquaresFourIcon },
  { href: '/seller/orders', label: 'Pesanan Masuk', icon: PackageIcon },
  { href: '/seller/analytics', label: 'Analitik', icon: ChartBarIcon },      // baru
  { href: '/seller/add', label: 'Tambah Produk', icon: PlusIcon },
];
```

**Perubahan `seller/page.tsx`:**
- Hapus header custom dari page (pindah ke layout)
- Hapus tab navigation (overview/analytics) — analytics jadi halaman terpisah
- Hapus FAB (Tambah Produk) — sudah ada di sidebar
- Overview jadi default: stat cards + quick actions + product list

#### 2. Pisahkan Analytics ke halaman terpisah

**File baru:** `src/app/seller/analytics/page.tsx`

Pindahkan semua logic analytics (date range, sales trend, revenue, product ranking, peak hours, CSV export) dari `seller/page.tsx` ke halaman sendiri.

#### 3. Buat stat cards interaktif (clickable)

Di `DashboardStatCards.tsx`, tambahkan props `onClick` optional. Setiap card yang diklik bisa navigate ke halaman terkait:
- "Stok Produk" → scroll ke product list
- "Terjual" → ke analytics
- "Pesanan Masuk" → ke `/seller/orders`

#### 4. Tambahkan search/filter di product list

Di overview tab, tambahkan search input dan filter (by status aktif/nonaktif) untuk product list. Gunakan pattern yang sama dengan admin/users dan admin/products.

#### 5. Empty states yang lebih baik

Untuk analytics: jika belum ada data, tampilkan ilustrasi + teks "Belum ada data penjualan" bukan chart kosong.

### Detail file yang diubah:

| File | Perubahan |
|------|-----------|
| `src/app/seller/layout.tsx` | **BARU** — Layout dengan sidebar navigasi |
| `src/app/seller/page.tsx` | Refactor — hapus header + tab nav + analytics state; fokus ke overview (stats, quick actions, products) |
| `src/app/seller/analytics/page.tsx` | **BARU** — Pindahan analytics dari page.tsx |
| `src/components/DashboardStatCards.tsx` | Opsional: tambahkan `onClick` handler per card |
| `src/middleware.ts` | Tambahkan `/seller/analytics` ke MITRA guard (sudah tercakup oleh `/seller/*`) |

### Arsitektur Layout Mitra:

```
/seller/layout.tsx
├── Sidebar (fixed left, collapsible di mobile)
│   ├── Store name + user info
│   ├── Nav: Ringkasan
│   ├── Nav: Pesanan Masuk (dengan badge activeOrders)
│   ├── Nav: Analitik
│   ├── Nav: Tambah Produk
│   └── Logout
└── Main content area
    ├── /seller → Overview page (stats + products)
    ├── /seller/orders → Order management
    ├── /seller/analytics → Analytics charts
    ├── /seller/add → Add product form
    ├── /seller/edit/[id] → Edit product form
    └── /seller/register → Registration form
```

### Potensi trade-off:
- **Pro:** Navigasi lebih jelas, halaman lebih fokus, konsisten dengan admin
- **Pro:** Analytics terpisah → tidak perlu fetch analytics di overview (hemat API call)
- **Con:** Butuh lebih banyak file (1 layout + 1 page baru)
- **Con:** Perubahan cukup besar pada `seller/page.tsx` (refactor signifikan)
- **Con:** Mobile sidebar perlu toggle (seperti admin), menambah kompleksitas UI

### Alternatif yang lebih minimal:
Jika perubahan besar tidak diinginkan, alternatif minimal:
1. Tetap gunakan tab navigation, tapi tambahkan lebih banyak interaktivitas:
   - Stat cards clickable (ke orders / analytics section)
   - Product list dengan search bar inline
   - Quick status toggle untuk produk (aktif/nonaktif) tanpa harus ke edit page
2. Tambahkan bottom nav di mobile (seperti main app) untuk akses cepat antar section

---

## Ringkasan Urutan Pengerjaan (Rekomendasi)

1. **Bug #4** (termudah, 1 file, 1 line) → 2 menit
2. **Bug #5** (4 file, perubahan kecil terisolasi) → 5 menit
3. **Bug #3** (1 file, tambah toast + success state) → 5 menit
4. **Bug #2** (1 file, logic refactor kecil) → 5 menit
5. **Bug #1** (paling besar, 3+ file, perlu layout baru + refactor) → 15-20 menit
