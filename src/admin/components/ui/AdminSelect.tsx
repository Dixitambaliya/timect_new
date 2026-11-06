"use client";

import { Select, SelectOption } from "@/components/ui/select";

export type AdminSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export default function AdminSelect({
  value,
  options,
  onChange,
  placeholder = "Select an option…",
  className = "",
}: {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
      aria-label={placeholder}
    >
      {!value && <SelectOption value="">{placeholder}</SelectOption>}
      {options.map((option) => (
        <SelectOption key={option.value} value={option.value}>
          {option.description
            ? `${option.label} — ${option.description}`
            : option.label}
        </SelectOption>
      ))}
    </Select>
  );
}
