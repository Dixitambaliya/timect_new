"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export type HeaderLink = {
  href: string;
  label: string;
};

const DEFAULT_NAV_LINKS: HeaderLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/corporate-gifting", label: "Corporate Gifting" },
  { href: "/watches", label: "Watches" },
  { href: "/contact", label: "Contact" },
];

type HeaderProps = {
  /** Override nav links (e.g. gift page: Home, Contact, Catalog). */
  links?: HeaderLink[];
  /** Visual variant for special pages. */
  variant?: "default" | "gift";
  className?: string;
};

export default function Header({
  links = DEFAULT_NAV_LINKS,
  variant = "default",
  className = "",
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isGift = variant === "gift";

  return (
    <>
      <header
        className={`border-b border-[var(--line)] ${scrolled ? "scrolled" : ""} ${
          isGift ? "header-gift-light" : ""
        } ${className}`.trim()}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center cursor-pointer">
            <img
              src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png"
              alt="Timect Logo"
              className="h-12 w-12 object-contain"
            />
          </Link>
          <nav className="hidden md:flex gap-10 text-[12px] tracked-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:text-black transition cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div
        className={`md:hidden fixed inset-0 bg-white z-[9999] flex flex-col p-8 transition-all duration-200 ease-in-out ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center cursor-pointer"
          >
            <img
              src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png"
              alt="Timect Logo"
              className="h-10 w-10 object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="p-2 text-gray-700 hover:text-black cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-6 text-sm font-bold tracking-wider uppercase text-gray-800">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="hover:text-black pb-3 border-b border-gray-100 cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
