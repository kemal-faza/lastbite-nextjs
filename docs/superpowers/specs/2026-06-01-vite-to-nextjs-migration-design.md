# Spec: Migrasi Vite ke Next.js — Target Bersih

## Overview

Migrasi aplikasi LastBite dari React+Vite ke Next.js 15 App Router ke folder target bersih
(`lastbite-nextjs/`), dengan struktur folder idiomatic Next.js sekaligus (Fase 1 + Fase 2
digabung). Project sumber di `prototype/` tidak dimodifikasi.

## Architecture

### Current (Vite)
```
index.html → src/main.tsx → App (providers → RouterProvider → routes)
```

### Target (Next.js)
```
app/layout.tsx (html, body, Providers)
  (main)/layout.tsx (MainLayout + BottomNav) → consumer pages
  seller/page.tsx, seller/add/page.tsx (standalone, no MainLayout)
```

## Folder Structure

```
lastbite-nextjs/
  next.config.ts
  tsconfig.json
  postcss.config.mjs
  package.json
  public/                          # Copy dari prototype/public/
  src/
    app/
      layout.tsx                   # Root layout: html, body, Providers
      globals.css                  # @import '../styles/index.css'
      providers.tsx                # 'use client' — Cart, Wishlist, Order providers
      (main)/
        layout.tsx                 # MainLayout wrapper + BottomNav
        page.tsx                   # Home
        search/page.tsx            # Search
        cart/page.tsx              # Cart
        orders/page.tsx            # Orders
        profile/page.tsx           # Profile
        wishlist/page.tsx          # Wishlist
        product/[id]/page.tsx      # Detail Product
        order/confirm/[id]/page.tsx  # Confirmation
      seller/
        page.tsx                   # Seller Dashboard
        add/page.tsx               # Add Product
    components/                    # ex src/app/components/
      Header.tsx, SearchBar.tsx, ProductCard.tsx, ...
      ui/                          # 48 shadcn/ui components
      figma/
        ImageWithFallback.tsx
    lib/
      context/
        CartContext.tsx
        WishlistContext.tsx
        OrderContext.tsx
      data/
        products.ts
    styles/                        # Copy dari prototype/src/styles/
      fonts.css
      index.css
      tailwind.css
      theme.css
      globals.css
```

## Routes Mapping

| Vite (react-router) | Next.js (App Router) | Layout |
|---------------------|----------------------|--------|
| `/` | `(main)/page.tsx` | MainLayout + BottomNav |
| `/search` | `(main)/search/page.tsx` | MainLayout + BottomNav |
| `/cart` | `(main)/cart/page.tsx` | MainLayout + BottomNav |
| `/orders` | `(main)/orders/page.tsx` | MainLayout + BottomNav |
| `/profile` | `(main)/profile/page.tsx` | MainLayout + BottomNav |
| `/wishlist` | `(main)/wishlist/page.tsx` | MainLayout + BottomNav |
| `/product/:id` | `(main)/product/[id]/page.tsx` | MainLayout + BottomNav |
| `/order/confirm/:id` | `(main)/order/confirm/[id]/page.tsx` | MainLayout + BottomNav |
| `/seller` | `seller/page.tsx` | None (standalone) |
| `/seller/add` | `seller/add/page.tsx` | None (standalone) |

## Routing Migration Details

| Komponen | Dari (react-router) | Ke (next/navigation) |
|----------|---------------------|---------------------|
| BottomNav | `<NavLink>` render props | `<Link href>` + `usePathname()` |
| ProductCard | `useNavigate()` | `useRouter()` → `router.push()` |
| AIRecommendation | `useNavigate()` | `useRouter()` → `router.push()` |
| Semua page | `useParams()` | `useParams()` (identik) |
| Semua page | `useNavigate()` | `useRouter()` → `router.push/back` |
| MainLayout | `<Outlet />` | `{children}` |

## 'use client' Boundaries

| File | Directive |
|------|-----------|
| Semua page files | `'use client'` |
| `providers.tsx` | `'use client'` (includes ThemeProvider from next-themes) |
| Semua context (CartContext, WishlistContext, OrderContext) | `'use client'` |
| Semua komponen dengan hooks (useState, useRouter, usePathname) | `'use client'` |
| Root `layout.tsx` | Server component (with `suppressHydrationWarning` on `<html>`) |
| `(main)/layout.tsx` | Server component |

## `next-themes` — Bug Fix

`sonner.tsx` uses `useTheme()` from `next-themes`, but the source project never mounted
`ThemeProvider`. This causes a runtime error. The migration adds `ThemeProvider` wrapping
in `providers.tsx` with `attribute="class"` to toggle the `.dark` class on `<html>`,
matching the CSS variant `@custom-variant dark (&:is(.dark *))` in `theme.css`.
`suppressHydrationWarning` on `<html>` prevents hydration mismatch.

## File Changes Summary

### Copy (tidak modifikasi)
- `public/*` — semua assets
- `src/styles/*` — semua 5 file CSS
- `src/components/ui/*` — 48 shadcn/ui files
- `src/components/figma/ImageWithFallback.tsx`
- `src/lib/data/products.ts`
- Semua komponen non-routing: Header, SearchBar, CategoryFilter, FilterBar, FilterModal, MapModal, QueueIndicator

### Copy + modifikasi (routing imports)
- `src/lib/context/*` — tambah `'use client'` kalau belum ada
- `src/components/ProductCard.tsx` — `useNavigate` → `useRouter`
- `src/components/AIRecommendation.tsx` — `useNavigate` → `useRouter`
- `src/components/BottomNav.tsx` — `NavLink` → `Link` + `usePathname`
- Semua page files — `Link`/`useNavigate`/`useParams` dari `react-router` → `next/navigation`

### Create new
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `package.json` (adapt dari prototype)
- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/app/globals.css`
- `src/app/(main)/layout.tsx`

### Merge / inline
- `src/app/layouts/MainLayout.tsx` → di-merge ke `(main)/layout.tsx`

## Dependencies

### Removed
- `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `react-router`
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`

### Added
- `next@^15.3.0`, `@tailwindcss/postcss@^4.1.12`, `@types/node@^22.15.0`

### Unchanged
- `react`, `react-dom` (18.3.1), `tailwindcss` (4.1.12), `tw-animate-css`,
  `lucide-react`, `motion`, `@radix-ui/*`, `canvas-confetti`, `recharts`, `sonner`,
  `class-variance-authority`, `clsx`, `tailwind-merge`, dan dependency utility lainnya.

## Error Handling & Risks

| Risiko | Mitigasi |
|--------|----------|
| Path import rusak karena file pindah | Path alias `@/*` → `./src/*`; verifikasi `tsc --noEmit` |
| Lupa `'use client'` | Next.js compile error — fix langsung |
| `next-themes` ThemeProvider tidak ada (source bug) | `sonner.tsx` pakai `useTheme()` tapi ThemeProvider tidak pernah di-mount. Fix: tambah ThemeProvider di `providers.tsx` |
| Figma asset path tidak dikenali | Tidak ada `figma:asset/` import di source — aman |
| Tailwind v4 PostCSS perlu plugin berbeda | `@tailwindcss/vite` → `@tailwindcss/postcss` |
| MUI import tersisa | Grep `@mui` sebelum install; hapus semua |
| `sonner` Toaster tidak ada | Pindah dari `App.tsx` (dihapus) ke `providers.tsx` |

## Testing Strategy

1. `npm run dev` — no startup errors, port 3000
2. `npm run build` — no type/build errors
3. Navigate all 10 routes manually di browser
4. Verify BottomNav muncul di consumer routes, tidak di seller routes
5. Test cart add/remove/checkout flow
6. Test wishlist toggle
7. Test order confirmation dengan timer pickup
8. Verify semua gambar produk load
