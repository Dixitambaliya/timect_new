"use client";

import NextLink from "next/link";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ComponentProps } from "react";
import { adminPath } from "./routing";

export const AdminSubdomainContext = createContext(false);
export function AdminNavigationProvider({ subdomain, children }: { subdomain: boolean; children: React.ReactNode }) {
  return <AdminSubdomainContext.Provider value={subdomain}>{children}</AdminSubdomainContext.Provider>;
}

export default function AdminLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const subdomain = useContext(AdminSubdomainContext);
  const target = typeof href === "string" ? adminPath(href, subdomain) : {
    ...href, pathname: href.pathname ? adminPath(href.pathname, subdomain) : href.pathname,
  };
  return <NextLink {...props} href={target} />;
}

export function useRouter() {
  const router = useNextRouter();
  const subdomain = useContext(AdminSubdomainContext);
  return useMemo(() => ({ ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(adminPath(href, subdomain), options),
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(adminPath(href, subdomain), options),
  }), [router, subdomain]);
}

// Existing selection/filter logic compares against internal /admin paths.
export function usePathname() {
  const pathname = useNextPathname();
  const subdomain = useContext(AdminSubdomainContext);
  return subdomain ? `/admin${pathname === "/" ? "" : pathname}` : pathname;
}
