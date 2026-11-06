import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";
import { getAdminSession } from "@/admin/lib/session";

export async function GET() {
  try {
    const rows = await sql`
      SELECT a.*, COUNT(p.id) as post_count
      FROM blog_authors a
      LEFT JOIN blog_posts p ON p.author_id = a.id
      GROUP BY a.id
      ORDER BY a.name ASC
    `;
    return NextResponse.json({ authors: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, slug, bio, designation, avatarUrl, socialLinks = {} } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO blog_authors (name, slug, bio, designation, avatar_url, social_links)
      VALUES (${name}, ${slug}, ${bio || null}, ${designation || null}, ${avatarUrl || null}, ${JSON.stringify(socialLinks)}::jsonb)
      RETURNING *
    `;

    return NextResponse.json({ success: true, author: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
