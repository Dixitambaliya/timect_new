import { NextRequest, NextResponse } from "next/server";
import { recordVisitorHeartbeat, endVisitorSession } from "@/db/tracking-actions";

/**
 * POST /api/tracking/heartbeat
 * Receives lightweight heartbeat pings from the public website client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      visitorId,
      userId,
      userName,
      path,
      pageTitle,
      pageType,
      deviceType,
      browser,
      operatingSystem,
      referrer,
      action, // 'heartbeat' | 'end'
    } = body;

    if (!sessionId || !visitorId) {
      return NextResponse.json({ error: "Missing session or visitor ID" }, { status: 400 });
    }

    if (action === "end") {
      await endVisitorSession(sessionId);
      return NextResponse.json({ success: true, status: "ended" });
    }

    // Attempt approximate country/city from IP headers or fallback
    const country = request.headers.get("x-vercel-ip-country") || "India";
    const city = request.headers.get("x-vercel-ip-city") || "Mumbai";

    await recordVisitorHeartbeat({
      sessionId,
      visitorId,
      userId,
      userName,
      path: path || "/",
      pageTitle,
      pageType: pageType || "other",
      deviceType: deviceType || "desktop",
      browser,
      operatingSystem,
      country,
      city,
      referrer,
    });

    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
