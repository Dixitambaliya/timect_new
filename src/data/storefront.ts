/**
 * Storefront content model (homepage hero, banners, statement, contact).
 * Stored in cms_settings under STOREFRONT_SETTING_KEY and editable from
 * /admin/storefront. These defaults are the original Timect copy and are
 * used until an admin saves their own version.
 */

const CDN = "https://res.cloudinary.com/dphscxzb4/image/upload";

export const STOREFRONT_SETTING_KEY = "storefront";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  price?: string;
  image: string;
  href: string;
  buttonLabel: string;
  specs: { label: string; value: string }[];
};

export type PromoBanner = {
  id: string;
  title: string;
  text: string;
  image: string;
  href: string;
  buttonLabel: string;
};

export type WhatsAppButtonSettings = {
  enabled: boolean;
  buttonText: string;
  phoneNumber: string;
  messageTemplate: string;
  corporateMessage: string;
  conciergeMessage: string;
};

export type StorefrontSettings = {
  announcement: string[];
  heroSlides: HeroSlide[];
  banners: PromoBanner[];
  statement: { heading: string; text: string };
  quote: { text: string; author: string };
  contact: {
    careEmail: string;
    serviceEmail: string;
    phone: string;
    hours: string;
    whatsapp: string;
  };
  whatsappButton?: WhatsAppButtonSettings;
  social: { instagram: string; facebook: string; youtube: string };
};

export const DEFAULT_STOREFRONT: StorefrontSettings = {
  announcement: [
    "Celebrating 145 Years of Craftsmanship",
    "5-year international guarantee on every Timect watch",
    "Questions about a model? Ask our concierge on WhatsApp",
  ],
  heroSlides: [
    {
      id: "anniversary",
      eyebrow: "No. 01 -145th Anniversary Edition",
      title: "Anniversary",
      subtitle: "Heritage",
      description:
        "Celebrating 145 years of Japanese precision horology with hand-textured silk dial artistry and 70-hour automatic caliber.",
      price: "₹1,30,000",
      image: `${CDN}/v1784048472/timect/image_2.png`,
      href: "/watches",
      buttonLabel: "Explore the collection",
      specs: [
        { label: "Caliber", value: "6R35 Mechanical" },
        { label: "Power Reserve", value: "70 Hours" },
        { label: "Crystal", value: "Dual Sapphire" },
        { label: "Water Resistance", value: "50 m" },
      ],
    },
    {
      id: "hydroconquest",
      eyebrow: "No. 02 -Deep Sea Chronometer",
      title: "HydroConquest",
      subtitle: "Edition",
      description:
        "Engineered for marine depth and refined urban prestige -high-grade stainless steel under a scratch-resistant ceramic bezel.",
      price: "₹2,25,000",
      image: `${CDN}/v1784048474/timect/image_4.png`,
      href: "/watches?category=new",
      buttonLabel: "Shop new arrivals",
      specs: [
        { label: "Caliber", value: "L888 Automatic" },
        { label: "Power Reserve", value: "72 Hours" },
        { label: "Bezel", value: "Ceramic Diver" },
        { label: "Water Resistance", value: "300 m" },
      ],
    },
    {
      id: "king-seiko",
      eyebrow: "No. 03 -High-Beat Masterpiece",
      title: "King Seiko",
      subtitle: "Mechanical",
      description:
        "Ultra-precise 36,000 vph high-beat movement with legendary Zaratsu mirror polishing and vintage 1960s geometry.",
      price: "₹2,10,000",
      image: `${CDN}/v1784048480/timect/image_9.png`,
      href: "/watches?category=recommended",
      buttonLabel: "See recommended",
      specs: [
        { label: "Caliber", value: "6L35 High-Beat" },
        { label: "Power Reserve", value: "45 Hours" },
        { label: "Polishing", value: "Zaratsu Mirror" },
        { label: "Water Resistance", value: "50 m" },
      ],
    },
  ],
  banners: [
    {
      id: "for-him",
      title: "For Him",
      text: "Sports chronographs, divers and dress pieces built for years of daily wear.",
      image: `${CDN}/v1784048483/timect/man_watch_cat.jpg`,
      href: "/watches?gender=Men",
      buttonLabel: "Explore",
    },
    {
      id: "for-her",
      title: "For Her",
      text: "Refined ladies models in rose gold, two-tone and mother-of-pearl finishes.",
      image: `${CDN}/v1784048495/timect/woman_watch_cat.jpg`,
      href: "/watches?gender=Women",
      buttonLabel: "Explore",
    },
  ],
  statement: {
    heading: "Precision instruments, built for the wrist",
    text: "Timect designs and manufactures wristwatches for people who value clarity, reliability, and lasting quality. Every collection moves through case design, dial finishing, movement selection, and rigorous testing before it reaches your wrist.",
  },
  quote: {
    text: "Time never stops, why should we?",
    author: "Timect",
  },
  contact: {
    careEmail: "care@timect.com",
    serviceEmail: "service@timect.com",
    phone: "",
    hours: "Monday – Saturday, 10 am – 7 pm IST",
    whatsapp: "",
  },
  whatsappButton: {
    enabled: true,
    buttonText: "Ask on WhatsApp",
    phoneNumber: "",
    messageTemplate: "Hi Timect, I would like to enquire about {name} ({price}). {url}\n{image}",
    corporateMessage: "Hi Timect, I'd like help with a corporate gifting order.",
    conciergeMessage: "Hi Timect, I have a question about your watches.",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
};

export const TIMECT_LOGO = `${CDN}/v1784048492/timect/timect_logo.png`;

/** Merge a partially stored settings object over the defaults. */
export function mergeStorefront(
  stored: Partial<StorefrontSettings> | null | undefined,
): StorefrontSettings {
  const d = DEFAULT_STOREFRONT;
  if (!stored || typeof stored !== "object") return d;
  const storedWp = stored.whatsappButton;
  const dWp = d.whatsappButton!;
  return {
    announcement: Array.isArray(stored.announcement)
      ? stored.announcement.filter(Boolean)
      : d.announcement,
    heroSlides:
      Array.isArray(stored.heroSlides) && stored.heroSlides.length
        ? stored.heroSlides
        : d.heroSlides,
    banners: Array.isArray(stored.banners) ? stored.banners : d.banners,
    statement: { ...d.statement, ...(stored.statement || {}) },
    quote: { ...d.quote, ...(stored.quote || {}) },
    contact: { ...d.contact, ...(stored.contact || {}) },
    whatsappButton: {
      enabled: storedWp?.enabled !== undefined ? Boolean(storedWp.enabled) : dWp.enabled,
      buttonText: storedWp?.buttonText?.trim() || dWp.buttonText,
      phoneNumber: (storedWp?.phoneNumber || stored.contact?.whatsapp || dWp.phoneNumber).replace(/[^\d+]/g, ""),
      messageTemplate: storedWp?.messageTemplate?.trim() || dWp.messageTemplate,
      corporateMessage: storedWp?.corporateMessage?.trim() || dWp.corporateMessage,
      conciergeMessage: storedWp?.conciergeMessage?.trim() || dWp.conciergeMessage,
    },
    social: { ...d.social, ...(stored.social || {}) },
  };
}

/** Build a WhatsApp deep link with optional variable replacement. */
export function buildWhatsAppLink(
  number: string,
  message: string,
  variables?: { name?: string; price?: string; code?: string; url?: string; image?: string },
): string {
  const cleanNumber = (number || "").replace(/[^\d]/g, "");
  let text = message || "";
  if (variables) {
    if (variables.name) {
      text = text.replace(/\{name\}/g, variables.name).replace(/\{product\}/g, variables.name);
    }
    if (variables.price) {
      text = text.replace(/\{price\}/g, variables.price);
    }
    if (variables.code) {
      text = text.replace(/\{code\}/g, variables.code);
    }
    if (variables.url) {
      text = text.replace(/\{url\}/g, variables.url);
    }
    if (variables.image) {
      text = text.replace(/\{image\}/g, variables.image);
    }
  }
  if (!cleanNumber) return `https://wa.me/?text=${encodeURIComponent(text)}`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
