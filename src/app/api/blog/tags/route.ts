import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";
import { getAdminSession } from "@/admin/lib/session";

export async function GET() {
  try {
    const rows = await sql`
      SELECT t.*, COUNT(pt.blog_post_id) as post_count
      FROM blog_tags t
      LEFT JOIN blog_post_tags pt ON pt.blog_tag_id = t.id
      GROUP BY t.id
      ORDER BY t.name ASC
    `;
    return NextResponse.json({ tags: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO blog_tags (name, slug, description)
      VALUES (${name}, ${slug}, ${description || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, tag: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
