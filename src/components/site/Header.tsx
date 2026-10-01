"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import { useScrollY } from "@/components/fuse/hooks";
import { ChevronDown, MenuIcon, SearchIcon, Mail, ArrowRight } from "@/components/fuse/icons";
import { catalogThumbUrl } from "@/lib/catalog-image";
import Logo from "./Logo";
import { MAIN_NAV, SHOP_LINKS, watchesFilterHref } from "./navigation";
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
    variant === "glass" && "glass border-transparent bg-white/[.04] text-white hover:bg-white/[.14]",
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

/** Desktop mega menu for "Watches": quick links + live shop-by-category cards. */
function MegaMenu({ open, onEnter, onLeave, onNavigate }: {
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}) {
  const { categories } = useSite();
  if (!open) return null;
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%+8px)] z-50 animate-dropdown-in"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="grid grid-cols-[260px_1fr] gap-3 rounded-fuse bg-white p-3 shadow-[0_24px_60px_rgba(0,0,0,.12)]">
        <div className="rounded-fuse-md bg-bg p-6">
          <p className="mb-4 text-[14px] font-semibold uppercase tracking-wide text-muted">Shop</p>
          <ul className="flex flex-col gap-3">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={onNavigate} className="link-hover text-[18px] font-semibold text-heading">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <ul className="grid grid-cols-3 gap-2 xl:grid-cols-6">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={watchesFilterHref(c.slug)}
                onClick={onNavigate}
                className="group/m flex h-full flex-col rounded-fuse-md bg-bg p-2"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-fuse-sm bg-placeholder">
                  {c.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={catalogThumbUrl(c.image, 360)}
                      alt=""
                      loading="lazy"
                      className="img-fill transition-transform duration-700 group-hover/m:scale-110"
                    />
                  )}
                </span>
                <span className="flex items-center justify-between gap-2 px-2 pb-1 pt-3 text-[15px] font-semibold capitalize">
                  {c.label.toLowerCase()}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-400 group-hover/m:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const transparent = pathname === "/";
  const y = useScrollY();
  const { openPanel } = useSite();
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(160);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetTop + el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setMega(false), [pathname]);

  const stacked = y > headerH + 40;
  const light = transparent;
  const iconVariant = light ? "glass" : "solid";

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 180);
  };

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    return base !== "/" && pathname.startsWith(base) && !href.includes("?");
  };

  return (
    <>
      {/* Static header — sits inside the hero on the home page */}
      <header
        ref={headerRef}
        className={cx(
          "z-50 transition-opacity duration-400",
          transparent ? "absolute inset-x-1 top-[var(--announcement-h)] md:inset-x-3" : "relative mx-1 md:mx-3",
          stacked && "pointer-events-none opacity-0",
        )}
        onMouseLeave={scheduleClose}
      >
        <div
          className={cx(
            "mx-auto flex max-w-site items-center justify-between gap-4 rounded-fuse transition-colors duration-400",
            transparent ? "px-3 py-3 md:p-4 xl:p-8" : "bg-white px-3 py-3 md:px-4 md:py-5",
          )}
        >
          <div className="flex items-center gap-3 xl:gap-10">
            <HeaderIcon variant={iconVariant} aria-label="Open menu" onClick={() => openPanel("menu")}>
              <MenuIcon />
            </HeaderIcon>
            <Link href="/" aria-label="Timect home" className="block shrink-0">
              <Logo light={light} />
            </Link>

            <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
              {MAIN_NAV.map((item) =>
                item.mega ? (
                  <div key={item.href} onMouseEnter={openMega} onFocus={openMega}>
                    <Link
                      href={item.href}
                      aria-expanded={mega}
                      className={cx(
                        "flex items-center gap-1.5 rounded-[10px] px-4 py-2 font-semibold transition-[background-color,color] duration-400",
                        mega ? "bg-[#f0f2f4eb] text-ink" : light ? "text-white" : "text-ink hover:bg-bg",
                      )}
                    >
                      {item.title}
                      <ChevronDown className={cx("h-5 w-5 transition-transform duration-400", mega && "rotate-180")} />
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={scheduleClose}
                    className={cx(
                      "rounded-[10px] px-4 py-2 font-semibold transition-[background-color,color] duration-400",
                      light ? "text-white hover:bg-white/10" : "text-ink hover:bg-bg",
                      !light && isActive(item.href) && "bg-bg",
                    )}
                  >
                    {item.title}
                  </Link>
                ),
              )}
            </nav>
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

        <div className="relative mx-auto hidden max-w-site xl:block">
          <MegaMenu
            open={mega}
            onEnter={() => clearTimeout(closeTimer.current)}
            onLeave={scheduleClose}
            onNavigate={() => setMega(false)}
          />
        </div>
      </header>

      {/* Blurred scrim while the mega menu is open */}
      {mounted &&
        createPortal(
          <div
            aria-hidden
            className={cx(
              "pointer-events-none fixed inset-0 z-40 bg-[#2323230d] transition-[opacity,backdrop-filter] duration-400",
              mega ? "opacity-100 backdrop-blur-[12px]" : "opacity-0 backdrop-blur-0",
            )}
          />,
          document.body,
        )}

      {/* Stacked sticky header — compact dark glass pill */}
      <div
        className={cx(
          "fixed inset-x-2 top-2 z-[55] mx-auto max-w-[480px] transition-[transform,opacity] duration-[600ms] ease-fuse-out md:top-4",
          stacked ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-[140%] opacity-0",
        )}
        aria-hidden={!stacked}
      >
        <div className="glass-dark flex items-center gap-3 rounded-fuse !bg-[#232323cc] p-2 shadow-[0_12px_40px_rgba(0,0,0,.18)]">
          <HeaderIcon variant="dark" aria-label="Open menu" tabIndex={stacked ? 0 : -1} onClick={() => openPanel("menu")}>
            <MenuIcon />
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
