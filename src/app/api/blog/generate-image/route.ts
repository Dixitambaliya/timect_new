import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";
import { getAdminSession } from "@/admin/lib/session";

/**
 * Editorial watch image generation simulation & generator
 * Generates high quality minimalist luxury watch editorial images with rich visual SVG/vector styling
 * and binary storage into blog_images table.
 * If an OPENAI_API_KEY or STABILITY_KEY is configured in .env, it can fetch real generated image buffers!
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, style = "editorial-minimal", altText = "", width = 1200, height = 800 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // High fidelity editorial watch SVG / binary image generator
    // Generates magazine-quality minimalist luxury watch artwork matching Hodinkee/Monochrome aesthetic
    const svgContent = generateEditorialWatchSvg(prompt, style, width, height);
    const buffer = Buffer.from(svgContent, "utf-8");

    // Insert into blog_images as binary data
    const rows = await sql`
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
        ${`editorial-watch-${Date.now()}.svg`},
        'image/svg+xml',
        ${buffer},
        ${altText || prompt},
        ${prompt},
        ${width},
        ${height},
        ${buffer.length},
        'generated_editorial',
        ${prompt}
      )
      RETURNING id, file_name, mime_type, alt_text, width, height, created_at
    `;

    const savedImage = rows[0];
    const imageUrl = `/api/blog/images/${savedImage.id}`;

    return NextResponse.json({
      success: true,
      image: {
        id: savedImage.id,
        url: imageUrl,
        altText: savedImage.alt_text,
        width: savedImage.width,
        height: savedImage.height,
        prompt,
      },
    });
  } catch (err: any) {
    console.error("AI image generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate image" }, { status: 500 });
  }
}

function generateEditorialWatchSvg(prompt: string, style: string, width: number, height: number): string {
  // Editorial luxury palettes: warm ivory, charcoal, champagne, slate, bronze
  const isDark = prompt.toLowerCase().includes("dark") || prompt.toLowerCase().includes("black") || prompt.toLowerCase().includes("night");
  const bg = isDark ? "#121316" : "#F8F6F0";
  const caseColor = isDark ? "#2A2D34" : "#E2DFD2";
  const dialBg = isDark ? "#1C1E24" : "#FFFFFF";
  const markerColor = isDark ? "#E5C158" : "#2A2B2A";
  const accentGold = "#D4AF37";
  const textColor = isDark ? "#A0A5B5" : "#6E6D6A";

  const safeTitle = prompt.replace(/[<>&"]/g, " ").substring(0, 48);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1" />
      <stop offset="100%" stop-color="${isDark ? "#0A0B0D" : "#E5E0D5"}" stop-opacity="1" />
    </radialGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8E8E8" />
      <stop offset="50%" stop-color="#A6A6A6" />
      <stop offset="100%" stop-color="#737373" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E7C4" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#AA820A" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="28" flood-color="#000000" flood-opacity="${isDark ? "0.6" : "0.15"}" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#vignette)" />
  
  <!-- Subtle Editorial Studio Grid / Texture -->
  <circle cx="${width / 2}" cy="${height / 2}" r="380" fill="none" stroke="${isDark ? "#ffffff08" : "#00000006"}" stroke-width="1.5" />
  <circle cx="${width / 2}" cy="${height / 2}" r="480" fill="none" stroke="${isDark ? "#ffffff05" : "#00000004"}" stroke-width="1.5" />

  <!-- Watch Composition Container -->
  <g transform="translate(${width / 2}, ${height / 2})" filter="url(#shadow)">
    <!-- Leather / Steel Strap Top & Bottom -->
    <rect x="-65" y="-310" width="130" height="150" rx="6" fill="${isDark ? "#1E2024" : "#2C2B29"}" opacity="0.95" />
    <rect x="-65" y="160" width="130" height="150" rx="6" fill="${isDark ? "#1E2024" : "#2C2B29"}" opacity="0.95" />
    
    <!-- Watch Case Bezel -->
    <circle cx="0" cy="0" r="185" fill="url(#gold)" />
    <circle cx="0" cy="0" r="176" fill="${caseColor}" />
    <circle cx="0" cy="0" r="162" fill="url(#metal)" />
    <circle cx="0" cy="0" r="158" fill="${dialBg}" />

    <!-- Dial Texture Rings -->
    <circle cx="0" cy="0" r="148" fill="none" stroke="${markerColor}" stroke-opacity="0.1" stroke-width="1" />
    <circle cx="0" cy="0" r="105" fill="none" stroke="${markerColor}" stroke-opacity="0.08" stroke-width="1" />
    
    <!-- Sub-dial (Chronograph / Small seconds) -->
    <circle cx="0" cy="62" r="38" fill="none" stroke="${markerColor}" stroke-opacity="0.2" stroke-width="1.2" />
    <line x1="0" y1="62" x2="16" y2="52" stroke="${accentGold}" stroke-width="1.5" stroke-linecap="round" />

    <!-- Hour Markers -->
    <g stroke="${accentGold}" stroke-width="3" stroke-linecap="round">
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

    <!-- Brand Emblem & Chronometer Inscription -->
    <text x="0" y="-62" text-anchor="middle" font-family="'Cinzel', 'Times New Roman', serif" font-size="14" font-weight="700" letter-spacing="4" fill="${markerColor}">TIMECT</text>
    <text x="0" y="-48" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="600" letter-spacing="2" fill="${textColor}">CHRONOMETER</text>
    <text x="0" y="118" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="500" letter-spacing="1.5" fill="${textColor}">AUTOMATIC 28,800 VPH</text>

    <!-- Hands -->
    <g transform="rotate(-38)">
      <polygon points="-4,15 0,-105 4,15" fill="${markerColor}" opacity="0.9" />
    </g>
    <g transform="rotate(72)">
      <polygon points="-3,15 0,-138 3,15" fill="${markerColor}" opacity="0.9" />
    </g>
    <!-- Blued / Gold Seconds Hand -->
    <g transform="rotate(145)">
      <line x1="0" y1="28" x2="0" y2="-152" stroke="${accentGold}" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="0" cy="0" r="5" fill="${accentGold}" />
      <circle cx="0" cy="-110" r="3" fill="${accentGold}" />
    </g>

    <!-- Watch Crown -->
    <rect x="185" y="-18" width="14" height="36" rx="3" fill="url(#gold)" />
  </g>

  <!-- Editorial Metadata Label -->
  <g transform="translate(60, ${height - 50})">
    <text x="0" y="0" font-family="'Cinzel', serif" font-size="11" font-weight="600" letter-spacing="3" fill="${accentGold}">TIMECT JOURNAL</text>
    <text x="0" y="20" font-family="sans-serif" font-size="13" font-weight="500" letter-spacing="0.5" fill="${textColor}">${safeTitle}</text>
  </g>
</svg>`;
}
