# Timect -Project Overview

> One-time project context document for AI agents and developers.  
> Generated from the codebase as of 2026-07-22.  
> Brand: **Timect** -wristwatch manufacturer / luxury e-commerce storefront.

---

## 1. Project summary

Timect is a **Next.js App Router** luxury watch e-commerce marketing site with:

- Homepage product showcases (new arrivals, recommended)
- Full product catalog with multi-criteria filters
- Product detail pages (gallery, variants, specs accordion, related)
- Static brand pages (about, contact, FAQs, privacy, terms)
- Neon PostgreSQL product catalog driven by JSON seed data
- Flexible **JSONB specifications** filtering (no per-attribute DB columns)

There is **no cart, checkout, payments, or authentication** yet. The contact form is a UI placeholder.

---

## 2. Tech stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 16.2** (App Router) |
| UI | **React 19**, **Tailwind CSS 4** |
| Language | **TypeScript** |
| Database | **Neon PostgreSQL** (`@neondatabase/serverless`) |
| Animation | **GSAP** + `@gsap/react`, **Lenis** smooth scroll (homepage) |
| Icons | **lucide-react** (catalog UI); custom SVG social icons in footer |
| Fonts | Google Fonts: **Cormorant Garamond** (serif), **Jost** (sans) |
| Images | **Cloudinary** CDN (`res.cloudinary.com`) + local `public/images` |
| Lint | ESLint + `eslint-config-next` |

**Important:** Project notes in `AGENTS.md` / `CLAUDE.md` warn this is not classic Next.js training data -check `node_modules/next/dist/docs/` before relying on outdated APIs.

---

## 3. Project architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (client components)                                │
│  Header, catalog filters, carousels, product page, GSAP     │
└───────────────────────────┬─────────────────────────────────┘
                            │ Server Actions ("use server")
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  src/db/actions.ts                                          │
│  getFilteredProducts, getProductBySlug, getNewArrivals, …   │
└───────────────────────────┬─────────────────────────────────┘
                            │ neon SQL tagged templates
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Neon PostgreSQL                                            │
│  products table + GIN index on specifications JSONB         │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ seed script (tsx / node)
┌───────────────────────────┴─────────────────────────────────┐
│  src/data/products.json  →  src/db/seed.ts                  │
│  Category filter recipes  →  src/data/categoryFilters.ts    │
│  Spec match helpers       →  src/lib/specifications.ts      │
└─────────────────────────────────────────────────────────────┘
```

### Architecture principles

1. **Server Actions as data API** -no REST `app/api` routes; client pages call functions from `src/db/actions.ts`.
2. **Single products table** -flags (`is_new_arrival`, etc.) segment homepage shelves; flexible attrs live in JSONB.
3. **Catalog filters from specs** -shop-by-category uses `specifications` JSONB + keyword recipes, not new columns.
4. **Seed-driven content** -rebuild DB from `products.json` via `seed.ts` (drops/recreates table).
5. **Layout per page** -root layout is fonts + metadata only; Header/Footer are composed inside each page or `StaticPage`.

---

## 4. Folder structure

```
timect_new/
├── AGENTS.md / CLAUDE.md      # Agent rules (Next.js docs warning)
├── project_overview.md        # This document
├── package.json
├── next.config.ts             # Cloudinary remote image host
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
├── public/
│   └── images/                # Local assets (logo, watches, banners)
├── upload_images.py           # Utility for Cloudinary uploads
└── src/
    ├── app/                   # Next.js App Router pages
    │   ├── layout.tsx         # Root layout, fonts, global CSS
    │   ├── globals.css        # Design tokens + component CSS
    │   ├── page.tsx           # Homepage
    │   ├── watches/page.tsx   # Catalog + filters
    │   ├── product/[slug]/   # PDP
    │   ├── about|contact|faqs|privacy|terms/
    │   └── favicon.ico
    ├── components/            # Shared UI
    │   ├── product/           # PDP-specific components
    │   └── …                  # Header, Footer, Hero, etc.
    ├── data/
    │   ├── products.json      # Seed source of truth
    │   ├── categoryFilters.ts # Catalog filter definitions
    │   └── cloudinary_mapping.json
    ├── db/
    │   ├── neon.ts            # Neon client (requires DATABASE_URL)
    │   ├── actions.ts         # Server actions + Product types
    │   └── seed.ts            # Schema create + seed
    └── lib/
        └── specifications.ts  # JSONB flatten / match helpers
```

### Unused / legacy

- `src/components/CollectionBanners.tsx` -no longer mounted on homepage (collections merged into Shop by Category).
- `src/components/CustomCursor.tsx` -present; usage depends on homepage wiring.

---

## 5. Database schema

### Table: `products`

Created by `src/db/seed.ts` (script **drops and recreates** on each seed run).

| Column | Type | Notes |
|--------|------|--------|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment |
| `slug` | `TEXT UNIQUE` | SEO path; unique via slugify + id on collision |
| `is_main_product` | `BOOLEAN` | Featured/main PDP-style product |
| `is_new_arrival` | `BOOLEAN` | Homepage New Arrivals shelf |
| `is_recommended` | `BOOLEAN` | Homepage Recommended / best sellers |
| `is_related` | `BOOLEAN` | Related / premium collection shelf |
| `name` | `TEXT` | Display name |
| `price` | `TEXT NOT NULL` | Formatted currency string (e.g. `₹ 1,10,000`) |
| `image` | `TEXT` | Primary image URL |
| `brand` | `TEXT` | Brand label |
| `title` | `TEXT` | Long title (main product) |
| `subtitle` | `TEXT` | Subtitle |
| `price_subtext` | `TEXT` | RRP note |
| `sizes` | `JSONB` | e.g. `["39 mm","42 mm"]` |
| `images` | `JSONB` | Gallery URL array |
| `variants` | `JSONB` | `{ id, name, image }[]` |
| `specifications` | `JSONB` | Flexible watch specs (see below) |
| `tag` | `TEXT` | e.g. `NEW` (optional badge) |
| `code` | `TEXT` | Reference code (recommended items) |
| `collection` | `TEXT` | e.g. `HYDROCONQUEST` |
| `description` | `TEXT` | Short description |
| `gender` | `TEXT` | `Men` \| `Women` \| `Unisex` |
| `rating` | `NUMERIC(2,1)` | Default `4.5` |
| `hover_image` | `TEXT` | Card hover image URL |

### Indexes

```sql
CREATE INDEX products_specifications_gin
  ON products USING GIN (specifications jsonb_path_ops);
```

Supports flexible text/regex prefilters on specs without schema migrations.

### Specifications JSONB shape

Sections are heterogeneous:

```json
[
  {
    "title": "Case",
    "type": "details",
    "items": [
      "Material: Stainless steel",
      "Dimension: 40.00 mm",
      "Water Resistance: Water-resistant to 10 bar"
    ]
  },
  {
    "title": "Dial & Hands",
    "type": "grid",
    "items": [
      { "label": "Dial color", "value": "Frosted Blue sunray" }
    ]
  },
  {
    "title": "Movement & Functions",
    "type": "details",
    "items": ["Movement Type: Quartz", "Caliber: L152"]
  },
  {
    "title": "Strap",
    "type": "text",
    "content": "Stainless steel bracelet with folding clasp."
  },
  {
    "title": "Style",
    "type": "details",
    "items": ["Category: Sports", "Collection: Gold Truton"]
  }
]
```

**Do not add columns for dial color, case size, material, etc.** Extend `specifications` and filter recipes instead.

### Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon connection string (`.env` or `.env.local`) |

`src/db/neon.ts` throws if `DATABASE_URL` is missing at import time.

### Seed command

```bash
npx tsx src/db/seed.ts
```

Reads `src/data/products.json`, recreates `products`, inserts all rows, builds GIN index.

---

## 6. API / data access (no REST routes)

There are **no** `app/api/**/route.ts` handlers.

All data access is via **Server Actions** in `src/db/actions.ts` (`"use server"`):

| Function | Purpose |
|----------|---------|
| `getMainProduct()` | First product with `is_main_product` |
| `getNewArrivals()` | `is_new_arrival` ordered by id |
| `getRecommended()` | `is_recommended` ordered by id |
| `getRelatedProducts()` | `is_related` ordered by id |
| `getProductById(id)` | Legacy id lookup |
| `getProductBySlug(slug)` | PDP primary lookup |
| `getFilteredProducts(filters)` | Catalog: search, gender, brand, price, category pills, collection `filter`, free `spec` keywords, sort, pagination |

### `getFilteredProducts` filter contract

```ts
{
  search?: string;
  genders?: string[];       // Men | Women | Unisex
  brands?: string[];        // matched against brand || collection
  priceMin?: number;
  priceMax?: number;
  category?: string;        // all | new | recommended | related
  filter?: string;          // shop-by-category slug (e.g. blue, dress-luxury)
  spec?: string;            // comma-separated free keywords
  sortBy?: string;          // newest | price-asc | price-desc
  page?: number;
  pageSize?: number;        // default 20
}
// returns { products, total, hasMore }
```

**Pipeline:** optional SQL `~*` prefilter on specs/text → map rows to `Product` → JS filters (category flags, catalog recipe, price parse, gender, brand, search) → sort → page slice.

Prices are stored as **display strings**; numeric compare strips non-digits.

---

## 7. Routes (pages)

| Path | File | Role |
|------|------|------|
| `/` | `app/page.tsx` | Homepage: preloader, GSAP, shelves, shop-by-category |
| `/watches` | `app/watches/page.tsx` | Catalog + sidebar filters + chips |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | Product detail (legacy numeric id redirects to slug) |
| `/about` | `app/about/page.tsx` | Brand story |
| `/contact` | `app/contact/page.tsx` | Contact UI (placeholder form) |
| `/faqs` | `app/faqs/page.tsx` | FAQ accordion |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms & conditions |

### Important query params

| Param | Used on | Values / meaning |
|-------|---------|------------------|
| `category` | `/watches` | `all` (default), `new`, `recommended`, `related` |
| `filter` | `/watches` | Catalog slug: `sports-chronographs`, `dress-luxury`, `gold-truton`, `blue`, `ladies`, `rose-ladies`, also `him` / `her` |

Examples:

- `/watches?filter=blue`
- `/watches?category=new`
- `/watches?filter=ladies`

---

## 8. Product flow

```
products.json
    │ seed.ts
    ▼
Neon products table
    │
    ├── Homepage
    │     getNewArrivals / getRecommended
    │     → NewArrivals / Recommended carousels
    │     → click card → /product/{slug}
    │
    ├── Shop by Category / For Him Her
    │     Link → /watches?filter={slug}
    │
    ├── Catalog /watches
    │     getFilteredProducts({ category, filter, genders, brands, price, search, sort, page })
    │     → grid + load more
    │     → click card → /product/{slug}
    │
    └── PDP /product/[slug]
          getProductBySlug (or getProductById → redirect)
          → gallery, info, specs accordion, related shelf
```

### Homepage sections (order)

1. Preloader (session once via `sessionStorage`)
2. Header
3. Hero
4. New Arrivals
5. Recommended
6. Shop by Category (6 cards only)
7. For Him / For Her
8. Quote
9. Footer

### Shop-by-category cards (`SHOP_BY_CATEGORY`)

| Label | Slug |
|-------|------|
| Sports & Chronographs | `sports-chronographs` |
| Dress & Luxury | `dress-luxury` |
| GOLD TRUTON | `gold-truton` |
| BLUE | `blue` |
| LADIES | `ladies` |
| ROSE LADIES | `rose-ladies` |

Defined in `src/data/categoryFilters.ts` (shared with catalog sidebar).

### Catalog filter chips

Active filters render as removable chips: collection filter, search, max price, each gender, each brand, plus “Clear all”.

Sidebar order:

1. Search  
2. Max price  
3. Gender  
4. Collection (shop-by-category list)  
5. Brand / Collection  

---

## 9. Components

### Layout / chrome

| Component | Role |
|-----------|------|
| `Header` | Logo, nav (Collections, New Arrivals, Best Sellers, Contact), mobile menu |
| `Footer` | Brand blurb, collections/support/company links, social icons, legal |
| `StaticPage` | Wrapper for static pages: Header + title band + content + Footer |
| `Preloader` | Full-screen load intro (homepage) |

### Homepage marketing

| Component | Role |
|-----------|------|
| `Hero` | Large brand hero |
| `NewArrivals` | Horizontal drag/scroll product shelf |
| `Recommended` | Featured recommended grid/shelf |
| `ShopByCategory` | Category image tiles → catalog filters |
| `ForHimHer` | Gender CTAs → `filter=him` / `filter=her` |
| `Quote` | Brand quote block |
| `CollectionBanners` | Legacy; not currently on homepage |

### Catalog / product

| Component | Role |
|-----------|------|
| `app/watches/page.tsx` | Full catalog UI (large client page) |
| `ProductGallery` | Image gallery |
| `ProductInfo` | Title, price, sizes, variants, CTA |
| `ProductAccordion` | Spec sections on PDP |
| `RelatedProducts` | Related product grid |
| `FaqAccordion` | FAQ expand/collapse with micro-animations |

### Primitives

| Component | Role |
|-----------|------|
| `Button` | Outline button with CSS vars for colors/hover |
| `CustomCursor` | Optional custom cursor |

---

## 10. Existing UI patterns

### Design tokens (`globals.css` + layout)

- Ink: `#111111` (`--ink`)
- Paper: white (`--paper`)
- Line: `#e5e5e5` (`--line`)
- Muted: `#6b6b6b` (`--muted`)
- Body: Jost; headings/accents: Cormorant via `.serif`
- Letter-spacing: `.tracked` / `.tracked-sm`

### Layout

- Content max width typically **1400–1450px**, horizontal padding `px-4` / `px-8`
- Black / white luxury aesthetic; catalog cards use light gray backgrounds, rounded-2xl borders

### Interactions

- Hover image swap on product cards (`image` ↔ `hoverImage`)
- Catalog chips for active filters
- FAQ accordion: height via `grid-template-rows`, icon morph plus→minus, soft fade
- Homepage: Lenis smooth scroll + GSAP ScrollTrigger batch reveals
- Preloader gated by `sessionStorage.hasSeenPreloader`

### Typography patterns

- Section titles: small caps tracking (`tracked-sm`, ~12–15px)
- Product names: tight, uppercase or line-clamp in grids
- Prices: bold black, INR-formatted strings from DB

---

## 11. Reusable components & shared modules

| Module | Reuse for |
|--------|-----------|
| `Button` | Any CTA with customizable outline/hover colors |
| `StaticPage` | New marketing/legal pages with consistent chrome |
| `FaqAccordion` | Any Q&A list with animated panels |
| `SHOP_BY_CATEGORY` + `CATALOG_FILTERS` | New category cards / filter recipes without schema change |
| `flattenSpecifications` / `productMatchesCatalogFilter` | Spec-aware search/filter logic |
| `mapRowToProduct` | Snake_case DB → camelCase app model |
| Footer link groups | Keep footer minimal: Collections / Support / Company |

---

## 12. Authentication & Admin CMS

### Admin panel (`/admin`)

Isolated Timect catalog CMS under `src/app/admin` + `src/admin/*`. Storefront routes and components are unchanged.

| Area | Location |
|------|----------|
| Routes | `src/app/admin/**` (login, dashboard, products, collections, media, settings) |
| Logic / UI | `src/admin/{actions,components,lib,hooks,styles}` |
| Route protection | `src/proxy.ts` (Next.js 16 Proxy) -JWT cookie on `/admin/*` except login |
| Auth | JWT (httpOnly cookie `timect_admin_token`) + bcrypt password hashes |
| Schema migrate | `npx tsx src/db/admin-migrate.ts` (non-destructive; does **not** drop products) |

### Admin tables

- `admin_users` -full_name, email, password_hash, role (`super_admin` \| `admin` \| `manager` \| `viewer`), is_active, timestamps, last_login
- `media_library` -uploaded / registered image URLs (Cloudinary-compatible)
- `cms_settings` -JSONB key/value (homepage cards, catalog filters)
- `audit_logs` -optional action log

### Auth env vars

| Variable | Purpose |
|----------|---------|
| `ADMIN_JWT_SECRET` | JWT signing secret (required in production) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` / `ADMIN_SEED_NAME` | First super admin (seeded only if no users) |
| `CLOUDINARY_*` | Optional; media upload uses signed Cloudinary API |

Default seed (if empty table): `admin@timect.com` / see migrate output -change after first login.

### Product admin

Full CRUD against existing `products` table (same JSONB `specifications` / `variants` / `sizes` / `images`). Multi-step editor: Basic → Flags → Images → Variants → Sizes → Specs → Preview. No per-spec DB columns.

---

## 13. Storage

| Kind | Where | Notes |
|------|--------|------|
| Product data | Neon PostgreSQL | Primary runtime store |
| Seed source | `src/data/products.json` | Edited then re-seeded |
| Product images | Cloudinary URLs (primary) | Allowed in `next.config.ts` |
| Local images | `public/images/` | Fallback / design assets |
| Mapping | `cloudinary_mapping.json` | Local path → Cloudinary URL |
| Client-only | `sessionStorage` | Preloader seen flag |
| Upload helper | `upload_images.py` | Offline/ops script, not runtime |

No S3/blob SDK, no file upload API in the Next app.

---

## 14. Existing business logic

1. **Product segmentation** -boolean flags drive homepage shelves and catalog “category” pills.
2. **Slug generation** -seed slugifies names; duplicate base slugs append `-{dbId}`.
3. **Legacy product URLs** -numeric `/product/123` loads by id then `router.replace` to slug URL.
4. **Specification-driven discovery** -category cards and sidebar “Collection” use JSONB + recipe matchers (`anyOfGroups`, `keywordsAny`, `keywordsAll`, optional `genders`).
5. **SQL prefilter + JS refine** -broad `~*` on specs/text, then precise structured match.
6. **Price filtering** -parse display price to number for range sort/filter.
7. **Brand filter** -matches `brand` or `collection` (fallback label `"Seiko"` in some UI paths).
8. **Pagination** -client “Load more” increments `page`; server returns `hasMore`.
9. **Contact form** -front-end only; emails listed as placeholders (`care@timect.com`, `service@timect.com`).
10. **Warranty / shipping** -documented on FAQs, privacy, terms as content only (no order system).

---

## 15. Coding conventions

### General

- **TypeScript** throughout; path alias `@/*` → `src/*`
- Prefer **Server Actions** for data, not new Route Handlers, unless you introduce a real external API surface
- **Client components** only when needed (`"use client"` for hooks, router, interactive filters)
- **Do not invent schema columns** for filter facets -use `specifications` JSONB + `categoryFilters.ts`

### Naming

- DB: `snake_case` columns  
- App models: `camelCase` (`hoverImage`, `isNewArrival`, `priceSubtext`)
- Files: PascalCase for React components; camelCase for lib/data utilities

### Styling

- Tailwind utility-first for layout/spacing/color
- Shared motion/layout classes in `globals.css` (`.cat-tile`, `.watch-wrap`, `.btn-outline`, `.serif`)
- Max-width containers and black/white luxury language stay consistent

### Data / seed

- After editing `products.json`, re-run `npx tsx src/db/seed.ts` (destructive recreate)
- Keep `specifications` filled for filterable products
- New shop category: add to `CATALOG_FILTERS` and `SHOP_BY_CATEGORY` if it should appear on homepage/sidebar

### Next.js notes

- Read project Next docs under `node_modules/next/dist/docs/` when unsure
- Image remote host must stay in `next.config.ts` for any new CDN domain

### Agent / PR hygiene (from tooling norms)

- Prefer small focused diffs; avoid drive-by refactors
- Do not commit secrets; keep `DATABASE_URL` in env only

---

## 16. Scripts & commands

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint

npx tsx src/db/seed.ts   # recreate + seed products (destructive)
```

---

## 17. Known gaps / future work (not present)

- Shopping cart, checkout, payments
- Auth / accounts / wishlist persistence (wishlist icon may be decorative)
- Real contact form backend
- Order management / inventory
- CMS for products
- Non-destructive migrations (seed currently drops table)
- `CollectionBanners` cleanup or reintroduction
- Fully server-side catalog rendering (watches page is heavy client)

---

## 18. Quick mental model for AI agents

1. **Timect** = luxury watch storefront on Next 16 + Neon.
2. **Products** live in one table; **specs JSONB** is the flexible attribute store.
3. **Filtering** = Server Action `getFilteredProducts` + `categoryFilters` + `specifications` helpers.
4. **UI** = black/white, serif+sans, Tailwind, GSAP homepage flourishes.
5. **No auth, no cart, no REST API** -extend carefully without breaking that model unless asked.
6. **Seed is destructive** -treat `products.json` as content source of truth for catalog data.
