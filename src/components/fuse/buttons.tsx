import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { ArrowRight, Spinner } from "./icons";

type ActionProps = {
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  tabIndex?: number;
  "aria-label"?: string;
};

function Action({ href, external, children, type = "button", ...rest }: ActionProps) {
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} {...rest}>
      {children}
    </button>
  );
}

/** Fuse "button-primary": split pill whose arrow chip pops in on hover. */
export function ButtonPrimary({
  children,
  className,
  glass = false,
  small = false,
  bg,
  ...rest
}: ActionProps & { glass?: boolean; small?: boolean; bg?: string }) {
  return (
    <Action
      className={cx("btn-primary group", glass && "glass", small && "is-small", className)}
      style={bg ? ({ "--btn-bg": bg } as CSSProperties) : undefined}
      {...rest}
    >
      <span className="btn-text">{children}</span>
      <span className="btn-icon">
        <ArrowRight />
      </span>
    </Action>
  );
}

/** Fuse "button-thirdly": outline button whose label drops and arrow slides in. */
export function ButtonOutline({ children, className, ...rest }: ActionProps) {
  return (
    <Action className={cx("btn-outline", className)} {...rest}>
      <span className="btn-text">{children}</span>
      <span className="btn-icon" aria-hidden>
        <ArrowRight />
      </span>
    </Action>
  );
}

export function ButtonSecondary({
  children,
  className,
  loading = false,
  ...rest
}: ActionProps & { loading?: boolean }) {
  return (
    <Action className={cx("btn-secondary", className)} {...rest}>
      <span className={cx(loading && "invisible")}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </Action>
  );
}

const tones = {
  sale: "bg-sale text-white",
  primary: "bg-label-primary text-white",
  secondary: "bg-label-secondary text-white",
  base: "bg-label-base text-ink",
  heading: "bg-heading text-white",
  dark: "bg-[#3A3A3AA3] text-white backdrop-blur",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "heading",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-[6px] px-[6px] py-[2px] text-[12px] font-bold uppercase leading-[1.3] tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap justify-center gap-3 text-[16px] text-muted">
      {items.map(([label, href], i) => (
        <span key={`${label}-${i}`} className="flex items-center gap-3">
          {i > 0 && <span className="text-line">|</span>}
          {href ? (
            <Link href={href} className="link-hover text-ink">
              {label}
            </Link>
          ) : (
            <span aria-current="page">{label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
