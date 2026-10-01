"use client";

import { Plus, Trash2 } from "lucide-react";

const PRESETS = ["36 mm", "38 mm", "39 mm", "40 mm", "41 mm", "42 mm", "44 mm"];

export default function SizeEditor({
  sizes,
  onChange,
}: {
  sizes: string[];
  onChange: (sizes: string[]) => void;
}) {
  const add = (value = "") => onChange([...sizes, value]);
  const update = (idx: number, value: string) => {
    const next = [...sizes];
    next[idx] = value;
    onChange(next);
  };
  const remove = (idx: number) => onChange(sizes.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--admin-muted)]">
          Unlimited case sizes (e.g. 39 mm, 42 mm)
        </p>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => add("")}
        >
          <Plus className="h-4 w-4" />
          Add size
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className="admin-btn admin-btn-secondary text-xs"
            onClick={() => {
              if (!sizes.includes(p)) onChange([...sizes, p]);
            }}
          >
            + {p}
          </button>
        ))}
      </div>

      {sizes.length === 0 ? (
        <div className="rounded-fuse-md border border-dashed border-[var(--admin-line)] py-12 text-center text-sm text-[var(--admin-muted)]">
          No sizes yet. Use presets or add custom values.
        </div>
      ) : (
        <div className="space-y-2">
          {sizes.map((size, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="admin-input"
                value={size}
                onChange={(e) => update(idx, e.target.value)}
                placeholder="42 mm"
              />
              <button
                type="button"
                className="admin-btn admin-btn-danger px-2"
                onClick={() => remove(idx)}
                aria-label="Remove size"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
