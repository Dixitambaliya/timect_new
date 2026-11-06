import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/db/blog-actions";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/fuse/buttons";
import { Clock, Calendar, HelpCircle, Sparkles, ArrowRight } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found | TIMECT Journal" };
  }

  const seoTitle = `${post.title} | TIMECT Journal`;
  const seoDescription = post.excerpt;

  return {
    ...createPageMetadata({
      title: seoTitle,
      description: seoDescription,
      path: `/blog/${slug}`,
    }),
    title: { absolute: seoTitle },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.featured_image_url || "/api/blog/images/1",
          width: 1200,
          height: 800,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image_url || "/api/blog/images/1"],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || (post.status !== "published" && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const related = await getRelatedBlogPosts(post.id, post.category_id, 4);

  const structuredData: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.featured_image_url ? [post.featured_image_url] : [],
      datePublished: post.published_at,
      dateModified: post.updated_at,
      publisher: {
        "@type": "Organization",
        name: "TIMECT",
        logo: {
          "@type": "ImageObject",
          url: "https://timect-mu.vercel.app/favicon.ico",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://timect-mu.vercel.app/blog/${post.slug}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://timect-mu.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Journal",
          item: "https://timect-mu.vercel.app/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `https://timect-mu.vercel.app/blog/${post.slug}`,
        },
      ],
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  const breadcrumbItems: [string, (string | undefined)?][] = [
    ["Home", "/"],
    ["Journal", "/blog"],
  ];
  if (post.category) {
    breadcrumbItems.push([post.category.name, `/blog/category/${post.category.slug}`]);
  }
  breadcrumbItems.push([post.title]);

  return (
    <article className="container-fuse pb-20 pt-6 md:pt-10">
      {structuredData.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}

      {/* Breadcrumbs precisely inside container-fuse matching ProductPage / Navbar */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Main Single White Rounded Card for the Entire Article */}
      <div className="rounded-fuse bg-white p-6 md:p-12 shadow-sm">
        {/* Article Meta Header */}
        <div className="mx-auto max-w-[820px] text-center">
          <div className="inline-flex items-center gap-2 rounded-fuse-sm bg-bg border border-line px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>{post.category?.name || "Journal"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {post.reading_time_minutes} min read
            </span>
          </div>

          <h1 className="fuse-h2 mt-4 font-bold text-heading text-center">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="mx-auto mt-3 max-w-[640px] text-[16px] leading-[1.6] text-muted md:text-[18px]">
              {post.subtitle}
            </p>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>
        </div>

        {/* Featured Image proportional frame inside the card */}
        <div className="mx-auto mt-8 max-w-[820px] overflow-hidden rounded-fuse bg-bg border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featured_image_url || "/api/blog/images/1"}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[460px]"
          />
        </div>

        {/* Article Content Section */}
        <div className="mx-auto mt-8 max-w-[820px]">
          {/* Direct Answer Summary Box */}
          {post.seo?.direct_answer && (
            <div className="mb-8 rounded-fuse-md border border-line bg-bg p-5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-heading mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Editorial Summary
              </div>
              <p className="text-[15px] font-medium leading-[1.7] text-[#2b2f38]">
                {post.seo.direct_answer}
              </p>
            </div>
          )}

          {/* Prose */}
          <div
            className="prose prose-neutral max-w-none text-[#2b2f38] text-[16px] leading-[1.8] prose-headings:text-heading prose-headings:font-bold prose-h2:text-[22px] prose-h2:mt-8 prose-h2:mb-3 prose-p:mb-4 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Topics:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-fuse-sm bg-bg border border-line px-2.5 py-0.5 text-[11px] text-heading font-medium"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* FAQ Accordion */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-10 rounded-fuse-md border border-line bg-bg p-5 md:p-6">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Frequently Asked Questions
              </div>
              <h3 className="text-[18px] font-bold text-heading mb-4">
                Common Questions & Guidance
              </h3>

              <div className="space-y-4 divide-y divide-line/60">
                {post.faqs.map((faq, i) => (
                  <div key={i} className={i > 0 ? "pt-4" : ""}>
                    <h4 className="text-[15px] font-bold text-heading mb-1.5">
                      {faq.question}
                    </h4>
                    <p className="text-[14px] leading-[1.65] text-[#2b2f38]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Related Articles strictly within container-fuse */}
      {related.length > 0 && (
        <div className="mt-12 md:mt-14">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[20px] font-bold text-heading md:text-[22px]">
              Related Articles
            </h3>
            <Link href="/blog" className="text-[12px] font-semibold text-heading hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {related.map((rel) => (
              <div
                key={rel.id}
                className="group flex flex-col overflow-hidden rounded-fuse bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rel.featured_image_url || "/api/blog/images/1"}
                    alt={rel.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {rel.category?.name}
                    </p>
                    <h4 className="mt-1 text-[14px] font-bold text-heading leading-snug line-clamp-2 group-hover:underline">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted border-t border-line/60 pt-2.5">
                    <span>{rel.reading_time_minutes} min read</span>
                    <Link href={`/blog/${rel.slug}`} className="font-semibold text-heading hover:underline">
                      Read →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
