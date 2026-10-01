import Link from "next/link";

export type Crumb = { label: string; href?: string };

/** Fuse breadcrumbs: muted labels separated by thin pipes. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-2.5 text-[13px] text-[var(--admin-muted)]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-[var(--admin-line-strong)]">|</span>}
              {item.href && !last ? (
                <Link href={item.href} className="link-hover text-[var(--admin-ink)]">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Page title block used on every admin screen. */
export function PageHeader({
  crumbs,
  title,
  description,
  actions,
}: {
  crumbs: Crumb[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Breadcrumbs items={crumbs} />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-[var(--admin-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
