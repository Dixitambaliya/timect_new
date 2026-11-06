import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/neon";

/**
 * GET /api/blog/images/[id]
 * High-performance image retrieval endpoint with binary bytea support,
 * proper Content-Type, Cache-Control, and conditional ETag caching.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      return new NextResponse("Invalid Image ID", { status: 400 });
    }

    const rows = await sql`
      SELECT id, file_name, mime_type, image_data, alt_text, width, height, file_size, created_at
      FROM blog_images
      WHERE id = ${imageId}
      LIMIT 1
    `;

    if (!rows.length || !rows[0].image_data) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const img = rows[0];
    const mimeType = img.mime_type || "image/webp";
    
    // image_data from postgres bytea can come as a Buffer or Uint8Array or hex string
    let buffer: Buffer;
    if (Buffer.isBuffer(img.image_data)) {
      buffer = img.image_data;
    } else if (typeof img.image_data === "string") {
      if (img.image_data.startsWith("\\x")) {
        buffer = Buffer.from(img.image_data.slice(2), "hex");
      } else {
        buffer = Buffer.from(img.image_data, "base64");
      }
    } else if (img.image_data instanceof Uint8Array) {
      buffer = Buffer.from(img.image_data);
    } else {
      buffer = Buffer.from(img.image_data as any);
    }

    const etag = `"${img.id}-${buffer.length}-${new Date(img.created_at).getTime()}"`;
    const ifNoneMatch = request.headers.get("if-none-match");

    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
      },
    });
  } catch (err: any) {
    console.error("Error serving blog image:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
