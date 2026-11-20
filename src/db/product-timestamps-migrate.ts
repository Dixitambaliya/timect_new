/** Add timestamps without inventing dates for existing products.
 * Run once per database: npx tsx src/db/product-timestamps-migrate.ts
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

for (const name of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), name);
  if (existsSync(path)) {
    process.loadEnvFile(path);
    break;
  }
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql.transaction([
    sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ, ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ`,
    // Setting defaults separately leaves historical rows null.
    sql`ALTER TABLE products ALTER COLUMN created_at SET DEFAULT NOW(), ALTER COLUMN updated_at SET DEFAULT NOW()`,
    sql`CREATE OR REPLACE FUNCTION set_product_updated_at() RETURNS trigger AS $$
      BEGIN
        IF (to_jsonb(NEW) - 'updated_at' - 'created_at') IS DISTINCT FROM
           (to_jsonb(OLD) - 'updated_at' - 'created_at') THEN
          NEW.updated_at := NOW();
        END IF;
        RETURN NEW;
      END;
    $$ LANGUAGE plpgsql`,
    sql`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_set_updated_at' AND tgrelid = 'products'::regclass AND NOT tgisinternal) THEN
        CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION set_product_updated_at();
      END IF;
    END $$`,
  ]);
  console.log("Product timestamp migration complete.");
}

main().catch((error) => {
  console.error("Product timestamp migration failed:", error);
  process.exitCode = 1;
});
