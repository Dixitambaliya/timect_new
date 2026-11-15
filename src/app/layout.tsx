import type { Metadata } from "next";
import { absoluteUrl, SITE_CONFIG } from "@/lib/seo/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: "%s | TIMECT",
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    locale: SITE_CONFIG.locale,
    images: [{ url: absoluteUrl(SITE_CONFIG.logo), alt: "TIMECT watches" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [absoluteUrl(SITE_CONFIG.logo)],
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
