import { NextRequest, NextResponse } from "next/server";
import { getLiveVisitorsData, getSessionPageViews } from "@/db/tracking-actions";
import { getAdminSession } from "@/admin/lib/session";

/**
 * GET /api/admin/live-visitors
 * Returns active live visitors, live breakdown metrics, and optional session details.
 * Admin-only protected.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const detailSessionId = searchParams.get("sessionId");

    if (detailSessionId) {
      const pageViews = await getSessionPageViews(detailSessionId);
      return NextResponse.json({ pageViews });
    }

    const data = await getLiveVisitorsData();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
