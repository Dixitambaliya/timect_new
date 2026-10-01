"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, Link2, Loader2, Upload, X } from "lucide-react";
import {
  adminListMedia,
  adminRegisterMediaUrl,
  adminUploadMedia,
  type MediaItem,
} from "@/admin/actions/media";
import { useToast } from "@/admin/hooks/useToast";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
  onSelectMany?: (urls: string[]) => void;
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple,
  onSelectMany,
}: MediaPickerProps) {
  const { success, error } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [folders, setFolders] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminListMedia({
        search,
        folder: folder || undefined,
        pageSize: 60,
      });
      setItems(res.items);
      setFolders(res.folders);
    } finally {
      setLoading(false);
    }
  }, [search, folder]);

  useEffect(() => {
    if (open) {
      setSelected(new Set());
      void load();
    }
  }, [open, load]);

  if (!open) return null;

  const toggle = (url: string) => {
    if (!multiple) {
      onSelect(url);
      onClose();
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder || "general");
        const res = await adminUploadMedia(fd);
        if (!res.ok) {
          error(res.error);
        } else if (!multiple) {
          onSelect(res.item.url);
          onClose();
          success("Image uploaded");
          return;
        } else {
          setSelected((prev) => new Set(prev).add(res.item.url));
        }
      }
      await load();
      success("Upload complete");
    } finally {
      setUploading(false);
    }
  };

  const handleUrl = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    try {
      const res = await adminRegisterMediaUrl({
        url: urlInput.trim(),
        folder: folder || "external",
      });
      if (!res.ok) {
        error(res.error);
        return;
      }
      if (!multiple) {
        onSelect(res.item.url);
        onClose();
      } else {
        setSelected((prev) => new Set(prev).add(res.item.url));
        await load();
      }
      setUrlInput("");
      success("URL added");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="admin-card relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--admin-line)] px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">Media library</h3>
            <p className="text-xs text-[var(--admin-muted)]">
              Upload, paste URL, or pick an existing image
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost px-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--admin-line)] px-5 py-3">
          <input
            className="admin-input max-w-xs"
            placeholder="Search media…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="admin-input max-w-[160px]"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          >
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <label className="admin-btn admin-btn-secondary cursor-pointer">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
          </label>
          <div className="flex min-w-[220px] flex-1 items-center gap-1">
            <input
              className="admin-input"
              placeholder="https://… image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleUrl();
                }
              }}
            />
            <button
              type="button"
              className="admin-btn admin-btn-secondary px-2"
              onClick={() => void handleUrl()}
              title="Add URL"
            >
              <Link2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="admin-scrollbar flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--admin-muted)]">
              No media yet. Upload or paste a Cloudinary URL.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => {
                const isOn = selected.has(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.url)}
                    className={`group relative aspect-square overflow-hidden rounded-fuse-md border-2 bg-[var(--admin-bg)] ${
                      isOn
                        ? "border-[var(--admin-accent)]"
                        : "border-transparent hover:border-[var(--admin-line)]"
                    }`}
                  >
                    {item.url.startsWith("data:") ||
                    item.url.includes("cloudinary") ||
                    item.url.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.altText || item.filename || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.altText || ""}
                        fill
                        className="object-cover"
                      />
                    )}
                    {isOn && (
                      <span className="absolute right-2 top-2 rounded-full bg-[var(--admin-accent)] p-1 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                      {item.filename || item.folder}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between border-t border-[var(--admin-line)] px-5 py-3">
            <p className="text-sm text-[var(--admin-muted)]">
              {selected.size} selected
            </p>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={!selected.size}
              onClick={() => {
                onSelectMany?.(Array.from(selected));
                onClose();
              }}
            >
              Use selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
