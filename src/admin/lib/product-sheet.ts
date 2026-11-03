import ExcelJS from "exceljs";
import type { Product, Specification } from "@/db/actions";
import type { ProductInput } from "@/admin/lib/product-mapper";
import { GENDER_OPTIONS } from "@/admin/lib/constants";

/**
 * Shopify-style product spreadsheet: one row per product, keyed by Handle.
 * Export writes every product; import upserts -a row whose Handle matches an
 * existing product replaces that product's data, otherwise a new one is made.
 */

type Col = {
  header: string;
  key: keyof SheetRow;
  width: number;
  note: string;
};

export type SheetRow = {
  handle: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  brand: string;
  collection: string;
  code: string;
  gender: string;
  price: string;
  priceSubtext: string;
  tag: string;
  rating: string;
  isMainProduct: string;
  isNewArrival: string;
  isRecommended: string;
  isRelated: string;
  image: string;
  hoverImage: string;
  images: string;
  sizes: string;
  variants: string;
  specifications: string;
};

export const COLUMNS: Col[] = [
  { header: "Handle", key: "handle", width: 32, note: "Product URL id. Matches an existing product to update it. Leave blank for new products -it is generated from the name." },
  { header: "Name", key: "name", width: 34, note: "Required. The URL is generated from this." },
  { header: "Title", key: "title", width: 34, note: "Display title. Defaults to Name." },
  { header: "Subtitle", key: "subtitle", width: 30, note: "Short line under the title." },
  { header: "Description", key: "description", width: 50, note: "Full description." },
  { header: "Brand", key: "brand", width: 16, note: "" },
  { header: "Collection", key: "collection", width: 20, note: "" },
  { header: "Code", key: "code", width: 18, note: "Model / SKU code." },
  { header: "Gender", key: "gender", width: 12, note: `One of: ${GENDER_OPTIONS.join(", ")}.` },
  { header: "Price", key: "price", width: 14, note: "Required. e.g. 24500" },
  { header: "Price Subtext", key: "priceSubtext", width: 22, note: "e.g. Incl. of all taxes" },
  { header: "Tag", key: "tag", width: 14, note: "Badge such as New or Bestseller." },
  { header: "Rating", key: "rating", width: 8, note: "0–5. Defaults to 4.5." },
  { header: "Main Product", key: "isMainProduct", width: 13, note: "TRUE / FALSE" },
  { header: "New Arrival", key: "isNewArrival", width: 12, note: "TRUE / FALSE" },
  { header: "Recommended", key: "isRecommended", width: 13, note: "TRUE / FALSE" },
  { header: "Related", key: "isRelated", width: 10, note: "TRUE / FALSE" },
  { header: "Image", key: "image", width: 40, note: "Primary image URL. Defaults to the first of Images." },
  { header: "Hover Image", key: "hoverImage", width: 40, note: "Image shown on hover." },
  { header: "Images", key: "images", width: 50, note: "Gallery image URLs, one per line (or separated by |)." },
  { header: "Sizes", key: "sizes", width: 18, note: "Comma separated, e.g. 38mm, 41mm" },
  { header: "Variants", key: "variants", width: 34, note: "Handles of linked colour variants, comma separated. Links are applied both ways." },
  { header: "Specifications (JSON)", key: "specifications", width: 60, note: "Specification sections as JSON. Keep as exported unless you know the format." },
];

const LIST_SPLIT = /\r?\n|\|/;

function yesNo(v: boolean | undefined) {
  return v ? "TRUE" : "FALSE";
}

function productToRow(p: Product): SheetRow {
  return {
    handle: p.slug || "",
    name: p.name || p.title || "",
    title: p.title || "",
    subtitle: p.subtitle || "",
    description: p.description || "",
    brand: p.brand || "",
    collection: p.collection || "",
    code: p.code || "",
    gender: p.gender || "",
    price: p.price || "",
    priceSubtext: p.priceSubtext || "",
    tag: p.tag || "",
    rating: p.rating != null ? String(p.rating) : "",
    isMainProduct: yesNo(p.isMainProduct),
    isNewArrival: yesNo(p.isNewArrival),
    isRecommended: yesNo(p.isRecommended),
    isRelated: yesNo(p.isRelated),
    image: p.image || "",
    hoverImage: p.hoverImage || "",
    images: (p.images || []).join("\n"),
    sizes: (p.sizes || []).join(", "),
    variants: (p.variants || [])
      .map((v) => v.slug)
      .filter(Boolean)
      .join(", "),
    specifications: p.specifications?.length ? JSON.stringify(p.specifications) : "",
  };
}

export async function buildProductWorkbook(products: Product[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Timect Admin";
  wb.created = new Date();

  const ws = wb.addWorksheet("Products", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF232323" } };
  head.height = 22;
  head.alignment = { vertical: "middle" };
  COLUMNS.forEach((c, i) => {
    if (c.note) head.getCell(i + 1).note = c.note;
  });

  for (const p of products) ws.addRow(productToRow(p));
  ws.eachRow((row, n) => {
    if (n > 1) row.alignment = { vertical: "top", wrapText: false };
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };

  const help = wb.addWorksheet("How to import");
  help.columns = [
    { header: "Column", key: "header", width: 24 },
    { header: "How to fill it", key: "note", width: 110 },
  ];
  help.getRow(1).font = { bold: true };
  help.addRow({ header: "", note: "" });
  help.addRow({
    header: "Updating",
    note: "Keep the Handle of an existing product and change any other cell. On import the product is replaced with the row's data.",
  });
  help.addRow({ header: "Adding", note: "Add a row with an empty Handle. Name and Price are required." });
  help.addRow({
    header: "Blank cells",
    note: "A blank cell clears that field. A column deleted from the sheet keeps the products' current values for it.",
  });
  help.addRow({ header: "Deleting", note: "Rows removed from the sheet are NOT deleted from the store. Delete products from the Products page." });
  help.addRow({ header: "", note: "" });
  for (const c of COLUMNS) help.addRow({ header: c.header, note: c.note });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/* ----------------------------------------------------------------- import */

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("richText" in value) return value.richText.map((t) => t.text).join("").trim();
    if ("text" in value && value.text != null) return cellText(value.text as ExcelJS.CellValue);
    if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
    if ("hyperlink" in value) return String(value.hyperlink).trim();
  }
  return String(value).trim();
}

function parseBool(s: string): boolean {
  return ["true", "yes", "y", "1", "x"].includes(s.trim().toLowerCase());
}

function splitList(s: string, sep: RegExp): string[] {
  return s
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean);
}

export type ParsedRow = {
  /** 1-based spreadsheet row number, for error messages */
  row: number;
  handle: string;
  /** Fields present in the sheet; fields not listed keep existing values. */
  input: Partial<ProductInput>;
  /** Variant handles, or null when the Variants column is absent */
  variantHandles: string[] | null;
  error?: string;
};

export async function parseProductWorkbook(file: ArrayBuffer): Promise<{ rows: ParsedRow[]; error?: string }> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(file);
  } catch {
    return { rows: [], error: "Could not read the file. Upload an .xlsx workbook (Excel, Google Sheets → Download → .xlsx)." };
  }
  const ws = wb.getWorksheet("Products") ?? wb.worksheets[0];
  if (!ws) return { rows: [], error: "The workbook has no sheets." };

  // Map header text → column number (case/space-insensitive)
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const byHeader = new Map(COLUMNS.map((c) => [norm(c.header), c.key]));
  byHeader.set("specifications", "specifications");
  byHeader.set("slug", "handle");
  byHeader.set("sku", "code");
  const colOf = new Map<keyof SheetRow, number>();
  ws.getRow(1).eachCell((cell, n) => {
    const key = byHeader.get(norm(cellText(cell.value)));
    if (key && !colOf.has(key)) colOf.set(key, n);
  });
  if (!colOf.has("name") && !colOf.has("title")) {
    return { rows: [], error: "Missing a Name (or Title) column. Start from an exported file to get the right headers." };
  }

  const rows: ParsedRow[] = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const get = (k: keyof SheetRow) => {
      const c = colOf.get(k);
      return c ? cellText(row.getCell(c).value) : undefined;
    };
    const values = [...colOf.values()].map((c) => cellText(row.getCell(c).value));
    if (values.every((v) => !v)) return; // skip empty rows

    const input: Partial<ProductInput> = {};
    const str = (k: keyof SheetRow & keyof ProductInput) => {
      const v = get(k);
      if (v !== undefined) (input as Record<string, unknown>)[k] = v;
    };
    (["name", "title", "subtitle", "description", "brand", "collection", "code", "priceSubtext", "tag", "image", "hoverImage", "price"] as const).forEach(str);

    let error: string | undefined;
    const gender = get("gender");
    if (gender !== undefined) {
      const match = GENDER_OPTIONS.find((g) => g.toLowerCase() === gender.toLowerCase());
      if (gender && !match) error = `Gender "${gender}" must be one of ${GENDER_OPTIONS.join(", ")}.`;
      input.gender = match || "Unisex";
    }
    const rating = get("rating");
    if (rating !== undefined) {
      const r = parseFloat(rating);
      input.rating = Number.isFinite(r) ? Math.min(5, Math.max(0, r)) : 4.5;
    }
    (["isMainProduct", "isNewArrival", "isRecommended", "isRelated"] as const).forEach((k) => {
      const v = get(k);
      if (v !== undefined) input[k] = parseBool(v);
    });
    const images = get("images");
    if (images !== undefined) input.images = splitList(images, LIST_SPLIT);
    const sizes = get("sizes");
    if (sizes !== undefined) input.sizes = splitList(sizes, /[,\n|]/);
    const specs = get("specifications");
    if (specs !== undefined) {
      if (!specs) input.specifications = [];
      else {
        try {
          const parsed = JSON.parse(specs) as Specification[];
          if (!Array.isArray(parsed)) throw new Error();
          input.specifications = parsed;
        } catch {
          error ??= "Specifications is not valid JSON.";
        }
      }
    }
    const variants = get("variants");

    if (!error && !(input.name || input.title) && (colOf.has("name") || colOf.has("title"))) {
      error = "Name is required.";
    }
    if (!error && colOf.has("price") && !input.price) error = "Price is required.";

    rows.push({
      row: n,
      handle: get("handle") || "",
      input,
      variantHandles: variants === undefined ? null : splitList(variants, /[,\n|]/),
      error,
    });
  });

  return { rows };
}
