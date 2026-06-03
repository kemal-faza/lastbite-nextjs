# Bug Fix Sprint — Design Spec

**Date:** 2026-06-03
**Status:** Approved

## Overview

7 bug dikelompokkan berdasarkan dependency dan dikerjakan dalam 3 wave. Setiap bug memiliki root cause, pendekatan fix, dan file yang terpengaruh.

---

## Bug 1: Foto Produk Tidak Tampil

### Root Cause
Seed data (`backend/prisma/seed.ts`) mereferensi path `/images/products/*.jpg`, tapi Express hanya serve `/uploads/` (bukan `/images/`). Akibatnya `getImageUrl()` me-return URL yang 404, dan `ImageWithFallback` menampilkan placeholder abu-abu.

### Fix
Update `imageUrl` di `seed.ts` untuk 8 produk ke path `/uploads/<filename>` menggunakan file yang sudah ada di `backend/uploads/` (45 file existing). Strategi pemilihan: lihat 45 file di `backend/uploads/`, pilih 8 yang paling mewakili kategori produk (meals → gambar makanan berat, bakery → roti/kue, drinks → minuman). Jika tidak ada yang cocok untuk kategori tertentu, upload gambar baru via `POST /uploads` dan catat nama filenya untuk dimasukkan ke seed.

### Files Affected
- `backend/prisma/seed.ts`

### Verification
- Run `npx prisma db seed`
- Buka homepage — semua ProductCard dan ProductGrid menampilkan gambar asli

---

## Bug 2: Rekomendasi AI Muncul Tanpa Purchase History

### Root Cause
Komponen `AIRecommendation` di-render unconditionally di homepage (`src/app/(main)/page.tsx` line 64). Tidak ada pengecekan apakah user memiliki riwayat pembelian.

### Catatan
Komponen ini bukan AI sebenarnya — ini adalah scoring rule-based deterministik (category match + discount + pseudo-random popularity). Label "AI" adalah UX placeholder. Fix ini mengikuti **Jalur A** (label correction + conditional). Implementasi AI sungguhan (Jalur B) akan dikerjakan di plan terpisah.

### Fix
1. Tambahkan endpoint `GET /orders/has-history` di backend — return `{ hasHistory: boolean }`
2. Buat hook `useHasPurchaseHistory()` di frontend
3. Di homepage, render `AIRecommendation` hanya jika `hasHistory === true`
4. Rename:
   - Badge "AI" → "Rekomendasi"
   - Teks "Berdasarkan riwayat & preferensimu" → "Berdasarkan produk yang kamu suka"
   - Judul komponen: "Rekomendasi AI untuk kamu" → "Rekomendasi untuk Kamu"
   - Hilangkan `Sparkles` icon, ganti dengan icon rekomendasi biasa atau tetap tanpa icon
5. Di product detail page, rekomendasi "Kamu mungkin juga suka" tetap muncul tanpa conditional (berbasis produk saat ini, bukan riwayat user)

### Files Affected
- Backend: tambah endpoint `/orders/has-history`
- Frontend: `src/components/AIRecommendation.tsx`
- Frontend: `src/app/(main)/page.tsx`
- Frontend: new hook `src/hooks/useHasPurchaseHistory.ts`

### Verification
- Buka homepage tanpa login → tidak ada rekomendasi
- Login sebagai user tanpa riwayat pesanan → tidak ada rekomendasi
- Login sebagai user dengan pesanan → rekomendasi muncul
- Buka detail produk → rekomendasi "Kamu mungkin juga suka" selalu muncul

---

## Bug 3: Dropdown Select Styling Jelek

### Root Cause
Di `src/components/ui/select.tsx` line 44, class `bg-input-background` bukan standard Tailwind CSS class. Tidak ada di konfigurasi project. Akibatnya CSS tidak ter-resolve dan background dropdown tidak tampil sesuai desain.

### Fix
Ganti `bg-input-background` menjadi `bg-white` di `SelectTrigger` styling. Review semua class di komponen Select untuk konsistensi.

### Files Affected
- `src/components/ui/select.tsx`

### Verification
- Buka halaman yang menggunakan Select (FilterBar, admin settings, dll)
- Dropdown tampil dengan background putih dan styling yang konsisten

---

## Bug 4: Admin Tidak Diarahkan ke Dashboard Admin Setelah Login

### Root Cause
`login/page.tsx` line 66 hardcoded `router.push('/')` tanpa memeriksa role user.

### Fix
Terapkan middleware-based role redirect (Opsi A — lihat Bug 6 untuk detail middleware). Setelah login:
1. Simpan `role` ke cookie (non-httpOnly, bisa dibaca middleware)
2. Middleware menangani redirect berdasarkan path + role
3. Untuk admin: redirect ke `/admin` setelah login

### Files Affected
- `src/app/(auth)/login/page.tsx`
- `src/middleware.ts` (file baru)

---

## Bug 5: Guest Browsing + Login-on-Buy dengan Return URL

### Root Cause
Saat user tidak login klik "Beli", `CartContext.addItem()` gagal dengan 401 dan hanya menampilkan toast "Silakan login untuk menambah ke keranjang."

### Fix
1. Buat custom hook `useRequireAuth()`:
   - Return function `requireAuth(action: () => void)`
   - Cek `isAuthenticated` — jika belum, simpan `window.location.pathname` ke `returnUrl` query param
   - Redirect ke `/login?returnUrl=<current_path>`
2. Update `login/page.tsx`: setelah login sukses, baca `returnUrl` dari search params
   - Jika ada dan valid (path internal, dimulai dengan `/`), redirect ke `returnUrl`
   - Jika tidak ada, redirect berdasarkan role (lihat Bug 4/6)
3. Terapkan di:
   - `ProductCard` — handler tombol "Beli"
   - `DetailProductPage` — handler tombol "Beli" di bottom CTA
4. Keamanan: validasi `returnUrl` hanya path internal:
   - Harus dimulai dengan `/`
   - Tidak boleh mengandung `://`, `//` (cegah protocol-relative URL attack)
   - Tidak boleh mengandung `@` (cegah URL credential injection)
   - Jika tidak valid, fallback ke redirect role-based

### Files Affected
- `src/hooks/useRequireAuth.ts` (file baru)
- `src/components/ProductCard.tsx`
- `src/app/(main)/product/[id]/page.tsx` (DetailProductPage)
- `src/app/(auth)/login/page.tsx`

### Verification
- Buka homepage tanpa login, klik "Beli" → redirect ke `/login?returnUrl=/`
- Setelah login → kembali ke homepage
- Buka detail produk tanpa login, klik "Beli" → redirect ke `/login?returnUrl=/product/<id>`
- Setelah login → kembali ke detail produk
- `returnUrl=https://evil.com` → diabaikan, redirect role-based

---

## Bug 6: Mitra Login Harus ke Dashboard Mitra + Tidak Lihat Tampilan User Biasa

### Root Cause
Sama dengan Bug 4 — `login/page.tsx` hardcoded `/`. Plus: main layout (`(main)/layout.tsx`) tidak memiliki guard untuk role mitra.

### Fix
**Middleware approach (Opsi A):**

1. Setelah login: set cookie `role` (non-httpOnly)
2. Buat `src/middleware.ts` dengan logic:
   ```
   /admin/* + role !== "ADMIN" → redirect /login
   /seller/* + role !== "MITRA" → redirect / (kecuali /seller/register)
   /, /search, /cart, /profile, /product/* + role === "MITRA" → redirect /seller
   ```
3. Setelah logout: hapus cookie `role`
4. `login/page.tsx`: setelah login, simpan role ke cookie, lalu redirect berdasarkan role
5. Hapus guard client-side di `admin/layout.tsx` (sudah ditangani middleware)

### Files Affected
- `src/middleware.ts` (file baru — lihat Bug 4)
- `src/app/(auth)/login/page.tsx`
- `src/lib/context/AuthContext.tsx` (logout: hapus cookie role)
- `src/app/admin/layout.tsx` (hapus guard client-side, middleware sudah handle)

### Verification
- Login sebagai mitra → langsung ke `/seller`
- Login sebagai admin → langsung ke `/admin`
- Login sebagai food saver → ke `/`
- Mitra akses `/` → redirect ke `/seller`
- Admin akses `/` → redirect ke `/admin`
- Food saver akses `/admin` → redirect ke `/login`
- Logout → cookie role hilang

---

## Bug 7: Akun Mitra Dummy untuk Produk Terdaftar

### Root Cause
Seed hanya membuat 1 akun mitra (`mitra@lastbite.id`) untuk 8 produk dengan 5 toko berbeda.

### Fix
Buat 5 akun MITRA di seed, satu per toko:

| Toko | Email | Password | Produk |
|------|-------|----------|--------|
| Dapur Bu Ani | `dapurbuani@lastbite.id` | `password123` | Ayam Preksu, Nasi Goreng Kampung |
| RM Padang Suharti | `rmpadang@lastbite.id` | `password123` | Nasi Padang |
| Bakeria | `bakeria@lastbite.id` | `password123` | Roti Coklat, Roti Keju |
| Warung Kopi Aroma | `kopiaroma@lastbite.id` | `password123` | Kopi Susu, Es Teh Tarik |
| Mie Ayam Mang Udin | `mieayam@lastbite.id` | `password123` | Mie Ayam Komplit |

Setiap produk di-assign `mitraId` ke akun mitra yang sesuai dengan `storeName`-nya.

### Files Affected
- `backend/prisma/seed.ts`

### Verification
- Run `npx prisma db seed`
- Login sebagai `dapurbuani@lastbite.id` → dashboard mitra menampilkan 2 produk Dapur Bu Ani
- Login sebagai `bakeria@lastbite.id` → dashboard mitra menampilkan 2 produk Bakeria

---

## Parallel Execution Plan

```
WAVE 1 (paralel):
  Bug 1: Foto Produk
  Bug 5: Guest + Beli→Login

WAVE 2 (setelah Wave 1):
  Bug 4 + 6: Middleware + Auth Routing (dikerjakan sebagai 1 unit — share file middleware.ts dan login/page.tsx)

WAVE 3 (paralel):
  Bug 2: AI History Check
  Bug 3: Select Styling
  Bug 7: Mitra Dummy
```

---

## Files Summary

| File | Bugs | Action |
|------|------|--------|
| `backend/prisma/seed.ts` | 1, 7 | Update imageUrl + tambah akun mitra |
| Backend: tambah endpoint | 2 | `GET /orders/has-history` |
| `src/middleware.ts` | 4, 6 | NEW: role-based routing guard |
| `src/app/(auth)/login/page.tsx` | 4, 5, 6 | Role redirect + returnUrl |
| `src/lib/context/AuthContext.tsx` | 6 | Logout: hapus cookie role |
| `src/components/AIRecommendation.tsx` | 2 | Rename label, hapus badge AI |
| `src/app/(main)/page.tsx` | 2 | Conditional render AIRecommendation |
| `src/hooks/useHasPurchaseHistory.ts` | 2 | NEW |
| `src/hooks/useRequireAuth.ts` | 5 | NEW |
| `src/components/ProductCard.tsx` | 5 | Pakai useRequireAuth |
| `src/app/(main)/product/[id]/page.tsx` | 5 | Pakai useRequireAuth |
| `src/components/ui/select.tsx` | 3 | Fix bg-input-background |
| `src/app/admin/layout.tsx` | 6 | Hapus client-side guard |
