import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await sql`
      INSERT INTO blog_newsletter_subscribers (email, source, status)
      VALUES (${email.trim().toLowerCase()}, 'journal', 'active')
      ON CONFLICT (email) DO NOTHING
    `;

    return NextResponse.json({ success: true, message: "Thank you for subscribing to Timect Journal." });
  } catch (err: any) {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
