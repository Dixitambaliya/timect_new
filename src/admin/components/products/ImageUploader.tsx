"use client";

import { useRef, useState } from "react";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Replace,
} from "lucide-react";
import MediaPicker from "@/admin/components/media/MediaPicker";
import { adminUploadMedia } from "@/admin/actions/media";
import { useToast } from "@/admin/hooks/useToast";

type ImageUploaderProps = {
  images: string[];
  primaryImage?: string;
  hoverImage?: string;
  onChange: (images: string[]) => void;
  onPrimaryChange?: (url: string) => void;
  onHoverChange?: (url: string) => void;
};

export default function ImageUploader({
  images,
  primaryImage,
  hoverImage,
  onChange,
  onPrimaryChange,
  onHoverChange,
}: ImageUploaderProps) {
  const { error, success } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"multi" | "hover" | "replace">(
    "multi",
  );
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const primary = primaryImage || images[0] || "";

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
    if (onPrimaryChange && primary === images[from]) {
      // keep primary by URL
    }
  };

  const removeAt = (idx: number) => {
    const url = images[idx];
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    if (onPrimaryChange && primary === url) {
      onPrimaryChange(next[0] || "");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");
        const res = await adminUploadMedia(fd);
        if (res.ok) added.push(res.item.url);
        else error(res.error);
      }
      if (added.length) {
        const next = [...images, ...added];
        onChange(next);
        if (!primary && onPrimaryChange) onPrimaryChange(added[0]);
        success(`${added.length} image(s) uploaded`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          Upload images
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => {
            setPickerMode("multi");
            setPickerOpen(true);
          }}
        >
          Media library
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div
        className="rounded-fuse-md border-2 border-dashed border-[var(--admin-line)] bg-[var(--admin-bg)] p-6 text-center text-sm text-[var(--admin-muted)]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        Drag & drop images here, or use upload / media library
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex != null) reorder(dragIndex, idx);
                setDragIndex(null);
              }}
              className={`group relative aspect-square overflow-hidden rounded-fuse-md border bg-[var(--admin-bg)] ${
                primary === url
                  ? "border-[var(--admin-accent)] ring-2 ring-[var(--admin-accent)]/20"
                  : "border-[var(--admin-line)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-1.5 opacity-0 transition group-hover:opacity-100">
                <span className="admin-drag-handle rounded bg-black/50 p-1 text-white">
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Set primary"
                    className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
                    onClick={() => onPrimaryChange?.(url)}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${primary === url ? "fill-amber-400 text-amber-400" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    title="Replace"
                    className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
                    onClick={() => {
                      setReplaceIndex(idx);
                      setPickerMode("replace");
                      setPickerOpen(true);
                    }}
                  >
                    <Replace className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    className="rounded bg-black/50 p-1 text-white hover:bg-red-600"
                    onClick={() => removeAt(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {primary === url && (
                <span className="absolute bottom-1 left-1 rounded bg-[var(--admin-accent)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="admin-card p-4">
        <label className="admin-label">Hover image (product cards)</label>
        <div className="flex flex-wrap items-center gap-3">
          {hoverImage ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--admin-line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hoverImage}
                alt="Hover"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-[var(--admin-line)] text-xs text-[var(--admin-muted)]">
              None
            </div>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              setPickerMode("hover");
              setPickerOpen(true);
            }}
          >
            Choose hover image
          </button>
          {hoverImage && (
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => onHoverChange?.("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple={pickerMode === "multi"}
        onSelect={(url) => {
          if (pickerMode === "hover") {
            onHoverChange?.(url);
          } else if (pickerMode === "replace" && replaceIndex != null) {
            const next = [...images];
            next[replaceIndex] = url;
            onChange(next);
            setReplaceIndex(null);
          } else {
            onChange([...images, url]);
            if (!primary) onPrimaryChange?.(url);
          }
        }}
        onSelectMany={(urls) => {
          const next = [...images, ...urls];
          onChange(next);
          if (!primary && urls[0]) onPrimaryChange?.(urls[0]);
        }}
      />
    </div>
  );
}
