import type { Metadata } from "next";
import { Archivo, Chivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo-face",
  display: "swap",
});

const chivo = Chivo({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-chivo-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Timect — Official Online Store",
    template: "%s | Timect",
  },
  description: "Celebrating 145 Years of Craftsmanship — precision wristwatches by Timect.",
  icons: {
    icon: [{ url: "/images/timect_logo.png", type: "image/png" }],
    shortcut: "/images/timect_logo.png",
    apple: "/images/timect_logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${chivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
