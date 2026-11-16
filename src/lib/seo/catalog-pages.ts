import type { CatalogFilter } from "@/data/categoryFilters";

export type CatalogLanding = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  keywords: string[];
  initialCategory?: string;
  initialFilter?: string;
  initialGenders?: string[];
};

export const FIXED_CATALOG_LANDINGS: Record<string, CatalogLanding> = {
  "mens-watches": {
    slug: "mens-watches",
    title: "Men's Watches | Timect Watches",
    heading: "Men's watches",
    description: "Explore Timect men's watches, including chronographs, quartz watches, dress watches, and everyday wristwatches with detailed specifications.",
    keywords: ["men's watches", "watches for men", "Timect men's watches", "men's wrist watches", "chronograph watches for men"],
    initialGenders: ["Men"],
  },
  "womens-watches": {
    slug: "womens-watches",
    title: "Women's Watches | Timect Watches",
    heading: "Women's watches",
    description: "Explore Timect women's watches, including refined quartz watches, dress watches, rose-gold styles, and everyday wristwatches.",
    keywords: ["women's watches", "watches for women", "Timect women's watches", "ladies watches", "rose gold watches for women"],
    initialGenders: ["Women"],
  },
  "unisex-watches": {
    slug: "unisex-watches",
    title: "Unisex Watches | Timect Watches",
    heading: "Unisex watches",
    description: "Browse versatile Timect unisex watches and compare case sizes, movements, materials, dial colours, and prices.",
    keywords: ["unisex watches", "Timect unisex watches", "everyday wristwatches"],
    initialGenders: ["Unisex"],
  },
  "new-arrivals": {
    slug: "new-arrivals",
    title: "New Watch Arrivals | Timect Watches",
    heading: "New watch arrivals",
    description: "Discover the latest Timect watch arrivals for men and women, with current prices, images, movement details, and full specifications.",
    keywords: ["new watches", "new watch arrivals", "latest Timect watches", "new wristwatches"],
    initialCategory: "new",
  },
  "recommended-watches": {
    slug: "recommended-watches",
    title: "Recommended Watches | Timect Watches",
    heading: "Recommended watches",
    description: "Browse recommended Timect watches selected across men's, women's, chronograph, quartz, and dress-watch collections.",
    keywords: ["recommended watches", "best Timect watches", "Timect watch collection"],
    initialCategory: "recommended",
  },
};

export function filterCatalogLanding(filter: CatalogFilter): CatalogLanding {
  const label = filter.label.replace(/\s+/g, " ").trim();
  const subject = label.toLowerCase().includes("watch") ? label : `${label} Watches`;
  return {
    slug: filter.slug,
    title: `${subject} | Timect Watches`,
    heading: subject,
    description: filter.description
      ? `${filter.description}. Browse Timect models with detailed images, prices, and watch specifications.`
      : `Browse ${subject.toLowerCase()} from Timect Watches and compare current images, prices, movements, materials, and specifications.`,
    keywords: [subject, `Timect ${subject}`, `${label} wristwatches`, "Timect Watches"],
    initialFilter: filter.slug,
  };
}
