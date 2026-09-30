"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MobileNavigation from "@/components/MobileNavigation";
import { LOGO_SRC } from "@/lib/cloudinary";

export type HeaderLink = {
  href: string;
  label: string;
};

export const DEFAULT_NAV_LINKS: HeaderLink[] = [
  { href: "/watches", label: "Watches" },
  { href: "/corporate-gifting", label: "Corporate Gifting" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type HeaderProps = {
  /** Override nav links (e.g. gift page: Home, Contact, Catalog). */
  links?: HeaderLink[];
  /** Visual variant for special pages. */
  variant?: "default" | "gift";
  /**
   * Overlay: header floats above the first section (no spacer) and reads
   * `data-header-theme="dark|light"` from whatever section sits beneath it.
   */
  overlay?: boolean;
  className?: string;
};

export default function Header({
  links = DEFAULT_NAV_LINKS,
  variant = "default",
  overlay: overlayProp = false,
  className = "",
}: HeaderProps) {
  // The gifting stage positions its own content under a floating header.
  const overlay = overlayProp || variant === "gift";
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(overlay && variant !== "gift");
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;
    const probeY = 36;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;

      setAtTop(y < 24);
      setSolid(y > 24);
      // Hide while travelling down through content, return on any upward intent.
      if (y < 160) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -6) setHidden(false);

      if (overlay) {
        const sections = document.querySelectorAll<HTMLElement>("[data-header-theme]");
        let theme: string | null = null;
        for (const el of sections) {
          const r = el.getBoundingClientRect();
          if (r.top <= probeY && r.bottom > probeY) {
            theme = el.dataset.headerTheme ?? null;
          }
        }
        setDark(theme === "dark");
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [overlay]);

  const half = Math.ceil(links.length / 2);
  const left = links.slice(0, half);
  const right = links.slice(half);
  const isGift = variant === "gift";

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href.split("?")[0]));

  const classes = [
    "site-header",
    dark ? "site-header--dark" : "",
    solid || !overlay ? "site-header--solid" : "",
    hidden && !menuOpen ? "site-header--hidden" : "",
    overlay && atTop ? "site-header--quiet" : "",
    isGift ? "header-gift-light" : "",
    isGift && solid ? "scrolled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderLinks = (items: HeaderLink[]) =>
    items.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="site-nav-link"
        aria-current={isActive(link.href) ? "page" : undefined}
      >
        {link.label}
      </Link>
    ));

  return (
    <>
      <header className={classes}>
        <div className="lux-container h-full grid grid-cols-[1fr_auto_1fr] items-center">
          <nav aria-label="Primary" className="site-nav hidden lg:flex items-center gap-10">
            {renderLinks(left)}
          </nav>

          {/* Mobile: logo sits left */}
          <Link
            href="/"
            aria-label="Timect — home"
            className="col-start-1 lg:col-start-2 justify-self-start lg:justify-self-center flex items-center"
          >
            <Image
              src={LOGO_SRC}
              alt="Timect"
              width={1552}
              height={889}
              preload
              className="site-logo h-[30px] lg:h-[34px] w-auto"
            />
          </Link>

          <div className="col-start-3 flex items-center justify-end gap-10">
            <nav aria-label="Secondary" className="site-nav hidden lg:flex items-center gap-10">
              {renderLinks(right)}
            </nav>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden flex items-center gap-3 -mr-2 p-2 text-[0.6875rem] tracking-[0.28em] uppercase"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <span aria-hidden>Menu</span>
              <span className="flex flex-col gap-[6px] w-6" aria-hidden>
                <span className="menu-toggle-line w-6" />
                <span className="menu-toggle-line w-4 self-end" />
              </span>
            </button>
          </div>
        </div>
      </header>
      {!overlay && <div className="header-spacer" aria-hidden />}
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} links={links} />
    </>
  );
}
