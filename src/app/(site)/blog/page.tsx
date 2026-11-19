import { Metadata } from "next";
import Link from "next/link";
import {
  getPublishedBlogPosts,
  getBlogCategories,
} from "@/db/blog-actions";
import { createPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site-config";
import { JsonLd } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/fuse/buttons";
import { BlogFilters, BlogPagination, blogPageNumber } from "@/components/blog/BlogNavigation";

const baseMetadata: Metadata = {
  ...createPageMetadata({
    title: "Watch Guides & Blogs | Timect Watches",
    description:
      "Explore TIMECT watch guides, automatic movements, hands-on reviews, and horological education.",
    path: "/blog",
    keywords: ["watch guides", "watch buying guide", "watch care guide", "automatic vs quartz", "Timect Watches blogs"],
  }),
  title: { absolute: "Watch Guides & Blogs | Timect Watches" },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }): Promise<Metadata> {
  const page = blogPageNumber((await searchParams).page);
  return page > 1 ? { ...baseMetadata, alternates: { canonical: absoluteUrl(`/blog?page=${page}`) } } : baseMetadata;
}

export default async function BlogHomePage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = blogPageNumber((await searchParams).page);
  const pageSize = 9;
  const [latestPosts, categories] = await Promise.all([
    getPublishedBlogPosts({ limit: pageSize + 1, offset: (page - 1) * pageSize }),
    getBlogCategories(),
  ]);

  const gridPosts = latestPosts.slice(0, pageSize);
  const hasNext = latestPosts.length > pageSize;

  return (
    <div className="container-fuse pb-16 pt-6 md:pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Timect Watches Blogs",
          description: "Authoritative luxury watch editorial, buying guides, and horological education.",
          url: absoluteUrl("/blog"),
          publisher: {
            "@type": "Organization",
            name: "Timect Watches",
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/favicon.ico"),
            },
          },
        }}
      />

      <div className="mb-6 px-3 md:px-4">
        <Breadcrumbs items={[["Home", "/"], ["Blogs"]]} align="start" />
      </div>

      {/* Header aligned strictly inside container-fuse matching site pages */}
      <div className="px-2">
        <h1 className="fuse-h1 mx-auto mt-2 max-w-[900px] animate-rise-in text-center">
          Blogs
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-center text-[15px] leading-[1.6] text-muted md:text-[17px]">
          Essential insights into mechanical timekeeping, movement craftsmanship, case metallurgy, and collector guides.
        </p>

        <BlogFilters categories={categories} />
      </div>

      {/* Trending Guides Row */}
          {/* <div className="mb-3 px-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Curated</p>
            <h2 className="text-[20px] font-bold text-heading md:text-[24px]">Popular Guides</h2>
          </div> */}

          {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trendingPosts.map((post, idx) => (
              <div
                key={post.id}
                className="group flex flex-col justify-between rounded-fuse bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <span className="text-[20px] font-bold text-line">0{idx + 1}</span>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {post.category?.name}
                  </p>
                  <h3 className="mt-1.5 text-[15px] font-bold text-heading leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted border-t border-line/60 pt-3">
                  <span>{post.reading_time_minutes} min read</span>
                  <Link href={`/blog/${post.slug}`} className="font-semibold text-heading hover:underline">
                    Read →
                  </Link>
                </div>
              </div>
            ))}
          </div> */}

      {/* Main Grid matching Catalog Card Proportions */}
      <div className="mt-10 md:mt-12">
        <div className="mb-4 px-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Archive</p>
          <h2 className="text-[20px] font-bold text-heading md:text-[24px]">All Articles</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-fuse bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.featured_image_url || "/api/blog/images/1"}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  <div className="text-[11px] text-muted">
                    <span>{post.reading_time_minutes} min read</span>
                  </div>

                  <h3 className="mt-2 text-[15px] font-bold tracking-tight text-heading group-hover:underline line-clamp-2 leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-2 text-[13px] leading-[1.55] text-[#2b2f38] line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[12px] font-medium">
                  <span className="text-muted">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                  <Link href={`/blog/${post.slug}`} className="font-semibold text-heading hover:underline">
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <BlogPagination page={page} hasNext={hasNext} basePath="/blog" />
      </div>
    </div>
  );
}
