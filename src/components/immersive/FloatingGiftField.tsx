"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { GiftProduct } from "./InfiniteProductScroll";

type FloatingGiftFieldProps = {
  products: GiftProduct[];
  /** Base seconds for one full loop — higher = slower. */
  baseDuration?: number;
  className?: string;
  /** Same-screen product reveal — no route navigation. */
  onProductSelect?: (product: GiftProduct) => void;
  /** Pause orbital motion (e.g. while overlay is open). */
  paused?: boolean;
};

type RowRuntime = {
  track: HTMLDivElement;
  unitWidth: number; // width of one repeating set
  pos: number;
  baseDriftSpeed: number; // px/sec for ambient drifting
  scrollParallax: number; // multiplier for user scroll response
};

/** Ensure each row has at least minCount items so a single unit is wider than 4K screens */
function prepareRowItems(items: GiftProduct[], minCount = 24): GiftProduct[] {
  if (!items.length) return [];
  const res: GiftProduct[] = [];
  while (res.length < minCount) {
    res.push(...items);
  }
  return res;
}

/**
 * Wraps row position seamlessly across 4 identical units.
 * Units span [0, 4*W).
 * We maintain pos in [-W, 0).
 * At this range, unit 0..3 span [-W, 3*W) which completely covers all viewports from mobile to 4K.
 */
function wrapRowPos(pos: number, W: number): number {
  if (!W || W <= 0 || Number.isNaN(pos)) return 0;
  let res = pos % W;
  if (res > 0) res -= W;
  return res;
}

/**
 * Timect “Orbital Time Field” — luxury infinite gift gallery:
 * - 4 seamless repeating units per row: mathematically impossible to see empty spaces
 * - True infinite bidirectional scrolling with natural inertia
 * - Full-surface drag-to-scrub with velocity fling
 * - Mouse wheel & trackpad horizontal/vertical natural scroll response
 * - Hover to focus & soft-slow
 * - Zero forced layout reflows in the animation tick
 */
export default function FloatingGiftField({
  products,
  baseDuration = 125,
  className = "",
  onProductSelect,
  paused = false,
}: FloatingGiftFieldProps) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const runtimesRef = useRef<RowRuntime[]>([]);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  // Scroll velocity (user wheel / trackpad / fling momentum, px/s)
  const scrollVelRef = useRef<number>(0);

  // Drag interaction tracking
  const pointerDownRef = useRef(false);
  const pointerStartPos = useRef({ x: 0, y: 0 });
  const pointerLastX = useRef(0);
  const pointerLastTime = useRef(0);
  const dragVelocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragJustEndedRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  // Cursor position for tilt / spotlight
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Prepare 3 rows with staggered permutation and guaranteed width
  const rows = useMemo(() => {
    if (!products.length) return [[], [], []] as GiftProduct[][];

    const listA = [...products];
    const listB = [...products].reverse();
    const mid = Math.max(1, Math.floor(products.length / 3));
    const listC = [...products.slice(mid), ...products.slice(0, mid)];

    return [
      prepareRowItems(listA, 24),
      prepareRowItems(listB, 24),
      prepareRowItems(listC, 24),
    ];
  }, [products]);

  // Measure row dimensions and initialize positions safely
  const measureRuntimes = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const tracks = Array.from(root.querySelectorAll<HTMLDivElement>(".floating-row__track"));
    if (!tracks.length) return;

    const next: RowRuntime[] = [];
    const parallaxSpeeds = [1.0, 0.88, 1.14];
    // Natural ambient drift speeds (px/s)
    const driftSpeeds = reduced ? [0, 0, 0] : [-30, 24, -36];
    // Organic starting offsets across rows
    const staggers = [0, -0.32, 0.22];

    tracks.forEach((track, rowIndex) => {
      const unitEl = track.querySelector<HTMLElement>(".floating-row__unit");
      const unitWidth =
        unitEl?.getBoundingClientRect().width ||
        unitEl?.offsetWidth ||
        (track.scrollWidth ? track.scrollWidth / 4 : 0);
      if (!unitWidth || unitWidth <= 10) return;

      const prev = runtimesRef.current[rowIndex];
      let pos: number;
      if (prev && prev.unitWidth > 10) {
        // Retain current position progress when re-measuring on resize/update
        pos = wrapRowPos(prev.pos, unitWidth);
      } else {
        // Initial staggered placement
        const offset = staggers[rowIndex % staggers.length] * unitWidth;
        pos = wrapRowPos(-0.5 * unitWidth + offset, unitWidth);
      }

      next.push({
        track,
        unitWidth,
        pos,
        baseDriftSpeed: driftSpeeds[rowIndex % driftSpeeds.length],
        scrollParallax: parallaxSpeeds[rowIndex % parallaxSpeeds.length],
      });

      track.style.transform = `translate3d(${pos}px, 0px, 0px)`;
    });

    if (next.length) {
      runtimesRef.current = next;
    }
  }, [reduced]);

  // Main animation frame loop (smooth 60/120fps, zero DOM reflow queries)
  useEffect(() => {
    let active = true;

    const tick = (ts: number) => {
      if (!active) return;
      const last = lastTsRef.current || ts;
      const dt = Math.min(0.04, (ts - last) / 1000);
      lastTsRef.current = ts;

      // Self-heal runtime measurement if not ready on mount frame
      if (!runtimesRef.current.length) {
        measureRuntimes();
      }

      // Friction: smooth exponential decay on user scroll velocity
      scrollVelRef.current *= Math.pow(0.92, dt * 60);
      if (Math.abs(scrollVelRef.current) < 0.2) scrollVelRef.current = 0;

      const isPaused = pausedRef.current;
      const isDragging = isDraggingRef.current;
      const isHovering = rootRef.current?.dataset.productHover === "1";
      const hoverSlow = isHovering ? 0.3 : 1.0;
      const userScroll = scrollVelRef.current;

      if (!isPaused && !isDragging && runtimesRef.current.length) {
        const root = rootRef.current;
        const liveTracks = root ? Array.from(root.querySelectorAll<HTMLDivElement>(".floating-row__track")) : [];

        runtimesRef.current.forEach((rt, rowIndex) => {
          if (!rt.track.isConnected && liveTracks[rowIndex]) {
            rt.track = liveTracks[rowIndex];
          }

          // Ambient gentle drift
          const drift = rt.baseDriftSpeed * hoverSlow;
          // User scroll: scrolling down (positive) moves content left (negative x)
          const scrollMove = -userScroll * rt.scrollParallax;
          const totalSpeed = drift + scrollMove;

          rt.pos += totalSpeed * dt;
          rt.pos = wrapRowPos(rt.pos, rt.unitWidth);

          rt.track.style.transform = `translate3d(${rt.pos}px, 0px, 0px)`;
        });
      }

      // Cursor gravity tilt on rows container
      const p = pointerRef.current;
      const root = rootRef.current;
      if (root && p.active && !isDragging) {
        const gx = (p.x - 0.5) * 16;
        const gy = (p.y - 0.5) * 10;
        const rowsEl = root.querySelector<HTMLElement>(".floating-gift-field__rows");
        if (rowsEl) {
          gsap.set(rowsEl, { x: gx, y: gy, force3D: true });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const boot = requestAnimationFrame(() => {
      measureRuntimes();
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
      window.setTimeout(measureRuntimes, 100);
      window.setTimeout(measureRuntimes, 400);
    });

    const onResize = () => measureRuntimes();
    window.addEventListener("resize", onResize);

    /**
     * Natural, responsive wheel scroll.
     * Scrolling down moves content left (forward through catalog).
     * Scrolling up moves content right (backward through catalog).
     */
    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      e.preventDefault();

      let delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (!delta) return;

      if (e.deltaMode === 1) delta *= 24; // lines mode
      if (e.deltaMode === 2) delta *= 320; // pages mode

      // Responsive scroll impulse with smooth inertia
      const impulse = delta * 1.5;
      scrollVelRef.current = gsap.utils.clamp(-3500, 3500, scrollVelRef.current + impulse);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      active = false;
      cancelAnimationFrame(boot);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
    };
  }, [measureRuntimes]);

  useEffect(() => {
    measureRuntimes();
  }, [rows, measureRuntimes]);

  // Entrance animation whenever product set updates (e.g. colour filter clicked)
  useGSAP(
    () => {
      if (!rootRef.current) return;
      const items = rootRef.current.querySelectorAll<HTMLElement>(".float-product");
      if (!items.length) return;

      gsap.set(items, { autoAlpha: 1, opacity: 1, visibility: "visible" });
    },
    { dependencies: [products, reduced], scope: rootRef }
  );

  // Drag interaction across entire field
  const onPointerDown = (e: ReactPointerEvent) => {
    if (pausedRef.current || e.button !== 0) return;
    pointerDownRef.current = true;
    isDraggingRef.current = false;
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    pointerLastX.current = e.clientX;
    pointerLastTime.current = performance.now();
    dragVelocityRef.current = 0;

    try {
      rootRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    pointerRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      active: true,
    };

    // Update soft spotlight
    const spot = spotlightRef.current;
    if (spot) {
      gsap.set(spot, {
        left: `${pointerRef.current.x * 100}%`,
        top: `${pointerRef.current.y * 100}%`,
        opacity: 1,
      });
    }

    if (pointerDownRef.current) {
      const dist = Math.hypot(
        e.clientX - pointerStartPos.current.x,
        e.clientY - pointerStartPos.current.y
      );

      if (dist > 5 && !isDraggingRef.current) {
        isDraggingRef.current = true;
        setDragging(true);
      }

      if (isDraggingRef.current) {
        const dx = e.clientX - pointerLastX.current;
        const now = performance.now();
        const dt = Math.max(1, now - pointerLastTime.current);
        dragVelocityRef.current = (dx / dt) * 1000;
        pointerLastX.current = e.clientX;
        pointerLastTime.current = now;

        // 1:1 direct tracking
        runtimesRef.current.forEach((rt) => {
          rt.pos += dx * rt.scrollParallax;
          rt.pos = wrapRowPos(rt.pos, rt.unitWidth);
          rt.track.style.transform = `translate3d(${rt.pos}px, 0px, 0px)`;
        });
      }
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (pointerDownRef.current) {
      pointerDownRef.current = false;
      try {
        rootRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setDragging(false);

        // Momentum fling on release
        const fling = -gsap.utils.clamp(-2500, 2500, dragVelocityRef.current * 0.8);
        scrollVelRef.current = fling;

        dragJustEndedRef.current = true;
        window.setTimeout(() => {
          dragJustEndedRef.current = false;
        }, 120);
      }
    }
  };

  const onPointerLeave = () => {
    pointerRef.current.active = false;
    const spot = spotlightRef.current;
    if (spot) {
      gsap.to(spot, { opacity: 0, duration: 0.4, overwrite: "auto" });
    }
    const rowsEl = rootRef.current?.querySelector<HTMLElement>(".floating-gift-field__rows");
    if (rowsEl) {
      gsap.to(rowsEl, { x: 0, y: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    }
  };

  const handleProductSelect = useCallback(
    (product: GiftProduct) => {
      if (dragJustEndedRef.current || isDraggingRef.current) return;
      onProductSelect?.(product);
    },
    [onProductSelect]
  );

  const onProductEnter = useCallback(() => {
    if (rootRef.current) rootRef.current.dataset.productHover = "1";
  }, []);

  const onProductLeave = useCallback(() => {
    if (rootRef.current) rootRef.current.dataset.productHover = "0";
  }, []);

  if (!products.length) {
    return (
      <div className={`floating-gift-field ${className}`}>
        <p className="floating-gift-field__empty">Products loading…</p>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`floating-gift-field floating-gift-field--orbital ${className}${
        dragging ? " is-dragging" : ""
      }${reduced ? " is-reduced" : ""}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Timect orbital gift field"
    >
      {/* Soft ambient constellation */}
      <div className="orbital-ambient" aria-hidden="true">
        <div className="orbital-ring orbital-ring--a" />
        <div className="orbital-ring orbital-ring--b" />
        <div className="orbital-dust" />
      </div>

      {/* Cursor focus spotlight */}
      <div ref={spotlightRef} className="orbital-spotlight" aria-hidden="true" />

      <div className="floating-gift-field__rows">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`floating-row floating-row--${rowIndex}`}>
            <div
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              className={`floating-row__track${reduced ? " is-static" : ""}`}
            >
              {[0, 1, 2, 3].map((uIndex) => (
                <div
                  key={`u-${rowIndex}-${uIndex}`}
                  className="floating-row__unit"
                  aria-hidden={uIndex !== 1 && uIndex !== 2 ? true : undefined}
                >
                  {row.map((p, i) => (
                    <FloatProduct
                      key={`r${rowIndex}-u${uIndex}-${p.id}-${i}`}
                      product={p}
                      index={i + rowIndex * 3}
                      size={sizeFor(i, rowIndex)}
                      reduced={reduced}
                      keyboardFocus={uIndex === 1}
                      onSelect={handleProductSelect}
                      onEnter={onProductEnter}
                      onLeave={onProductLeave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="orbital-hint tracked-sm" aria-hidden="true">
        Scroll or drag to explore · Hover to focus
      </p>
    </div>
  );
}

function sizeFor(i: number, row: number): "sm" | "md" | "lg" {
  const n = (i + row * 2) % 5;
  if (n === 0) return "lg";
  if (n === 2 || n === 4) return "sm";
  return "md";
}

function FloatProduct({
  product,
  index,
  size,
  reduced,
  keyboardFocus = true,
  onSelect,
  onEnter,
  onLeave,
}: {
  product: GiftProduct;
  index: number;
  size: "sm" | "md" | "lg";
  reduced: boolean;
  keyboardFocus?: boolean;
  onSelect?: (product: GiftProduct) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  const label = product.name || product.title || "Timect watch";

  return (
    <button
      type="button"
      className={`float-product float-product--${size} cursor-pointer${
        reduced ? "" : " float-product--live"
      }`}
      tabIndex={keyboardFocus ? 0 : -1}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => onSelect?.(product)}
      draggable={false}
      aria-label={`${label} — ${product.price}`}
    >
      <span className="float-product__halo" aria-hidden="true" />
      <div className="float-product__img-wrap">
        {product.image ? (
          <Image
            src={product.image}
            alt={label}
            width={320}
            height={320}
            className="float-product__img"
            sizes="(max-width: 768px) 28vw, 160px"
            loading={keyboardFocus ? "eager" : "lazy"}
            draggable={false}
          />
        ) : null}
      </div>
      <span className="float-product__label">
        <em>{label}</em>
        <span>{product.price}</span>
      </span>
    </button>
  );
}
