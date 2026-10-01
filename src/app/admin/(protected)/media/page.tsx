"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Copy,
  Folder,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import EmptyState from "@/admin/components/ui/EmptyState";
import Pagination from "@/admin/components/ui/Pagination";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";
import {
  adminDeleteMedia,
  adminListMedia,
  adminRegisterMediaUrl,
  adminUploadMedia,
  type MediaItem,
} from "@/admin/actions/media";
import { useToast } from "@/admin/hooks/useToast";

export default function MediaPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploadFolder, setUploadFolder] = useState("general");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminListMedia({
        search,
        folder: folder || undefined,
        page,
        pageSize: 24,
      });
      setItems(res.items);
      setTotal(res.total);
      setFolders(res.folders);
    } finally {
      setLoading(false);
    }
  }, [search, folder, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = (files: FileList | null) => {
    if (!files?.length) return;
    startTransition(async () => {
      let ok = 0;
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", uploadFolder);
        const res = await adminUploadMedia(fd);
        if (res.ok) ok += 1;
        else error(res.error);
      }
      if (ok) success(`Uploaded ${ok} file(s)`);
      await load();
    });
  };

  const handleUrl = () => {
    if (!urlInput.trim()) return;
    startTransition(async () => {
      const res = await adminRegisterMediaUrl({
        url: urlInput.trim(),
        folder: uploadFolder || "external",
      });
      if (!res.ok) error(res.error);
      else {
        success("URL added to library");
        setUrlInput("");
        await load();
      }
    });
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      success("URL copied");
    } catch {
      error("Could not copy");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 24));

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Media" },
          ]}
        />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">Media manager</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Upload, organize, and copy Cloudinary-compatible image URLs
        </p>
      </div>

      <div className="admin-card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="admin-label">Folder</label>
          <input
            className="admin-input w-40"
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            placeholder="general"
          />
        </div>
        <label className="admin-btn admin-btn-primary cursor-pointer">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
        <div className="flex min-w-[240px] flex-1 gap-2">
          <input
            className="admin-input"
            placeholder="Paste image URL…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrl();
              }
            }}
          />
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleUrl}
            disabled={pending}
          >
            Add URL
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            className="admin-input pl-9"
            placeholder="Search filename, alt, folder…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="admin-input w-auto"
          value={folder}
          onChange={(e) => {
            setFolder(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon={<Folder className="h-5 w-5" />}
            title="No media yet"
            description="Upload images or register existing Cloudinary URLs."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="admin-card group overflow-hidden"
            >
              <div className="relative aspect-square bg-[var(--admin-bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.altText || item.filename || ""}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded bg-white/90 p-1.5 text-black"
                    title="Copy URL"
                    onClick={() => void copyUrl(item.url)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded bg-white/90 p-1.5 text-red-600"
                    title="Delete"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">
                  {item.filename || "image"}
                </p>
                <p className="truncate text-[10px] text-[var(--admin-muted)]">
                  {item.folder}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onChange={setPage}
      />

      <ConfirmDialog
        open={deleteId != null}
        title="Delete this media item?"
        description="Removes the library entry. Cloudinary assets are deleted when a public_id is present."
        confirmLabel="Delete"
        danger
        loading={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId == null) return;
          startTransition(async () => {
            const res = await adminDeleteMedia(deleteId);
            if (!res.ok) error(res.error);
            else {
              success("Media deleted");
              setDeleteId(null);
              await load();
            }
          });
        }}
      />
    </div>
  );
}
