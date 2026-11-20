import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedBlogPosts,
  getBlogCategories,
} from "@/db/blog-actions";
import { createPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site-config";
import { BlogFilters, BlogPagination, blogPageNumber } from "@/components/blog/BlogNavigation";
import { Breadcrumbs } from "@/components/fuse/buttons";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = blogPageNumber((await searchParams).page);
  const categories = await getBlogCategories();
  const current = categories.find((c) => c.slug === slug);

  if (!current) {
    return { title: "Category Not Found | Timect Watches" };
  }

  return {
    ...createPageMetadata({
      title: current.seo_title || `${current.name} Watch Guides | Timect Watches`,
      description: current.seo_description || current.description || `Read ${current.name} watch guides and practical blogs from Timect Blogs.`,
      path: `/blog/category/${slug}`,
      keywords: [`${current.name} watch guides`, current.name, "Timect Watches Blogs", "watch education"],
    }),
    title: { absolute: current.seo_title || `${current.name} Watch Guides | Timect Watches` },
    ...(page > 1 ? { alternates: { canonical: absoluteUrl(`/blog/category/${slug}?page=${page}`) } } : {}),
  };
}

export default async function BlogCategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = blogPageNumber((await searchParams).page);
  const pageSize = 9;
  const { slug } = await params;
  const categories = await getBlogCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const results = await getPublishedBlogPosts({ categorySlug: slug, limit: pageSize + 1, offset: (page - 1) * pageSize });
  const posts = results.slice(0, pageSize);

  return (
    <div className="container-fuse pb-20 pt-12 md:pt-20">
      <JsonLd data={webPageSchema({ name: `${currentCategory.name} Watch Guides`, description: currentCategory.seo_description || currentCategory.description || `Watch guides about ${currentCategory.name}.`, path: `/blog/category/${slug}`, type: "CollectionPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blogs", path: "/blog" }, { name: currentCategory.name, path: `/blog/category/${slug}` }])} />
      {/* Category Masthead */}
      <div className="px-2">
        <Breadcrumbs items={[["Home", "/"], ["Blogs", "/blog"], [currentCategory.name]]} />
        <h1 className="fuse-h1 mx-auto mt-2 max-w-[1100px] animate-rise-in text-center">
          {currentCategory.name}
        </h1>
        {currentCategory.description && (
          <p className="mx-auto mt-5 max-w-[680px] text-center text-[16px] leading-[1.6] text-muted md:text-[18px]">
            {currentCategory.description}
          </p>
        )}

        <BlogFilters categories={categories} current={slug} />
      </div>

      {/* Posts Grid */}
      <div className="mx-auto mt-12 md:mt-16 max-w-site">
        {posts.length === 0 ? (
          <div className="rounded-fuse bg-white p-12 text-center text-muted">
            <p>No published blogs in this category yet.</p>
            <Link href="/blog" className="mt-4 inline-block text-[13px] uppercase tracking-wider text-heading font-semibold underline">
              Return to Blogs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] text-muted">
                      <span>{post.reading_time_minutes} min read</span>
                    </div>

                    <h2 className="mt-3 text-[19px] font-bold tracking-tight text-heading group-hover:underline line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="mt-3 text-[14px] leading-[1.6] text-[#2b2f38] line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4 text-[13px] font-medium">
                    <span className="text-muted">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <Link href={`/blog/${post.slug}`} className="font-semibold text-heading hover:underline">
                      Read Story →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <BlogPagination page={page} hasNext={results.length > pageSize} basePath={`/blog/category/${slug}`} />
      </div>
    </div>
  );
}
