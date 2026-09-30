"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { PAGE_READY_EVENT } from "@/lib/page-ready";
import {
  clearRouteCover,
  getPendingRouteCover,
  shouldCoverPath,
  startRouteCover,
  subscribeRouteCover,
} from "@/lib/route-cover";

/**
 * Timect logo overlay — covers the outgoing page on click, then the incoming
 * route, so client navigations never flash a scroll-jump or empty catalog.
 * Does NOT use useSearchParams (that suspends and lets content flash first).
 */
export default function RoutePreloader() {
  const pathname = usePathname();
  const pendingPath = useSyncExternalStore(
    subscribeRouteCover,
    getPendingRouteCover,
    () => null,
  );

  const covering =
    shouldCoverPath(pathname) || shouldCoverPath(pendingPath);
  const sessionKey = pendingPath ?? (shouldCoverPath(pathname) ? pathname : "");

  const [exiting, setExiting] = useState(false);
  const [hiddenSession, setHiddenSession] = useState<string | null>(null);

  // Visible on the same render as startRouteCover() — no useEffect flash.
  const visible =
    Boolean(sessionKey) &&
    covering &&
    (exiting || hiddenSession !== sessionKey);

  // Intercept in-app clicks so the overlay covers the CURRENT view
  // (For Him / For Her, Shop by Category, header) before the route swaps.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      if (anchor.origin !== window.location.origin) return;
      startRouteCover(`${anchor.pathname}${anchor.search}`);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!covering) {
      setExiting(false);
      setHiddenSession(null);
      return;
    }

    if (!sessionKey || hiddenSession === sessionKey) return;

    setExiting(false);

    const minMs = 320;
    const maxMs = 4000;
    const started = Date.now();
    let pageReady = false;
    let exitTimer: ReturnType<typeof setTimeout> | null = null;
    let hardTimer: ReturnType<typeof setTimeout> | null = null;
    let minTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const hide = () => {
      if (closed) return;
      closed = true;
      setExiting(true);
      exitTimer = setTimeout(() => {
        setHiddenSession(sessionKey);
        setExiting(false);
        clearRouteCover();
      }, 380);
    };

    const tryHide = () => {
      if (!pageReady) return;
      const elapsed = Date.now() - started;
      if (elapsed >= minMs) hide();
      else minTimer = setTimeout(hide, minMs - elapsed);
    };

    const onReady = () => {
      pageReady = true;
      tryHide();
    };

    window.addEventListener(PAGE_READY_EVENT, onReady);

    hardTimer = setTimeout(() => {
      pageReady = true;
      hide();
    }, maxMs);

    return () => {
      window.removeEventListener(PAGE_READY_EVENT, onReady);
      if (exitTimer) clearTimeout(exitTimer);
      if (hardTimer) clearTimeout(hardTimer);
      if (minTimer) clearTimeout(minTimer);
    };
  }, [sessionKey, covering, hiddenSession]);

  if (!visible) return null;

  return (
    <div
      className={`route-preloader fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--paper)] ${
        exiting ? "route-preloader--exit" : "route-preloader--enter"
      }`}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/timect_logo.png" alt="" className="route-preloader-logo h-10 w-auto mb-8" />
      <div className="route-preloader-track w-40 h-px bg-[var(--line)] overflow-hidden">
        <div className="route-preloader-line h-full bg-[var(--ink)] origin-left" />
      </div>
    </div>
  );
}
