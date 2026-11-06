import { Metadata } from "next";
import Link from "next/link";
import {
  getPublishedBlogPosts,
  getBlogCategories,
} from "@/db/blog-actions";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/fuse/buttons";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Journal | TIMECT Watches & Editorial",
    description:
      "Explore TIMECT watch guides, automatic movements, hands-on reviews, and horological education.",
    path: "/blog",
  }),
  title: { absolute: "Journal | TIMECT Watches & Editorial" },
};

export default async function BlogHomePage() {
  const [featuredPosts, latestPosts, categories, trendingPosts] = await Promise.all([
    getPublishedBlogPosts({ featured: true, limit: 1 }),
    getPublishedBlogPosts({ limit: 15 }),
    getBlogCategories(),
    getPublishedBlogPosts({ trending: true, limit: 4 }),
  ]);

  const heroPost = featuredPosts[0] || latestPosts[0];
  const gridPosts = latestPosts.filter((p) => p.id !== heroPost?.id);

  return (
    <div className="container-fuse pb-16 pt-6 md:pt-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "TIMECT Journal",
          description: "Authoritative luxury watch editorial, buying guides, and horological education.",
          url: "https://timect-mu.vercel.app/blog",
          publisher: {
            "@type": "Organization",
            name: "TIMECT",
            logo: {
              "@type": "ImageObject",
              url: "https://timect-mu.vercel.app/favicon.ico",
            },
          },
        }}
      />

      {/* Header aligned strictly inside container-fuse matching site pages */}
      <div className="px-2">
        <Breadcrumbs items={[["Home", "/"], ["Journal"]]} />
        <h1 className="fuse-h1 mx-auto mt-2 max-w-[900px] animate-rise-in text-center">
          Journal
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-center text-[15px] leading-[1.6] text-muted md:text-[17px]">
          Essential insights into mechanical timekeeping, movement craftsmanship, case metallurgy, and collector guides.
        </p>

        {/* Category Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/blog"
            className="rounded-fuse-md bg-heading px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90"
          >
            All Stories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog/category/${c.slug}`}
              className="rounded-fuse-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-heading transition hover:border-line-hover hover:bg-bg"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Featured Story -compacted to proportional size */}
      {heroPost && (
        <div className="mt-8 md:mt-10">
          <div className="group grid grid-cols-1 gap-6 rounded-fuse bg-white p-5 md:grid-cols-12 md:p-8 shadow-sm transition hover:shadow-md">
            <div className="relative overflow-hidden rounded-fuse-md md:col-span-6 bg-bg aspect-[16/10] max-h-[380px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroPost.featured_image_url || "/api/blog/images/1"}
                alt={heroPost.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="rounded-fuse-sm bg-heading/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  Featured
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between md:col-span-6 md:py-2">
              <div>
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted">
                  <span>{heroPost.category?.name || "Horology"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {heroPost.reading_time_minutes} min read
                  </span>
                </div>

                <h2 className="mt-3 text-[22px] font-bold tracking-tight text-heading md:text-[28px] leading-snug">
                  <Link href={`/blog/${heroPost.slug}`} className="hover:underline">
                    {heroPost.title}
                  </Link>
                </h2>

                <p className="mt-3 text-[14px] leading-[1.65] text-[#2b2f38] line-clamp-3">
                  {heroPost.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
                <span className="text-[12px] text-muted">
                  {heroPost.published_at ? new Date(heroPost.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
                <Link
                  href={`/blog/${heroPost.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-fuse-sm bg-bg px-3.5 py-1.5 text-[12px] font-semibold text-heading transition hover:bg-heading hover:text-white"
                >
                  Read Story <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Guides Row */}
      {trendingPosts.length > 0 && (
        <div className="mt-10 md:mt-12">
          <div className="mb-3 px-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Curated</p>
            <h2 className="text-[20px] font-bold text-heading md:text-[24px]">Popular Guides</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </div>
      )}

      {/* Main Grid matching Catalog Card Proportions */}
      <div className="mt-10 md:mt-12">
        <div className="mb-4 px-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Archive</p>
          <h2 className="text-[20px] font-bold text-heading md:text-[24px]">All Articles</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded-fuse-sm bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-heading backdrop-blur shadow-sm">
                    {post.category?.name || "Journal"}
                  </span>
                </div>
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
      </div>
    </div>
  );
}
