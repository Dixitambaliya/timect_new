import type { Metadata } from "next";
import { getCatalogCards } from "@/db/actions";
import { Breadcrumbs, ButtonOutline } from "@/components/fuse/buttons";
import { SearchIcon } from "@/components/fuse/icons";
import ProductCard from "@/components/site/ProductCard";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const results = term ? await getCatalogCards({ search: term, pageSize: 48 }) : null;

  return (
    <div className="container-fuse pb-16 pt-12 md:pt-20">
      <Breadcrumbs items={[["Home", "/"], ["Search"]]} />
      <h1 className="fuse-h1 mt-2 text-center">Search</h1>
      <form action="/search" className="mx-auto mt-8 flex max-w-[640px] items-center gap-2 rounded-fuse bg-white p-2">
        <SearchIcon className="ms-3 h-6 w-6 shrink-0" />
        <input
          name="q"
          defaultValue={term}
          placeholder="Search watches"
          aria-label="Search watches"
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[18px] outline-none"
        />
        <button className="btn-secondary px-6 py-3">Search</button>
      </form>
      {results && (
        <p className="mt-8 text-center text-muted" aria-live="polite">
          {results.products.length}
          {results.hasMore ? "+" : ""} results for “{term}”
        </p>
      )}
      {results && results.products.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
          {results.products.map((p, i) => (
            <li key={p.id} className="animate-rise-in" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}
      {results?.hasMore && (
        <div className="mt-10 flex justify-center">
          <ButtonOutline href={`/watches?q=${encodeURIComponent(term)}`}>See every match in the catalog</ButtonOutline>
        </div>
      )}
      {results && results.products.length === 0 && (
        <div className="py-16 text-center">
          <p className="fuse-h5">No watches found</p>
          <p className="mt-3 text-muted">Try a collection name, material, or reference number.</p>
          <ButtonOutline href="/watches" className="mt-8">
            Browse all watches
          </ButtonOutline>
        </div>
      )}
    </div>
  );
}
