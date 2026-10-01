# Timect — Next.js + Fuse

The Timect storefront and admin panel, rebuilt on the **Fuse** design system
(Fuse tokens, glass surfaces, 16px radii, Archivo/Chivo type, Fuse buttons,
drawers, modals and entrance animations) on **Next.js 16 (App Router)** with
the existing **Neon PostgreSQL** catalog. No Fuse demo content is included —
every product, category, gift and page comes from Timect data.

```bash
npm install
npm run dev               # storefront http://localhost:3000, admin /admin
npm run build && npm start

npm run db:admin-migrate  # non-destructive: admin, media, CMS, inbox tables + first super admin
```

Environment (`.env`): `DATABASE_URL`, `ADMIN_JWT_SECRET`, `CLOUDINARY_*`,
`NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`,
optional `NEXT_PUBLIC_SITE_URL`.

## Storefront (`src/app/(site)`)

| Route | Notes |
| --- | --- |
| `/` | Fuse hero slider, statement + category chips, New arrivals / Recommended tabs, category carousel, For Him / For Her banners, signature (main) product, quote ticker |
| `/watches` | URL-driven catalog: `category`, `filter` (shop-by-category slug), `gender`, `brand`, `q`, `max`, `sort`; filter drawer, sticky glass toolbar, infinite scroll |
| `/product/[slug]` | Fuse product layout, gallery with zoom/lightbox, linked variants, spec drawers, WhatsApp + email enquiry, related + recently viewed. Numeric ids redirect to the slug |
| `/corporate-gifting` | Gift grid with colour filter (`/api/corporate-gifting`) and gift modal |
| `/search`, `/about`, `/contact`, `/faqs`, `/privacy`, `/terms` | Contact form and footer newsletter are stored in the database |

Shared UI lives in `src/components/fuse` (design-system primitives) and
`src/components/site` (header, mega menu, drawers, product cards, footer).

## Admin (`/admin`)

Dashboard · Products (multi-step editor, variants, specs, bulk actions) ·
Collections (collections, homepage category cards, catalog filters) ·
Corporate Gifting · Media (Cloudinary) · **Homepage & content** (hero slides,
banners, announcements, statement, quote, contact/WhatsApp/social) · **Inbox**
(contact messages, newsletter subscribers, CSV export) · **Team** (admin users
and roles) · Settings. Light/dark theme, JWT session guarded by `src/proxy.ts`.

## Data

* `products` — catalog (`src/db/actions.ts`); filters use the JSONB `specifications`.
* `cms_settings` — `shop_by_category`, `catalog_filters`, `corporate_gifting`,
  `storefront` (all editable in the admin; static defaults in `src/data/*`).
* `contact_messages`, `newsletter_subscribers` — created on first use or by the migration.
* `admin_users`, `media_library`, `audit_logs`.

`src/db/seed.ts` **drops and recreates** `products` from `src/data/products.json`
— don't run it against the live database unless you intend to reset the catalog.
