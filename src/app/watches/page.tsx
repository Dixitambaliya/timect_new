"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { getCatalogCards, type CatalogCard } from "@/db/actions";
import {
  getCatalogFilterLabel,
  SHOP_BY_CATEGORY,
} from "@/data/categoryFilters";
import { catalogThumbUrl } from "@/lib/catalog-image";
import HoverSwapImage from "@/components/product/HoverSwapImage";
import { signalPageReady } from "@/lib/page-ready";
import { displayCase, splitProductName } from "@/lib/product-display";
import {
  LucideCheck,
  LucideChevronDown,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideX,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

const DEFAULT_PRICE_MAX = 250000;
/** Page size — first batch paints as soon as text data returns */
const PAGE_SIZE = 9;

/** Session cache so revisiting filters feels instant */
const catalogSessionCache = new Map<
  string,
  { products: CatalogCard[]; hasMore: boolean; page: number; at: number }
>();
const CACHE_TTL_MS = 60_000;

function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div className="min-w-0 animate-pulse" style={{ animationDelay: `${index * 40}ms` }} aria-hidden>
      <div className="aspect-[4/5] w-full bg-[#ebe6dc]" />
      <div className="mt-5 space-y-3">
        <div className="h-2.5 w-16 bg-[var(--stone)]" />
        <div className="h-4 w-3/4 bg-[var(--stone)]" />
        <div className="h-3 w-1/3 bg-[var(--stone)]" />
      </div>
    </div>
  );
}

/** Image loads independently — card text is never blocked on the photo. */
function ProgressiveImage({
  src,
  hoverSrc,
  alt,
  priority = false,
}: {
  src?: string;
  hoverSrc?: string;
  alt: string;
  priority?: boolean;
}) {
  const primary = catalogThumbUrl(src, 640);
  const hover = hoverSrc ? catalogThumbUrl(hoverSrc, 640) : "";
  const [primaryLoaded, setPrimaryLoaded] = useState(false);

  return (
    <div className="relative aspect-[4/5] w-full bg-[#ebe6dc] overflow-hidden catalog-media">
      <div
        className={`absolute inset-0 bg-[var(--stone)] product-hover-crossfade ${primaryLoaded ? "opacity-0" : "opacity-100"}`}
        aria-hidden
      />
      <HoverSwapImage
        src={primary}
        hoverSrc={hover}
        alt={alt}
        fit="cover"
        priority={priority}
        onPrimaryLoad={() => setPrimaryLoaded(true)}
      />
    </div>
  );
}

function ProductCard({ product, index }: { product: CatalogCard; index: number }) {
  const split = splitProductName(product.name || product.title, product.code);
  const displayName = displayCase(split.title || product.collection || "Timect");
  const kicker =
    (split.title && (product.collection || (product.brand !== "Exclusive" ? product.brand : ""))) ||
    (product.gender && product.gender !== "Unisex" ? `For ${product.gender === "Men" ? "Him" : "Her"}` : "Timect");
  const badge = product.tag || (product.isMainProduct ? "Exclusive" : "");

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-card-enter group block min-w-0"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="relative">
        {badge && (
          <span className="absolute top-4 left-4 z-10 eyebrow text-[0.58rem] text-[var(--ink)]/70">{badge}</span>
        )}
        <ProgressiveImage src={product.image} hoverSrc={product.hoverImage} alt={displayName} priority={index < 3} />
        <span
          className="absolute right-4 bottom-4 eyebrow text-[0.58rem] opacity-0 translate-y-2 transition-all duration-700 ease-[var(--ease-lux)] group-hover:opacity-100 group-hover:translate-y-0"
          aria-hidden
        >
          Discover →
        </span>
      </div>

      <div className="mt-5">
        <p className="eyebrow text-[0.58rem] text-[var(--muted)] truncate">{displayCase(kicker)}</p>
        <h2 className="display text-[1.25rem] md:text-[1.4rem] leading-[1.15] mt-2 line-clamp-2" title={displayName}>
          {displayName}
        </h2>
        <div className="mt-2.5 flex items-baseline justify-between gap-3 text-[0.8rem] font-light text-[var(--muted)]">
          <span className="truncate tracking-[0.08em]">{split.reference}</span>
          <span className="text-[var(--ink)] whitespace-nowrap tracking-[0.03em]">{product.price}</span>
        </div>
      </div>
    </Link>
  );
}

/** Editorial title band — the heading follows the active collection. */
function CatalogIntro({ label }: { label: string }) {
  return (
    <div className="pt-10 md:pt-16 pb-10 md:pb-14 mb-8 md:mb-12 border-b border-[var(--line)] grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
      <div className="md:col-span-8">
        <p className="eyebrow text-[var(--champagne)]">The Collection</p>
        <h1 className="display display-lg mt-6">{label}</h1>
      </div>
      <p className="md:col-span-4 lede text-[var(--muted)] md:pb-2">
        Precision wristwatches, each chosen for the way it wears, reads and endures.
      </p>
    </div>
  );
}

function WatchesCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL-driven initial category / specification / gender filter
  const urlCategory = searchParams.get("category") || "all";
  const urlFilter = searchParams.get("filter") || "";
  const urlGender = searchParams.get("gender") || "";

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenders, setSelectedGenders] = useState<string[]>(() =>
    urlGender && ["Men", "Women", "Unisex"].includes(urlGender)
      ? [urlGender]
      : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    DEFAULT_PRICE_MAX,
  ]);
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);
  const [activeFilter, setActiveFilter] = useState<string>(urlFilter);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    if (sortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortOpen]);

  // Debounced filters for API requests
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<
    [number, number]
  >([0, DEFAULT_PRICE_MAX]);

  // Pagination & Results status state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Products state — text paints as soon as the lean API returns
  const [products, setProducts] = useState<CatalogCard[]>([]);
  /** True only while waiting for the very first batch of a new filter set */
  const [loading, setLoading] = useState(true);
  /** True while streaming extra pages or user Load more */
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchGenRef = useRef(0);

  // Mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Debounce price range
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 300);
    return () => clearTimeout(handler);
  }, [priceRange]);

  // Synchronize category + specification + gender filters with URL changes
  useEffect(() => {
    const category = searchParams.get("category") || "all";
    const filter = searchParams.get("filter") || "";
    const gender = searchParams.get("gender") || "";
    setActiveCategory(category);
    setActiveFilter(filter);
    if (gender && ["Men", "Women", "Unisex"].includes(gender)) {
      setSelectedGenders([gender]);
    }
  }, [searchParams]);

  const filterKey = [
    debouncedSearchQuery,
    selectedGenders.join(","),
    selectedBrands.join(","),
    debouncedPriceRange[0],
    debouncedPriceRange[1],
    activeCategory,
    activeFilter,
    sortBy,
  ].join("|");

  const fetchPage = useCallback(
    async (pageNum: number) => {
      // Lean catalog payload: text + image URLs only (images load in the browser)
      return getCatalogCards({
        search: debouncedSearchQuery,
        genders: selectedGenders,
        brands: selectedBrands,
        priceMin: debouncedPriceRange[0],
        priceMax: debouncedPriceRange[1],
        category: activeCategory,
        filter: activeFilter || undefined,
        sortBy: sortBy,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
    },
    [
      debouncedSearchQuery,
      selectedGenders,
      selectedBrands,
      debouncedPriceRange,
      activeCategory,
      activeFilter,
      sortBy,
    ],
  );

  // Progressive UX: cache hit paints text instantly; network fills/refreshes.
  // Images always load independently after card text is on screen.
  useEffect(() => {
    const gen = ++fetchGenRef.current;
    let cancelled = false;

    const cached = catalogSessionCache.get(filterKey);
    const cacheFresh =
      cached && Date.now() - cached.at < CACHE_TTL_MS ? cached : null;

    if (cacheFresh) {
      setProducts(cacheFresh.products);
      setHasMore(cacheFresh.hasMore);
      setPage(cacheFresh.page);
      setLoading(false);
      setLoadingMore(false);
      signalPageReady();
    } else {
      setPage(1);
      setProducts([]);
      setHasMore(false);
      setLoading(true);
      setLoadingMore(false);
    }

    const run = async () => {
      try {
        const first = await fetchPage(1);
        if (cancelled || gen !== fetchGenRef.current) return;

        setProducts(first.products);
        setHasMore(first.hasMore);
        setPage(1);
        setLoading(false);
        catalogSessionCache.set(filterKey, {
          products: first.products,
          hasMore: first.hasMore,
          page: 1,
          at: Date.now(),
        });
        signalPageReady();
      } catch (err) {
        console.error("Failed to load watches:", err);
        if (!cancelled && gen === fetchGenRef.current) {
          setLoading(false);
          signalPageReady();
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [filterKey, fetchPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const gen = fetchGenRef.current;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const batch = await fetchPage(next);
      if (gen !== fetchGenRef.current) return;
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = batch.products.filter((p) => !seen.has(p.id));
        return fresh.length ? [...prev, ...fresh] : prev;
      });
      setHasMore(batch.hasMore);
      setPage(next);
    } catch (err) {
      console.error("Failed to load more watches:", err);
    } finally {
      if (gen === fetchGenRef.current) setLoadingMore(false);
    }
  };

  const handleApplyFilters = () => {
    setMobileSidebarOpen(false);
  };

  const buildWatchesUrl = (opts: {
    category?: string;
    filter?: string | null;
  }) => {
    const params = new URLSearchParams();
    const category = opts.category ?? activeCategory;
    const filter =
      opts.filter === null ? "" : (opts.filter ?? activeFilter);
    if (category && category !== "all") params.set("category", category);
    if (filter) params.set("filter", filter);
    const qs = params.toString();
    return qs ? `/watches?${qs}` : "/watches";
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenders([]);
    setSelectedBrands([]);
    setPriceRange([0, DEFAULT_PRICE_MAX]);
    setActiveFilter("");
    setActiveCategory("all");
    router.push("/watches");
  };

  const clearCatalogFilter = () => {
    setActiveFilter("");
    router.push(buildWatchesUrl({ filter: null }));
  };

  const setCatalogFilter = (slug: string) => {
    const next = activeFilter === slug ? "" : slug;
    setActiveFilter(next);
    router.push(buildWatchesUrl({ filter: next || null }));
  };

  const filterLabel = getCatalogFilterLabel(activeFilter);
  const CATEGORY_TITLES: Record<string, string> = { new: "New Arrivals", recommended: "The Selection", related: "Collection" };
  const activeFilterLabel =
    (filterLabel && displayCase(filterLabel)) ||
    CATEGORY_TITLES[activeCategory] ||
    (selectedGenders.length === 1 && selectedGenders[0] !== "Unisex"
      ? selectedGenders[0] === "Men"
        ? "For Him"
        : "For Her"
      : "All Watches");

  const handleGenderChange = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender],
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const removeGender = (gender: string) => {
    setSelectedGenders((prev) => prev.filter((g) => g !== gender));
  };

  const removeBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== brand));
  };

  const clearSearch = () => setSearchQuery("");

  const clearPrice = () => setPriceRange([0, DEFAULT_PRICE_MAX]);


  // Helper to clean price format for display
  const formatPrice = (priceVal: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(priceVal);
  };

  type ActiveChip = {
    id: string;
    label: string;
    onRemove: () => void;
  };

  const activeChips: ActiveChip[] = [];
  if (filterLabel && activeFilter) {
    activeChips.push({
      id: `filter-${activeFilter}`,
      label: filterLabel,
      onRemove: clearCatalogFilter,
    });
  }
  if (debouncedSearchQuery.trim()) {
    activeChips.push({
      id: `search-${debouncedSearchQuery}`,
      label: `Search: ${debouncedSearchQuery.trim()}`,
      onRemove: clearSearch,
    });
  }
  if (priceRange[1] < DEFAULT_PRICE_MAX) {
    activeChips.push({
      id: "price-max",
      label: `Max ${formatPrice(priceRange[1])}`,
      onRemove: clearPrice,
    });
  }
  for (const gender of selectedGenders) {
    activeChips.push({
      id: `gender-${gender}`,
      label: gender,
      onRemove: () => removeGender(gender),
    });
  }
  for (const brand of selectedBrands) {
    activeChips.push({
      id: `brand-${brand}`,
      label: brand,
      onRemove: () => removeBrand(brand),
    });
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Header />

      <main className="lux-container pb-24 md:pb-32">
        <CatalogIntro label={activeFilterLabel} />
        {/* Content Area */}
        <div className="grid lg:grid-cols-4 gap-8 xl:gap-14">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block h-fit sticky top-[calc(var(--header-h)+1.5rem)] pr-8 border-r border-[var(--line)]">
            <div className="flex items-center justify-between pb-5 border-b border-[var(--line)] mb-7">
              <h3 className="eyebrow text-[var(--ink)]">
                Filters
              </h3>
              <button
                onClick={handleResetFilters}
                className="eyebrow text-[0.58rem] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Search filter */}
            <div className="mb-6">
              <label className="block eyebrow text-[0.6rem] text-[var(--muted)] mb-3">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search watches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-[var(--line)] py-2.5 pl-7 pr-2 text-[0.85rem] font-light placeholder:text-[var(--muted)] focus:border-[var(--ink)] focus:outline-none transition-colors"
                />
                <LucideSearch className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="eyebrow text-[0.6rem] text-[var(--muted)]">
                  Max Price
                </label>
                <span className="text-[0.8rem] text-[var(--ink)]">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={DEFAULT_PRICE_MAX}
                step="5000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value, 10)])
                }
                className="w-full h-px bg-[var(--line)] appearance-none cursor-pointer accent-[var(--ink)] mb-2"
              />
              <div className="flex justify-between text-[0.65rem] text-[var(--muted)] tracking-[0.06em]">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(DEFAULT_PRICE_MAX / 2)}</span>
                <span>{formatPrice(DEFAULT_PRICE_MAX)}</span>
              </div>
            </div>

            {/* Gender filter */}
            <div className="mb-6 border-t border-[var(--line)] pt-6">
              <h4 className="eyebrow text-[0.6rem] text-[var(--muted)] mb-4">
                Gender
              </h4>
              <div className="space-y-2">
                {["Men", "Women", "Unisex"].map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center gap-3 text-[0.85rem] font-light text-[var(--ink)]/75 hover:text-[var(--ink)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(gender)}
                      onChange={() => handleGenderChange(gender)}
                      className="h-3.5 w-3.5 cursor-pointer accent-[var(--ink)]"
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>

            {/* Collection filters (Shop by Category) */}
            <div className="mb-6 border-t border-[var(--line)] pt-6">
              <h4 className="eyebrow text-[0.6rem] text-[var(--muted)] mb-4">
                Collection
              </h4>
              <div className="space-y-2">
                {SHOP_BY_CATEGORY.map((item) => {
                  const selected = activeFilter === item.slug;
                  return (
                    <label
                      key={item.slug}
                      className="flex items-center gap-3 text-[0.85rem] font-light text-[var(--ink)]/75 hover:text-[var(--ink)] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => setCatalogFilter(item.slug)}
                        className="h-3.5 w-3.5 cursor-pointer accent-[var(--ink)]"
                      />
                      <span className={selected ? "text-[var(--ink)]" : ""}>
                        {displayCase(item.label)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand filter */}
            <div className="mb-8 border-t border-[var(--line)] pt-6">
              <h4 className="eyebrow text-[0.6rem] text-[var(--muted)] mb-4">
                Brand / Collection
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                {[
                  "Exclusive",
                  "Presage",
                  "Prospex",
                  "Astron",
                  "HYDROCONQUEST",
                  "Seiko",
                ].map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 text-[0.85rem] font-light text-[var(--ink)]/75 hover:text-[var(--ink)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="h-3.5 w-3.5 cursor-pointer accent-[var(--ink)]"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Catalog Grid */}
          <div className="lg:col-span-3">
            {/* Active filters status / Results count & Sort */}
            <div className="flex flex-col gap-3 mb-6 px-1">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-2.5 h-10 px-4 border border-[var(--line)] eyebrow text-[0.6rem] hover:border-[var(--ink)] transition-colors"
                  >
                    <LucideSlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>

                  <p className="text-[0.8rem] font-light text-[var(--muted)] flex items-center gap-3 flex-wrap">
                    <span>
                      Showing{" "}
                      <span className="text-[var(--ink)]">
                        {products.length}
                        {hasMore ? "+" : ""}
                      </span>{" "}
                      watches
                    </span>
                    {(loading || loadingMore) && (
                      <span className="inline-flex items-center gap-2 eyebrow text-[0.56rem] text-[var(--muted)]">
                        <span className="h-3 w-3 border border-[var(--line)] border-t-[var(--ink)] rounded-full animate-spin" />
                        Loading…
                      </span>
                    )}
                  </p>
                </div>

                {/* Custom Luxury Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen((prev) => !prev)}
                    className={`flex items-center gap-2.5 h-10 px-4 border text-[0.8rem] transition-colors duration-300 cursor-pointer select-none ${
                      sortOpen
                        ? "border-[var(--ink)]"
                        : "border-[var(--line)] hover:border-[var(--ink)]"
                    }`}
                    aria-expanded={sortOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="eyebrow text-[0.56rem] text-[var(--muted)]">Sort</span>
                    <span className="text-[var(--ink)]">
                      {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ||
                        "Newest"}
                    </span>
                    <LucideChevronDown
                      className={`h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-300 ${
                        sortOpen ? "rotate-180 text-[var(--ink)]" : ""
                      }`}
                    />
                  </button>

                  {sortOpen && (
                    <div
                      role="listbox"
                      className="absolute right-0 mt-2 w-56 bg-[var(--paper)] border border-[var(--line)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] py-2 z-40 overflow-hidden"
                    >
                      {SORT_OPTIONS.map((option) => {
                        const isSelected = sortBy === option.value;
                        return (
                          <button
                            key={option.value}
                            role="option"
                            aria-selected={isSelected}
                            type="button"
                            onClick={() => {
                              setSortBy(option.value);
                              setSortOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-5 py-3 text-[0.82rem] text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[var(--ivory)] text-[var(--ink)]"
                                : "text-[var(--ink)]/70 font-light hover:bg-[var(--ivory)] hover:text-[var(--ink)]"
                            }`}
                          >
                            <span>{option.label}</span>
                            {isSelected && (
                              <LucideCheck className="h-3.5 w-3.5 text-[var(--champagne)] ml-2 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-2 h-8 px-3.5 border border-[var(--ink)] eyebrow text-[0.56rem] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                    >
                      {chip.label}
                      <LucideX className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="eyebrow text-[0.56rem] text-[var(--muted)] hover:text-[var(--ink)] underline underline-offset-4"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* No skeleton flash — Timect preloader covers until first batch is ready */}
            {loading && products.length === 0 ? (
              <div className="min-h-[320px] bg-transparent" aria-busy="true" />
            ) : !loading && products.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center border-y border-[var(--line)] p-8 text-center">
                <p className="display text-[1.8rem] mb-6">
                  No watches found matching the selected filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="lux-btn lux-btn--dark"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-12 sm:gap-x-6 md:gap-y-16">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index % PAGE_SIZE} />
                  ))}
                  {/* Placeholder cards while more batches stream in */}
                  {loadingMore &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <ProductCardSkeleton
                        key={`more-sk-${i}`}
                        index={i}
                      />
                    ))}
                </div>
                <div className="flex flex-col items-center mt-12 mb-6">
                  {hasMore && !loadingMore && (
                    <button
                      type="button"
                      onClick={() => void loadMore()}
                      className="lux-btn lux-btn--dark disabled:opacity-50"
                    >
                      Load more
                    </button>
                  )}
                  {loadingMore && hasMore && (
                    <p className="eyebrow text-[0.58rem] text-[var(--muted)]">
                      Fetching more watches…
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Modal overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-[9999] flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[min(340px,88vw)] bg-[var(--paper)] h-full p-7 flex flex-col animate-slide-in"
          >
            {/* Header (Sticky / Non-scrollable) */}
            <div className="flex items-center justify-between pb-5 border-b border-[var(--line)] mb-7 shrink-0">
              <h3 className="eyebrow text-[var(--ink)]">
                Filters
              </h3>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="eyebrow text-[0.58rem] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-6 mb-6">
              {/* Search filter */}
              <div>
                <label className="block eyebrow text-[0.6rem] text-[var(--muted)] mb-3">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search watches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[var(--line)] py-2.5 pl-7 pr-2 text-[0.85rem] font-light placeholder:text-[var(--muted)] focus:border-[var(--ink)] focus:outline-none transition-colors"
                  />
                  <LucideSearch className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="eyebrow text-[0.6rem] text-[var(--muted)]">
                    Max Price
                  </label>
                  <span className="text-[0.8rem] text-[var(--ink)]">
                    {formatPrice(priceRange[1])}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={DEFAULT_PRICE_MAX}
                  step="5000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value, 10)])
                  }
                  className="w-full h-px bg-[var(--line)] appearance-none cursor-pointer accent-[var(--ink)] mb-2"
                />
                <div className="flex justify-between text-[0.65rem] text-[var(--muted)] tracking-[0.06em]">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(DEFAULT_PRICE_MAX)}</span>
                </div>
              </div>

              {/* Gender filter */}
              <div className="border-t border-[var(--line)] pt-6">
                <h4 className="eyebrow text-[0.6rem] text-[var(--muted)] mb-4">
                  Gender
                </h4>
                <div className="space-y-2">
                  {["Men", "Women", "Unisex"].map((gender) => (
                    <label
                      key={gender}
                      className="flex items-center gap-3 text-[0.85rem] font-light text-[var(--ink)]/75 hover:text-[var(--ink)] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(gender)}
                        onChange={() => handleGenderChange(gender)}
                        className="h-3.5 w-3.5 cursor-pointer accent-[var(--ink)]"
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              {/* Collection filters */}
              <div className="border-t border-[var(--line)] pt-6">
                <h4 className="eyebrow text-[0.6rem] text-[var(--muted)] mb-4">
                  Collection
                </h4>
                <div className="space-y-2">
                  {SHOP_BY_CATEGORY.map((item) => {
                    const selected = activeFilter === item.slug;
                    return (
                      <label
                        key={item.slug}
                        className="flex items-center gap-3 text-[0.85rem] font-light text-[var(--ink)]/75 hover:text-[var(--ink)] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setCatalogFilter(item.slug)}
                          className="h-3.5 w-3.5 cursor-pointer accent-[var(--ink)]"
                        />
                        <span
                          className={
                            selected ? "text-[var(--ink)]" : ""
                          }
                        >
                          {displayCase(item.label)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Brand filter */}
              <div className="border-t border-[var(--line)] pt-6">
                <h4 className="eyebrow text-[0.6rem] text-[var(--muted)] mb-4">
                  Brand / Collection
                </h4>
                <div className="space-y-2">
                  {[
                    "Exclusive",
                    "Presage",
                    "Prospex",
                    "Astron",
                    "HYDROCONQUEST",
                    "Seiko",
                  ].map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-3 text-[0.85rem] font-light text-[var(--ink)]/75 hover:text-[var(--ink)] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="h-3.5 w-3.5 cursor-pointer accent-[var(--ink)]"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Buttons (Non-scrollable) */}
            <div className="mt-auto pt-5 flex gap-3 border-t border-[var(--line)] shrink-0">
              <button
                onClick={handleResetFilters}
                className="flex-1 lux-btn lux-btn--dark !px-0"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 lux-btn lux-btn--solid !px-0"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function WatchesCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--paper)]" aria-busy="true" />}>
      <WatchesCatalogContent />
    </Suspense>
  );
}
