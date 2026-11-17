"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useScrolledPast } from "@/components/fuse/hooks";
import { MenuIcon, SearchIcon, Mail, ArrowRight } from "@/components/fuse/icons";
import Logo from "./Logo";
import { useSite } from "./SiteProvider";

/** Square header icon button: glass over imagery, light tile on a solid header. */
function HeaderIcon({
  children,
  variant,
  className,
  href,
  ...rest
}: {
  children: ReactNode;
  variant: "glass" | "solid" | "dark";
  className?: string;
  href?: string;
  onClick?: () => void;
  tabIndex?: number;
  "aria-label": string;
}) {
  const cls = cx(
    "relative inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-fuse-md border px-3 transition-[background-color,border-color,color] duration-400 md:h-[54px] md:min-w-[54px]",
    variant === "glass" && "glass border-transparent bg-white/[.16] text-ink hover:bg-white/[.3]",
    variant === "solid" && "border-line bg-btn text-ink hover:border-line-hover hover:bg-white",
    variant === "dark" && "border-white/10 bg-white/[.06] text-white hover:bg-white/[.16]",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();
  const transparent = pathname === "/";
  const { openPanel } = useSite();
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(160);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetTop + el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stacked = useScrolledPast(headerH + 40);
  const light = transparent;
  const iconVariant = light ? "glass" : "solid";

  return (
    <>
      {/* Static header -sits inside the hero on the home page */}
      <header
        ref={headerRef}
        className={cx(
          "z-50 transition-opacity duration-400",
          transparent ? "absolute inset-x-1 top-[var(--announcement-h)] md:inset-x-3" : "relative mx-1 md:mx-3",
          stacked && "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cx(
            "mx-auto flex max-w-site items-center justify-between gap-4 rounded-fuse transition-colors duration-400",
            transparent ? "px-3 py-3 md:p-4 xl:p-8" : "bg-white px-3 py-3 md:px-4 md:py-5",
          )}
        >
          <div className="flex items-center gap-3 xl:gap-10">
            <HeaderIcon variant={iconVariant} aria-label="Open menu" onClick={() => openPanel("menu")}>
              <MenuIcon className="h-8 w-8" />
            </HeaderIcon>
            <Link href="/" aria-label="Timect home" className="block shrink-0">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <HeaderIcon variant={iconVariant} aria-label="Search" onClick={() => openPanel("search")}>
              <SearchIcon />
            </HeaderIcon>
            <HeaderIcon variant={iconVariant} aria-label="Contact us" href="/contact" className="hidden md:inline-flex xl:px-4">
              <Mail />
              <span className="hidden font-semibold xl:inline">Enquire</span>
            </HeaderIcon>
          </div>
        </div>
      </header>

      {/* Stacked sticky header -compact dark glass pill */}
      <div
        className={cx(
          "fixed inset-x-2 top-2 z-[55] mx-auto max-w-[480px] transition-[transform,opacity] duration-[600ms] ease-fuse-out md:top-4",
          stacked ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-[140%] opacity-0",
        )}
        aria-hidden={!stacked}
      >
        <div className="glass-dark flex items-center gap-3 rounded-fuse !bg-[#232323cc] p-2 shadow-[0_12px_40px_rgba(0,0,0,.18)]">
          <HeaderIcon variant="dark" aria-label="Open menu" tabIndex={stacked ? 0 : -1} onClick={() => openPanel("menu")}>
            <MenuIcon className="h-8 w-8" />
          </HeaderIcon>
          <Link href="/" aria-label="Timect home" tabIndex={stacked ? 0 : -1} className="flex-1 md:ms-2">
            <Logo light compact />
          </Link>
          <HeaderIcon variant="dark" aria-label="Search" tabIndex={stacked ? 0 : -1} onClick={() => openPanel("search")}>
            <SearchIcon />
          </HeaderIcon>
          <HeaderIcon variant="dark" aria-label="Shop watches" tabIndex={stacked ? 0 : -1} href="/watches" className="hidden sm:inline-flex">
            <ArrowRight />
          </HeaderIcon>
        </div>
      </div>
    </>
  );
}
