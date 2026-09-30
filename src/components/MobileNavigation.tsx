"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { LOGO_SRC } from "@/lib/cloudinary";
import type { HeaderLink } from "@/components/Header";

type Props = {
  open: boolean;
  onClose: () => void;
  links: HeaderLink[];
};

/**
 * Full-screen editorial menu for small screens: large serif index,
 * masked reveal, focus kept inside while open, Escape to close.
 */
export default function MobileNavigation({ open, onClose, links }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const items: HeaderLink[] = [...(links.some((l) => l.href === "/") ? [] : [{ href: "/", label: "Home" }]), ...links];

  return (
    <div
      id="mobile-navigation"
      ref={panelRef}
      className={`mobile-nav lg:hidden ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="lux-container flex items-center justify-between h-[var(--header-h)] shrink-0">
        <Link href="/" onClick={onClose} aria-label="Timect — home">
          <Image src={LOGO_SRC} alt="Timect" width={1552} height={889} className="h-[30px] w-auto invert" />
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex items-center gap-3 -mr-2 p-2 text-[0.6875rem] tracking-[0.28em] uppercase"
          aria-label="Close menu"
        >
          <span aria-hidden>Close</span>
          <span className="relative w-5 h-5" aria-hidden>
            <span className="absolute left-0 top-1/2 w-5 h-px bg-current rotate-45" />
            <span className="absolute left-0 top-1/2 w-5 h-px bg-current -rotate-45" />
          </span>
        </button>
      </div>

      <nav aria-label="Mobile" className="lux-container flex-1 flex flex-col justify-center">
        <ul className="border-t border-[var(--line-dark)]">
          {items.map((link, i) => (
            <li
              key={link.href}
              className="mobile-nav__item border-b border-[var(--line-dark)]"
              style={{ ["--i" as string]: i }}
            >
              <Link href={link.href} onClick={onClose} className="group flex items-baseline gap-5 py-5">
                <span className="numeral text-[0.8rem] text-[var(--champagne)] w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[2.4rem] sm:text-[3rem] leading-none transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-x-2">
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="mobile-nav__item lux-container pb-10 pt-6 flex items-end justify-between gap-6 text-[var(--muted-dark)]"
        style={{ ["--i" as string]: items.length }}
      >
        <p className="display italic text-[1.15rem] text-[var(--ivory)]/80 max-w-[14rem]">
          Time never stops, why should we?
        </p>
        <Link href="/contact" onClick={onClose} className="lux-link text-[var(--ivory)]">
          Enquire
        </Link>
      </div>
    </div>
  );
}
