import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";
import { getAdminSession } from "@/admin/lib/session";

/**
 * GET /api/blog/posts - List posts with pagination, filter, search
 * POST /api/blog/posts - Create post with SEO, FAQs, and tags
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!, 10) : null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const offset = (page - 1) * limit;

    let posts;
    let countResult;

    if (search) {
      const q = `%${search}%`;
      posts = await sql`
        SELECT p.*, c.name as category_name, a.name as author_name
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE (LOWER(p.title) LIKE ${q} OR LOWER(p.slug) LIKE ${q})
          AND (${status} = '' OR p.status = ${status})
          AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
        ORDER BY p.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM blog_posts p
        WHERE (LOWER(p.title) LIKE ${q} OR LOWER(p.slug) LIKE ${q})
          AND (${status} = '' OR p.status = ${status})
          AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
      `;
    } else {
      posts = await sql`
        SELECT p.*, c.name as category_name, a.name as author_name
        FROM blog_posts p
        LEFT JOIN blog_categories c ON p.category_id = c.id
        LEFT JOIN blog_authors a ON p.author_id = a.id
        WHERE (${status} = '' OR p.status = ${status})
          AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
        ORDER BY p.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM blog_posts p
        WHERE (${status} = '' OR p.status = ${status})
          AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
      `;
    }

    const total = parseInt(countResult[0]?.count || "0", 10);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching admin blog posts:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      title,
      slug,
      subtitle,
      excerpt,
      contentHtml,
      contentJson,
      featuredImageId,
      featuredImageUrl,
      authorId,
      categoryId,
      status = "draft",
      isFeatured = false,
      isTrending = false,
      readingTimeMinutes = 5,
      seo,
      faqs,
      tagIds,
    } = data;

    if (!title || !slug || !excerpt || !contentHtml) {
      return NextResponse.json({ error: "Title, slug, excerpt, and content are required." }, { status: 400 });
    }

    const publishedAt = status === "published" ? new Date().toISOString() : null;

    // Insert post
    const postRows = await sql`
      INSERT INTO blog_posts (
        title,
        slug,
        subtitle,
        excerpt,
        content_html,
        content_json,
        featured_image_id,
        featured_image_url,
        author_id,
        category_id,
        status,
        is_featured,
        is_trending,
        reading_time_minutes,
        published_at,
        created_at,
        updated_at
      ) VALUES (
        ${title},
        ${slug},
        ${subtitle || null},
        ${excerpt},
        ${contentHtml},
        ${contentJson ? JSON.stringify(contentJson) : null},
        ${featuredImageId || null},
        ${featuredImageUrl || null},
        ${authorId || null},
        ${categoryId || null},
        ${status},
        ${Boolean(isFeatured)},
        ${Boolean(isTrending)},
        ${readingTimeMinutes || 5},
        ${publishedAt},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const newPost = postRows[0];

    // Insert SEO
    if (seo) {
      await sql`
        INSERT INTO blog_post_seo (
          blog_post_id,
          meta_title,
          meta_description,
          canonical_url,
          focus_keyword,
          secondary_keywords,
          og_title,
          og_description,
          og_image_url,
          robots_index,
          robots_follow,
          search_intent,
          target_entities,
          direct_answer,
          seo_score,
          geo_score,
          aeo_score
        ) VALUES (
          ${newPost.id},
          ${seo.metaTitle || title},
          ${seo.metaDescription || excerpt},
          ${seo.canonicalUrl || null},
          ${seo.focusKeyword || null},
          ${seo.secondaryKeywords || []},
          ${seo.ogTitle || title},
          ${seo.ogDescription || excerpt},
          ${seo.ogImageUrl || featuredImageUrl || null},
          ${seo.robotsIndex !== false},
          ${seo.robotsFollow !== false},
          ${seo.searchIntent || "Informational"},
          ${seo.targetEntities || []},
          ${seo.directAnswer || null},
          ${seo.seoScore || 85},
          ${seo.geoScore || 85},
          ${seo.aeoScore || 85}
        )
      `;
    }

    // Insert FAQs
    if (Array.isArray(faqs) && faqs.length) {
      for (let i = 0; i < faqs.length; i++) {
        const f = faqs[i];
        if (f.question && f.answer) {
          await sql`
            INSERT INTO blog_post_faqs (blog_post_id, question, answer, sort_order)
            VALUES (${newPost.id}, ${f.question}, ${f.answer}, ${i})
          `;
        }
      }
    }

    // Insert tags
    if (Array.isArray(tagIds) && tagIds.length) {
      for (const tId of tagIds) {
        await sql`
          INSERT INTO blog_post_tags (blog_post_id, blog_tag_id)
          VALUES (${newPost.id}, ${tId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    return NextResponse.json({ success: true, post: newPost });
  } catch (err: any) {
    console.error("Error creating blog post:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
