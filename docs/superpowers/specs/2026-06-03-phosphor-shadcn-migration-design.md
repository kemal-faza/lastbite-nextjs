# Phosphor Icons + shadcn Component Migration

**Date:** 2026-06-03
**Status:** Design approved, awaiting implementation
**Scope:** Replace all Lucide icons with Phosphor Icons (Regular), replace custom components with shadcn equivalents (maximal).

---

## 1. Overview

Two-phase sequential migration:

| Phase | Description | Files |
|-------|-------------|-------|
| A: Icon Migration | Replace `lucide-react` with `@phosphor-icons/react` (Regular weight) | ~76 files |
| B: Component Migration | Replace custom components with shadcn equivalents | ~15 components |

**Non-goals:** No functional changes, no layout changes, no new features. Pure library swap.

---

## 2. Approach

**Two-Phase Sequential.** Icons first (mechanical, ~76 files), components second (judgment-based, ~15 components). Each phase committed independently for clean rollback.

**No icon wrapper.** Direct import replacement: `lucide-react` -> `@phosphor-icons/react`. No abstraction layer. Decision rationale: single icon library expected for the project's lifetime, wrapper adds unnecessary indirection for a one-time migration.

---

## 3. Phase A: Icon Migration

### 3.1 Dependencies

```bash
npm install @phosphor-icons/react
```
Add to `next.config.ts`:
```ts
experimental: {
  optimizePackageImports: ["@phosphor-icons/react"],
}
```

### 3.2 Transformation Rules

**Rule 1 -- Direct equivalent (append `Icon` suffix):**
```
lucide:  Heart        phosphor: HeartIcon
lucide:  Bell         phosphor: BellIcon
lucide:  Clock        phosphor: ClockIcon
lucide:  MapPin       phosphor: MapPinIcon
lucide:  Star         phosphor: StarIcon
lucide:  Plus         phosphor: PlusIcon
lucide:  Minus        phosphor: MinusIcon
lucide:  Camera       phosphor: CameraIcon
lucide:  Download     phosphor: DownloadIcon
lucide:  Pencil       phosphor: PencilIcon
lucide:  Phone        phosphor: PhoneIcon
lucide:  Eye          phosphor: EyeIcon
lucide:  Shield       phosphor: ShieldIcon
lucide:  User         phosphor: UserIcon
lucide:  Users        phosphor: UsersIcon
lucide:  ShoppingBag  phosphor: ShoppingBagIcon
lucide:  Package      phosphor: PackageIcon
lucide:  Bell         phosphor: BellIcon
lucide:  Upload       phosphor: UploadIcon
lucide:  Tag          phosphor: TagIcon
lucide:  Check        phosphor: CheckIcon
lucide:  Award        phosphor: AwardIcon
lucide:  BarChart3    phosphor: ChartBarIcon
```

**Rule 2 -- Different canonical names:**

| Lucide | Phosphor |
|--------|----------|
| `AlertTriangle` | `WarningIcon` |
| `AlertCircle` | `WarningCircleIcon` |
| `ArrowUpDown` | `ArrowsDownUpIcon` |
| `CalendarDays` | `CalendarDotsIcon` |
| `CheckCircle` | `CheckCircleIcon` |
| `ChevronDown` | `CaretDownIcon` |
| `ChevronLeft` | `CaretLeftIcon` |
| `ChevronRight` | `CaretRightIcon` |
| `ChevronUp` | `CaretUpIcon` |
| `ChevronsUpDown` | `CaretUpDownIcon` |
| `ClipboardList` | `ClipboardTextIcon` |
| `DollarSign` | `CurrencyDollarIcon` |
| `ExternalLink` | `ArrowSquareOutIcon` |
| `EyeOff` | `EyeClosedIcon` |
| `GripVertical` | `DotsSixVerticalIcon` |
| `HelpCircle` | `QuestionIcon` |
| `Home` | `HouseIcon` |
| `LayoutDashboard` | `SquaresFourIcon` |
| `LogOut` | `SignOutIcon` |
| `Loader2` | `SpinnerIcon` |
| `Mail` | `EnvelopeIcon` |
| `Menu` | `ListIcon` |
| `MoreHorizontal` | `DotsThreeIcon` |
| `Moon` | `MoonIcon` |
| `Navigation` | `NavigationArrowIcon` |
| `PanelLeft` | `SidebarIcon` |
| `Save` | `FloppyDiskIcon` |
| `Search` | `MagnifyingGlassIcon` |
| `Send` | `PaperPlaneRightIcon` |
| `Settings` | `GearIcon` |
| `ShieldCheck` | `ShieldCheckIcon` |
| `SlidersHorizontal` | `SlidersIcon` |
| `Smile` | `SmileyIcon` |
| `Store` | `StorefrontIcon` |
| `TrendingUp` | `TrendUpIcon` |
| `TrendingDown` | `TrendDownIcon` |
| `Utensils` | `ForkKnifeIcon` |
| `X` | `XIcon` |
| `XCircle` | `XCircleIcon` |

### 3.3 Prop Transformation

- Remove `strokeWidth` prop (Phosphor uses `weight` prop)
- Default `weight="regular"` is the Phosphor default, no explicit prop needed
- `size` and `color`/`className` remain unchanged
- Any icon names used with compound patterns (e.g., `ChevronDownIcon` in shadcn Select) follow same mapping

### 3.4 Shadcn UI Internal Icons

The following shadcn UI files in `src/components/ui/` import lucide internally and must be manually rewritten:

| File | Icons Used | Phosphor Replacement |
|------|-----------|---------------------|
| `accordion.tsx` | `ChevronDownIcon` | `CaretDownIcon` |
| `breadcrumb.tsx` | `ChevronRight`, `MoreHorizontal` | `CaretRightIcon`, `DotsThreeIcon` |
| `calendar.tsx` | `ChevronLeft`, `ChevronRight` | `CaretLeftIcon`, `CaretRightIcon` |
| `carousel.tsx` | `ArrowLeft`, `ArrowRight` | `ArrowLeftIcon`, `ArrowRightIcon` |
| `checkbox.tsx` | `CheckIcon` | `CheckIcon` |
| `command.tsx` | `SearchIcon` | `MagnifyingGlassIcon` |
| `context-menu.tsx` | `CheckIcon`, `ChevronRightIcon`, `CircleIcon` | `CheckIcon`, `CaretRightIcon`, `CircleIcon` |
| `dialog.tsx` | `XIcon` | `XIcon` |
| `dropdown-menu.tsx` | `CheckIcon`, `ChevronRightIcon`, `CircleIcon` | `CheckIcon`, `CaretRightIcon`, `CircleIcon` |
| `input-otp.tsx` | `MinusIcon` | `MinusIcon` |
| `menubar.tsx` | `CheckIcon`, `ChevronRightIcon`, `CircleIcon` | `CheckIcon`, `CaretRightIcon`, `CircleIcon` |
| `navigation-menu.tsx` | `ChevronDownIcon` | `CaretDownIcon` |
| `pagination.tsx` | `ChevronLeftIcon`, `ChevronRightIcon`, `MoreHorizontalIcon` | `CaretLeftIcon`, `CaretRightIcon`, `DotsThreeIcon` |
| `radio-group.tsx` | `CircleIcon` | `CircleIcon` |
| `resizable.tsx` | `GripVerticalIcon` | `DotsSixVerticalIcon` |
| `select.tsx` | `ChevronDownIcon`, `CheckIcon`, `ChevronUpIcon` | `CaretDownIcon`, `CheckIcon`, `CaretUpIcon` |
| `sheet.tsx` | `XIcon` | `XIcon` |
| `sidebar.tsx` | `PanelLeftIcon` | `SidebarIcon` |

**Risk:** Future `npx shadcn@latest add [component]` runs will overwrite these manual icon changes. Mitigation: document in MEMORY.md so future maintainers know to re-apply icon replacements after shadcn CLI updates.

### 3.5 Verification

- `next build` must succeed with zero errors
- `npm ls lucide-react` should show no dependents (removable after migration)
- Manual smoke test: every page renders icons correctly
- Grep for `from "lucide-react"` or `from 'lucide-react'` should return zero matches

---

## 4. Phase B: Component Migration

### 4.1 Component Mapping

| # | Current Component | shadcn Replacement | Notes |
|---|-------------------|-------------------|-------|
| 1 | `FilterModal` | `Sheet` (bottom) | Replace AnimatePresence + motion.div with Sheet side="bottom" |
| 2 | `MapModal` | `Sheet` (bottom) | Same pattern as FilterModal |
| 3 | `WriteReviewModal` | `Sheet` (bottom) | Same pattern |
| 4 | `NotificationCenter` | `Sheet` (right) | Side panel for notification inbox |
| 5 | `SearchBar` | `Command` + `CommandInput` | Command palette-style search with built-in dropdown list |
| 6 | `CategoryFilter` | `ToggleGroup` (single) | Radio-like category selector, handles active/disabled states |
| 7 | `ProductCard` | `Card` wrapper | Wrap existing markup in Card/CardHeader/CardContent/CardFooter |
| 8 | `ImageWithFallback` | `AspectRatio` + `Avatar` | AspectRatio for image container, Avatar for fallback initials |
| 9 | `ReviewList` | `Card` + `Avatar` | Card container with Avatar for reviewer display |
| 10 | `DashboardStatCards` | `Card` | Wrap each stat card in Card |
| 11 | `ProductManagementList` | `Card` + `Table` | Card wrapper + existing shadcn Table |
| 12 | `NotificationBell` | `Button` + `Badge` | Already using button pattern, verify Badge usage |
| 13 | `OrderStatusBadge` | `Badge` | Verify it uses shadcn Badge, migrate if not |

### 4.2 Components NOT Replaced

These are too app-specific for shadcn wrapping. Business logic stays, only styling container changes where applicable.

| Component | Reason |
|-----------|--------|
| `Header` | App-specific layout with logo, location, badge |
| `BottomNav` | Mobile tab bar, custom navigation logic |
| `ProductGrid` | Product grid logic with sort/filter |
| `AIRecommendation` | Custom scoring engine, not a UI wrapper |
| `FilterBar` | Custom sort bar with specific controls |
| `QueueIndicator` | Real-time simulation widget |
| `MitraRegistrationForm` | Already uses shadcn Input/Textarea/Label |

### 4.3 shadcn Component Installation

Components already installed in `src/components/ui/` but may need re-installation with updated peer dependencies:

```bash
npx shadcn@latest add sheet toggle-group command card avatar aspect-ratio dialog tabs popover scroll-area
```

Already installed and in use (no re-add needed): `button`, `input`, `label`, `badge`, `table`, `select`, `textarea`, `switch`, `chart`.

### 4.4 Verification

- Each replaced component renders correctly
- All interactive behaviors preserved (open/close modals, filter toggling, search)
- No visual regression on each affected page
- `next build` succeeds

---

## 5. Acceptance Criteria

1. `npm ls lucide-react` returns empty or removable (Phase A complete)
2. Zero `from "lucide-react"` imports in `src/` (Phase A complete)
3. All ~76 icons render in Phosphor Regular style (Phase A complete)
4. All 13 custom components replaced with shadcn equivalents (Phase B complete)
5. `next build` succeeds with zero errors (both phases)
6. No functional regression: auth flows, cart/checkout, product browsing, seller dashboard still work
7. Icons and components follow project terminology (Keranjang not Cart, Mitra not Seller, etc.)

---

## 6. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Phosphor icon name mismatch | Build error or missing icon | Build catches missing imports. Verify each against `@phosphor-icons/react` package at implementation time |
| shadcn CLI overwrites manual icon changes | Icons revert to lucide on `npx shadcn add` | Document in MEMORY.md. Use version control to diff and re-apply |
| Sheet/Dialog z-index conflicts | Modals overlapping incorrectly | Test each modal/sheet in isolation and together |
| Command vs SearchBar behavior difference | Search UX changes | Preserve existing search behavior (debounce, results list, empty state) |
| ToggleGroup styling mismatch | Category filter looks different | Customize with Tailwind to match existing design tokens |
