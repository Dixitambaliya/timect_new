import { flushSync } from "react-dom";
import { saveScrollForCurrent } from "@/lib/scroll-memory";

type Listener = () => void;

const listeners = new Set<Listener>();
let pendingPath: string | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

/** Routes that use the storefront Timect overlay (home has its own GSAP preloader). */
export function shouldCoverPath(pathname: string | null) {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname === "/") return false;
  return true;
}

export function pathFromHref(href: string) {
  const withoutHash = href.split("#")[0] || "/";
  const path = withoutHash.split("?")[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Paint the route overlay on the current page before Next.js swaps the tree.
 * No-ops for same-path query updates, home, and admin.
 */
export function startRouteCover(href: string) {
  saveScrollForCurrent();
  const path = pathFromHref(href);
  if (!shouldCoverPath(path)) return;
  if (typeof window !== "undefined" && window.location.pathname === path) {
    return;
  }
  if (pendingPath === path) return;

  const apply = () => {
    pendingPath = path;
    emit();
  };

  if (typeof document !== "undefined") {
    flushSync(apply);
  } else {
    apply();
  }
}

export function clearRouteCover() {
  if (pendingPath == null) return;
  pendingPath = null;
  emit();
}

export function subscribeRouteCover(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPendingRouteCover() {
  return pendingPath;
}
