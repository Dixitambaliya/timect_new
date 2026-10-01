import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Breadcrumbs } from "@/components/fuse/buttons";

/** Fuse content page frame: breadcrumbs, oversized title, white rounded body. */
export default function ContentPage({
  title,
  subtitle,
  children,
  width = "max-w-[960px]",
  bare = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
  /** Render children without the white card (for custom layouts). */
  bare?: boolean;
}) {
  return (
    <div className="container-fuse pb-10 pt-12 md:pt-20">
      <div className="px-2">
        <Breadcrumbs items={[["Home", "/"], [title]]} />
        <h1 className="fuse-h1 mx-auto mt-2 max-w-[1100px] animate-rise-in text-center">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-[680px] text-center text-[16px] leading-[1.6] text-muted md:text-[18px]">{subtitle}</p>
        )}
      </div>
      <div className={cx("mx-auto mt-10 md:mt-16", width)}>
        {bare ? children : <div className="rounded-fuse bg-white p-6 md:p-12">{children}</div>}
      </div>
    </div>
  );
}
