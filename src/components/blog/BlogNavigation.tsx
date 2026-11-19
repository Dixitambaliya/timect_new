import Link from "next/link";
import type { BlogCategory } from "@/db/blog-actions";

export function blogPageNumber(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 10000 ? page : 1;
}

export function BlogFilters({ categories, current }: { categories: BlogCategory[]; current?: string }) {
  const visible = categories.slice(0, 4);
  const selected = categories.find((category) => category.slug === current);
  if (selected && !visible.some((category) => category.slug === current)) visible[visible.length - 1] = selected;
  const remaining = categories.filter((category) => !visible.some((item) => item.id === category.id));
  const linkClass = (active: boolean) => `rounded-fuse-md px-3.5 py-1.5 text-[13px] font-semibold transition ${active ? "bg-heading text-white" : "border border-line bg-white text-heading hover:border-line-hover hover:bg-bg"}`;
  return (
    <nav aria-label="Blog categories" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Link href="/blog" aria-current={!current ? "page" : undefined} className={linkClass(!current)}>All Stories</Link>
      {visible.map((category) => <Link key={category.id} href={`/blog/category/${category.slug}`} aria-current={current === category.slug ? "page" : undefined} className={linkClass(current === category.slug)}>{category.name}</Link>)}
      {remaining.length > 0 && <details className="relative">
        <summary className="cursor-pointer list-none rounded-fuse-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-heading hover:bg-bg">More categories <span aria-hidden="true">&#9662;</span></summary>
        <div className="absolute right-0 z-20 mt-2 min-w-[220px] rounded-fuse-md border border-line bg-white p-2 text-left shadow-lg">
          {remaining.map((category) => <Link key={category.id} href={`/blog/category/${category.slug}`} className="block rounded-fuse-sm px-3 py-2 text-[13px] font-semibold text-heading hover:bg-bg">{category.name}</Link>)}
        </div>
      </details>}
    </nav>
  );
}

export function BlogPagination({ page, hasNext, basePath }: { page: number; hasNext: boolean; basePath: string }) {
  if (page === 1 && !hasNext) return null;
  const href = (number: number) => number === 1 ? basePath : `${basePath}?page=${number}`;
  return <nav aria-label="Blog pagination" className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold">
    {page > 1 && <Link href={href(page - 1)} className="rounded-fuse-md border border-line bg-white px-4 py-2 hover:bg-bg">Previous</Link>}
    <span aria-current="page">Page {page}</span>
    {hasNext && <Link href={href(page + 1)} className="rounded-fuse-md border border-line bg-white px-4 py-2 hover:bg-bg">Next</Link>}
  </nav>;
}
