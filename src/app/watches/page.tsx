"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  LucideCheck,
  LucideChevronDown,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideStar,
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
    <div
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col p-4 min-w-0 animate-pulse"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-hidden
    >
      <div className="aspect-square w-full bg-slate-100 rounded-xl mb-4" />
      <div className="space-y-2 px-1">
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-3 w-8 bg-slate-100 rounded" />
        </div>
        <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
        <div className="flex justify-between items-center pt-4 mt-2">
          <div className="h-4 w-20 bg-slate-100 rounded" />
          <div className="h-9 w-24 bg-slate-100 rounded-lg" />
        </div>
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
  const primary = catalogThumbUrl(src);
  const hover = hoverSrc ? catalogThumbUrl(hoverSrc, 480) : "";
  const [primaryLoaded, setPrimaryLoaded] = useState(false);

  return (
    <div className="relative aspect-square w-full bg-slate-100 rounded-xl mb-4 overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 product-hover-crossfade ${
          primaryLoaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />
      <HoverSwapImage
        src={primary}
        hoverSrc={hover}
        alt={alt}
        priority={priority}
        onPrimaryLoad={() => setPrimaryLoaded(true)}
      />
    </div>
  );
}

function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: CatalogCard;
  index: number;
  onOpen: (slug: string) => void;
}) {
  const displayBrand = product.brand || product.collection || "Seiko";
  const displayName = product.name || product.title || "Exclusive Watch";

  return (
    <div
      onClick={() => onOpen(product.slug)}
      className="product-card-enter group bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300 min-w-0"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="relative">
        {product.tag && (
          <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-2 py-0.5 tracking-widest rounded-md uppercase z-10">
            {product.tag}
          </span>
        )}
        {product.isMainProduct && !product.tag && (
          <span className="absolute top-3 left-3 bg-[#0c2c42] text-white text-[9px] font-bold px-2 py-0.5 tracking-widest rounded-md uppercase z-10">
            EXCLUSIVE
          </span>
        )}
        <ProgressiveImage
          src={product.image}
          hoverSrc={product.hoverImage}
          alt={displayName}
          priority={index < 3}
        />
      </div>

      {/* Text always renders immediately — never waits on images */}
      <div className="flex-grow flex flex-col space-y-1 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase truncate max-w-[70%]">
            {displayBrand}
          </span>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            <LucideStar className="h-3 w-3 fill-amber-500" />
            <span className="text-[10px] font-bold text-gray-600">
              {product.rating || "4.5"}
            </span>
          </div>
        </div>

        <h3
          className="text-xs font-bold text-gray-900 uppercase truncate leading-tight mt-1"
          title={displayName}
        >
          {displayName}
        </h3>

        {product.code && (
          <span className="text-[10px] font-medium text-gray-400">
            Ref: {product.code}
          </span>
        )}
        {product.gender && (
          <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
            {product.gender}
          </span>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-auto">
          <span className="text-sm font-extrabold text-black">
            {product.price}
          </span>
          <button
            type="button"
            className="bg-black hover:bg-neutral-800 text-white rounded-lg px-3 py-2.5 text-[10px] font-extrabold tracking-wider transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
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
    <div className="min-h-screen bg-slate-50 text-[#111111]">
      <Header />

      <main className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Area */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-gray-200 h-fit sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-sm font-bold tracking-wider uppercase text-gray-900">
                Filters
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-black font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Search filter */}
            <div className="mb-6">
              <label className="block text-xs font-bold tracking-wider uppercase text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search watches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:bg-white focus:border-black focus:outline-none transition-all"
                />
                <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold tracking-wider uppercase text-gray-700">
                  Max Price
                </label>
                <span className="text-xs font-bold text-gray-900">
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
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black mb-1"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(DEFAULT_PRICE_MAX / 2)}</span>
                <span>{formatPrice(DEFAULT_PRICE_MAX)}</span>
              </div>
            </div>

            {/* Gender filter */}
            <div className="mb-6 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 mb-3">
                Gender
              </h4>
              <div className="space-y-2">
                {["Men", "Women", "Unisex"].map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center gap-3 text-xs text-gray-600 font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(gender)}
                      onChange={() => handleGenderChange(gender)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>

            {/* Collection filters (Shop by Category) */}
            <div className="mb-6 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 mb-3">
                Collection
              </h4>
              <div className="space-y-2">
                {SHOP_BY_CATEGORY.map((item) => {
                  const selected = activeFilter === item.slug;
                  return (
                    <label
                      key={item.slug}
                      className="flex items-center gap-3 text-xs text-gray-600 font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => setCatalogFilter(item.slug)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                      />
                      <span className={selected ? "text-black font-semibold" : ""}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand filter */}
            <div className="mb-8 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 mb-3">
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
                    className="flex items-center gap-3 text-xs text-gray-600 font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
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
                    className="lg:hidden flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold tracking-wider hover:border-black transition shadow-sm"
                  >
                    <LucideSlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>

                  <p className="text-xs text-gray-500 font-medium flex items-center gap-2 flex-wrap">
                    <span>
                      Showing{" "}
                      <span className="font-bold text-gray-900">
                        {products.length}
                        {hasMore ? "+" : ""}
                      </span>{" "}
                      luxury watches
                    </span>
                    {(loading || loadingMore) && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        <span className="h-3 w-3 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
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
                    className={`flex items-center gap-2 bg-white px-3.5 py-2 border rounded-xl text-xs shadow-sm transition-all duration-200 cursor-pointer select-none ${
                      sortOpen
                        ? "border-black ring-2 ring-black/5"
                        : "border-gray-200 hover:border-gray-900"
                    }`}
                    aria-expanded={sortOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="text-gray-500 font-medium">Sort:</span>
                    <span className="font-bold text-gray-900">
                      {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ||
                        "Newest"}
                    </span>
                    <LucideChevronDown
                      className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
                        sortOpen ? "rotate-180 text-black" : ""
                      }`}
                    />
                  </button>

                  {sortOpen && (
                    <div
                      role="listbox"
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-2xl py-1.5 z-40 ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
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
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-slate-50 text-black font-bold"
                                : "text-gray-600 hover:bg-slate-50 hover:text-black font-medium"
                            }`}
                          >
                            <span>{option.label}</span>
                            {isSelected && (
                              <LucideCheck className="h-3.5 w-3.5 text-black ml-2 flex-shrink-0" />
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
                      className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full hover:bg-neutral-800 transition"
                    >
                      {chip.label}
                      <LucideX className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[10px] font-bold tracking-wider uppercase text-gray-500 hover:text-black underline underline-offset-2"
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
              <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500 font-medium mb-4">
                  No watches found matching the selected filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-wider hover:bg-neutral-800 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index % PAGE_SIZE}
                      onOpen={(slug) => router.push(`/product/${slug}`)}
                    />
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
                      className="bg-black hover:bg-neutral-800 text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      LOAD MORE PRODUCTS
                    </button>
                  )}
                  {loadingMore && hasMore && (
                    <p className="text-xs text-gray-400 font-medium tracking-wide">
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
          className="fixed inset-0 bg-black/50 z-[9999] flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[300px] bg-white h-full p-6 flex flex-col animate-slide-in"
          >
            {/* Header (Sticky / Non-scrollable) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-6 shrink-0">
              <h3 className="text-sm font-bold tracking-wider uppercase text-gray-900">
                Filters
              </h3>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-xs text-gray-500 hover:text-black font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-6 mb-6">
              {/* Search filter */}
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search watches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:bg-white focus:border-black focus:outline-none transition-all"
                  />
                  <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-gray-700">
                    Max Price
                  </label>
                  <span className="text-xs font-bold text-gray-900">
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
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black mb-1"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(DEFAULT_PRICE_MAX)}</span>
                </div>
              </div>

              {/* Gender filter */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 mb-3">
                  Gender
                </h4>
                <div className="space-y-2">
                  {["Men", "Women", "Unisex"].map((gender) => (
                    <label
                      key={gender}
                      className="flex items-center gap-3 text-xs text-gray-600 font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(gender)}
                        onChange={() => handleGenderChange(gender)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              {/* Collection filters */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 mb-3">
                  Collection
                </h4>
                <div className="space-y-2">
                  {SHOP_BY_CATEGORY.map((item) => {
                    const selected = activeFilter === item.slug;
                    return (
                      <label
                        key={item.slug}
                        className="flex items-center gap-3 text-xs text-gray-600 font-medium cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setCatalogFilter(item.slug)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                        />
                        <span
                          className={
                            selected ? "text-black font-semibold" : ""
                          }
                        >
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Brand filter */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold tracking-wider uppercase text-gray-700 mb-3">
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
                      className="flex items-center gap-3 text-xs text-gray-600 font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Buttons (Non-scrollable) */}
            <div className="mt-auto pt-4 flex gap-4 border-t border-gray-100 shrink-0">
              <button
                onClick={handleResetFilters}
                className="flex-1 bg-white border border-gray-200 text-black py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:border-black transition cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition cursor-pointer"
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
    <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
      <WatchesCatalogContent />
    </Suspense>
  );
}
