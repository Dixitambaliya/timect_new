import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

// Load environment variables
for (const envFile of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const firstEqual = trimmed.indexOf("=");
        if (firstEqual !== -1) {
          const key = trimmed.substring(0, firstEqual).trim();
          const val = trimmed.substring(firstEqual + 1).trim().replace(/^['"]|['"]$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
    break;
  }
}

const sql = neon(process.env.DATABASE_URL!);

export async function migrateVisitorTracking() {
  console.log("Migrating Visitor Sessions & Live Tracking schema...");

  // 1. visitor_sessions table
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL UNIQUE,
      visitor_id TEXT NOT NULL,
      user_id INT,
      user_name TEXT,
      current_path TEXT NOT NULL,
      current_page_title TEXT,
      page_type TEXT NOT NULL DEFAULT 'other',
      device_type TEXT NOT NULL DEFAULT 'desktop',
      browser TEXT,
      operating_system TEXT,
      country TEXT DEFAULT 'India',
      city TEXT DEFAULT 'Mumbai',
      referrer TEXT,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ended_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'ended')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ visitor_sessions");

  // 2. visitor_page_views table
  await sql`
    CREATE TABLE IF NOT EXISTS visitor_page_views (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      page_path TEXT NOT NULL,
      page_title TEXT,
      page_type TEXT NOT NULL DEFAULT 'other',
      entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ visitor_page_views");

  // Create fast indexes for real-time live queries
  await sql`CREATE INDEX IF NOT EXISTS idx_visitor_sessions_status_seen ON visitor_sessions(status, last_seen_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_visitor_sessions_page_type ON visitor_sessions(page_type);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_visitor_page_views_session ON visitor_page_views(session_id);`;

  console.log("Visitor tracking tables and indexes created successfully!");
}

if (require.main === module) {
  migrateVisitorTracking()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
