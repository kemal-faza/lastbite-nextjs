# Vite to Next.js Migration — Target Bersih

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development for sequential chains, superpowers:dispatching-parallel-agents for parallel batches, or superpowers:executing-plans for inline execution. See Task Grouping section for strategy.

**Goal:** Migrate LastBite from Vite+react-router to Next.js 15 App Router, copying to clean target folder `lastbite-nextjs/` with idiomatic Next.js structure (Phase 1+2 combined). Source `prototype/` untouched.

**Architecture:** Root layout wraps Providers → route group `(main)` provides MainLayout+BottomNav for consumer routes → standalone `seller/` routes for seller pages. All `react-router` imports replaced by `next/navigation` equivalents. MUI removed.

**Execution Strategy:** Hybrid — 1 sequential foundation chain, then parallel page batch, then final verification chain.

**Tech Stack:** Next.js 15.3, React 18.3, Tailwind CSS 4.1, next/navigation, next/link, shadcn/ui

---

## File Structure

### Create (new files)
| File | Purpose |
|------|---------|
| `package.json` | Project manifest with Next.js |
| `tsconfig.json` | TypeScript config for Next.js |
| `postcss.config.mjs` | Tailwind CSS v4 PostCSS plugin |
| `next.config.ts` | Next.js minimal config |
| `src/app/layout.tsx` | Root layout: html, body, Providers |
| `src/app/providers.tsx` | 'use client' context wrappers |
| `src/app/globals.css` | CSS entry: `@import '../styles/index.css'` |
| `src/app/(main)/layout.tsx` | MainLayout wrapper + BottomNav |
| `src/app/(main)/page.tsx` | Home page |
| `src/app/(main)/search/page.tsx` | Search page |
| `src/app/(main)/cart/page.tsx` | Cart page |
| `src/app/(main)/orders/page.tsx` | Orders page |
| `src/app/(main)/profile/page.tsx` | Profile page |
| `src/app/(main)/wishlist/page.tsx` | Wishlist page |
| `src/app/(main)/product/[id]/page.tsx` | Detail Product |
| `src/app/(main)/order/confirm/[id]/page.tsx` | Confirmation |
| `src/app/seller/page.tsx` | Seller Dashboard |
| `src/app/seller/add/page.tsx` | Add Product |

### Copy from `prototype/` (no modification)
| Source | Target |
|--------|--------|
| `public/*` | `public/*` |
| `src/styles/fonts.css` | `src/styles/fonts.css` |
| `src/styles/globals.css` | `src/styles/globals.css` |
| `src/styles/index.css` | `src/styles/index.css` |
| `src/styles/tailwind.css` | `src/styles/tailwind.css` |
| `src/styles/theme.css` | `src/styles/theme.css` |
| `src/app/components/ui/*` (48 files) | `src/components/ui/*` |
| `src/app/components/figma/ImageWithFallback.tsx` | `src/components/figma/ImageWithFallback.tsx` |
| `src/app/components/Header.tsx` | `src/components/Header.tsx` |
| `src/app/components/SearchBar.tsx` | `src/components/SearchBar.tsx` |
| `src/app/components/CategoryFilter.tsx` | `src/components/CategoryFilter.tsx` |
| `src/app/components/ProductGrid.tsx` | `src/components/ProductGrid.tsx` |
| `src/app/components/FilterBar.tsx` | `src/components/FilterBar.tsx` |
| `src/app/components/FilterModal.tsx` | `src/components/FilterModal.tsx` |
| `src/app/components/MapModal.tsx` | `src/components/MapModal.tsx` |
| `src/app/components/QueueIndicator.tsx` | `src/components/QueueIndicator.tsx` |
| `src/app/data/products.ts` | `src/lib/data/products.ts` |

### Copy + modify (routing adaptation)
| Source | Target | Changes |
|--------|--------|---------|
| `src/app/context/CartContext.tsx` | `src/lib/context/CartContext.tsx` | Add `'use client'`; fix import path |
| `src/app/context/WishlistContext.tsx` | `src/lib/context/WishlistContext.tsx` | Add `'use client'` |
| `src/app/context/OrderContext.tsx` | `src/lib/context/OrderContext.tsx` | Add `'use client'` |
| `src/app/components/BottomNav.tsx` | `src/components/BottomNav.tsx` | `NavLink` → `Link` + `usePathname`; add `'use client'` |
| `src/app/components/ProductCard.tsx` | `src/components/ProductCard.tsx` | `useNavigate` → `useRouter`; add `'use client'` |
| `src/app/components/AIRecommendation.tsx` | `src/components/AIRecommendation.tsx` | `useNavigate` → `useRouter`; add `'use client'` |
| `src/app/layouts/MainLayout.tsx` | N/A (merged) | `Outlet` → `children` — merged into `(main)/layout.tsx` |
| `src/app/pages/Home.tsx` | `src/app/(main)/page.tsx` | Add `'use client'`; fix imports |
| `src/app/pages/Search.tsx` | `src/app/(main)/search/page.tsx` | Add `'use client'`; fix imports |
| `src/app/pages/Cart.tsx` | `src/app/(main)/cart/page.tsx` | Add `'use client'`; `useNavigate` → `useRouter`; `Link` → `next/link` |
| `src/app/pages/Orders.tsx` | `src/app/(main)/orders/page.tsx` | Add `'use client'`; `useNavigate` → `useRouter`; fix imports |
| `src/app/pages/Profile.tsx` | `src/app/(main)/profile/page.tsx` | Add `'use client'`; `useNavigate` → `useRouter`; fix imports |
| `src/app/pages/Wishlist.tsx` | `src/app/(main)/wishlist/page.tsx` | Add `'use client'`; `useNavigate` → `useRouter`; `Link` → `next/link` |
| `src/app/pages/DetailProduct.tsx` | `src/app/(main)/product/[id]/page.tsx` | Add `'use client'`; `useNavigate`/`useParams` → `next/navigation` |
| `src/app/pages/Confirmation.tsx` | `src/app/(main)/order/confirm/[id]/page.tsx` | Add `'use client'`; `useNavigate`/`useParams` → `next/navigation` |
| `src/app/pages/SellerDashboard.tsx` | `src/app/seller/page.tsx` | Add `'use client'`; `useNavigate` → `useRouter`; fix imports |
| `src/app/pages/AddProduct.tsx` | `src/app/seller/add/page.tsx` | Add `'use client'`; `useNavigate` → `useRouter`; fix imports |

---

## Task Grouping

**Sequential Chain 1: Foundation** — Tasks 1-4 must run in order (each depends on prior artifacts)

**Parallel Batch 1: Component Adaptation** — Tasks 5-6 are independent of each other, both depend on Chain 1

**Parallel Batch 2: Page Migration** — Tasks 7-15 are independent of each other, all depend on Parallel Batch 1

**Sequential Chain 2: Final Verification** — Task 16 depends on all pages being migrated

---

## Pre-flight

- [ ] **Step 0: Init git in target directory**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git init
git add -A
git commit -m "chore: initial commit — CONTEXT.md, design spec, empty plan"
```

Source: `/mnt/DATA/Documents/Praktikum/Interaksi Manusia dan Komputer/prototype` (read-only, no modifications)

---

### Task 1: Copy Static Assets + Create Config Files

**Type:** `AFK`
**Blocked by:** None

**Purpose:** Copy all files that don't need modification (styles, assets, static components, data) and create all project configuration files.

- [ ] **Step 1: Copy `public/` assets**

```bash
cp -r /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/public/* /mnt/DATA/Documents/Code/lastbite-nextjs/public/
```

- [ ] **Step 2: Copy `src/styles/` (5 CSS files)**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/styles
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/styles/fonts.css /mnt/DATA/Documents/Code/lastbite-nextjs/src/styles/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/styles/globals.css /mnt/DATA/Documents/Code/lastbite-nextjs/src/styles/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/styles/index.css /mnt/DATA/Documents/Code/lastbite-nextjs/src/styles/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/styles/tailwind.css /mnt/DATA/Documents/Code/lastbite-nextjs/src/styles/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/styles/theme.css /mnt/DATA/Documents/Code/lastbite-nextjs/src/styles/
```

- [ ] **Step 3: Copy `src/app/components/ui/` (48 shadcn/ui files)**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/ui
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/ui/*.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/ui/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/ui/*.ts /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/ui/ 2>/dev/null
```

- [ ] **Step 4: Copy `ImageWithFallback` + static components**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/figma
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/figma/ImageWithFallback.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/figma/

# Static components (no routing deps)
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/Header.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/SearchBar.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/CategoryFilter.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/ProductGrid.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/FilterBar.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/FilterModal.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/MapModal.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/QueueIndicator.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
```

- [ ] **Step 5: Copy data + context files (with import path fix for context)**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/lib/data
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/lib/context

# Copy data
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/data/products.ts /mnt/DATA/Documents/Code/lastbite-nextjs/src/lib/data/

# Copy context
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/context/CartContext.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/lib/context/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/context/WishlistContext.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/lib/context/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/context/OrderContext.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/lib/context/
```

- [ ] **Step 6: Copy routing-dependent components (will adapt in Tasks 5-6)**

```bash
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/BottomNav.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/ProductCard.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
cp /mnt/DATA/Documents/Praktikum/Interaksi\ Manusia\ dan\ Komputer/prototype/src/app/components/AIRecommendation.tsx /mnt/DATA/Documents/Code/lastbite-nextjs/src/components/
```

- [ ] **Step 7: Create `package.json`**

```json
{
  "name": "lastbite",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "canvas-confetti": "1.9.4",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.12",
    "@types/node": "^22.15.0",
    "tailwindcss": "^4.1.12",
    "typescript": "^5"
  }
}
```

- [ ] **Step 8: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [
      { "name": "next" }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 9: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 10: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 11: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: copy static assets + project config for Next.js 15"
```

---

### Task 2: Create Root Layout, Providers, Globals CSS

**Type:** `AFK`
**Blocked by:** Task 1

**Purpose:** Create the three foundational Next.js app files: root layout, client providers, and CSS entry.

- [ ] **Step 1: Create `src/app/globals.css`**

```css
@import '../styles/index.css';
```

- [ ] **Step 2: Create `src/app/providers.tsx`**

Note: `ThemeProvider` from `next-themes` is REQUIRED because `sonner.tsx` component uses `useTheme()`. Without it, runtime error: `useTheme must be used within a ThemeProvider`. Use `attribute="class"` so `.dark` class toggles on `<html>`, matching the CSS variant `@custom-variant dark (&:is(.dark *))` in theme.css.

```tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/lib/context/CartContext';
import { WishlistProvider } from '@/lib/context/WishlistContext';
import { OrderProvider } from '@/lib/context/OrderContext';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            {children}
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Create `src/app/layout.tsx`**

Note: `suppressHydrationWarning` on `<html>` is required by `next-themes` to prevent hydration mismatch when dark mode is active on initial render.

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'LastBite - Solusi Makanan Surplus',
  description: 'Aplikasi makanan surplus - hemat dan kurangi food waste',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: root layout, providers, globals CSS"
```

---

### Task 3: Install Dependencies + Verify Blank Dev Server

**Type:** `AFK`
**Blocked by:** Task 2

**Purpose:** Install npm dependencies and verify Next.js dev server starts on port 3000.

- [ ] **Step 1: Install dependencies**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
npm install
```

Expected: npm install completes without errors.

- [ ] **Step 2: Start dev server (background, kill after confirming)**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
timeout 30 npm run dev &
sleep 10
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: HTTP 200 or 404 (no pages yet). Server starts without compile errors.

If compile errors appear, fix before proceeding.

- [ ] **Step 3: Kill dev server**

```bash
kill $(lsof -t -i:3000) 2>/dev/null
```

- [ ] **Step 4: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "chore: install deps, verify dev server"
```

---

### Task 4: Add 'use client' to Context Files + Fix Import Paths

**Type:** `AFK`
**Blocked by:** Task 1

**Purpose:** Context files were copied from `src/app/context/` to `src/lib/context/`. They use React hooks (useReducer, useEffect) which require `'use client'` in Next.js App Router. CartContext also has a relative import that needs updating to `@/` alias.

- [ ] **Step 1: Read all three context files**

Read `src/lib/context/CartContext.tsx`, `src/lib/context/WishlistContext.tsx`, `src/lib/context/OrderContext.tsx` to confirm current state. (Copied from source in Task 1 Step 5.)

- [ ] **Step 2: Fix CartContext.tsx**

Add `'use client';` at line 1. Replace the data import:

```tsx
// Old (line ~2):
import { products } from '../data/products';

// New:
import { products } from '@/lib/data/products';
```

Final first 3 lines:
```tsx
'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { products } from '@/lib/data/products';
```

- [ ] **Step 3: Fix WishlistContext.tsx**

Add `'use client';` at line 1. No import path changes needed (no relative imports to data or components).

- [ ] **Step 4: Fix OrderContext.tsx**

Add `'use client';` at line 1. No import path changes needed (only uses React and localStorage).

- [ ] **Step 5: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "fix: add 'use client' to context files, fix CartContext import"
```

---

### Task 5: Adapt BottomNav + Create (main)/layout.tsx

**Type:** `AFK`
**Blocked by:** Task 3

**Purpose:** Replace `NavLink` from react-router with `Link` + `usePathname` from next/navigation. Create the route group layout that wraps consumer pages with MainLayout + BottomNav.

- [ ] **Step 1: Rewrite `src/components/BottomNav.tsx`**

```tsx
'use client';

import { Home, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'home', path: '/', label: 'Beranda', icon: Home },
  { id: 'search', path: '/search', label: 'Cari', icon: Search },
  { id: 'cart', path: '/cart', label: 'Keranjang', icon: ShoppingBag },
  { id: 'profile', path: '/profile', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${
                isActive ? 'text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-[var(--primary)]/20' : ''}`} />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/app/(main)/layout.tsx`**

```tsx
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/BottomNav';

export default function MainRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: BottomNav adapted to next/navigation + (main)/layout"
```

---

### Task 6: Adapt ProductCard + AIRecommendation Routing

**Type:** `AFK`
**Blocked by:** Task 3

**Purpose:** Replace `useNavigate` from react-router with `useRouter` from next/navigation in both shared components.

- [ ] **Step 1: Rewrite `src/components/ProductCard.tsx`**

Read the current `src/components/ProductCard.tsx`. Apply these changes:

Change import:
```tsx
// Remove:
import { useNavigate } from 'react-router';

// Replace with:
import { useRouter } from 'next/navigation';
```

Add `'use client';` at line 1 if not present.

Change usage:
```tsx
// Remove:
const navigate = useNavigate();

// Replace with:
const router = useRouter();
```

Change navigation:
```tsx
// Old:
onClick={() => navigate('/product/' + product.id)}

// New:
onClick={() => router.push('/product/' + product.id)}
```

Also fix context import paths:
```tsx
// Old:
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// New:
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
```

And fix data import:
```tsx
// Old:
import { type Product } from '../data/products';

// New:
import { type Product } from '@/lib/data/products';
```

- [ ] **Step 2: Rewrite `src/components/AIRecommendation.tsx`**

Read the current `src/components/AIRecommendation.tsx`. Apply these changes:

Change import:
```tsx
// Remove:
import { useNavigate } from 'react-router';

// Replace with:
import { useRouter } from 'next/navigation';
```

Add `'use client';` at line 1 if not present.

Change usage:
```tsx
// Remove:
const navigate = useNavigate();

// Replace with:
const router = useRouter();
```

Change all navigations:
```tsx
// Old pattern:
onClick={() => navigate(`/product/${product.id}`)}
navigate(`/product/${product.id}`)

// New pattern:
onClick={() => router.push(`/product/${product.id}`)}
router.push(`/product/${product.id}`)
```

Fix import paths:
```tsx
// Old:
import { products, type Product } from '../data/products';

// New:
import { products, type Product } from '@/lib/data/products';
```

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "fix: ProductCard + AIRecommendation adapt to next/navigation"
```

---

### Task 7: Migrate Home Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Home.tsx to `(main)/page.tsx`, add `'use client'`, fix all import paths.

- [ ] **Step 1: Read source page**

Read `/mnt/DATA/Documents/Praktikum/Interaksi Manusia dan Komputer/prototype/src/app/pages/Home.tsx` to get current content.

- [ ] **Step 2: Create `src/app/(main)/page.tsx`**

Add `'use client';` at line 1. Copy the content of Home.tsx. Fix all import paths:

```tsx
'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { AIRecommendation } from '@/components/AIRecommendation';
import { FilterBar } from '@/components/FilterBar';
import type { SortOption } from '@/components/FilterBar';
import type { FilterValues } from '@/components/FilterModal';

export default function HomePage() {
  // ... (rest of content exactly as in Home.tsx, no changes needed beyond imports)
}
```

- [ ] **Step 3: Verify import path accuracy**

The page file is at `src/app/(main)/page.tsx`. Components are at `src/components/`. With the `@/*` path alias mapping to `./src/*`, imports like `@/components/Header` resolve correctly.

- [ ] **Step 4: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Home page to App Router"
```

---

### Task 8: Migrate Search Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Search.tsx to `(main)/search/page.tsx`, adapt routing imports.

- [ ] **Step 1: Create directory**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/app/\(main\)/search
```

- [ ] **Step 2: Create `src/app/(main)/search/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/Search.tsx`. Fix imports:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { Search as SearchIcon, Clock, TrendingUp, X } from 'lucide-react';
import { products } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
// ... rest of file unchanged from Search.tsx
```

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Search page to App Router"
```

---

### Task 9: Migrate Wishlist Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Wishlist.tsx to `(main)/wishlist/page.tsx`, adapt routing and Link.

- [ ] **Step 1: Create directory**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/app/\(main\)/wishlist
```

- [ ] **Step 2: Create `src/app/(main)/wishlist/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/Wishlist.tsx`.

Apply these changes to the copy:
- `import { useNavigate } from 'react-router'` → `import { useRouter } from 'next/navigation'`
- `import { Link } from 'react-router'` → `import Link from 'next/link'` (if used)
- `const navigate = useNavigate()` → `const router = useRouter()`
- `navigate(` → `router.push(`
- All relative imports → `@/` alias imports

Fix imports:
```tsx
import { useWishlist } from '@/lib/context/WishlistContext';
import { products } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
```

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Wishlist page to App Router"
```

---

### Task 10: Migrate Profile Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Profile.tsx to `(main)/profile/page.tsx`, replace `useNavigate` with `useRouter`.

- [ ] **Step 1: Create directory**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/app/\(main\)/profile
```

- [ ] **Step 2: Create `src/app/(main)/profile/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/Profile.tsx`.

Apply changes:
- `import { useNavigate } from 'react-router'` → `import { useRouter } from 'next/navigation'`
- `const navigate = useNavigate()` → `const router = useRouter()`
- `navigate(` → `router.push(`
- No `@/` alias fixes needed (Profile.tsx likely has no component imports other than lucide-react)

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Profile page to App Router"
```

---

### Task 11: Migrate Cart Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Cart.tsx to `(main)/cart/page.tsx`, replace `useNavigate` and `Link` from react-router.

- [ ] **Step 1: Create directory**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/app/\(main\)/cart
```

- [ ] **Step 2: Create `src/app/(main)/cart/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/Cart.tsx`.

Apply these find-and-replace operations:
1. `import { Link, useNavigate } from 'react-router'` → `import Link from 'next/link';` on one line, then `import { useRouter } from 'next/navigation';` on the next
2. `const navigate = useNavigate()` → `const router = useRouter()`
3. All `navigate(` → `router.push(`
4. Fix context imports:
   - `import { useCart } from '../../context/CartContext'` (or similar) → `import { useCart } from '@/lib/context/CartContext'`
   - `import { useOrders } from '../../context/OrderContext'` (or similar) → `import { useOrders } from '@/lib/context/OrderContext'`
5. Fix data import:
   - `import { products } from '../../data/products'` (or similar) → `import { products } from '@/lib/data/products'`

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Cart page to App Router"
```

---

### Task 12: Migrate Orders Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Orders.tsx to `(main)/orders/page.tsx`, replace `useNavigate` → `useRouter`.

- [ ] **Step 1: Create directory**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/app/\(main\)/orders
```

- [ ] **Step 2: Create `src/app/(main)/orders/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/Orders.tsx`.

Apply changes:
- `import { useNavigate } from 'react-router'` → `import { useRouter } from 'next/navigation'`
- `const navigate = useNavigate()` → `const router = useRouter()`
- `navigate(` → `router.push(`
- Fix context import: `import { useOrders } from '@/lib/context/OrderContext'`

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Orders page to App Router"
```

---

### Task 13: Migrate DetailProduct Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy DetailProduct.tsx to `(main)/product/[id]/page.tsx`, replace `useNavigate`/`useParams` from react-router with `next/navigation` equivalents.

- [ ] **Step 1: Create directory**

```bash
mkdir -p "/mnt/DATA/Documents/Code/lastbite-nextjs/src/app/(main)/product/[id]"
```

- [ ] **Step 2: Create `src/app/(main)/product/[id]/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/DetailProduct.tsx`.

Apply changes:
1. `import { useParams, useNavigate } from 'react-router'` → `import { useParams, useRouter } from 'next/navigation'`
2. `const navigate = useNavigate()` → `const router = useRouter()`
3. `useParams()` → `useParams()` (API identical — params from URL path)
4. All `navigate(` → `router.push(`
5. Fix data import: `import { products } from '@/lib/data/products'`
6. Fix component imports: `@/components/AIRecommendation`, `@/components/QueueIndicator`, `@/components/MapModal`
7. Fix context imports: `@/lib/context/CartContext`, `@/lib/context/WishlistContext`

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate DetailProduct page to App Router"
```

---

### Task 14: Migrate Confirmation Page

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy Confirmation.tsx to `(main)/order/confirm/[id]/page.tsx`.

- [ ] **Step 1: Create directory**

```bash
mkdir -p "/mnt/DATA/Documents/Code/lastbite-nextjs/src/app/(main)/order/confirm/[id]"
```

- [ ] **Step 2: Create `src/app/(main)/order/confirm/[id]/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/Confirmation.tsx`.

Apply changes:
- `import { useParams, useNavigate } from 'react-router'` → `import { useParams, useRouter } from 'next/navigation'`
- `const navigate = useNavigate()` → `const router = useRouter()`
- All `navigate(` → `router.push(`
- Fix context import: `import { useOrders } from '@/lib/context/OrderContext'`

- [ ] **Step 3: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Confirmation page to App Router"
```

---

### Task 15: Migrate Seller Pages

**Type:** `AFK`
**Blocked by:** Task 5, Task 6

**Purpose:** Copy SellerDashboard.tsx and AddProduct.tsx to standalone seller routes (no MainLayout wrapper).

- [ ] **Step 1: Create directories**

```bash
mkdir -p /mnt/DATA/Documents/Code/lastbite-nextjs/src/app/seller/add
```

- [ ] **Step 2: Create `src/app/seller/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/SellerDashboard.tsx`.

Apply changes:
- `import { useNavigate } from 'react-router'` → `import { useRouter } from 'next/navigation'`
- `const navigate = useNavigate()` → `const router = useRouter()`
- `navigate(` → `router.push(`
- Fix any relative imports to `@/` alias

- [ ] **Step 3: Create `src/app/seller/add/page.tsx`**

Add `'use client';` at line 1. Copy content from `prototype/src/app/pages/AddProduct.tsx`.

Apply changes:
- `import { useNavigate } from 'react-router'` → `import { useRouter } from 'next/navigation'`
- `const navigate = useNavigate()` → `const router = useRouter()`
- `navigate(` → `router.push(`
- Fix any relative imports to `@/` alias

- [ ] **Step 4: Commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "feat: migrate Seller pages to App Router"
```

---

### Task 16: Build Verification + Cleanup

**Type:** `AFK`
**Blocked by:** Tasks 7-15 (all pages migrated)

**Purpose:** Run full production build, verify all routes compile, fix any remaining issues.

- [ ] **Step 1: Run production build**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
npm run build
```

Expected: `next build` succeeds. All routes compiled in output.

If errors:
- Check for missing `'use client'` directives
- Check for remaining `react-router` imports (grep `react-router` in src/)
- Check for wrong import paths (grep `from '..` patterns in page files)
- Fix and re-run build

- [ ] **Step 2: Check for remaining react-router imports**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
grep -r "react-router" src/ --include="*.tsx" --include="*.ts"
```

Expected: No matches. If matches found, fix each file.

- [ ] **Step 3: Check for remaining MUI imports**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
grep -r "@mui\|@emotion" src/ --include="*.tsx" --include="*.ts"
```

Expected: No matches. If matches found, remove the import and adapt the component. MUI dependencies are not installed.

- [ ] **Step 4: Start dev server and manually verify key routes**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
npm run dev
```

Open in browser, verify:
1. `/` — Home page renders with Header, SearchBar, AI recs, ProductGrid
2. `/search` — Search page renders
3. `/cart` — Cart page renders (empty state)
4. `/orders` — Orders page renders (empty state)
5. `/profile` — Profile page renders
6. `/wishlist` — Wishlist page renders
7. `/product/1` — Detail product renders with dynamic param
8. `/order/confirm/test-123` — Confirmation renders
9. `/seller` — Seller dashboard renders (no BottomNav)
10. `/seller/add` — Add product renders (no BottomNav)

- [ ] **Step 5: Final commit**

```bash
cd /mnt/DATA/Documents/Code/lastbite-nextjs
git add -A
git commit -m "chore: build verification, cleanup remaining react-router/MUI refs"
```

---

## Verification Checklist (Task 16)

1. `npm run build` — zero errors, all routes compiled
2. No `react-router` imports anywhere in `src/`
3. No `@mui` or `@emotion` imports anywhere in `src/`
4. `npm run dev` starts on port 3000
5. Home (`/`) renders all components
6. Search (`/search`) renders with filtering
7. Cart (`/cart`) shows empty state
8. Orders (`/orders`) shows empty state
9. Profile (`/profile`) renders with menu links
10. Wishlist (`/wishlist`) renders with toggle
11. Detail product (`/product/1`) renders with dynamic param
12. Confirmation (`/order/confirm/test-456`) renders
13. Seller (`/seller`) renders dashboard
14. Seller add (`/seller/add`) renders form
15. BottomNav appears on consumer routes, absent on seller routes
16. Cart add to cart, wishlist toggle, order checkout flow works
