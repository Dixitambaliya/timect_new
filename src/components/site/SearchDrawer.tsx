"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getCatalogCards, type CatalogCard } from "@/db/actions";
import { cx } from "@/lib/cx";
import { Drawer } from "@/components/fuse/Overlay";
import { CloseIcon, SearchIcon } from "@/components/fuse/icons";
import { ProductCardHorizontal } from "./ProductCard";
import { SEARCHABLE_PAGES, watchesFilterHref } from "./navigation";
import { useSite } from "./SiteProvider";

function Skeleton() {
  return (
    <div className="flex gap-2 rounded-fuse bg-white/60 p-2">
      <div className="h-[140px] w-[140px] animate-pulse rounded-fuse-md bg-placeholder" />
      <div className="flex flex-1 flex-col gap-3 rounded-fuse-md bg-white p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-placeholder" />
        <div className="mt-auto h-4 w-1/3 animate-pulse rounded bg-placeholder" />
      </div>
    </div>
  );
}

type Tab = "products" | "categories" | "pages";

/** Predictive search drawer — live product search against the catalog DB. */
export default function SearchDrawer() {
  const { panel, closePanel, categories } = useSite();
  const router = useRouter();
  const open = panel === "search";
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [results, setResults] = useState<CatalogCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [recommended, setRecommended] = useState<CatalogCard[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTerm(q.trim()), 280);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!open) {
      setQ("");
      setTerm("");
      setTab("products");
    } else if (recommended === null) {
      getCatalogCards({ category: "recommended", pageSize: 6 })
        .then((r) => setRecommended(r.products))
        .catch(() => setRecommended([]));
    }
  }, [open, recommended]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    getCatalogCards({ search: term, pageSize: 12 })
      .then((r) => active && setResults(r.products))
      .catch(() => active && setResults([]))
      .finally(() => active && setSearching(false));
    return () => {
      active = false;
    };
  }, [term]);

  const loading = searching || q.trim() !== term;
  const lower = term.toLowerCase();
  const matchedCategories = useMemo(
    () => categories.filter((c) => c.label.toLowerCase().includes(lower)),
    [categories, lower],
  );
  const matchedPages = useMemo(
    () => SEARCHABLE_PAGES.filter((p) => p.title.toLowerCase().includes(lower)),
    [lower],
  );
  const counts: Record<Tab, number> = {
    products: results.length,
    categories: matchedCategories.length,
    pages: matchedPages.length,
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    closePanel();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Drawer open={open} onClose={closePanel} side="right" label="Search" width="md:w-[600px]">
      <form onSubmit={submit} className="px-4 pt-5 md:px-6 md:pt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="search-input" className="text-[16px] text-muted">
            Search
          </label>
          <button type="button" onClick={closePanel} aria-label="Close search" className="-m-2 p-2">
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 border-b border-transparent pb-2 focus-within:border-line">
          <SearchIcon className="h-6 w-6 shrink-0" />
          <input
            id="search-input"
            data-autofocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search watches, collections, references…"
            autoComplete="off"
            className="w-full bg-transparent text-[22px] font-semibold outline-none placeholder:font-normal placeholder:text-muted/70 md:text-[24px]"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-[14px] font-semibold text-muted underline">
              Clear
            </button>
          )}
        </div>
      </form>

      {term ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 px-4 md:px-6" role="tablist">
            {(["products", "categories", "pages"] as Tab[]).map((k) => {
              const n = counts[k];
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  disabled={!n && !(k === "products" && loading)}
                  onClick={() => setTab(k)}
                  className={cx(
                    "rounded-fuse border px-2 py-3 text-[14px] font-semibold capitalize transition-colors duration-400 md:text-[16px]",
                    tab === k ? "border-accent-border bg-accent-soft" : "border-white bg-white",
                    !n && "border-transparent bg-white/40 font-normal text-muted",
                  )}
                >
                  {k} ({k === "products" && loading ? "…" : n})
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex-1 overflow-y-auto px-4 pb-28 md:px-6">
            {tab === "products" ? (
              loading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              ) : results.length ? (
                <ul className="flex flex-col gap-4">
                  {results.map((p, i) => (
                    <li key={p.id} className="animate-rise-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <ProductCardHorizontal product={p} onNavigate={closePanel} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-10 text-center text-muted">No watches found for “{term}”.</p>
              )
            ) : tab === "categories" ? (
              <ul className="flex flex-col gap-2">
                {matchedCategories.map((c) => (
                  <li key={c.slug}>
                    <Link href={watchesFilterHref(c.slug)} onClick={closePanel} className="flex items-center gap-4 rounded-fuse bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {c.image && <img src={c.image} alt="" className="h-16 w-16 rounded-fuse-md object-cover" />}
                      <span className="font-semibold capitalize">{c.label.toLowerCase()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col gap-2">
                {matchedPages.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} onClick={closePanel} className="block rounded-fuse bg-white px-5 py-4 font-semibold">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="absolute inset-x-2 bottom-2 md:inset-x-4 md:bottom-4">
            <button type="button" onClick={() => submit()} className="btn-secondary w-full">
              See all results
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 flex-1 overflow-y-auto px-4 pb-6 md:px-6">
          {categories.length > 0 && (
            <>
              <p className="mb-3 text-[14px] font-semibold uppercase tracking-wide text-muted">Popular categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.slug} href={watchesFilterHref(c.slug)} onClick={closePanel} className="pill capitalize">
                    {c.label.toLowerCase()}
                  </Link>
                ))}
              </div>
            </>
          )}
          <p className="mb-3 mt-8 text-[14px] font-semibold uppercase tracking-wide text-muted">Recommended watches</p>
          {recommended === null ? (
            <div className="flex flex-col gap-4">
              <Skeleton />
              <Skeleton />
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {recommended.map((p, i) => (
                <li key={p.id} className="animate-rise-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <ProductCardHorizontal product={p} onNavigate={closePanel} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Drawer>
  );
}
