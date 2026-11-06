import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";
import { getAdminSession } from "@/admin/lib/session";

/**
 * GET /api/blog/posts/[id] - Single post with SEO, FAQs, tags
 * PUT /api/blog/posts/[id] - Update post
 * DELETE /api/blog/posts/[id] - Delete post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id, 10);

    const postRows = await sql`
      SELECT * FROM blog_posts WHERE id = ${postId} LIMIT 1
    `;
    if (!postRows.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = postRows[0];

    // SEO
    const seoRows = await sql`SELECT * FROM blog_post_seo WHERE blog_post_id = ${postId} LIMIT 1`;
    post.seo = seoRows[0] || null;

    // FAQs
    const faqRows = await sql`SELECT * FROM blog_post_faqs WHERE blog_post_id = ${postId} ORDER BY sort_order ASC, id ASC`;
    post.faqs = faqRows;

    // Tag IDs
    const tagRows = await sql`SELECT blog_tag_id FROM blog_post_tags WHERE blog_post_id = ${postId}`;
    post.tagIds = tagRows.map((r) => r.blog_tag_id);

    return NextResponse.json({ post });
  } catch (err: any) {
    console.error("Error fetching single blog post:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id, 10);
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
      status,
      isFeatured,
      isTrending,
      readingTimeMinutes,
      seo,
      faqs,
      tagIds,
    } = data;

    const publishedAt = status === "published" ? new Date().toISOString() : null;

    await sql`
      UPDATE blog_posts SET
        title = ${title},
        slug = ${slug},
        subtitle = ${subtitle || null},
        excerpt = ${excerpt},
        content_html = ${contentHtml},
        content_json = ${contentJson ? JSON.stringify(contentJson) : null},
        featured_image_id = ${featuredImageId || null},
        featured_image_url = ${featuredImageUrl || null},
        author_id = ${authorId || null},
        category_id = ${categoryId || null},
        status = ${status},
        is_featured = ${Boolean(isFeatured)},
        is_trending = ${Boolean(isTrending)},
        reading_time_minutes = ${readingTimeMinutes || 5},
        published_at = COALESCE(published_at, ${publishedAt}),
        updated_at = NOW()
      WHERE id = ${postId}
    `;

    // Upsert SEO
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
          ${postId},
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
        ON CONFLICT (blog_post_id) DO UPDATE SET
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          canonical_url = EXCLUDED.canonical_url,
          focus_keyword = EXCLUDED.focus_keyword,
          secondary_keywords = EXCLUDED.secondary_keywords,
          og_title = EXCLUDED.og_title,
          og_description = EXCLUDED.og_description,
          og_image_url = EXCLUDED.og_image_url,
          robots_index = EXCLUDED.robots_index,
          robots_follow = EXCLUDED.robots_follow,
          search_intent = EXCLUDED.search_intent,
          target_entities = EXCLUDED.target_entities,
          direct_answer = EXCLUDED.direct_answer,
          seo_score = EXCLUDED.seo_score,
          geo_score = EXCLUDED.geo_score,
          aeo_score = EXCLUDED.aeo_score,
          updated_at = NOW()
      `;
    }

    // Refresh FAQs
    if (Array.isArray(faqs)) {
      await sql`DELETE FROM blog_post_faqs WHERE blog_post_id = ${postId}`;
      for (let i = 0; i < faqs.length; i++) {
        const f = faqs[i];
        if (f.question && f.answer) {
          await sql`
            INSERT INTO blog_post_faqs (blog_post_id, question, answer, sort_order)
            VALUES (${postId}, ${f.question}, ${f.answer}, ${i})
          `;
        }
      }
    }

    // Refresh tags
    if (Array.isArray(tagIds)) {
      await sql`DELETE FROM blog_post_tags WHERE blog_post_id = ${postId}`;
      for (const tId of tagIds) {
        await sql`
          INSERT INTO blog_post_tags (blog_post_id, blog_tag_id)
          VALUES (${postId}, ${tId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating blog post:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id, 10);

    await sql`DELETE FROM blog_posts WHERE id = ${postId}`;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting blog post:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
