import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

// 1. Manually load environment variables from .env or .env.local
for (const envFile of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from ${envFile}`);
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const firstEqual = trimmed.indexOf("=");
        if (firstEqual !== -1) {
          const key = trimmed.substring(0, firstEqual).trim();
          const val = trimmed.substring(firstEqual + 1).trim().replace(/^['"]|['"]$/g, "");
          process.env[key] = val;
        }
      }
    }
    break;
  }
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log("Connecting to Neon database...");
  
  // 2. Create products table
  console.log("Recreating 'products' table...");
  await sql`DROP TABLE IF EXISTS products CASCADE;`;
  await sql`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
      is_main_product BOOLEAN NOT NULL DEFAULT FALSE,
      is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
      is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
      is_related BOOLEAN NOT NULL DEFAULT FALSE,
      
      name TEXT,
      price TEXT NOT NULL,
      image TEXT,
      
      brand TEXT,
      title TEXT,
      subtitle TEXT,
      price_subtext TEXT,
      sizes JSONB,
      images JSONB,
      variants JSONB,
      specifications JSONB,
      
      tag TEXT,
      
      code TEXT,
      
      collection TEXT,
      description TEXT,
      gender TEXT,
      rating NUMERIC(2,1) DEFAULT 4.5,
      hover_image TEXT
    );
  `;

  // GIN index for flexible JSONB specification filtering (no per-attribute columns)
  console.log("Creating GIN index on specifications...");
  await sql`
    CREATE INDEX IF NOT EXISTS products_specifications_gin
    ON products USING GIN (specifications jsonb_path_ops);
  `;
  
  // 3. Clear existing database rows
  console.log("Clearing existing products...");
  await sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE;`;
  
  // 4. Read products.json
  const productsPath = path.resolve(process.cwd(), "src/data/products.json");
  if (!fs.existsSync(productsPath)) {
    console.error(`Error: File not found at ${productsPath}`);
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(productsPath, "utf-8");
  const data = JSON.parse(rawData);

  // Helper function to slugify text
  function slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  // Pre-calculate DB IDs and base slugs in sequence of insertion
  const items: {
    type: "main" | "arrival" | "recommended" | "related";
    originalData: any;
    dbId: number;
    baseSlug: string;
  }[] = [];

  let currentDbId = 1;

  if (data.mainProduct) {
    const baseName = data.mainProduct.title || "product";
    items.push({
      type: "main",
      originalData: data.mainProduct,
      dbId: currentDbId++,
      baseSlug: slugify(baseName),
    });
  }

  for (const item of (data.newArrivals || [])) {
    const baseName = item.name || "product";
    items.push({
      type: "arrival",
      originalData: item,
      dbId: currentDbId++,
      baseSlug: slugify(baseName),
    });
  }

  for (const item of (data.recommended || [])) {
    const baseName = item.name || "product";
    items.push({
      type: "recommended",
      originalData: item,
      dbId: currentDbId++,
      baseSlug: slugify(baseName),
    });
  }

  for (const item of (data.relatedProducts || [])) {
    const baseName = (item.collection || "") + (item.description ? " " + item.description : "");
    items.push({
      type: "related",
      originalData: item,
      dbId: currentDbId++,
      baseSlug: slugify(baseName || "product"),
    });
  }

  // Count occurrences of each base slug to find duplicates
  const slugCounts: Record<string, number> = {};
  for (const item of items) {
    slugCounts[item.baseSlug] = (slugCounts[item.baseSlug] || 0) + 1;
  }

  // Generate final unique slugs
  const finalSlugs = new Map<number, string>();
  for (const item of items) {
    const count = slugCounts[item.baseSlug];
    if (count > 1) {
      // Append database ID if multiple products share the same name/slug
      finalSlugs.set(item.dbId, `${item.baseSlug}-${item.dbId}`);
    } else {
      finalSlugs.set(item.dbId, item.baseSlug);
    }
  }

  let insertCount = 1;
  
  console.log("Seeding main product...");
  const mainProduct = data.mainProduct;
  if (mainProduct) {
    const slug = finalSlugs.get(insertCount++) || "";
    await sql`
      INSERT INTO products (
        is_main_product, is_new_arrival, is_recommended, is_related,
        slug, name, price, image, brand, title, subtitle, price_subtext,
        sizes, images, variants, specifications, gender, rating, hover_image
      ) VALUES (
        TRUE, FALSE, FALSE, FALSE,
        ${slug}, ${mainProduct.title}, ${mainProduct.price}, ${mainProduct.images?.[0] || null}, 
        ${mainProduct.brand || null}, ${mainProduct.title || null}, ${mainProduct.subtitle || null}, ${mainProduct.priceSubtext || null},
        ${JSON.stringify(mainProduct.sizes || [])}, ${JSON.stringify(mainProduct.images || [])}, 
        ${JSON.stringify(mainProduct.variants || [])}, ${JSON.stringify(mainProduct.specifications || [])},
        ${mainProduct.gender || null}, ${mainProduct.rating || 4.5}, ${mainProduct.hover_image || null}
      );
    `;
  }
  
  console.log("Seeding new arrivals...");
  const newArrivals = data.newArrivals || [];
  for (const item of newArrivals) {
    const slug = finalSlugs.get(insertCount++) || "";
    await sql`
      INSERT INTO products (
        is_main_product, is_new_arrival, is_recommended, is_related,
        slug, name, price, image, tag, gender, rating, hover_image, specifications
      ) VALUES (
        FALSE, TRUE, FALSE, FALSE,
        ${slug}, ${item.name}, ${item.price}, ${item.image || null}, ${item.tag || null},
        ${item.gender || null}, ${item.rating || 4.5}, ${item.hover_image || null},
        ${JSON.stringify(item.specifications || [])}
      );
    `;
  }
  
  console.log("Seeding recommended products...");
  const recommended = data.recommended || [];
  for (const item of recommended) {
    const slug = finalSlugs.get(insertCount++) || "";
    await sql`
      INSERT INTO products (
        is_main_product, is_new_arrival, is_recommended, is_related,
        slug, name, price, image, code, gender, rating, hover_image, specifications
      ) VALUES (
        FALSE, FALSE, TRUE, FALSE,
        ${slug}, ${item.name}, ${item.price}, ${item.image || null}, ${item.code || null},
        ${item.gender || null}, ${item.rating || 4.5}, ${item.hover_image || null},
        ${JSON.stringify(item.specifications || [])}
      );
    `;
  }
  
  console.log("Seeding related products...");
  const relatedProducts = data.relatedProducts || [];
  for (const item of relatedProducts) {
    const slug = finalSlugs.get(insertCount++) || "";
    await sql`
      INSERT INTO products (
        is_main_product, is_new_arrival, is_recommended, is_related,
        slug, price, image, collection, description, gender, rating, hover_image, specifications
      ) VALUES (
        FALSE, FALSE, FALSE, TRUE,
        ${slug}, ${item.price}, ${item.image || null}, ${item.collection || null}, ${item.description || null},
        ${item.gender || null}, ${item.rating || 4.5}, ${item.hover_image || null},
        ${JSON.stringify(item.specifications || [])}
      );
    `;
  }
  
  console.log("Seeding complete! Database populated successfully.");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
