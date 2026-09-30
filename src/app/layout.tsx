import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import StorefrontProviders from "@/components/StorefrontProviders";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const jost = Jost({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Timect - Official Online Store",
  description: "Celebrating 145 Years of Craftsmanship",
  icons: {
    icon: [
      { url: "/images/timect_logo.png", type: "image/png" },
      {
        url: "https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/timect_logo.png",
    apple: "/images/timect_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${jost.variable}`}
    >
      <body className="bg-white text-[#111111] antialiased">
        <StorefrontProviders>{children}</StorefrontProviders>
      </body>
    </html>
  );
}
