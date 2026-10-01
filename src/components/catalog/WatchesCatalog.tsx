"use client";

import { smoothScrollTo } from "@/lib/smooth-scroll";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getCatalogCards, type CatalogCard } from "@/db/actions";
import type { CatalogFacets, ShopCategory } from "@/db/content";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { Breadcrumbs } from "@/components/fuse/buttons";
import { Drawer } from "@/components/fuse/Overlay";
import { useCarousel, useDragScroll, useScrollY } from "@/components/fuse/hooks";
import { CarouselProgress, Reveal } from "@/components/fuse/ui";
import { ChevronDown, CloseIcon, FilterIcon, SearchIcon, SortIcon, Spinner } from "@/components/fuse/icons";
import ProductCard, { ProductCardSkeleton } from "@/components/site/ProductCard";

const PAGE_SIZE = 12;
const GENDERS = ["Men", "Women", "Unisex"] as const;
const SORTS = [
  ["newest", "Newest"],
  ["price-asc", "Price, low to high"],
  ["price-desc", "Price, high to low"],
] as const;
const CATEGORY_TABS = [
  ["all", "All watches"],
  ["new", "New arrivals"],
  ["recommended", "Recommended"],
] as const;
const CATEGORY_TITLES: Record<string, string> = {
  new: "New arrivals",
  recommended: "Recommended",
  related: "Curated picks",
};

/** Session cache so revisiting a filter combination paints instantly. */
const sessionCache = new Map<string, { products: CatalogCard[]; hasMore: boolean; page: number; at: number }>();
const CACHE_TTL_MS = 60_000;

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function FilterGroup({
  title,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-fuse bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-start font-semibold"
      >
        <span>
          {title}
          {count ? <span className="ms-2 rounded-full bg-heading px-2 py-0.5 text-[12px] text-white">{count}</span> : null}
        </span>
        <ChevronDown className={cx("h-5 w-5 transition-transform duration-400", open && "rotate-180")} />
      </button>
      <div className={cx("grid transition-[grid-template-rows] duration-400", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CategoryRail({
  categories,
  active,
  onToggle,
}: {
  categories: ShopCategory[];
  active: string;
  onToggle: (slug: string) => void;
}) {
  const car = useCarousel();
  useDragScroll(car.ref);
  if (!categories.length) return null;
  return (
    <div className="mt-10 md:mt-14">
      <ul ref={car.ref} className="no-scrollbar -my-2 flex snap-x gap-2 overflow-x-auto py-2">
        {categories.map((c, i) => {
          const on = active === c.slug;
          return (
            <li key={c.slug} className="w-[280px] shrink-0 snap-start animate-rise-in md:w-[360px]" style={{ animationDelay: `${i * 60}ms` }}>
              <button
                type="button"
                onClick={() => onToggle(c.slug)}
                aria-pressed={on}
                className={cx(
                  "hover-lift group/sc flex w-full gap-2 rounded-fuse p-2 text-start transition-colors duration-400",
                  on ? "bg-accent-soft ring-1 ring-accent-border" : "bg-[#dfe3e8]",
                )}
              >
                <span className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-fuse-md md:h-[120px] md:w-[120px]" style={{ background: c.bg }}>
                  {c.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={catalogThumbUrl(c.image, 300)} alt="" className="img-fill transition-transform duration-700 group-hover/sc:scale-110" loading="lazy" />
                  )}
                </span>
                <span className="flex flex-1 flex-col rounded-fuse-md bg-white p-4">
                  <span className="text-[17px] font-semibold capitalize">{c.label.toLowerCase()}</span>
                  <span className="mt-auto text-[14px] font-semibold">
                    <span className="link-underline">{on ? "Clear filter" : "Shop now"}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <CarouselProgress carousel={car} className="mt-4" />
    </div>
  );
}

export default function WatchesCatalog({
  facets,
  filterLabels,
  categories,
}: {
  facets: CatalogFacets;
  filterLabels: Record<string, string>;
  categories: ShopCategory[];
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const y = useScrollY();

  // ---- URL is the single source of truth for every filter ----
  const category = sp.get("category") || "all";
  const filter = sp.get("filter") || "";
  const genders = useMemo(
    () => (sp.get("gender") || "").split(",").filter((g) => (GENDERS as readonly string[]).includes(g)),
    [sp],
  );
  const brands = useMemo(() => (sp.get("brand") || "").split(",").filter(Boolean), [sp]);
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "newest";
  const maxParam = Number(sp.get("max"));
  const maxPrice = maxParam > 0 && maxParam < facets.maxPrice ? maxParam : facets.maxPrice;

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "" || (k === "category" && v === "all") || (k === "sort" && v === "newest")) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  // Debounced inputs (search + price) write back to the URL
  const [searchDraft, setSearchDraft] = useState(q);
  const [priceDraft, setPriceDraft] = useState(maxPrice);
  useEffect(() => setSearchDraft(q), [q]);
  useEffect(() => setPriceDraft(maxPrice), [maxPrice]);
  useEffect(() => {
    if (searchDraft.trim() === q) return;
    const t = setTimeout(() => update({ q: searchDraft.trim() || null }), 350);
    return () => clearTimeout(t);
  }, [searchDraft, q, update]);
  useEffect(() => {
    if (priceDraft === maxPrice) return;
    const t = setTimeout(() => update({ max: priceDraft >= facets.maxPrice ? null : String(priceDraft) }), 350);
    return () => clearTimeout(t);
  }, [priceDraft, maxPrice, facets.maxPrice, update]);

  // ---- Data ----
  const [products, setProducts] = useState<CatalogCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const gen = useRef(0);
  const key = [category, filter, genders.join(","), brands.join(","), q, sort, maxPrice].join("|");

  const fetchPage = useCallback(
    (pageNum: number) =>
      getCatalogCards({
        search: q || undefined,
        genders,
        brands,
        priceMin: 0,
        priceMax: maxPrice < facets.maxPrice ? maxPrice : undefined,
        category,
        filter: filter || undefined,
        sortBy: sort,
        page: pageNum,
        pageSize: PAGE_SIZE,
      }),
    // key captures every dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  useEffect(() => {
    const myGen = ++gen.current;
    const cached = sessionCache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      setProducts(cached.products);
      setHasMore(cached.hasMore);
      setPage(cached.page);
      setLoading(false);
      return;
    }
    setLoading(true);
    setProducts([]);
    setHasMore(false);
    setPage(1);
    fetchPage(1)
      .then((res) => {
        if (myGen !== gen.current) return;
        setProducts(res.products);
        setHasMore(res.hasMore);
        sessionCache.set(key, { products: res.products, hasMore: res.hasMore, page: 1, at: Date.now() });
      })
      .catch((err) => console.error("Failed to load watches:", err))
      .finally(() => myGen === gen.current && setLoading(false));
  }, [key, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const myGen = gen.current;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetchPage(next);
      if (myGen !== gen.current) return;
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev, ...res.products.filter((p) => !seen.has(p.id))];
        sessionCache.set(key, { products: merged, hasMore: res.hasMore, page: next, at: Date.now() });
        return merged;
      });
      setHasMore(res.hasMore);
      setPage(next);
    } finally {
      if (myGen === gen.current) setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, fetchPage, key]);

  // Infinite scroll sentinel
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && void loadMore(), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  // ---- UI state ----
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [cols, setCols] = useState(4);

  const toggleList = (param: "gender" | "brand", list: string[], value: string) => {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    update({ [param]: next.join(",") || null });
  };
  const resetAll = () => {
    setSearchDraft("");
    router.replace(pathname, { scroll: false });
  };

  const chips: { id: string; label: string; onRemove: () => void }[] = [];
  if (filter) chips.push({ id: "filter", label: filterLabels[filter] || filter, onRemove: () => update({ filter: null }) });
  if (category !== "all") chips.push({ id: "cat", label: CATEGORY_TITLES[category] || category, onRemove: () => update({ category: null }) });
  if (q) chips.push({ id: "q", label: `“${q}”`, onRemove: () => update({ q: null }) });
  if (maxPrice < facets.maxPrice) chips.push({ id: "max", label: `Up to ${inr(maxPrice)}`, onRemove: () => update({ max: null }) });
  genders.forEach((g) => chips.push({ id: `g-${g}`, label: g, onRemove: () => toggleList("gender", genders, g) }));
  brands.forEach((b) => chips.push({ id: `b-${b}`, label: b, onRemove: () => toggleList("brand", brands, b) }));
  const filterCount = chips.filter((c) => c.id !== "cat").length;

  const title =
    (filter && filterLabels[filter]) ||
    (genders.length === 1 ? (genders[0] === "Men" ? "For him" : genders[0] === "Women" ? "For her" : "Unisex") : "") ||
    CATEGORY_TITLES[category] ||
    "All watches";

  const grid = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-3 xl:grid-cols-4", 5: "lg:grid-cols-4 xl:grid-cols-5" }[cols];
  const sortLabel = SORTS.find((s) => s[0] === sort)?.[1] || "Newest";

  return (
    <div className="container-fuse pb-10 pt-12 md:pt-20">
      <div className="px-2">
        <Breadcrumbs items={[["Home", "/"], ["Watches", title !== "All watches" ? "/watches" : undefined], ...(title !== "All watches" ? [[title] as [string]] : [])]} />
        <Reveal as="h1" type="wipe" key={title} className="fuse-h1 mt-2 text-center capitalize">
          {title.toLowerCase()}
        </Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORY_TABS.map(([id, label]) => (
            <button key={id} type="button" onClick={() => update({ category: id })} className={cx("pill", category === id && "is-active")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <CategoryRail categories={categories} active={filter} onToggle={(slug) => update({ filter: filter === slug ? null : slug })} />

      {chips.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={c.onRemove}
              className="flex animate-rise-in items-center gap-2 rounded-fuse border border-accent-border bg-accent-soft px-4 py-2 text-[14px] font-semibold"
            >
              {c.label} <CloseIcon className="h-4 w-4" />
            </button>
          ))}
          <button type="button" onClick={resetAll} className="link-underline ms-2 text-[14px] font-semibold">
            Clear all
          </button>
        </div>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-[14px] text-muted" aria-live="polite">
        {loading ? (
          <>
            <Spinner className="h-4 w-4" /> Loading watches…
          </>
        ) : (
          `${products.length}${hasMore ? "+" : ""} watches`
        )}
      </p>

      <ul className={cx("mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3", grid)}>
        {loading && products.length === 0
          ? Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <ProductCardSkeleton />
              </li>
            ))
          : products.map((p, i) => (
              <li key={p.id} className="animate-rise-in" style={{ animationDelay: `${(i % PAGE_SIZE) * 45}ms` }}>
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
        {loadingMore &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={`more-${i}`}>
              <ProductCardSkeleton />
            </li>
          ))}
      </ul>

      {!loading && products.length === 0 && (
        <div className="py-20 text-center">
          <p className="fuse-h5">No watches match these filters</p>
          <button type="button" onClick={resetAll} className="btn-secondary mt-6">
            Clear filters
          </button>
        </div>
      )}

      <div ref={sentinel} className="flex h-20 items-center justify-center">
        {hasMore && !loadingMore && (
          <button type="button" onClick={() => void loadMore()} className="btn-outline">
            <span className="btn-text !py-3">Load more</span>
          </button>
        )}
      </div>

      {/* Sticky glass toolbar */}
      <div className="pointer-events-none sticky bottom-3 z-40 mt-6 flex justify-center gap-3 md:bottom-6">
        <div className="glass-dark pointer-events-auto flex items-center gap-2 rounded-fuse !bg-[#232323cc] p-1.5 text-white">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-fuse-md bg-white px-5 py-3 font-medium text-ink md:px-10"
          >
            <FilterIcon className="h-5 w-5" /> Filters
            {filterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-heading px-1 text-[12px] text-white">{filterCount}</span>
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              onBlur={() => setTimeout(() => setSortOpen(false), 150)}
              aria-expanded={sortOpen}
              className="flex items-center gap-2 px-3 py-3 md:px-6"
            >
              <SortIcon className="h-5 w-5 text-white/60" />
              <span className="hidden text-white/60 md:inline">Sort by:</span>
              <span className="max-w-[120px] truncate font-semibold">{sortLabel}</span>
              <ChevronDown className={cx("h-5 w-5 transition-transform", sortOpen && "rotate-180")} />
            </button>
            {sortOpen && (
              <ul className="absolute bottom-[calc(100%+12px)] left-0 w-[240px] animate-dropdown-in rounded-fuse-md bg-white p-1 text-ink shadow-xl">
                {SORTS.map(([k, l]) => (
                  <li key={k}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        update({ sort: k });
                        setSortOpen(false);
                      }}
                      className={cx("w-full rounded-[8px] px-3 py-2 text-start hover:bg-bg", k === sort && "bg-accent-soft font-semibold")}
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="hidden gap-1 rounded-fuse-md bg-white/10 p-1 md:flex" role="radiogroup" aria-label="Grid density">
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={cols === n}
                aria-label={`${n} columns`}
                onClick={() => setCols(n)}
                className={cx("flex h-9 w-10 items-center justify-center rounded-[10px] transition-colors", cols === n ? "bg-[#00000070]" : "hover:bg-white/10")}
              >
                <span className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${n}, 3px)` }}>
                  {Array.from({ length: n * 2 }, (_, i) => (
                    <span key={i} className="h-[5px] w-[3px] rounded-[1px] bg-white" />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => smoothScrollTo(0)}
          className={cx(
            "glass-dark pointer-events-auto hidden rounded-fuse !bg-[#232323cc] px-6 font-semibold text-white transition-opacity duration-400 md:block md:px-8",
            y > 600 ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          Up
        </button>
      </div>

      {/* Filter drawer */}
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" label="Filters" width="md:w-[480px]">
        <div className="flex items-center justify-between p-4 md:p-6">
          <h2 className="text-[20px] font-semibold text-muted">Filters</h2>
          <button type="button" onClick={() => setFiltersOpen(false)} className="icon-btn bg-white" aria-label="Close filters">
            <CloseIcon />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-4 md:px-4">
          <FilterGroup title="Search" count={q ? 1 : 0}>
            <div className="flex items-center gap-2 rounded-fuse border border-line bg-white px-4 focus-within:border-ink">
              <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Name, reference, material…"
                className="w-full bg-transparent py-3.5 outline-none"
              />
            </div>
          </FilterGroup>
          <FilterGroup title="Price" count={maxPrice < facets.maxPrice ? 1 : 0}>
            <div className="relative h-6">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-pag-bg" />
              <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-heading" style={{ width: `${(priceDraft / facets.maxPrice) * 100}%` }} />
              <input
                type="range"
                aria-label="Maximum price"
                min={0}
                max={facets.maxPrice}
                step={5000}
                value={priceDraft}
                onChange={(e) => setPriceDraft(Number(e.target.value))}
                className="range-fuse absolute inset-0"
              />
            </div>
            <div className="mt-4 flex justify-between text-[15px] font-semibold">
              <span className="rounded-[10px] border border-line px-3 py-2">{inr(0)}</span>
              <span className="rounded-[10px] border border-line px-3 py-2">{inr(priceDraft)}</span>
            </div>
          </FilterGroup>
          <FilterGroup title="Gender" count={genders.length}>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button key={g} type="button" onClick={() => toggleList("gender", genders, g)} className={cx("pill px-4 py-2.5 text-[14px]", genders.includes(g) && "is-active")}>
                  {g}
                </button>
              ))}
            </div>
          </FilterGroup>
          {categories.length > 0 && (
            <FilterGroup title="Collection" count={filter ? 1 : 0}>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => {
                  const on = filter === c.slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => update({ filter: on ? null : c.slug })}
                      aria-pressed={on}
                      className={cx(
                        "flex items-center gap-2 rounded-[10px] border px-2 py-2 text-start text-[14px] capitalize transition-colors",
                        on ? "border-accent-border bg-accent-soft" : "border-line hover:border-line-hover",
                      )}
                    >
                      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-[6px] border border-black/10" style={{ background: c.bg }}>
                        {c.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={catalogThumbUrl(c.image, 80)} alt="" className="img-fill" />
                        )}
                      </span>
                      <span className="flex-1 truncate">{c.label.toLowerCase()}</span>
                    </button>
                  );
                })}
              </div>
            </FilterGroup>
          )}
          {facets.brands.length > 0 && (
            <FilterGroup title="Brand / collection" count={brands.length} defaultOpen={false}>
              <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto">
                {facets.brands.map((b) => (
                  <label key={b} className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={brands.includes(b)} onChange={() => toggleList("brand", brands, b)} className="h-5 w-5 accent-heading" />
                    <span className="flex-1">{b}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 md:p-4">
          <button type="button" onClick={resetAll} className="rounded-fuse border border-line bg-white py-4 font-semibold">
            Clear all
          </button>
          <button type="button" onClick={() => setFiltersOpen(false)} className="btn-secondary">
            {loading ? "Updating…" : `Show ${products.length}${hasMore ? "+" : ""} results`}
          </button>
        </div>
      </Drawer>
    </div>
  );
}
