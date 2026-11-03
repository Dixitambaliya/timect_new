"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import {
  adminExportProducts,
  adminImportProducts,
  type ImportResult,
} from "@/admin/actions/product-import";
import { useToast } from "@/admin/hooks/useToast";

function saveBase64(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Shopify-style bulk editing: export every product to Excel, edit, re-upload.
 * Uploads are previewed first (dry run), then applied as create/update.
 */
export default function ProductImportExport({ onImported }: { onImported: () => void }) {
  const { success, error } = useToast();
  const [exporting, startExport] = useTransition();
  const [open, setOpen] = useState(false);

  const doExport = (template = false) =>
    startExport(async () => {
      const res = await adminExportProducts(template);
      if (!res.ok) return error(res.error);
      saveBase64(res.base64, res.filename);
      success(template ? "Template downloaded" : "Products exported");
    });

  return (
    <>
      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => doExport()} disabled={exporting}>
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Export
      </button>
      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Import
      </button>
      {open && (
        <ImportDialog
          onClose={() => setOpen(false)}
          onTemplate={() => doExport(true)}
          onImported={() => {
            onImported();
          }}
        />
      )}
    </>
  );
}

function ImportDialog({
  onClose,
  onTemplate,
  onImported,
}: {
  onClose: () => void;
  onTemplate: () => void;
  onImported: () => void;
}) {
  const { success, error } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, pending]);

  const run = (f: File, dryRun: boolean) =>
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", f);
      const res = await adminImportProducts(fd, dryRun);
      setResult(res);
      if (!res.ok) return error(res.error);
      if (!dryRun) {
        success(`Imported: ${res.created} created, ${res.updated} updated`);
        onImported();
      }
    });

  const pick = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    run(f, true);
  };

  const done = result?.ok && !result.dryRun;
  const ready = result?.ok && result.dryRun && result.created + result.updated > 0;

  return createPortal(
    <div className="admin-portal fixed inset-0 z-[300] flex items-end justify-center p-2 md:items-center md:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-[#23232314] backdrop-blur-[12px]"
        aria-label="Close dialog"
        onClick={() => !pending && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl animate-rise-in flex-col rounded-fuse bg-[var(--admin-surface)] shadow-[var(--admin-shadow-lg)]"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 md:px-8 md:pt-8">
          <div>
            <h3 id="import-title" className="text-[20px] font-bold text-[var(--admin-heading)]">
              Import products
            </h3>
            <p className="mt-1 text-[14px] leading-relaxed text-[var(--admin-muted)]">
              Upload an .xlsx file. Rows whose Handle matches an existing product update it; rows with a new or blank
              Handle create products. Start from{" "}
              <button type="button" className="underline" onClick={onTemplate}>
                a blank template
              </button>{" "}
              or an Export.
            </p>
          </div>
          <button type="button" className="admin-btn admin-btn-ghost px-2" onClick={onClose} disabled={pending} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 md:px-8">
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-fuse-md border border-dashed border-[var(--admin-line)] bg-[var(--admin-bg)] px-4 py-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files[0]);
            }}
          >
            <FileSpreadsheet className="h-6 w-6 text-[var(--admin-muted)]" />
            <span className="text-sm font-medium">{file ? file.name : "Drop an .xlsx file or click to choose"}</span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>

          {pending && (
            <p className="mt-4 flex items-center gap-2 text-sm text-[var(--admin-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {result?.ok && result.dryRun ? "Importing…" : "Checking file…"}
            </p>
          )}

          {result && !result.ok && !pending && (
            <p className="mt-4 rounded-fuse-md bg-[var(--admin-danger-soft)] px-4 py-3 text-sm text-[var(--admin-danger)]">
              {result.error}
            </p>
          )}

          {result?.ok && !pending && (
            <div className="mt-4 space-y-3 pb-2">
              <p className="text-sm">
                {done ? "Done -" : "Preview -"}
                <strong>{result.created}</strong> {done ? "created" : "to create"}, <strong>{result.updated}</strong>{" "}
                {done ? "updated" : "to update"}
                {result.failed > 0 && (
                  <>
                    , <strong className="text-[var(--admin-danger)]">{result.failed}</strong> with errors (skipped)
                  </>
                )}
                .
              </p>
              <div className="overflow-hidden rounded-fuse-md border border-[var(--admin-line)]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[var(--admin-bg)] text-[var(--admin-muted)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Row</th>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r) => (
                      <tr key={r.row} className="border-t border-[var(--admin-line)] align-top">
                        <td className="px-3 py-2 text-[var(--admin-muted)]">{r.row}</td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{r.name || "—"}</div>
                          {r.handle && <div className="font-mono text-[11px] text-[var(--admin-muted)]">{r.handle}</div>}
                          {r.message && (
                            <div className={r.action === "error" ? "text-[var(--admin-danger)]" : "text-[var(--admin-muted)]"}>
                              {r.message}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              r.action === "error"
                                ? "text-[var(--admin-danger)]"
                                : r.action === "create"
                                  ? "text-[var(--admin-accent)]"
                                  : ""
                            }
                          >
                            {r.action === "error" ? "Skipped" : r.action === "create" ? "New" : "Update"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 p-6 md:px-8 md:pb-8">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={pending}>
            {done ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={pending || !ready || !file}
            onClick={() => file && run(file, false)}
          >
            {result?.ok && result.dryRun
              ? `Import ${result.created + result.updated} product${result.created + result.updated === 1 ? "" : "s"}`
              : "Import"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
