# Admin subdomain routing

Next.js 16.2.10 uses the existing `src/proxy.ts`. The admin hostname rewrites page paths into the existing `/admin` route tree; no pages or layouts are duplicated. `/` resolves to `/admin`, which retains its dashboard redirect. Nested and dynamic paths retain their query strings. API paths and framework assets are excluded from page rewrites.

Only `timectwatches.com` and `www.timectwatches.com` redirect `/admin` and `/admin/*` to HTTPS admin URLs (307, preserving query strings). Localhost and preview hosts keep `/admin/*`. Explicit `/admin/*` on the admin hostname redirects to its clean equivalent.

The admin layout supplies hostname context to shared links and navigation hooks, so existing internal route definitions and pathname comparisons continue working while browser URLs omit `/admin`. Server redirects use a hostname-aware helper. Cache invalidation continues using actual internal route paths. Public product previews use the existing configured public site origin.

Actual existing routes include `/products/new`, `/products/[id]/edit`, and `/collections`. There are no existing `/categories` or `/products/add` pages; routing does not invent these pages.

## Authentication

The proxy retains an optimistic signed-token check. The protected server layout, session checks in admin actions, role checks in mutations, and existing API authentication remain in place independently. Shared token verification now checks known admin roles, and production requires `ADMIN_JWT_SECRET` or the existing `JWT_SECRET`; the development fallback is disabled in production. Login retains a validated same-origin destination and query string. Logout clears the host cookie and redirects to the correct login path.

Cookie attributes remain host-only (no Domain), HttpOnly, SameSite=Lax, Path=/, and Secure in production. Local HTTP development keeps non-Secure cookies. Main-domain sessions are intentionally not transferred; sign in again on the admin subdomain.

## Deployment

1. Set a strong `ADMIN_JWT_SECRET` in Vercel Production (or retain the configured `JWT_SECRET`). Preserve database, Cloudinary, mail, and other existing environment variables. Use the same secret across instances.
2. Keep `NEXT_PUBLIC_SITE_URL` set to the public site origin, not the admin hostname.
3. Deploy this checkout to the existing Vercel project through its normal Git/build workflow. No second project or database migration is needed.
4. Verify `admin.timectwatches.com` is assigned to this same project and production deployment, serves the deployment rather than a Vercel domain redirect, and has a valid HTTPS certificate. Preserve existing apex/www domain settings.
5. In Hostinger, retain the admin CNAME with the exact target supplied by Vercel. If Vercel shows valid configuration, no DNS edit is required. Remove conflicting admin records only if Vercel reports a conflict.
6. Test public homepage/product/category pages; admin homepage, products, collections, settings, nested edit routes; login/logout; search/filter pagination and return destinations; product create/edit/delete; authorized and unauthorized API/action access. Confirm localhost `/admin/products` still works.

No Vercel or Hostinger settings were changed by this implementation.

## Verification

- `npx tsx --test tests/admin-routing.test.ts`: passed. Covers authenticated rewrites, nested/dynamic paths, query strings, unauthenticated login redirects, apex/www redirects, public pass-through, API/assets pass-through, and localhost behavior.
- `npx tsc --noEmit`: passed on final changes.
- `npm run build`: passed before the final public-preview link and role-validation edits; final TypeScript and routing checks passed afterward.
- Not verified end-to-end: database-backed product add/edit/delete, actual credentials and login/logout cookie behavior in a browser, authenticated API responses, live homepage rendering, DNS propagation, and deployed TLS/domain behavior. No live data was mutated.

## Files

Modified:

- `src/admin/actions/auth.ts`
- `src/admin/components/dashboard/LiveVisitorWidget.tsx`
- `src/admin/components/layout/Breadcrumbs.tsx`
- `src/admin/components/layout/Sidebar.tsx`
- `src/admin/components/products/ProductForm.tsx`
- `src/admin/components/products/ProductTable.tsx`
- `src/admin/context/AdminSearchContext.tsx`
- `src/admin/lib/auth.ts`
- `src/app/admin/(protected)/blog/BlogEditorForm.tsx`
- `src/app/admin/(protected)/blog/page.tsx`
- `src/app/admin/(protected)/dashboard/page.tsx`
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/live-visitors/page.tsx`
- `src/app/admin/(protected)/products/[id]/edit/page.tsx`
- `src/app/admin/(protected)/storefront/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/page.tsx`
- `src/proxy.ts`

Created:

- `src/admin/lib/navigation.tsx`
- `src/admin/lib/routing.ts`
- `src/admin/lib/server-routing.ts`
- `tests/admin-routing.test.ts`
- `docs/admin-subdomain.md`
