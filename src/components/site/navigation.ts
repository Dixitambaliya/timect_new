/** Storefront navigation (routes are fixed; categories come from the CMS). */

export type NavLink = { title: string; href: string };

export const MAIN_NAV: (NavLink & { mega?: boolean })[] = [
  { title: "Watches", href: "/watches", mega: true },
  { title: "New Arrivals", href: "/watches?category=new" },
  { title: "Corporate Gifting", href: "/corporate-gifting" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const SHOP_LINKS: NavLink[] = [
  { title: "All watches", href: "/watches" },
  { title: "New arrivals", href: "/watches?category=new" },
  { title: "Recommended", href: "/watches?category=recommended" },
  { title: "For him", href: "/watches?gender=Men" },
  { title: "For her", href: "/watches?gender=Women" },
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
      { title: "New Arrivals", href: "/watches?category=new" },
      { title: "Recommended", href: "/watches?category=recommended" },
      { title: "For Him", href: "/watches?gender=Men" },
      { title: "For Her", href: "/watches?gender=Women" },
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
  return `/watches?filter=${encodeURIComponent(slug)}`;
}
