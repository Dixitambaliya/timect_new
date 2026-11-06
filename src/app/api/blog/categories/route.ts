import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";
import { getAdminSession } from "@/admin/lib/session";

export async function GET() {
  try {
    const rows = await sql`
      SELECT c.*, COUNT(p.id) as post_count
      FROM blog_categories c
      LEFT JOIN blog_posts p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    return NextResponse.json({ categories: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, slug, description, imageUrl, seoTitle, seoDescription, sortOrder = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO blog_categories (name, slug, description, image_url, seo_title, seo_description, sort_order)
      VALUES (${name}, ${slug}, ${description || null}, ${imageUrl || null}, ${seoTitle || null}, ${seoDescription || null}, ${sortOrder})
      RETURNING *
    `;

    return NextResponse.json({ success: true, category: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
