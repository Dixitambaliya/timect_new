"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "onCheckedChange" | "onChange" | "type"
> & {
  onChange?: (event: { target: { checked: boolean } }) => void;
};

/** shadcn/ui checkbox, adapted to the app's existing onChange API. */
export function Checkbox({ className = "", onChange, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      {...props}
      onCheckedChange={(checked) =>
        onChange?.({ target: { checked: checked === true } })
      }
      className={`peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-[var(--admin-line,#8a8a8a)] bg-white text-white shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--admin-accent,#111)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--admin-accent,#111)] data-[state=checked]:bg-[var(--admin-accent,#111)] ${className}`}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
