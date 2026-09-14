import { NextResponse, type NextRequest } from "next/server";
import {
  publicGetCorporateGiftingItems,
  adminCreateCorporateGiftingItem,
  adminUpdateCorporateGiftingItem,
  adminDeleteCorporateGiftingItem,
} from "@/admin/actions/corporate-gifting";

/**
 * GET /api/corporate-gifting
 * Returns corporate gifting items. Supports optional query filters:
 * - ?search=heritage
 * - ?colour=blue
 * - ?gender=men
 * - ?id=9001
 * - ?slug=timect-heritage-blue
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const colour = searchParams.get("colour")?.toLowerCase().trim();
    const gender = searchParams.get("gender")?.toLowerCase().trim();
    const collection = searchParams.get("collection")?.toLowerCase().trim();
    const idParam = searchParams.get("id");
    const slug = searchParams.get("slug")?.toLowerCase().trim();

    let products = await publicGetCorporateGiftingItems();

    if (idParam) {
      const id = parseInt(idParam, 10);
      products = products.filter((p) => p.id === id);
    }

    if (slug) {
      products = products.filter((p) => p.slug.toLowerCase() === slug);
    }

    if (gender) {
      products = products.filter(
        (p) => (p.gender || "").toLowerCase() === gender
      );
    }

    if (collection) {
      products = products.filter(
        (p) => (p.collection || "").toLowerCase() === collection
      );
    }

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (p.title && p.title.toLowerCase().includes(search)) ||
          (p.collection && p.collection.toLowerCase().includes(search))
      );
    }

    if (colour && colour !== "all") {
      const keywords: Record<string, string[]> = {
        silver: ["silver", "steel", "graphite", "line", "studio"],
        gold: ["gold", "truton", "two-tone"],
        black: ["black", "noir", "graphite"],
        blue: ["blue", "azure", "heritage"],
        green: ["green", "forest"],
        rose: ["rose", "pink", "ladies"],
      };
      const keys = keywords[colour] || [];
      if (keys.length) {
        products = products.filter((p) => {
          const t = `${p.name || ""} ${p.title || ""} ${p.collection || ""}`.toLowerCase();
          return keys.some((k) => t.includes(k));
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/corporate-gifting error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch corporate gifting products." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/corporate-gifting
 * Creates a new corporate gifting item.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await adminCreateCorporateGiftingItem(body);

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, item: result.item },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/corporate-gifting error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gift item." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/corporate-gifting
 * Updates an existing corporate gifting item (requires id in body).
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = parseInt(body.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Valid product ID is required." },
        { status: 400 }
      );
    }

    const result = await adminUpdateCorporateGiftingItem(id, body);

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, item: result.item });
  } catch (error) {
    console.error("PUT /api/corporate-gifting error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gift item." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/corporate-gifting
 * Deletes a corporate gifting item by id.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get("id");

    if (!idParam) {
      try {
        const body = await request.json();
        idParam = body.id;
      } catch {
        /* no body */
      }
    }

    const id = parseInt(idParam || "", 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Valid product ID is required." },
        { status: 400 }
      );
    }

    const result = await adminDeleteCorporateGiftingItem(id);

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Gift item deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/corporate-gifting error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gift item." },
      { status: 500 }
    );
  }
}
