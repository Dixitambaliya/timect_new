"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { Drawer } from "@/components/fuse/Overlay";
import { useCarousel } from "@/components/fuse/hooks";
import { SliderArrows } from "@/components/fuse/ui";
import { ArrowLeft, ChevronRight, CloseIcon, WhatsApp } from "@/components/fuse/icons";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { MAIN_NAV, SHOP_LINKS, UTILITY_LINKS, watchesFilterHref } from "./navigation";
import { useSite, whatsappLink } from "./SiteProvider";

function TrendingCategories({ onNavigate }: { onNavigate: () => void }) {
  const { categories } = useSite();
  const car = useCarousel({ loop: true });
  if (!categories.length) return null;
  return (
    <div className="mt-auto pt-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[20px] font-semibold text-heading">Shop by category</p>
        <SliderArrows carousel={car} className="[&_.slider-arrow]:h-12 [&_.slider-arrow]:w-12 [&_.slider-arrow]:rounded-full" />
      </div>
      <ul ref={car.ref} className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto">
        {categories.map((c) => (
          <li key={c.slug} className="w-full shrink-0 snap-start">
            <Link
              href={watchesFilterHref(c.slug)}
              onClick={onNavigate}
              className="group/t flex items-center gap-6 rounded-fuse border border-white bg-[#ffffff99] p-2"
            >
              <span className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-fuse-md bg-placeholder">
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={catalogThumbUrl(c.image, 240)} alt="" loading="lazy" className="img-fill transition-transform duration-700 group-hover/t:scale-110" />
                )}
              </span>
              <span>
                <span className="block text-[18px] font-semibold capitalize text-heading">{c.label.toLowerCase()}</span>
                <span className="mt-2 inline-block text-[13px] font-bold uppercase text-heading underline underline-offset-4">Shop now</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Burger drawer: top-level links rise in with a stagger; "Watches" opens a
 * nested level with shop links and every CMS category.
 */
export default function MenuDrawer() {
  const { panel, closePanel, categories, whatsappNumber } = useSite();
  const pathname = usePathname();
  const open = panel === "menu";
  const [nested, setNested] = useState(false);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setNested(false), 500);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    closePanel();
    // close on route change only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={closePanel}
      side="left"
      label="Menu"
      width="md:w-[600px]"
      aside={
        <button
          type="button"
          onClick={closePanel}
          aria-label="Close menu"
          className="mt-[calc(100vh-272px)] flex h-20 w-20 items-center justify-center rounded-fuse bg-white text-ink shadow-lg transition-transform duration-400 hover:rotate-90"
        >
          <CloseIcon />
        </button>
      }
    >
      <div className="flex items-center justify-between gap-2 p-3">
        <button
          type="button"
          onClick={closePanel}
          aria-label="Close menu"
          className="flex h-12 w-12 items-center justify-center rounded-fuse-md bg-[#ffffff99] shadow-[inset_0_0_0_1px_#fff] md:h-[56px] md:w-[56px]"
        >
          <CloseIcon />
        </button>
        <a
          href={whatsappLink(whatsappNumber, "Hi Timect, I have a question about your watches.")}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-fuse-md bg-[#ffffff99] px-4 py-3 text-[16px] font-semibold shadow-[inset_0_0_0_1px_#fff] md:py-4"
        >
          <WhatsApp className="h-5 w-5 text-whatsapp" /> WhatsApp
        </a>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Root level */}
        <div
          className={cx(
            "absolute inset-0 flex flex-col overflow-y-auto px-4 pb-6 transition-[transform,opacity] duration-[550ms] ease-fuse-out md:px-9",
            nested ? "-translate-x-[30%] opacity-0" : "translate-x-0",
          )}
        >
          <ul className="flex flex-col gap-1 pt-1">
            {MAIN_NAV.map((it, i) => (
              <li key={it.href} className="animate-rise-in" style={{ animationDelay: `${120 + i * 60}ms` }}>
                {it.mega ? (
                  <button
                    type="button"
                    onClick={() => setNested(true)}
                    className="group/l flex w-full items-center justify-between py-1 text-start text-[26px] font-bold leading-[1.3] text-heading md:text-[32px]"
                  >
                    <span className="transition-transform duration-400 group-hover/l:translate-x-2">{it.title}</span>
                    <ChevronRight className="h-6 w-6" />
                  </button>
                ) : (
                  <Link
                    href={it.href}
                    onClick={closePanel}
                    className="group/l block py-1 text-[26px] font-bold leading-[1.3] text-heading md:text-[32px]"
                  >
                    <span className="inline-block transition-transform duration-400 group-hover/l:translate-x-2">{it.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-col gap-3 text-[16px]">
            {[...UTILITY_LINKS, { title: "Privacy Policy", href: "/privacy" }, { title: "Terms & Conditions", href: "/terms" }].map((l, i) => (
              <li key={l.href} className="animate-rise-in" style={{ animationDelay: `${300 + i * 50}ms` }}>
                <Link href={l.href} onClick={closePanel} className="link-hover">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>

          <TrendingCategories onNavigate={closePanel} />
        </div>

        {/* Nested level: Watches */}
        <div
          className={cx(
            "absolute inset-0 overflow-y-auto px-4 pb-6 transition-[transform,opacity] duration-[550ms] ease-fuse-out md:px-9",
            nested ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0",
          )}
        >
          <button type="button" onClick={() => setNested(false)} className="mb-4 flex items-center gap-3 py-2 text-[16px] font-semibold text-muted">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <Link href="/watches" onClick={closePanel} className="mb-4 block text-[32px] font-bold text-heading">
            Watches
          </Link>
          <ul className="flex flex-col gap-2">
            {SHOP_LINKS.map((c, i) => (
              <li key={c.href} className="animate-rise-in" style={{ animationDelay: `${i * 50}ms` }}>
                <Link href={c.href} onClick={closePanel} className="flex items-center justify-between rounded-fuse bg-white px-5 py-4 text-[18px] font-semibold transition-colors hover:bg-btn">
                  {c.title}
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </li>
            ))}
          </ul>
          {categories.length > 0 && (
            <>
              <p className="mb-3 mt-8 text-[14px] font-semibold uppercase tracking-wide text-muted">Categories</p>
              <ul className="grid grid-cols-2 gap-2">
                {categories.map((c, i) => (
                  <li key={c.slug} className="animate-rise-in" style={{ animationDelay: `${200 + i * 40}ms` }}>
                    <Link href={watchesFilterHref(c.slug)} onClick={closePanel} className="group/c block rounded-fuse bg-white p-2">
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-fuse-md bg-placeholder">
                        {c.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={catalogThumbUrl(c.image, 320)} alt="" loading="lazy" className="img-fill transition-transform duration-700 group-hover/c:scale-110" />
                        )}
                      </span>
                      <span className="block px-2 pb-1 pt-3 font-semibold capitalize">{c.label.toLowerCase()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}
