"use client";

import { useId, useState } from "react";
import { Check, Plus, X } from "lucide-react";

export default function DropdownWithAdd({
  label,
  value,
  options,
  onChange,
  onAddOption,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onAddOption?: (newOpt: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const [isAdding, setIsAdding] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Ensure current value is included in options list if present
  const allOptions = Array.from(
    new Set(
      [...(value ? [value] : []), ...options].filter((o): o is string => Boolean(o && o.trim())),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const handleAddNew = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      if (onAddOption) onAddOption(trimmed);
      onChange(trimmed);
    }
    setCustomInput("");
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="admin-label mb-0" htmlFor={inputId}>
          {label}
        </label>
        {value && !isAdding && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] text-[var(--admin-muted)] hover:text-red-500 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="flex items-center gap-1.5">
          <input
            id={inputId}
            type="text"
            className="admin-input flex-1 !py-2 text-sm"
            placeholder={`Enter new ${label.toLowerCase()}...`}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddNew();
              } else if (e.key === "Escape") {
                setIsAdding(false);
                setCustomInput("");
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddNew}
            className="admin-btn admin-btn-primary shrink-0 !px-3 !py-2 text-xs font-semibold"
            title="Save new option"
          >
            <Check className="h-4 w-4" /> Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setCustomInput("");
            }}
            className="admin-btn admin-btn-ghost shrink-0 !px-2 !py-2 text-xs"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <select
            id={inputId}
            className="admin-input flex-1 !py-2 text-sm"
            value={value || ""}
            onChange={(e) => {
              if (e.target.value === "__ADD_NEW__") {
                setIsAdding(true);
              } else {
                onChange(e.target.value);
              }
            }}
          >
            <option value="">{placeholder || `-- Select ${label.toLowerCase()} --`}</option>
            {allOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__ADD_NEW__">+ Add new {label.toLowerCase()}...</option>
          </select>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="admin-btn admin-btn-secondary shrink-0 !px-3 !py-2 text-xs font-semibold"
            title={`Add new ${label.toLowerCase()}`}
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      )}
    </div>
  );
}
