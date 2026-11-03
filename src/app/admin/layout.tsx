import type { Metadata } from "next";
import "@/admin/styles/admin.css";

export const metadata: Metadata = {
  title: "Timect Admin",
  description: "Timect catalog CMS",
  robots: { index: false, follow: false },
};

/**
 * Admin root layout -isolated from storefront chrome.
 * Does not render Header/Footer/Preloader.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
