import { sql } from "@/db/neon";

export interface VisitorSessionRecord {
  id: number;
  session_id: string;
  visitor_id: string;
  user_id: number | null;
  user_name: string | null;
  current_path: string;
  current_page_title: string | null;
  page_type: string;
  device_type: string;
  browser: string | null;
  operating_system: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  started_at: string;
  last_seen_at: string;
  ended_at: string | null;
  status: "active" | "inactive" | "ended";
  duration_seconds?: number;
}

export interface LiveVisitorStats {
  totalActive: number;
  authenticated: number;
  anonymous: number;
  viewingProduct: number;
  viewingBlog: number;
  viewingHome: number;
  viewingOther: number;
}

// Inactive threshold: 60 seconds without heartbeat
const TIMEOUT_SECONDS = 60;

/**
 * Register or update visitor session heartbeat
 */
export async function recordVisitorHeartbeat(payload: {
  sessionId: string;
  visitorId: string;
  userId?: number | null;
  userName?: string | null;
  path: string;
  pageTitle?: string | null;
  pageType: string;
  deviceType: string;
  browser?: string | null;
  operatingSystem?: string | null;
  country?: string | null;
  city?: string | null;
  referrer?: string | null;
}) {
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
    country,
    city,
    referrer,
  } = payload;

  try {
    // Upsert visitor session
    const res = await sql`
      INSERT INTO visitor_sessions (
        session_id,
        visitor_id,
        user_id,
        user_name,
        current_path,
        current_page_title,
        page_type,
        device_type,
        browser,
        operating_system,
        country,
        city,
        referrer,
        started_at,
        last_seen_at,
        status,
        updated_at
      ) VALUES (
        ${sessionId},
        ${visitorId},
        ${userId || null},
        ${userName || null},
        ${path},
        ${pageTitle || null},
        ${pageType},
        ${deviceType},
        ${browser || null},
        ${operatingSystem || null},
        ${country || "India"},
        ${city || "Mumbai"},
        ${referrer || null},
        NOW(),
        NOW(),
        'active',
        NOW()
      )
      ON CONFLICT (session_id) DO UPDATE SET
        current_path = EXCLUDED.current_path,
        current_page_title = EXCLUDED.current_page_title,
        page_type = EXCLUDED.page_type,
        last_seen_at = NOW(),
        status = 'active',
        updated_at = NOW(),
        user_id = COALESCE(EXCLUDED.user_id, visitor_sessions.user_id),
        user_name = COALESCE(EXCLUDED.user_name, visitor_sessions.user_name)
      RETURNING id, current_path
    `;

    // Record page view transition if changed
    await sql`
      INSERT INTO visitor_page_views (
        session_id,
        page_path,
        page_title,
        page_type,
        entered_at
      ) VALUES (
        ${sessionId},
        ${path},
        ${pageTitle || null},
        ${pageType},
        NOW()
      )
    `;

    return { success: true };
  } catch (err) {
    console.error("Error recording heartbeat:", err);
    return { success: false };
  }
}

/**
 * End a visitor session immediately (e.g. on unload/signout)
 */
export async function endVisitorSession(sessionId: string) {
  try {
    await sql`
      UPDATE visitor_sessions 
      SET status = 'ended', ended_at = NOW(), updated_at = NOW()
      WHERE session_id = ${sessionId}
    `;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Get real-time live active sessions & metrics (stale sessions older than 60s marked inactive)
 */
export async function getLiveVisitorsData(): Promise<{
  stats: LiveVisitorStats;
  sessions: VisitorSessionRecord[];
}> {
  try {
    // 1. Mark stale sessions inactive
    await sql`
      UPDATE visitor_sessions 
      SET status = 'inactive'
      WHERE status = 'active' AND last_seen_at < NOW() - (${TIMEOUT_SECONDS} || ' seconds')::interval
    `;

    // 2. Fetch active sessions within timeout
    const rows = await sql`
      SELECT 
        id,
        session_id,
        visitor_id,
        user_id,
        user_name,
        current_path,
        current_page_title,
        page_type,
        device_type,
        browser,
        operating_system,
        country,
        city,
        referrer,
        started_at,
        last_seen_at,
        ended_at,
        status,
        ROUND(EXTRACT(EPOCH FROM (last_seen_at - started_at)))::int as duration_seconds
      FROM visitor_sessions
      WHERE status = 'active' AND last_seen_at >= NOW() - (${TIMEOUT_SECONDS} || ' seconds')::interval
      ORDER BY last_seen_at DESC
      LIMIT 100
    `;

    const sessions = rows.map((r: any) => ({
      ...r,
      started_at: new Date(r.started_at).toISOString(),
      last_seen_at: new Date(r.last_seen_at).toISOString(),
      ended_at: r.ended_at ? new Date(r.ended_at).toISOString() : null,
    }));

    // 3. Compute stats
    const stats: LiveVisitorStats = {
      totalActive: sessions.length,
      authenticated: sessions.filter((s) => s.user_id !== null).length,
      anonymous: sessions.filter((s) => s.user_id === null).length,
      viewingProduct: sessions.filter((s) => s.page_type === "product").length,
      viewingBlog: sessions.filter((s) => s.page_type === "blog").length,
      viewingHome: sessions.filter((s) => s.page_type === "home").length,
      viewingOther: sessions.filter(
        (s) => !["product", "blog", "home"].includes(s.page_type)
      ).length,
    };

    return { stats, sessions };
  } catch (err) {
    console.error("Error getting live visitors:", err);
    return {
      stats: {
        totalActive: 0,
        authenticated: 0,
        anonymous: 0,
        viewingProduct: 0,
        viewingBlog: 0,
        viewingHome: 0,
        viewingOther: 0,
      },
      sessions: [],
    };
  }
}

/**
 * Get visitor page view history for session details drawer
 */
export async function getSessionPageViews(sessionId: string) {
  try {
    const rows = await sql`
      SELECT id, page_path, page_title, page_type, entered_at
      FROM visitor_page_views
      WHERE session_id = ${sessionId}
      ORDER BY entered_at DESC
      LIMIT 20
    `;
    return rows.map((r: any) => ({
      ...r,
      entered_at: new Date(r.entered_at).toISOString(),
    }));
  } catch (err) {
    return [];
  }
}
