/** Storefront navigation (routes are fixed; categories come from the CMS). */

export type NavLink = { title: string; href: string };

export const MAIN_NAV: (NavLink & { mega?: boolean })[] = [
  { title: "Watches", href: "/watches", mega: true },
  { title: "Journal", href: "/blog" },
  { title: "New Arrivals", href: "/watches/new-arrivals" },
  { title: "Corporate Gifting", href: "/corporate-gifting" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const SHOP_LINKS: NavLink[] = [
  { title: "All watches", href: "/watches" },
  { title: "New arrivals", href: "/watches/new-arrivals" },
  { title: "Recommended", href: "/watches/recommended-watches" },
  { title: "For him", href: "/watches/mens-watches" },
  { title: "For her", href: "/watches/womens-watches" },
];

export const UTILITY_LINKS: NavLink[] = [
  { title: "FAQs", href: "/faqs" },
  { title: "Contact Us", href: "/contact" },
];

export const FOOTER_MENUS: { title: string; links: NavLink[] }[] = [
  {
    title: "Collections",
    links: [
      { title: "All Watches", href: "/watches" },
      { title: "New Arrivals", href: "/watches/new-arrivals" },
      { title: "Recommended", href: "/watches/recommended-watches" },
      { title: "For Him", href: "/watches/mens-watches" },
      { title: "For Her", href: "/watches/womens-watches" },
    ],
  },
  {
    title: "Support",
    links: [
      { title: "Contact Us", href: "/contact" },
      { title: "FAQs", href: "/faqs" },
      { title: "Search", href: "/search" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "Journal", href: "/blog" },
      { title: "About Us", href: "/about" },
      { title: "Corporate Gifting", href: "/corporate-gifting" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms & Conditions", href: "/terms" },
    ],
  },
];

/** Static pages offered in the search drawer "Pages" tab. */
export const SEARCHABLE_PAGES: NavLink[] = [
  { title: "About Us", href: "/about" },
  { title: "Contact Us", href: "/contact" },
  { title: "FAQs", href: "/faqs" },
  { title: "Corporate Gifting", href: "/corporate-gifting" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms & Conditions", href: "/terms" },
];

export function watchesFilterHref(slug: string): string {
  return `/watches/${encodeURIComponent(slug)}`;
}

/** Preserve CMS links while routing known catalog queries to indexable landing pages. */
export function canonicalCatalogHref(href?: string): string {
  if (!href) return "/watches";
  const routes: Record<string, string> = {
    "/watches?category=new": "/watches/new-arrivals",
    "/watches?category=recommended": "/watches/recommended-watches",
    "/watches?gender=Men": "/watches/mens-watches",
    "/watches?gender=Women": "/watches/womens-watches",
    "/watches?gender=Unisex": "/watches/unisex-watches",
  };
  return routes[href] || href;
}
