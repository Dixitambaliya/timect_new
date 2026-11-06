"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { Children, isValidElement, type ReactNode } from "react";

const EMPTY_VALUE = "__shadcn_empty_value__";

export function SelectOption(props: { value: string; children: ReactNode }) {
  void props;
  return null;
}

type SelectProps = {
  id?: string;
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

/** shadcn/ui select, adapted to the app's existing native-select API. */
export function Select({
  value,
  onChange,
  children,
  className = "",
  disabled,
  ...props
}: SelectProps) {
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value: string; children: ReactNode }>(child)) return [];
    return [{ value: child.props.value, label: child.props.children }];
  });

  return (
    <SelectPrimitive.Root
      value={value === "" ? EMPTY_VALUE : value}
      disabled={disabled}
      onValueChange={(nextValue) =>
        onChange({ target: { value: nextValue === EMPTY_VALUE ? "" : nextValue } })
      }
    >
      <SelectPrimitive.Trigger
        {...props}
        className={`admin-input flex min-h-[42px] items-center justify-between gap-2 text-left ${className}`}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="admin-portal z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-fuse-md border border-[var(--admin-line-strong)] bg-[var(--admin-surface)] text-[var(--admin-ink)] shadow-[var(--admin-shadow-lg)]"
        >
          <SelectPrimitive.Viewport className="max-h-72 p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value || EMPTY_VALUE}
                value={option.value || EMPTY_VALUE}
                className="relative flex cursor-default select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none data-[highlighted]:bg-[var(--admin-accent-soft)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-[var(--admin-accent)]" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
