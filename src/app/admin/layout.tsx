import { headers } from "next/headers";
import { isAdminHost } from "@/admin/lib/routing";
import { AdminNavigationProvider } from "@/admin/lib/navigation";
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
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subdomain = isAdminHost((await headers()).get("host") || "");
  return <AdminNavigationProvider subdomain={subdomain}>{children}</AdminNavigationProvider>;
}
