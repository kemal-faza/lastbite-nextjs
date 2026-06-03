# Phosphor Icons + shadcn Component Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:dispatching-parallel-agents. See the Task Grouping section for parallel vs sequential execution strategy.

**Goal:** Replace all Lucide icons with Phosphor Icons (Regular) and replace custom components with shadcn equivalents.

**Architecture:** Two sequential phases. Phase A: mechanical icon swap across ~76 files. Phase B: judgment-based component replacement across ~13 components. Each phase committed independently. No icon wrapper — direct import replacement from `lucide-react` to `@phosphor-icons/react`.

**Execution Strategy:** Hybrid — Phase A has a sequential prerequisite task (A1: install deps), then parallel batches (A2-A7: icon replacement by directory), then a sequential verification task (A8). Phase B is blocked by Phase A, then runs as parallel batches (B1-B5: component replacements grouped by type).

**Tech Stack:** Next.js 15, TypeScript, @phosphor-icons/react, shadcn/ui

---

## Task Grouping

### Sequential Chain 1: Phase A — Icon Migration

```
Task A1: Install deps + configure next.config (AFK, blocked by: None)
  ↓ depends on
Parallel Batch A: Icon replacement by directory group
  Task A2: Replace icons in src/components/ui/ (18 files) (AFK, blocked by: A1)
  Task A3: Replace icons in src/app/(auth)/ (3 files) (AFK, blocked by: A1)
  Task A4: Replace icons in src/app/(main)/ (9 files) (AFK, blocked by: A1)
  Task A5: Replace icons in src/app/admin/ (5 files) (AFK, blocked by: A1)
  Task A6: Replace icons in src/app/seller/ (5 files) (AFK, blocked by: A1)
  Task A7: Replace icons in src/components/ (21 files) (AFK, blocked by: A1)
  ↓ all must complete
Task A8: Phase A verification + remove lucide-react (AFK, blocked by: A2-A7)
```

### Sequential Chain 2: Phase B — Component Migration

```
Parallel Batch B1: Replace custom components (AFK, blocked by: Phase A complete)
  Task B1: FilterModal -> Sheet (AFK, blocked by: None within B)
  Task B2: MapModal -> Sheet (AFK, blocked by: None within B)
  Task B3: WriteReviewModal -> Sheet (AFK, blocked by: None within B)
  Task B4: NotificationCenter -> Sheet (AFK, blocked by: None within B)
  Task B5: SearchBar -> Command (AFK, blocked by: None within B)
  Task B6: CategoryFilter -> ToggleGroup (AFK, blocked by: None within B)
  Task B7: ProductCard -> Card + AspectRatio (AFK, blocked by: None within B)
  Task B8: ReviewList -> Card + Avatar (AFK, blocked by: None within B)
  Task B9: DashboardStatCards -> Card (AFK, blocked by: None within B)
  Task B10: ProductManagementList -> Card + Table (AFK, blocked by: None within B)
  Task B11: NotificationBell + OrderStatusBadge -> Badge verify (AFK, blocked by: None within B)
  ↓ all must complete
Task B12: Phase B verification + cleanup (AFK, blocked by: B1-B11)
```

---

## Phase A: Icon Migration

### Task A1: Install @phosphor-icons/react and configure Next.js

**Type:** `AFK`
**Blocked by:** None

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install package**

```bash
npm install @phosphor-icons/react
```

- [ ] **Step 2: Verify package installed**

```bash
ls node_modules/@phosphor-icons/react/package.json
```
Expected: file exists.

- [ ] **Step 3: Update next.config.ts for tree-shaking optimization**

Read the current `next.config.ts` and edit to add `optimizePackageImports`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Verify config is valid**

```bash
npx tsc --noEmit next.config.ts 2>&1 | head -5
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "deps: install @phosphor-icons/react + optimizePackageImports config"
```

---

### Task A2: Replace icons in src/components/ui/ (18 shadcn files)

**Type:** `AFK`
**Blocked by:** Task A1

**Files to modify:**
- `src/components/ui/accordion.tsx` — `ChevronDownIcon` -> `CaretDownIcon`
- `src/components/ui/breadcrumb.tsx` — `ChevronRight` -> `CaretRightIcon`, `MoreHorizontal` -> `DotsThreeIcon`
- `src/components/ui/calendar.tsx` — `ChevronLeft` -> `CaretLeftIcon`, `ChevronRight` -> `CaretRightIcon`
- `src/components/ui/carousel.tsx` — `ArrowLeft` -> `ArrowLeftIcon`, `ArrowRight` -> `ArrowRightIcon`
- `src/components/ui/checkbox.tsx` — `CheckIcon` -> `CheckIcon` (no name change, only import source)
- `src/components/ui/command.tsx` — `SearchIcon` -> `MagnifyingGlassIcon`
- `src/components/ui/context-menu.tsx` — `CheckIcon` -> `CheckIcon`, `ChevronRightIcon` -> `CaretRightIcon`, `CircleIcon` -> `CircleIcon`
- `src/components/ui/dialog.tsx` — `XIcon` -> `XIcon`
- `src/components/ui/dropdown-menu.tsx` — `CheckIcon` -> `CheckIcon`, `ChevronRightIcon` -> `CaretRightIcon`, `CircleIcon` -> `CircleIcon`
- `src/components/ui/input-otp.tsx` — `MinusIcon` -> `MinusIcon`
- `src/components/ui/menubar.tsx` — `CheckIcon` -> `CheckIcon`, `ChevronRightIcon` -> `CaretRightIcon`, `CircleIcon` -> `CircleIcon`
- `src/components/ui/navigation-menu.tsx` — `ChevronDownIcon` -> `CaretDownIcon`
- `src/components/ui/pagination.tsx` — `ChevronLeftIcon` -> `CaretLeftIcon`, `ChevronRightIcon` -> `CaretRightIcon`, `MoreHorizontalIcon` -> `DotsThreeIcon`
- `src/components/ui/radio-group.tsx` — `CircleIcon` -> `CircleIcon`
- `src/components/ui/resizable.tsx` — `GripVerticalIcon` -> `DotsSixVerticalIcon`
- `src/components/ui/select.tsx` — `ChevronDownIcon` -> `CaretDownIcon`, `CheckIcon` -> `CheckIcon`, `ChevronUpIcon` -> `CaretUpIcon`
- `src/components/ui/sheet.tsx` — `XIcon` -> `XIcon`
- `src/components/ui/sidebar.tsx` — `PanelLeftIcon` -> `SidebarIcon`

- [ ] **Step 1: Replace import source in all 18 files**

For each file, change:
```ts
import { ... } from "lucide-react"
```
to:
```ts
import { ... } from "@phosphor-icons/react"
```

- [ ] **Step 2: Rename icons in each file per the mapping above**

Apply the rename mappings. Example for `accordion.tsx`:
```tsx
// Before
import { ChevronDownIcon } from "lucide-react"
// After
import { CaretDownIcon } from "@phosphor-icons/react"
```

If an icon currently uses `strokeWidth` prop, remove it (Phosphor `weight="regular"` is the default). If `size` or `className` props exist, keep them unchanged.

- [ ] **Step 3: Verify TypeScript compilation for UI components**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "components/ui" | head -20
```
Expected: zero errors from `components/ui/` files.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "refactor: replace lucide icons with phosphor in shadcn ui components"
```

---

### Task A3: Replace icons in src/app/(auth)/ (3 files)

**Type:** `AFK`
**Blocked by:** Task A1

**Files to modify and their icon mappings:**

| File | Lucide Icons | Phosphor Replacements |
|------|-------------|----------------------|
| `login/page.tsx` | `Eye`, `EyeOff`, `ChevronLeft`, `Utensils` | `EyeIcon`, `EyeClosedIcon`, `CaretLeftIcon`, `ForkKnifeIcon` |
| `register/page.tsx` | `Eye`, `EyeOff`, `ChevronLeft`, `Utensils` | `EyeIcon`, `EyeClosedIcon`, `CaretLeftIcon`, `ForkKnifeIcon` |
| `verify-otp/page.tsx` | `ChevronLeft`, `Mail` | `CaretLeftIcon`, `EnvelopeIcon` |

- [ ] **Step 1: For each file, replace the import statement**

Change:
```ts
import { ... } from "lucide-react"
```
to:
```ts
import { ... } from "@phosphor-icons/react"
```

- [ ] **Step 2: Rename each icon in JSX per mapping**

Example for `login/page.tsx`:
```tsx
// Before
import { Eye, EyeOff, ChevronLeft, Utensils } from "lucide-react"
<Eye className="..." />
<EyeOff className="..." />
<ChevronLeft className="..." />
<Utensils className="..." />

// After
import { EyeIcon, EyeClosedIcon, CaretLeftIcon, ForkKnifeIcon } from "@phosphor-icons/react"
<EyeIcon className="..." />
<EyeClosedIcon className="..." />
<CaretLeftIcon className="..." />
<ForkKnifeIcon className="..." />
```

Remove any existing `strokeWidth` props on these icons.

- [ ] **Step 3: Verify auth pages compile**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "app/(auth)" | head -20
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "refactor: replace lucide with phosphor icons in auth pages"
```

---

### Task A4: Replace icons in src/app/(main)/ (9 files)

**Type:** `AFK`
**Blocked by:** Task A1

**Files to modify and their icon mappings:**

| File | Lucide Icons | Phosphor Replacements |
|------|-------------|----------------------|
| `page.tsx` | `ShieldCheck` | `ShieldCheckIcon` |
| `product/[id]/page.tsx` | `Heart`, `MapPin`, `Star`, `Check`, `ShoppingBag`, `ShieldCheck` | `HeartIcon`, `MapPinIcon`, `StarIcon`, `CheckIcon`, `ShoppingBagIcon`, `ShieldCheckIcon` |
| `cart/page.tsx` | `Tag`, `ArrowRight`, `ChevronLeft`, `Check`, `User`, `ClipboardList` | `TagIcon`, `ArrowRightIcon`, `CaretLeftIcon`, `CheckIcon`, `UserIcon`, `ClipboardTextIcon` |
| `profile/page.tsx` | `User`, `Settings`, `Clock`, `Heart`, `Award`, `ChevronRight`, `LogOut`, `Shield`, `HelpCircle`, `Store`, `Pencil`, `Check`, `X` | `UserIcon`, `GearIcon`, `ClockIcon`, `HeartIcon`, `AwardIcon`, `CaretRightIcon`, `SignOutIcon`, `ShieldIcon`, `QuestionIcon`, `StorefrontIcon`, `PencilIcon`, `CheckIcon`, `XIcon` |
| `wishlist/page.tsx` | `Heart`, `ShoppingBag`, `ArrowLeft`, `Bell` | `HeartIcon`, `ShoppingBagIcon`, `ArrowLeftIcon`, `BellIcon` |
| `notifications/page.tsx` | `ArrowLeft`, `ShoppingBag`, `Bell`, `AlertTriangle` | `ArrowLeftIcon`, `ShoppingBagIcon`, `BellIcon`, `WarningIcon` |
| `orders/page.tsx` | `Clock`, `CheckCircle`, `Package`, `ChevronRight`, `ShoppingBag`, `ArrowLeft` | `ClockIcon`, `CheckCircleIcon`, `PackageIcon`, `CaretRightIcon`, `ShoppingBagIcon`, `ArrowLeftIcon` |
| `search/page.tsx` | `Search` (aliased `SearchIcon`), `Clock`, `TrendingUp`, `X` | `MagnifyingGlassIcon`, `ClockIcon`, `TrendUpIcon`, `XIcon` |
| `order/confirm/[id]/page.tsx` | `ChevronLeft`, `Check`, `Clock`, `MapPin`, `Navigation`, `ShoppingBag` | `CaretLeftIcon`, `CheckIcon`, `ClockIcon`, `MapPinIcon`, `NavigationArrowIcon`, `ShoppingBagIcon` |

- [ ] **Step 1: Replace imports and rename icons in all 9 files**

For each file:
1. Change `from "lucide-react"` to `from "@phosphor-icons/react"`
2. Apply the rename mapping from the table above
3. Remove any `strokeWidth` props on icons

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "app/(main)" | head -20
```
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/
git commit -m "refactor: replace lucide with phosphor icons in main pages"
```

---

### Task A5: Replace icons in src/app/admin/ (5 files)

**Type:** `AFK`
**Blocked by:** Task A1

**Files and mappings:**

| File | Lucide Icons | Phosphor Replacements |
|------|-------------|----------------------|
| `layout.tsx` | `LayoutDashboard`, `Users`, `Store`, `Package`, `Settings`, `ShieldCheck`, `LogOut`, `Menu`, `X` | `SquaresFourIcon`, `UsersIcon`, `StorefrontIcon`, `PackageIcon`, `GearIcon`, `ShieldCheckIcon`, `SignOutIcon`, `ListIcon`, `XIcon` |
| `page.tsx` | `Users`, `Store`, `ShoppingBag`, `DollarSign`, `ShieldCheck`, `Package` | `UsersIcon`, `StorefrontIcon`, `ShoppingBagIcon`, `CurrencyDollarIcon`, `ShieldCheckIcon`, `PackageIcon` |
| `users/page.tsx` | `Search` | `MagnifyingGlassIcon` |
| `settings/page.tsx` | `Save` | `FloppyDiskIcon` |
| `products/page.tsx` | `Search`, `Eye`, `EyeOff` | `MagnifyingGlassIcon`, `EyeIcon`, `EyeClosedIcon` |
| `mitra-verification/page.tsx` | `CheckCircle`, `XCircle` | `CheckCircleIcon`, `XCircleIcon` |

- [ ] **Step 1: Replace imports and rename in all 6 files**

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "app/admin" | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "refactor: replace lucide with phosphor icons in admin pages"
```

---

### Task A6: Replace icons in src/app/seller/ (5 files)

**Type:** `AFK`
**Blocked by:** Task A1

**Files and mappings:**

| File | Lucide Icons | Phosphor Replacements |
|------|-------------|----------------------|
| `page.tsx` | `ArrowLeft`, `Store`, `Package`, `Plus`, `ExternalLink`, `Loader2`, `BarChart3`, `LayoutDashboard` | `ArrowLeftIcon`, `StorefrontIcon`, `PackageIcon`, `PlusIcon`, `ArrowSquareOutIcon`, `SpinnerIcon`, `ChartBarIcon`, `SquaresFourIcon` |
| `orders/page.tsx` | `ArrowLeft`, `Package`, `Clock`, `Loader2`, `Phone` | `ArrowLeftIcon`, `PackageIcon`, `ClockIcon`, `SpinnerIcon`, `PhoneIcon` |
| `edit/[id]/page.tsx` | `ArrowLeft`, `Camera`, `Upload`, `X`, `Loader2`, `Save` | `ArrowLeftIcon`, `CameraIcon`, `UploadIcon`, `XIcon`, `SpinnerIcon`, `FloppyDiskIcon` |
| `add/page.tsx` | `ArrowLeft`, `Camera`, `Upload`, `X`, `Loader2` | `ArrowLeftIcon`, `CameraIcon`, `UploadIcon`, `XIcon`, `SpinnerIcon` |
| `register/page.tsx` | `ArrowLeft` | `ArrowLeftIcon` |

- [ ] **Step 1: Replace imports and rename in all 5 files**

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "app/seller" | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/seller/
git commit -m "refactor: replace lucide with phosphor icons in seller pages"
```

---

### Task A7: Replace icons in src/components/ (21 files)

**Type:** `AFK`
**Blocked by:** Task A1

**Files and mappings (top-level components):**

| File | Lucide Icons | Phosphor Replacements |
|------|-------------|----------------------|
| `ProductCard.tsx` | `Clock`, `MapPin`, `ShoppingBag`, `Heart`, `ShieldCheck` | `ClockIcon`, `MapPinIcon`, `ShoppingBagIcon`, `HeartIcon`, `ShieldCheckIcon` |
| `ProductGrid.tsx` | `AlertCircle` | `WarningCircleIcon` |
| `ProductManagementList.tsx` | `Package`, `Pencil`, `Trash2`, `Loader2` | `PackageIcon`, `PencilIcon`, `Trash2Icon` (verify exists, otherwise `TrashIcon`), `SpinnerIcon` |
| `Header.tsx` | `MapPin` | `MapPinIcon` |
| `SearchBar.tsx` | `Search` | `MagnifyingGlassIcon` |
| `BottomNav.tsx` | `Home`, `Search`, `ShoppingBag`, `User` | `HouseIcon`, `MagnifyingGlassIcon`, `ShoppingBagIcon`, `UserIcon` |
| `FilterModal.tsx` | `X`, `SlidersHorizontal`, `MapPin`, `Wallet`, `Timer` | `XIcon`, `SlidersIcon`, `MapPinIcon`, `WalletIcon`, `TimerIcon` |
| `FilterBar.tsx` | `ArrowUpDown`, `DollarSign`, `MapPin`, `Clock`, `SlidersHorizontal` | `ArrowsDownUpIcon`, `CurrencyDollarIcon`, `MapPinIcon`, `ClockIcon`, `SlidersIcon` |
| `CategoryFilter.tsx` | `Package`, `Soup`, `Croissant`, `Coffee` | `PackageIcon`, `SoupIcon` (verify), `CroissantIcon` (verify), `CoffeeIcon` |
| `MapModal.tsx` | `X`, `MapPin`, `Navigation` | `XIcon`, `MapPinIcon`, `NavigationArrowIcon` |
| `QueueIndicator.tsx` | `Users`, `Clock` | `UsersIcon`, `ClockIcon` |
| `ReviewList.tsx` | `Star`, `User` | `StarIcon`, `UserIcon` |
| `WriteReviewModal.tsx` | `X`, `Star`, `Send` | `XIcon`, `StarIcon`, `PaperPlaneRightIcon` |
| `NotificationCenter.tsx` | `X`, `ShoppingBag`, `Bell`, `AlertTriangle` | `XIcon`, `ShoppingBagIcon`, `BellIcon`, `WarningIcon` |
| `NotificationBell.tsx` | `Bell` | `BellIcon` |
| `ImageWithFallback.tsx` | `ShoppingBag` | `ShoppingBagIcon` |
| `MitraRegistrationForm.tsx` | `Store`, `Loader2` | `StorefrontIcon`, `SpinnerIcon` |

**Analytics components:**

| File | Lucide Icons | Phosphor Replacements |
|------|-------------|----------------------|
| `analytics/CsvExportButton.tsx` | `Download`, `Loader2` | `DownloadIcon`, `SpinnerIcon` |
| `analytics/PeakHoursChart.tsx` | `Clock` | `ClockIcon` |
| `analytics/ProductRanking.tsx` | `Package` | `PackageIcon` |
| `analytics/RevenueSummary.tsx` | `DollarSign`, `TrendingDown`, `ShoppingBag`, `Package` | `CurrencyDollarIcon`, `TrendDownIcon`, `ShoppingBagIcon`, `PackageIcon` |
| `analytics/SalesTrendChart.tsx` | `TrendingUp` | `TrendUpIcon` |
| `analytics/DateRangeFilter.tsx` | `CalendarDays` | `CalendarDotsIcon` |

- [ ] **Step 1: Replace imports and rename in all 21 files**

For each file: change `from "lucide-react"` to `from "@phosphor-icons/react"`, rename each icon per mapping table, remove `strokeWidth` props.

- [ ] **Step 2: Handle uncertain icon names**

These Phosphor names need verification against the actual package. Use the import check:
```bash
node -e "const p = require('@phosphor-icons/react'); console.log(Object.keys(p).filter(k => k.includes('Croissant') || k.includes('Soup') || k.includes('Trash') || k.includes('Wallet') || k.includes('Timer') || k.includes('Smile') || k.includes('Soup') || k.includes('Croissant')))"
```
If an icon doesn't exist in Phosphor, find the closest equivalent from the Phosphor catalog.

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -i "components/" | head -30
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "refactor: replace lucide with phosphor icons in shared components"
```

---

### Task A8: Phase A verification + remove lucide-react

**Type:** `AFK`
**Blocked by:** Tasks A2-A7 (all parallel batches complete)

- [ ] **Step 1: Full TypeScript compilation check**

```bash
npx tsc --noEmit 2>&1
```
Expected: zero TypeScript errors.

- [ ] **Step 2: Next.js build check**

```bash
npx next build 2>&1 | tail -20
```
Expected: successful build. If build errors, fix them before proceeding.

- [ ] **Step 3: Grep for remaining lucide imports**

```bash
grep -r "from.*lucide-react" src/ --include="*.tsx" --include="*.ts"
```
Expected: zero matches. If any found, fix them.

- [ ] **Step 4: Check lucide-react is no longer a dependency of any import**

```bash
npm ls lucide-react 2>&1
```
Expected: shown as a dependency but with no dependents (shadcn may still list it as a peer dep).

- [ ] **Step 5: Remove lucide-react from package.json**

```bash
npm uninstall lucide-react
```

- [ ] **Step 6: Rebuild to confirm removal doesn't break anything**

```bash
npx next build 2>&1 | tail -20
```
Expected: successful build.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json
git commit -m "refactor: remove lucide-react, migration to phosphor complete"
```

---

## Phase B: Component Migration

### Task B1: FilterModal -> Sheet (bottom)

**Type:** `AFK`
**Blocked by:** Phase A complete (Task A8)

**Files:**
- Modify: `src/components/FilterModal.tsx`
- Read reference: `src/components/ui/sheet.tsx` (for import paths)

- [ ] **Step 1: Read current FilterModal implementation**

Read `src/components/FilterModal.tsx` to understand the current AnimatePresence + motion.div pattern, the props interface, and the filter content.

- [ ] **Step 2: Rewrite FilterModal to use shadcn Sheet**

Replace the modal wrapper with Sheet. Keep all filter content (jarak, harga, kedaluwarsa) unchanged. The key replacement:

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function FilterModal({ open, onClose }: FilterModalProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>
        {/* existing filter content — keep unchanged */}
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Update any callers of FilterModal**

Search for `FilterModal` usage in other files:
```bash
grep -r "FilterModal" src/ --include="*.tsx"
```
Ensure the `open` / `onClose` props still match. If the parent uses `isOpen` or `setIsOpen`, adapt the Sheet's `onOpenChange` accordingly.

- [ ] **Step 4: Verify compilation and visual**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "FilterModal"
```
Expected: zero errors. Build and visually verify the filter opens/closes correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterModal.tsx
git commit -m "refactor: replace FilterModal with shadcn Sheet"
```

---

### Task B2: MapModal -> Sheet (bottom)

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/MapModal.tsx`

- [ ] **Step 1: Read current MapModal**

Read `src/components/MapModal.tsx` — it's a bottom sheet with a mock map image.

- [ ] **Step 2: Rewrite using Sheet**

Same pattern as FilterModal but with map-specific content:
```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function MapModal({ open, onClose }: MapModalProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Lokasi Mitra</SheetTitle>
        </SheetHeader>
        {/* existing map content — keep unchanged */}
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "MapModal"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/MapModal.tsx
git commit -m "refactor: replace MapModal with shadcn Sheet"
```

---

### Task B3: WriteReviewModal -> Sheet (bottom)

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/WriteReviewModal.tsx`

- [ ] **Step 1: Read WriteReviewModal, rewrite using Sheet**

Same Sheet pattern with review form content preserved:
```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function WriteReviewModal({ open, onClose, ... }: WriteReviewModalProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Tulis Ulasan</SheetTitle>
        </SheetHeader>
        {/* existing star rating + text input + submit — keep unchanged */}
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "WriteReviewModal" && \
git add src/components/WriteReviewModal.tsx && \
git commit -m "refactor: replace WriteReviewModal with shadcn Sheet"
```

---

### Task B4: NotificationCenter -> Sheet (right side panel)

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/NotificationCenter.tsx`

- [ ] **Step 1: Read NotificationCenter, rewrite using Sheet (right side)**

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function NotificationCenter({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle>Notifikasi</SheetTitle>
        </SheetHeader>
        {/* existing notification list — keep unchanged */}
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "NotificationCenter" && \
git add src/components/NotificationCenter.tsx && \
git commit -m "refactor: replace NotificationCenter with shadcn Sheet (right)"
```

---

### Task B5: SearchBar -> Command

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/SearchBar.tsx`
- Modify: `src/app/(main)/search/page.tsx` (if SearchBar is also used inline there)

- [ ] **Step 1: Read SearchBar, identify all usages**

```bash
grep -r "SearchBar" src/ --include="*.tsx" --include="*.ts"
```

- [ ] **Step 2: Rewrite SearchBar to use Command**

```tsx
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  results?: SearchResult[]
  onSelect?: (result: SearchResult) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, results, onSelect, placeholder }: SearchBarProps) {
  return (
    <Command className="rounded-lg border" shouldFilter={false}>
      <CommandInput
        placeholder={placeholder ?? "Cari makanan surplus..."}
        value={value}
        onValueChange={onChange}
      />
      {results && (
        <CommandList>
          <CommandEmpty>Tidak ada hasil</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Hasil Pencarian">
              {results.map((result) => (
                <CommandItem key={result.id} onSelect={() => onSelect?.(result)}>
                  {result.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  )
}
```

- [ ] **Step 3: Update callers if SearchBar API changed**

Check each file that imports SearchBar. If the old API had different props, adapt the callers.

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "SearchBar" && \
git add src/components/SearchBar.tsx && \
git commit -m "refactor: replace SearchBar with shadcn Command"
```

---

### Task B6: CategoryFilter -> ToggleGroup

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/CategoryFilter.tsx`

- [ ] **Step 1: Read CategoryFilter, understand current implementation**

Read `src/components/CategoryFilter.tsx` — it renders horizontal chips with active/inactive states.

- [ ] **Step 2: Rewrite using ToggleGroup**

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const categories = [
  { value: "all", label: "Semua", icon: PackageIcon },
  { value: "meals", label: "Makanan", icon: ForkKnifeIcon },
  { value: "bakery", label: "Roti", icon: CroissantIcon }, // verify icon name
  { value: "drinks", label: "Minuman", icon: CoffeeIcon },
] as const

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={onChange}>
      {categories.map(({ value: v, label, icon: Icon }) => (
        <ToggleGroupItem key={v} value={v} className="gap-2">
          <Icon size={16} />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "CategoryFilter" && \
git add src/components/CategoryFilter.tsx && \
git commit -m "refactor: replace CategoryFilter with shadcn ToggleGroup"
```

---

### Task B7: ProductCard -> Card + AspectRatio

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ImageWithFallback.tsx` (replace with inline AspectRatio + Avatar pattern)

- [ ] **Step 1: Read ProductCard and ImageWithFallback**

- [ ] **Step 2: Rewrite ProductCard to use Card wrapper**

Wrap existing product card markup with Card components. Replace ImageWithFallback usage with AspectRatio + Avatar:

```tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <AspectRatio ratio={1/1}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback: show Avatar with product initial
            e.currentTarget.style.display = "none"
            // show fallback container
          }}
        />
      </AspectRatio>
      <CardContent className="p-3">
        {/* existing product info: name, store, price, discount */}
      </CardContent>
      <CardFooter className="p-3 pt-0 gap-2">
        {/* existing add-to-cart + wishlist buttons */}
      </CardFooter>
    </Card>
  )
}
```

- [ ] **Step 3: Check all ProductCard usages**

```bash
grep -r "ProductCard" src/ --include="*.tsx"
```
Ensure the updated component still works with all callers.

- [ ] **Step 4: Remove or update ImageWithFallback if no longer used elsewhere**

```bash
grep -r "ImageWithFallback" src/ --include="*.tsx" --include="*.ts"
```
If no other usages, delete the file. If used elsewhere, migrate those callers too or keep the component.

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -E "ProductCard|ImageWithFallback" && \
git add src/components/ProductCard.tsx src/components/ImageWithFallback.tsx && \
git commit -m "refactor: replace ProductCard wrapper with shadcn Card + AspectRatio"
```

---

### Task B8: ReviewList -> Card + Avatar

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/ReviewList.tsx`

- [ ] **Step 1: Read ReviewList**

- [ ] **Step 2: Rewrap review items in Card + add Avatar for user**

```tsx
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar size="sm">
                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{review.userName}</p>
                {/* star rating display — keep existing logic */}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "ReviewList" && \
git add src/components/ReviewList.tsx && \
git commit -m "refactor: replace ReviewList with shadcn Card + Avatar"
```

---

### Task B9: DashboardStatCards -> Card

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/DashboardStatCards.tsx`

- [ ] **Step 1: Read DashboardStatCards**

- [ ] **Step 2: Wrap each stat in Card**

Replace any custom stat card containers with shadcn Card:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardStatCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "DashboardStatCards" && \
git add src/components/DashboardStatCards.tsx && \
git commit -m "refactor: wrap DashboardStatCards in shadcn Card"
```

---

### Task B10: ProductManagementList -> Card + Table

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Modify: `src/components/ProductManagementList.tsx`

- [ ] **Step 1: Read ProductManagementList**

- [ ] **Step 2: Rewrap using Card + existing shadcn Table**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ProductManagementList({ products, onEdit, onDelete }: Props) {
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
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  {/* edit/delete buttons — keep existing */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep "ProductManagementList" && \
git add src/components/ProductManagementList.tsx && \
git commit -m "refactor: wrap ProductManagementList in shadcn Card + Table"
```

---

### Task B11: NotificationBell + OrderStatusBadge -> Badge verify

**Type:** `AFK`
**Blocked by:** Phase A complete

**Files:**
- Read: `src/components/NotificationBell.tsx`
- Read: `src/components/OrderStatusBadge.tsx`

- [ ] **Step 1: Read both components, check if they already use shadcn Badge**

```bash
grep -n "Badge\|badge" src/components/NotificationBell.tsx src/components/OrderStatusBadge.tsx
```

- [ ] **Step 2: If not using shadcn Badge, migrate**

If NotificationBell uses a custom badge span for unread count, replace with:
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
  {unreadCount}
</Badge>
```

If OrderStatusBadge uses custom status styling, replace with:
```tsx
import { Badge } from "@/components/ui/badge"

const statusVariants: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  "Menunggu": "secondary",
  "Diproses": "default",
  "Siap Diambil": "default",
  "Sudah Diambil": "outline",
  "Dibatalkan": "destructive",
}

<Badge variant={statusVariants[status]}>{status}</Badge>
```

- [ ] **Step 3: If already using shadcn Badge, no changes needed**

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit --pretty 2>&1 | grep -E "NotificationBell|OrderStatusBadge" && \
git add src/components/NotificationBell.tsx src/components/OrderStatusBadge.tsx && \
git commit -m "refactor: verify/migrate NotificationBell and OrderStatusBadge to shadcn Badge"
```

---

### Task B12: Phase B verification + cleanup

**Type:** `AFK`
**Blocked by:** Tasks B1-B11 (all parallel batches complete)

- [ ] **Step 1: Full TypeScript compilation**

```bash
npx tsc --noEmit 2>&1
```
Expected: zero errors. Fix any errors before proceeding.

- [ ] **Step 2: Next.js build**

```bash
npx next build 2>&1 | tail -30
```
Expected: successful build with no warnings.

- [ ] **Step 3: Check for remaining code using removed internal APIs**

```bash
grep -r "AnimatePresence\|motion\.div" src/components/FilterModal.tsx src/components/MapModal.tsx src/components/WriteReviewModal.tsx src/components/NotificationCenter.tsx
```
Expected: no matches (these should now use Sheet, not AnimatePresence/motion).

- [ ] **Step 4: Check shadcn component files are in sync**

```bash
ls src/components/ui/sheet.tsx src/components/ui/toggle-group.tsx src/components/ui/command.tsx src/components/ui/card.tsx src/components/ui/avatar.tsx src/components/ui/aspect-ratio.tsx src/components/ui/badge.tsx
```
Expected: all files exist.

- [ ] **Step 5: Manual smoke test checklist**

Navigate through key pages:
- `/` (Home) — ProductCards render with Card wrapper, CategoryFilter uses ToggleGroup
- `/search` — SearchBar uses Command
- `/product/[id]` — MapModal opens as Sheet
- `/cart` — reviews/testimonials use Card
- `/profile` — all icons are Phosphor
- `/admin` — admin pages render correctly
- `/seller` — DashboardStatCards use Card, ProductManagementList uses Table

- [ ] **Step 6: Final commit**

```bash
git add -A && git diff --staged --stat
git commit -m "refactor: complete phosphor icons + shadcn component migration"
```
