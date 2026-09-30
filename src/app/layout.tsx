import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import StorefrontProviders from "@/components/StorefrontProviders";
import { SITE_URL, SITE_NAME, jsonLdScript } from "@/lib/seo";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

const jost = Jost({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

const DESCRIPTION = "Timect wristwatches — precision timepieces shaped by craftsmanship, engineered for every second.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Timect — Crafted for Every Second",
    template: "%s | Timect",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Timect — Crafted for Every Second",
    description: DESCRIPTION,
    images: [
      {
        url: "https://res.cloudinary.com/dphscxzb4/image/upload/f_jpg,q_auto,c_fill,w_1200,h_630,g_center/v1784048469/timect/Gemini_Generated_Image_hepk3vhepk3vhepk_copy.jpg",
        width: 1200,
        height: 630,
        alt: "Timect two-tone watch with a silver dial and deep blue bezel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Timect — Crafted for Every Second",
    description: DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/images/timect_logo.png", type: "image/png" }],
    shortcut: "/images/timect_logo.png",
    apple: "/images/timect_logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a09",
  colorScheme: "light",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/timect_logo.png`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${jost.variable}`}>
      <body className="bg-[var(--paper)] text-[var(--ink)] antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd) }} />
        <StorefrontProviders>{children}</StorefrontProviders>
      </body>
    </html>
  );
}
