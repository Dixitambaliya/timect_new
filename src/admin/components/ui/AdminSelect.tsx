"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type AdminSelectOption = { value: string; label: string; description?: string };

export default function AdminSelect({ value, options, onChange, placeholder = "Select an option…", searchPlaceholder = "Search…", searchable = true, className = "" }: {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? options.filter((option) => `${option.label} ${option.description || ""}`.toLowerCase().includes(needle))
      : options;
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointer);
    window.addEventListener("keydown", handleKey);
    requestAnimationFrame(() => searchRef.current?.focus());
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button type="button" className="admin-input flex min-h-[46px] w-full items-center justify-between gap-3 text-left" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setQuery(""); setOpen((current) => !current); }}>
        <span className={selected ? "truncate" : "truncate text-[var(--admin-muted)]"}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--admin-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="admin-card absolute left-0 right-0 z-50 mt-1 overflow-hidden p-2 shadow-[var(--admin-shadow-lg)]">
          {searchable && (
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              <input ref={searchRef} className="admin-input py-2 pl-9 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} />
            </div>
          )}
          <div role="listbox" className="admin-scrollbar max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-5 text-center text-sm text-[var(--admin-muted)]">No options found</p>
            ) : filtered.map((option) => {
              const active = option.value === value;
              return (
                <button key={option.value} type="button" role="option" aria-selected={active} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${active ? "bg-[var(--admin-accent-soft)] text-[var(--admin-ink)]" : "hover:bg-[var(--admin-bg)]"}`} onClick={() => { onChange(option.value); setOpen(false); }}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{option.label}</span>
                    {option.description && <span className="block truncate text-xs text-[var(--admin-muted)]">{option.description}</span>}
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-[var(--admin-accent)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
