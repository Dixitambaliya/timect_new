"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** One-shot IntersectionObserver used by the Fuse entrance-animation system. */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  once = true,
}: { threshold?: number; rootMargin?: string; once?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, inView] as const;
}

export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, []);
  return y;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/** Locks page scroll while an overlay is open, compensating for scrollbar width. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, pr: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.pr;
    };
  }, [locked]);
}

export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [active, onEscape]);
}

/** Keeps an element mounted during its exit transition. */
export function usePresence(open: boolean, duration = 450) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      let r2 = 0;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
      };
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(t);
  }, [open, duration]);
  return { mounted, visible };
}

export type Carousel = {
  ref: RefObject<HTMLUListElement | null>;
  atStart: boolean;
  atEnd: boolean;
  progress: number;
  index: number;
  prev: () => void;
  next: () => void;
  scrollTo: (i: number) => void;
};

/** Horizontal scroll-snap carousel controller (prev/next + progress + index). */
export function useCarousel({ loop = false }: { loop?: boolean } = {}): Carousel {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ atStart: true, atEnd: false, progress: 0, index: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = Math.abs(el.scrollLeft);
    const first = el.children[0] as HTMLElement | undefined;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const step = first ? first.getBoundingClientRect().width + gap : 1;
    setState({
      atStart: left <= 2,
      atEnd: left >= max - 2,
      progress: max > 0 ? left / max : 1,
      index: Math.round(left / (step || 1)),
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
      mo.disconnect();
    };
  }, [measure]);

  const scrollBy = useCallback(
    (dir: number) => {
      const el = ref.current;
      if (!el) return;
      const first = el.children[0] as HTMLElement | undefined;
      const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
      const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth;
      const perView = Math.max(1, Math.floor((el.clientWidth + gap) / step));
      const max = el.scrollWidth - el.clientWidth;
      if (loop && dir > 0 && el.scrollLeft >= max - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      if (loop && dir < 0 && el.scrollLeft <= 2) {
        el.scrollTo({ left: max, behavior: "smooth" });
        return;
      }
      el.scrollBy({ left: dir * step * perView, behavior: "smooth" });
    },
    [loop],
  );

  const scrollTo = useCallback((i: number) => {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    const first = el?.children[0] as HTMLElement | undefined;
    if (el && child && first) {
      el.scrollTo({ left: child.offsetLeft - first.offsetLeft, behavior: "smooth" });
    }
  }, []);

  return { ref, ...state, prev: () => scrollBy(-1), next: () => scrollBy(1), scrollTo };
}

/** Drag-to-scroll for mouse users on horizontal tracks. */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}
