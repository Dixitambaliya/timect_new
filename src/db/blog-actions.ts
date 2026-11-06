import { sql } from "@/db/neon";

export interface BlogImageRow {
  id: number;
  file_name: string;
  mime_type: string;
  image_data?: Buffer | string | null;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  image_type: string | null;
  prompt: string | null;
  created_at: string;
}

export interface BlogAuthor {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  designation: string | null;
  avatar_url: string | null;
  social_links?: Record<string, string>;
  created_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  post_count?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface BlogFaq {
  id?: number;
  blog_post_id?: number;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface BlogPostSeo {
  id?: number;
  blog_post_id?: number;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  search_intent: string | null;
  target_entities: string[] | null;
  direct_answer: string | null;
  seo_score: number;
  geo_score: number;
  aeo_score: number;
  schema_type: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string;
  content_html: string;
  content_json?: any;
  featured_image_id: number | null;
  featured_image_url: string | null;
  author_id: number | null;
  category_id: number | null;
  status: "draft" | "published" | "scheduled" | "archived";
  is_featured: boolean;
  is_trending: boolean;
  reading_time_minutes: number;
  view_count: number;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  // joined fields:
  author?: BlogAuthor;
  category?: BlogCategory;
  tags?: BlogTag[];
  seo?: BlogPostSeo;
  faqs?: BlogFaq[];
}

/**
 * Public Data Fetchers
 */

export async function getPublishedBlogPosts(options?: {
  categoryId?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  try {
    let rows;
    if (options?.categorySlug) {
      rows = await sql`
        SELECT p.*, 
               c.name as category_name, c.slug as category_slug,
               a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE p.status = 'published' AND c.slug = ${options.categorySlug}
        ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (options?.featured) {
      rows = await sql`
        SELECT p.*, 
               c.name as category_name, c.slug as category_slug,
               a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE p.status = 'published' AND p.is_featured = TRUE
        ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
        LIMIT ${limit}
      `;
    } else if (options?.trending) {
      rows = await sql`
        SELECT p.*, 
               c.name as category_name, c.slug as category_slug,
               a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE p.status = 'published' AND (p.is_trending = TRUE OR p.view_count > 0)
        ORDER BY p.view_count DESC, p.published_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    } else if (options?.search) {
      const q = `%${options.search.toLowerCase()}%`;
      rows = await sql`
        SELECT p.*, 
               c.name as category_name, c.slug as category_slug,
               a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE p.status = 'published' AND (LOWER(p.title) LIKE ${q} OR LOWER(p.excerpt) LIKE ${q})
        ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT p.*, 
               c.name as category_name, c.slug as category_slug,
               a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE p.status = 'published'
        ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return rows.map(formatPostRow);
  } catch (err) {
    console.error("Error in getPublishedBlogPosts:", err);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const postRows = await sql`
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug, c.description as category_desc,
             a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation, a.bio as author_bio, a.social_links as author_social
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN blog_authors a ON p.author_id = a.id
      WHERE p.slug = ${slug}
      LIMIT 1
    `;

    if (!postRows.length) return null;

    const post = formatPostRow(postRows[0]);

    // Increment view count asynchronously
    sql`UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ${post.id}`.catch(console.error);

    // Fetch SEO metadata
    const seoRows = await sql`
      SELECT * FROM blog_post_seo WHERE blog_post_id = ${post.id} LIMIT 1
    `;
    if (seoRows.length) {
      post.seo = seoRows[0] as BlogPostSeo;
    }

    // Fetch FAQs
    const faqRows = await sql`
      SELECT question, answer, sort_order FROM blog_post_faqs 
      WHERE blog_post_id = ${post.id} 
      ORDER BY sort_order ASC, id ASC
    `;
    post.faqs = faqRows as BlogFaq[];

    // Fetch Tags
    const tagRows = await sql`
      SELECT t.id, t.name, t.slug, t.description 
      FROM blog_tags t
      JOIN blog_post_tags pt ON pt.blog_tag_id = t.id
      WHERE pt.blog_post_id = ${post.id}
    `;
    post.tags = tagRows as BlogTag[];

    return post;
  } catch (err) {
    console.error("Error in getBlogPostBySlug:", err);
    return null;
  }
}

export async function getRelatedBlogPosts(postId: number, categoryId: number | null, limit = 4) {
  try {
    const rows = await sql`
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             a.name as author_name, a.slug as author_slug, a.avatar_url as author_avatar, a.designation as author_designation
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN blog_authors a ON p.author_id = a.id
      WHERE p.status = 'published' AND p.id != ${postId}
        AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
      ORDER BY p.published_at DESC NULLS LAST
      LIMIT ${limit}
    `;
    return rows.map(formatPostRow);
  } catch (err) {
    console.error("Error in getRelatedBlogPosts:", err);
    return [];
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const rows = await sql`
      SELECT c.*, COUNT(p.id) FILTER (WHERE p.status = 'published') as post_count
      FROM blog_categories c
      LEFT JOIN blog_posts p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    return rows as unknown as BlogCategory[];
  } catch (err) {
    console.error("Error in getBlogCategories:", err);
    return [];
  }
}

export async function getBlogAuthors(): Promise<BlogAuthor[]> {
  try {
    const rows = await sql`SELECT * FROM blog_authors ORDER BY name ASC`;
    return rows as unknown as BlogAuthor[];
  } catch (err) {
    console.error("Error in getBlogAuthors:", err);
    return [];
  }
}

export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const rows = await sql`SELECT * FROM blog_tags ORDER BY name ASC`;
    return rows as unknown as BlogTag[];
  } catch (err) {
    console.error("Error in getBlogTags:", err);
    return [];
  }
}

function formatPostRow(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    content_html: row.content_html,
    content_json: row.content_json,
    featured_image_id: row.featured_image_id,
    featured_image_url: row.featured_image_url,
    author_id: row.author_id,
    category_id: row.category_id,
    status: row.status,
    is_featured: Boolean(row.is_featured),
    is_trending: Boolean(row.is_trending),
    reading_time_minutes: row.reading_time_minutes || 5,
    view_count: row.view_count || 0,
    published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
    scheduled_at: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : "",
    category: row.category_name ? {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
      description: row.category_desc || null,
      image_url: null,
      seo_title: null,
      seo_description: null,
      sort_order: 0,
    } : undefined,
    author: row.author_name ? {
      id: row.author_id,
      name: row.author_name,
      slug: row.author_slug,
      bio: row.author_bio || null,
      designation: row.author_designation || null,
      avatar_url: row.author_avatar || null,
      social_links: row.author_social || {},
      created_at: "",
    } : undefined,
  };
}
