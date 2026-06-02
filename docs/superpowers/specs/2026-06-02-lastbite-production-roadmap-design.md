# LastBite -- Production Roadmap Design

**Date**: 2026-06-02
**Status**: Approved
**Context**: Bridge from prototype (Next.js 15, static data, client-only) to full production (React Native mobile app + separate backend)

---

## 1. Strategy

**Approach**: Vertical Slice MVP-First
**Developer**: Solo
**Execution**: Per-milestone -- brainstorm, write plan, implement, review sequentially

Each milestone delivers an independently testable, shippable increment.

---

## 2. Prototype Gap Summary

What the prototype has (Next.js, all client-side):
- 8 static products in TypeScript file
- In-memory state via useReducer (Cart, Wishlist, Orders)
- localStorage persistence (24h TTL for orders)
- Mock reviews, mock maps, static images
- COD-only "payment"
- No authentication, no backend, no database

What production needs:
- Real auth with JWT sessions
- PostgreSQL database with proper schemas
- REST API (or GraphQL)
- Push notifications (Firebase FCM)
- Real maps & geolocation
- Real image upload & CDN
- Review/rating system with actual data
- Analytics dashboard for mitra
- Admin panel for operations
- CI/CD, monitoring, logging

---

## 3. Milestones

### M1: Auth & User Foundation
**Goal**: Real user accounts -- register, login, profile

| Layer | Scope |
|-------|-------|
| Backend | User table (PostgreSQL), password hashing (bcrypt), JWT auth, profile CRUD, phone/email OTP verification |
| Mobile | Register screen, login screen, OTP verify, profile page (read/edit), logout |
| API | `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-otp`, `GET/PATCH /users/me` |
| Deliverable | User can register, verify OTP, login, view/edit profile, logout |

### M2: Product Catalog
**Goal**: Real product data from database, searchable and filterable

| Layer | Scope |
|-------|-------|
| Backend | Product table, category enum, image upload to S3/Cloudinary, full-text search (PostgreSQL `tsvector`), filter/sort/pagination API |
| Mobile | Home (real data), search with debounce, category filter, product detail (real data), image loading with fallback |
| API | `GET /products`, `GET /products/:id`, `GET /products/search`, `POST /products` (mitra only) |
| Deliverable | Food saver can browse, search, and filter products from real database |

### M3: Cart & Order Engine
**Goal**: End-to-end transaction flow with server-side state

| Layer | Scope |
|-------|-------|
| Backend | Cart table (per-user, single-store constraint), Order table, status state machine (pending -> processed -> ready -> picked-up / cancelled), pickup code generation, pickup timer |
| Mobile | Cart with add/remove/quantity, 2-step checkout, order confirmation with pickup code, order history, pickup verification input |
| API | `GET/POST /cart`, `POST /orders`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/verify-pickup` |
| Deliverable | Complete buy flow: browse -> add to cart -> checkout -> confirm -> pickup with code verification |

### M4: Mitra Management
**Goal**: Sellers can register, manage products, and view incoming orders

| Layer | Scope |
|-------|-------|
| Backend | Mitra table (linked to user), verification workflow, product management CRUD, incoming orders view, basic stats (stock/sold/remaining) |
| Mobile | Mitra registration flow, mitra dashboard (stats + product list + incoming orders), add/edit product form, order status update |
| API | `POST /mitra/register`, `GET/PATCH /mitra/me`, `GET/POST/PATCH/DELETE /mitra/products`, `GET /mitra/orders`, `PATCH /mitra/orders/:id/status` |
| Deliverable | Mitra can onboard, manage products, fulfill orders |

### M5: Notification Service
**Goal**: Real-time push notifications for key events

| Layer | Scope |
|-------|-------|
| Backend | Firebase FCM integration, device token registration, notification event triggers (order status change, stock back in wishlist, promos), in-app notification table |
| Mobile | FCM token registration on login, push notification handling, notification center/inbox screen, permission request flow |
| API | `POST /devices`, `GET /notifications`, `PATCH /notifications/:id/read` |
| Deliverable | Users receive push notifications for order updates and stock alerts |

### M6: Location & Maps
**Goal**: Real maps replacing mock MapModal

| Layer | Scope |
|-------|-------|
| Backend | Mitra location (lat/lng + address), geocoding (Google Maps API), radius-based search, distance calculation |
| Mobile | Real map component (react-native-maps), store markers, distance display, direction/navigation intent, filter by distance (real) |
| API | `PATCH /mitra/me/location`, `GET /products?lat=&lng=&radius=` |
| Deliverable | Real maps with store locations, accurate distance, and directions |

### M7: Reviews & Trust System
**Goal**: Real review system to build trust (currently SUS trust score 3.27/5 -- lowest)

| Layer | Scope |
|-------|-------|
| Backend | Review table (linked to order), rating aggregation, moderation queue, trust badge logic (based on review count + avg rating + verification status) |
| Mobile | Write review after pickup, display reviews + ratings, trust badge display (Higienis A+, Verified, etc.) |
| API | `POST /orders/:id/review`, `GET /products/:id/reviews`, `GET /mitra/:id/reviews` |
| Deliverable | Verified reviews, trust badges calculated from real data |

### M8: Analytics Dashboard
**Goal**: Mitra can analyze sales performance

| Layer | Scope |
|-------|-------|
| Backend | Aggregation queries (daily/weekly/monthly), sales trend, peak hours, product performance, CSV export |
| Mobile | Enhanced mitra dashboard with charts (sales, items saved, revenue), insights cards, date range filter |
| API | `GET /mitra/analytics?from=&to=&granularity=` |
| Deliverable | Mitra dashboard with actionable sales analytics |

### M9: Admin & Operations
**Goal**: Platform operations team can manage everything

| Layer | Scope |
|-------|-------|
| Backend | Admin role, user/mitra CRUD, moderation queue, platform config (commission, categories, features flags), audit log |
| Frontend | Web-based admin panel (Next.js or separate SPA), user management table, mitra verification queue, platform settings |
| Deliverable | Admin can moderate, manage users/mitra, and configure platform |

---

## 4. Integration Strategy

**Between milestones**: Each M has a defined API contract (OpenAPI spec). The mobile app evolves alongside the backend but always against stable contracts.

**Between prototype and production**: Prototype serves as UI reference and user flow validation. React Native rebuilds from scratch using the same design system (colors `#11676a`/`#dda63a`/`#e4dcca`, spacing, typography from DESIGN.md).

---

## 5. Context Preservation

### CONTEXT.md (domain language) retained
Terms like "Makanan Surplus", "Mitra", "Food Saver", "Keranjang", "Pesanan", "Kode Pickup", "Favorit" carry forward unchanged. Avoidances documented in CONTEXT.md also carry forward.

### DESIGN.md (design system) retained
Color tokens (`--primary: #11676a`, `--secondary: #dda63a`, `--background: #e4dcca`), typography, spacing, shadow conventions all translate to React Native equivalents where applicable.

---

## 6. Technical Decisions

| Decision | Rationale |
|----------|-----------|
| React Native (not Flutter) | Faster ramp-up from React codebase; existing team knowledge in JS/TS ecosystem |
| Separate backend (not serverless) | Long-lived sessions, complex state machines, websocket potential. Framework TBD in M1 plan |
| PostgreSQL (not MongoDB) | Relational data (orders, users, products, reviews), ACID for transactions, full-text search built-in |
| OpenAPI contract per milestone | Solo dev needs self-discipline; contract-first prevents drift between mobile and backend |
| Vertical slice per milestone | Solo dev keeps full context, each milestone delivers value, momentum via visible progress |
