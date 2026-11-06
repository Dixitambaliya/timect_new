/**
 * Database migration for the Watch Journal / Blog CMS
 * Tables:
 * - blog_authors
 * - blog_categories
 * - blog_tags
 * - blog_images (binary bytea storage for generated editorial watch images)
 * - blog_posts
 * - blog_post_tags
 * - blog_post_seo (SEO, GEO & AEO optimization engine)
 * - blog_post_faqs
 * - blog_newsletter_subscribers
 * - blog_generation_jobs
 */
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

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
          const val = trimmed
            .substring(firstEqual + 1)
            .trim()
            .replace(/^['"]|['"]$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
    break;
  }
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(dbUrl);

export async function migrateBlogSchema() {
  console.log("Starting Watch Journal Blog CMS schema migration...");

  // 1. Authors
  await sql`
    CREATE TABLE IF NOT EXISTS blog_authors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      bio TEXT,
      designation TEXT,
      avatar_url TEXT,
      social_links JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_authors");

  // 2. Categories
  await sql`
    CREATE TABLE IF NOT EXISTS blog_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      seo_title TEXT,
      seo_description TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_categories");

  // 3. Tags
  await sql`
    CREATE TABLE IF NOT EXISTS blog_tags (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_tags");

  // 4. Binary Image Storage (per Phase 4 & Phase 7 requirement)
  await sql`
    CREATE TABLE IF NOT EXISTS blog_images (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'image/webp',
      image_data BYTEA,
      alt_text TEXT,
      caption TEXT,
      width INT,
      height INT,
      file_size INT,
      image_type TEXT DEFAULT 'editorial',
      prompt TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_images (binary database storage)");

  // 5. Blog Posts
  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      subtitle TEXT,
      excerpt TEXT NOT NULL,
      content_html TEXT NOT NULL,
      content_json JSONB,
      featured_image_id INT REFERENCES blog_images(id) ON DELETE SET NULL,
      featured_image_url TEXT,
      author_id INT REFERENCES blog_authors(id) ON DELETE SET NULL,
      category_id INT REFERENCES blog_categories(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      is_trending BOOLEAN NOT NULL DEFAULT FALSE,
      reading_time_minutes INT DEFAULT 5,
      view_count INT DEFAULT 0,
      published_at TIMESTAMPTZ,
      scheduled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_posts");

  // 6. Blog Post Tags junction
  await sql`
    CREATE TABLE IF NOT EXISTS blog_post_tags (
      blog_post_id INT REFERENCES blog_posts(id) ON DELETE CASCADE,
      blog_tag_id INT REFERENCES blog_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (blog_post_id, blog_tag_id)
    );
  `;
  console.log("✓ blog_post_tags");

  // 7. Blog SEO / GEO / AEO optimization data
  await sql`
    CREATE TABLE IF NOT EXISTS blog_post_seo (
      id SERIAL PRIMARY KEY,
      blog_post_id INT NOT NULL UNIQUE REFERENCES blog_posts(id) ON DELETE CASCADE,
      meta_title TEXT,
      meta_description TEXT,
      canonical_url TEXT,
      focus_keyword TEXT,
      secondary_keywords TEXT[],
      og_title TEXT,
      og_description TEXT,
      og_image_url TEXT,
      robots_index BOOLEAN DEFAULT TRUE,
      robots_follow BOOLEAN DEFAULT TRUE,
      search_intent TEXT,
      target_entities TEXT[],
      direct_answer TEXT,
      seo_score INT DEFAULT 85,
      geo_score INT DEFAULT 85,
      aeo_score INT DEFAULT 85,
      schema_type TEXT DEFAULT 'Article',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_post_seo");

  // 8. Blog FAQs for direct answers and AEO
  await sql`
    CREATE TABLE IF NOT EXISTS blog_post_faqs (
      id SERIAL PRIMARY KEY,
      blog_post_id INT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INT DEFAULT 0
    );
  `;
  console.log("✓ blog_post_faqs");

  // 9. Blog Newsletter Subscribers
  await sql`
    CREATE TABLE IF NOT EXISTS blog_newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      source TEXT DEFAULT 'journal',
      status TEXT DEFAULT 'active',
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("✓ blog_newsletter_subscribers");

  // 10. AI Generation Jobs
  await sql`
    CREATE TABLE IF NOT EXISTS blog_generation_jobs (
      id SERIAL PRIMARY KEY,
      topic TEXT NOT NULL,
      keyword TEXT,
      category_id INT REFERENCES blog_categories(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      generated_content JSONB,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
  `;
  console.log("✓ blog_generation_jobs");

  // Create helpful indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_images_type ON blog_images(image_type);`;

  console.log("\nWatch Journal Database Migration successfully completed!");
}

if (require.main === module) {
  migrateBlogSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
