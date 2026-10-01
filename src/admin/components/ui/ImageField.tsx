"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import MediaPicker from "@/admin/components/media/MediaPicker";

/** Image URL input with thumbnail preview and media-library picker. */
export default function ImageField({
  label,
  value,
  onChange,
  aspect = "aspect-square",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const [picker, setPicker] = useState(false);
  return (
    <div>
      <span className="admin-label">{label}</span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setPicker(true)}
          className={`relative w-24 shrink-0 overflow-hidden rounded-fuse-md border border-dashed border-[var(--admin-line-strong)] bg-[var(--admin-bg)] ${aspect}`}
          aria-label={`Choose ${label.toLowerCase()}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[var(--admin-muted)]">
              <ImageIcon className="h-5 w-5" />
            </span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            className="admin-input font-mono text-[13px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="admin-btn admin-btn-secondary !px-3 !py-2" onClick={() => setPicker(true)}>
              Choose image
            </button>
            {value && (
              <button type="button" className="admin-btn admin-btn-ghost !px-3 !py-2" onClick={() => onChange("")}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(url) => {
          onChange(url);
          setPicker(false);
        }}
      />
    </div>
  );
}
