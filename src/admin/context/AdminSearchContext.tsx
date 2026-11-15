"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface AdminSearchContextValue {
  search: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  submitSearch: (term?: string) => void;
}

const AdminSearchContext = createContext<AdminSearchContextValue>({
  search: "",
  setSearch: () => {},
  clearSearch: () => {},
  submitSearch: () => {},
});

export function useAdminSearch() {
  return useContext(AdminSearchContext);
}

export function AdminSearchProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearchState] = useState("");

  // Sync with URL query parameter when pathname or browser history changes
  useEffect(() => {
    const readUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search") || "";
      if (pathname === "/admin/products" || pathname === "/admin/media") {
        setSearchState(query);
      } else {
        setSearchState("");
      }
    };

    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, [pathname]);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState("");
    window.dispatchEvent(new Event("admin:clear-search"));
  }, []);

  const submitSearch = useCallback(
    (term?: string) => {
      const query = (term !== undefined ? term : search).trim();
      if (pathname === "/admin/products") {
        setSearchState(query);
        return;
      }
      if (pathname === "/admin/media") {
        setSearchState(query);
        return;
      }
      // If submitted from another admin page, navigate to products search
      router.push(
        query
          ? `/admin/products?search=${encodeURIComponent(query)}`
          : "/admin/products",
      );
    },
    [pathname, router, search],
  );

  return (
    <AdminSearchContext.Provider
      value={{
        search,
        setSearch,
        clearSearch,
        submitSearch,
      }}
    >
      {children}
    </AdminSearchContext.Provider>
  );
}

