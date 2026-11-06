import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const sql = neon(process.env.DATABASE_URL!);

/**
 * Editorial Luxury Watch Visual Theme Generator
 * Generates custom SVG for each specific watch topic
 */
function createTopicSvg(title: string, index: number): string {
  const themes = [
    { bg: "#16171B", case: "#343842", dial: "#1D1F24", accent: "#D4AF37", marker: "#E8E2D5", text: "#989DAA", dark: true },
    { bg: "#F8F6F0", case: "#DFDACB", dial: "#FFFFFF", accent: "#B8860B", marker: "#222325", text: "#6A6863", dark: false },
    { bg: "#181A1D", case: "#4A4D55", dial: "#101214", accent: "#C5A059", marker: "#F0E6D2", text: "#8A909D", dark: true },
    { bg: "#F5F3ED", case: "#D5D0C0", dial: "#FDFCF7", accent: "#AA771C", marker: "#2B2C2D", text: "#706E69", dark: false },
    { bg: "#141517", case: "#2D3036", dial: "#1A1B1F", accent: "#E5C158", marker: "#FFFFFF", text: "#A0A4B0", dark: true },
  ];

  const theme = themes[index % themes.length];
  const cleanTitle = title.replace(/[<>&"]/g, " ").substring(0, 44);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="grad-${index}" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${theme.bg}" />
      <stop offset="100%" stop-color="${theme.dark ? "#090A0C" : "#E2DDD0"}" />
    </radialGradient>
    <linearGradient id="gold-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2CE" />
      <stop offset="50%" stop-color="${theme.accent}" />
      <stop offset="100%" stop-color="#875E03" />
    </linearGradient>
    <filter id="shadow-${index}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#000000" flood-opacity="${theme.dark ? "0.65" : "0.15"}" />
    </filter>
  </defs>

  <rect width="1200" height="800" fill="url(#grad-${index})" />
  
  <circle cx="600" cy="400" r="370" fill="none" stroke="${theme.dark ? "#ffffff08" : "#00000006"}" stroke-width="1.5" />
  <circle cx="600" cy="400" r="470" fill="none" stroke="${theme.dark ? "#ffffff05" : "#00000004"}" stroke-width="1.5" />

  <g transform="translate(600, 400)" filter="url(#shadow-${index})">
    <!-- Watch Strap -->
    <rect x="-65" y="-310" width="130" height="150" rx="6" fill="${theme.dark ? "#1F2126" : "#2A2927"}" opacity="0.95" />
    <rect x="-65" y="160" width="130" height="150" rx="6" fill="${theme.dark ? "#1F2126" : "#2A2927"}" opacity="0.95" />

    <!-- Case & Bezel -->
    <circle cx="0" cy="0" r="185" fill="url(#gold-${index})" />
    <circle cx="0" cy="0" r="176" fill="${theme.case}" />
    <circle cx="0" cy="0" r="162" fill="${theme.dial}" />
    <circle cx="0" cy="0" r="156" fill="${theme.dial}" />

    <!-- Precision Rings -->
    <circle cx="0" cy="0" r="146" fill="none" stroke="${theme.marker}" stroke-opacity="0.12" stroke-width="1" />
    <circle cx="0" cy="0" r="105" fill="none" stroke="${theme.marker}" stroke-opacity="0.08" stroke-width="1" />

    <!-- Subdial (Chronometer / Small seconds) -->
    <circle cx="0" cy="62" r="38" fill="none" stroke="${theme.marker}" stroke-opacity="0.25" stroke-width="1.2" />
    <line x1="0" y1="62" x2="16" y2="52" stroke="${theme.accent}" stroke-width="1.5" stroke-linecap="round" />

    <!-- Hour Markers -->
    <g stroke="${theme.accent}" stroke-width="3" stroke-linecap="round">
      <line x1="0" y1="-146" x2="0" y2="-128" stroke-width="4" />
      <line x1="146" y1="0" x2="128" y2="0" />
      <line x1="0" y1="146" x2="0" y2="128" stroke-width="4" />
      <line x1="-146" y1="0" x2="-128" y2="0" />
      <line x1="73" y1="-126" x2="64" y2="-110" stroke-width="2" />
      <line x1="126" y1="-73" x2="110" y2="-64" stroke-width="2" />
      <line x1="126" y1="73" x2="110" y2="64" stroke-width="2" />
      <line x1="73" y1="126" x2="64" y2="110" stroke-width="2" />
      <line x1="-73" y1="126" x2="-64" y2="110" stroke-width="2" />
      <line x1="-126" y1="73" x2="-110" y2="64" stroke-width="2" />
      <line x1="-126" y1="-73" x2="-110" y2="-64" stroke-width="2" />
      <line x1="-73" y1="-126" x2="-64" y2="-110" stroke-width="2" />
    </g>

    <!-- Dial Typography -->
    <text x="0" y="-62" text-anchor="middle" font-family="'Cinzel', serif" font-size="14" font-weight="700" letter-spacing="4" fill="${theme.marker}">TIMECT</text>
    <text x="0" y="-48" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="600" letter-spacing="2" fill="${theme.text}">CHRONOMETER</text>
    <text x="0" y="118" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="500" letter-spacing="1.5" fill="${theme.text}">AUTOMATIC 28,800 VPH</text>

    <!-- Hands -->
    <g transform="rotate(${((index * 47) % 360) - 180})">
      <polygon points="-4,15 0,-105 4,15" fill="${theme.marker}" opacity="0.9" />
    </g>
    <g transform="rotate(${((index * 93) % 360) - 180})">
      <polygon points="-3,15 0,-138 3,15" fill="${theme.marker}" opacity="0.9" />
    </g>
    <g transform="rotate(${((index * 137) % 360) - 180})">
      <line x1="0" y1="28" x2="0" y2="-152" stroke="${theme.accent}" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="0" cy="0" r="5" fill="${theme.accent}" />
    </g>

    <!-- Crown -->
    <rect x="185" y="-18" width="14" height="36" rx="3" fill="url(#gold-${index})" />
  </g>

  <!-- Editorial Metadata Label -->
  <g transform="translate(60, 750)">
    <text x="0" y="0" font-family="'Cinzel', serif" font-size="11" font-weight="600" letter-spacing="3" fill="${theme.accent}">TIMECT JOURNAL</text>
    <text x="0" y="20" font-family="sans-serif" font-size="13" font-weight="500" letter-spacing="0.5" fill="${theme.text}">${cleanTitle}</text>
  </g>
</svg>`;
}

async function uploadSvgToCloudinary(svgContent: string, publicId: string) {
  const base64Data = `data:image/svg+xml;base64,${Buffer.from(svgContent, "utf-8").toString("base64")}`;
  const res = await cloudinary.uploader.upload(base64Data, {
    public_id: publicId,
    folder: "timect/journal",
    resource_type: "image",
    overwrite: true,
  });
  return res.secure_url;
}

async function run() {
  console.log("Generating editorial watch images and uploading to Cloudinary & Database...");

  const posts = await sql`
    SELECT id, title, slug, featured_image_id 
    FROM blog_posts 
    ORDER BY id ASC
  `;

  console.log(`Found ${posts.length} articles to process.`);

  let uploadedCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] Generating image for: "${post.title.substring(0, 36)}..."`);

    const svgContent = createTopicSvg(post.title, i);
    const svgBuffer = Buffer.from(svgContent, "utf-8");

    // 1. Upload to Cloudinary
    let cloudinaryUrl = "";
    try {
      const publicId = `journal-${post.slug}`;
      cloudinaryUrl = await uploadSvgToCloudinary(svgContent, publicId);
    } catch (err: any) {
      console.warn(`Cloudinary upload warning for post ${post.id}:`, err?.message || err);
    }

    // 2. Save binary data to blog_images database table
    const imgRes = await sql`
      INSERT INTO blog_images (
        file_name,
        mime_type,
        image_data,
        alt_text,
        caption,
        width,
        height,
        file_size,
        image_type,
        prompt
      ) VALUES (
        ${`${post.slug}-editorial.svg`},
        'image/svg+xml',
        ${svgBuffer},
        ${post.title},
        ${`Editorial luxury watch visual for ${post.title}`},
        1200,
        800,
        ${svgBuffer.length},
        'editorial',
        ${`Editorial luxury watch visual for ${post.title}`}
      )
      RETURNING id
    `;

    const imageId = imgRes[0].id;
    // Prefer Cloudinary CDN URL if available, fallback to internal database binary endpoint
    const finalImageUrl = cloudinaryUrl || `/api/blog/images/${imageId}`;

    // 3. Update blog post
    await sql`
      UPDATE blog_posts 
      SET featured_image_id = ${imageId},
          featured_image_url = ${finalImageUrl},
          updated_at = NOW()
      WHERE id = ${post.id}
    `;

    // 4. Update blog_post_seo og_image_url
    await sql`
      UPDATE blog_post_seo
      SET og_image_url = ${finalImageUrl},
          updated_at = NOW()
      WHERE blog_post_id = ${post.id}
    `;

    uploadedCount++;
  }

  console.log(`\nSuccessfully generated and uploaded all ${uploadedCount} editorial watch images!`);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Image generation & upload failed:", e);
    process.exit(1);
  });
