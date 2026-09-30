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
import { EASE } from "@/lib/motion";
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
  half: number;
  pos: number;
  speed: number; // px per second (signed)
  baseSpeed: number;
  reverse: boolean;
};

/**
 * Timect “Orbital Time Field” — unique gift gallery:
 * - 3 infinite rows with independent base speeds
 * - Cursor gravity (field leans toward pointer)
 * - Soft focus spotlight that enlarges nearby pieces
 * - Drag-to-scrub then smooth auto-resume
 * - Scroll-velocity inertia on the marquee
 * - Subtle watch-hand tick micro-motion
 * Not a clone of other brand gift finders.
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
  const draggingRef = useRef(false);
  const dragLastXRef = useRef(0);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false });
  /** Extra horizontal velocity from wheel (px/s). + = content moves left. */
  const wheelVelRef = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [dragging, setDragging] = useState(false);
  // note: no full-field pause — only soft-slow on product hover

  const rows = useMemo(() => {
    if (!products.length) return [[], [], []] as GiftProduct[][];
    const pad = (list: GiftProduct[], min = 10) => {
      if (!list.length) return list;
      const out = [...list];
      let i = 0;
      while (out.length < min) {
        out.push(list[i % list.length]);
        i++;
      }
      return out;
    };
    const a = pad([...products]);
    const b = pad([...products].reverse());
    const mid = Math.floor(products.length / 3);
    const c = pad([
      ...products.slice(mid),
      ...products.slice(0, mid),
    ]);
    return [a, b, c];
  }, [products]);

  const measureRuntimes = useCallback(() => {
    const next: RowRuntime[] = [];
    rowRefs.current.forEach((track, rowIndex) => {
      if (!track) return;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      const reverse = rowIndex % 2 === 1;
      // px/sec — slow, unique per row
      const loopSec = baseDuration + rowIndex * 24;
      const baseSpeed = (half / loopSec) * (reverse ? 1 : -1);
      const prev = runtimesRef.current[rowIndex];
      next.push({
        track,
        half,
        pos: prev?.pos ?? (reverse ? -half * 0.25 : 0),
        speed: baseSpeed,
        baseSpeed,
        reverse,
      });
      gsap.set(track, { x: prev?.pos ?? 0, force3D: true });
    });
    runtimesRef.current = next;
  }, [baseDuration]);

  // rAF driver — auto flow + smooth slow wheel velocity
  useEffect(() => {
    if (reduced) return;

    const wrapPos = (rt: RowRuntime) => {
      const h = rt.half;
      if (h <= 0) return;
      while (rt.pos <= -h) rt.pos += h;
      while (rt.pos > 0) rt.pos -= h;
    };

    const tick = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      lastTsRef.current = ts;

      // Smooth, slow coast after wheel — frame-rate independent friction
      // Higher power = longer, softer glide
      wheelVelRef.current *= Math.pow(0.955, dt * 60);
      if (Math.abs(wheelVelRef.current) < 0.4) wheelVelRef.current = 0;

      const productHover =
        rootRef.current?.dataset.productHover === "1" && !draggingRef.current;
      const fieldPaused = pausedRef.current;
      const wheelVel = wheelVelRef.current;
      const isScrolling = Math.abs(wheelVel) > 1;

      runtimesRef.current.forEach((rt) => {
        if (fieldPaused) {
          rt.speed += (0 - rt.speed) * 0.12;
        } else if (draggingRef.current) {
          // Pointer drag owns position this frame; keep fling energy as set on move
        } else if (isScrolling) {
          // Per-row flow:
          //  scroll UP   → continue that row’s natural direction
          //  scroll DOWN → reverse that row’s direction
          // All rows receive the wheel; each uses its own baseSpeed sign.
          const flow = Math.sign(rt.baseSpeed) || -1;
          // wheelVel > 0 (down) → opposite flow; wheelVel < 0 (up) → with flow
          const scrollPart = -flow * wheelVel;
          const target = scrollPart + rt.baseSpeed * 0.12;
          rt.speed += (target - rt.speed) * 0.085; // soft ease-in
        } else if (productHover) {
          const target = rt.baseSpeed * 0.08;
          rt.speed += (target - rt.speed) * 0.055;
        } else {
          // Resume gentle auto-flow
          rt.speed += (rt.baseSpeed - rt.speed) * 0.04;
        }

        if (!draggingRef.current && !fieldPaused) {
          rt.pos += rt.speed * dt;
        }

        wrapPos(rt);
        gsap.set(rt.track, { x: rt.pos, force3D: true });
      });

      // Cursor gravity — field tilt + spotlight
      const root = rootRef.current;
      const spot = spotlightRef.current;
      const p = pointerRef.current;
      if (root && p.active) {
        const gx = (p.x - 0.5) * 18;
        const gy = (p.y - 0.5) * 12;
        gsap.to(root.querySelector(".floating-gift-field__rows"), {
          x: gx,
          y: gy,
          duration: 0.9,
          ease: "power3.out",
          overwrite: "auto",
        });
        root.querySelectorAll<HTMLElement>(".floating-row").forEach((row, i) => {
          const depth = (i - 1) * 6;
          gsap.to(row, {
            y: gy * (0.35 + i * 0.15) + depth * (p.y - 0.5),
            duration: 1,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
      }
      if (spot && p.active) {
        gsap.to(spot, {
          left: `${p.x * 100}%`,
          top: `${p.y * 100}%`,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // Focus scale on products near pointer
      if (root && p.active && !draggingRef.current) {
        const rect = root.getBoundingClientRect();
        const px = rect.left + p.x * rect.width;
        const py = rect.top + p.y * rect.height;
        root.querySelectorAll<HTMLElement>(".float-product").forEach((el) => {
          if (el.dataset.hover === "1") return;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dist = Math.hypot(cx - px, cy - py);
          const influence = Math.max(0, 1 - dist / 240);
          if (influence > 0.04) {
            gsap.to(el, {
              scale: 1 + influence * 0.12,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          } else if (el.dataset.focus === "1") {
            el.dataset.focus = "0";
            gsap.to(el, {
              scale: 1,
              duration: 0.45,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
          if (influence > 0.04) el.dataset.focus = "1";
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const boot = requestAnimationFrame(() => {
      measureRuntimes();
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
      window.setTimeout(measureRuntimes, 400);
      window.setTimeout(measureRuntimes, 1000);
    });

    const onResize = () => measureRuntimes();
    window.addEventListener("resize", onResize);

    /**
     * Smooth slow wheel control (up & down).
     * Velocity only — each row maps this through its own flow direction in tick.
     * All rows scroll together; reverse rows reverse correctly.
     */
    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      let delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (!delta) return;
      e.preventDefault();

      // Normalize line / page deltas to pixel-ish units
      if (e.deltaMode === 1) delta *= 14; // lines
      if (e.deltaMode === 2) delta *= 400; // pages

      // Low sensitivity → slow motion; clamp so one flick stays gentle
      const impulse = gsap.utils.clamp(-48, 48, delta * 0.28);
      wheelVelRef.current = gsap.utils.clamp(
        -160,
        160,
        wheelVelRef.current + impulse
      );
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(boot);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
    };
  }, [reduced, measureRuntimes, products.length]);

  useEffect(() => {
    measureRuntimes();
  }, [products, measureRuntimes]);

  // Staggered luxury entrance animation whenever products change (e.g. colour swatch clicked)
  useGSAP(
    () => {
      if (reduced || !rootRef.current) return;
      const items = rootRef.current.querySelectorAll<HTMLElement>(".float-product");
      if (!items.length) return;

      // Animate products flying in with organic randomized offsets into their aligned floating positions
      gsap.fromTo(
        items,
        {
          opacity: 0,
          scale: () => gsap.utils.random(0.35, 0.65),
          y: () => gsap.utils.random(40, 110) * (Math.random() > 0.5 ? 1 : -1),
          x: () => gsap.utils.random(-50, 50),
          rotation: () => gsap.utils.random(-15, 15),
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          x: 0,
          rotation: 0,
          duration: 0.95,
          ease: "back.out(1.4)",
          stagger: {
            amount: 0.45,
            from: "random",
          },
          overwrite: "auto",
        }
      );
    },
    { dependencies: [products, reduced], scope: rootRef }
  );

  // Reduced-motion: still allow slow bidirectional wheel scrub via rAF ease
  useEffect(() => {
    if (!reduced) return;

    measureRuntimes();
    let raf = 0;
    let last = 0;

    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - (last || ts)) / 1000);
      last = ts;
      wheelVelRef.current *= Math.pow(0.955, dt * 60);
      if (Math.abs(wheelVelRef.current) < 0.4) wheelVelRef.current = 0;

      const wheelVel = wheelVelRef.current;
      if (!pausedRef.current && Math.abs(wheelVel) > 0.4) {
        runtimesRef.current.forEach((rt) => {
          const flow = Math.sign(rt.baseSpeed) || -1;
          // up = with flow, down = reverse flow (same as main loop)
          rt.pos += -flow * wheelVel * dt;
          const h = rt.half;
          if (h > 0) {
            while (rt.pos <= -h) rt.pos += h;
            while (rt.pos > 0) rt.pos -= h;
          }
          gsap.set(rt.track, { x: rt.pos, force3D: true });
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      let delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (!delta) return;
      e.preventDefault();
      if (e.deltaMode === 1) delta *= 14;
      if (e.deltaMode === 2) delta *= 400;
      const impulse = gsap.utils.clamp(-48, 48, delta * 0.28);
      wheelVelRef.current = gsap.utils.clamp(
        -160,
        160,
        wheelVelRef.current + impulse
      );
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
    };
  }, [reduced, measureRuntimes]);

  const onPointerMove = (e: ReactPointerEvent) => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    pointerRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      active: true,
    };

    if (draggingRef.current) {
      const dx = e.clientX - dragLastXRef.current;
      dragLastXRef.current = e.clientX;
      runtimesRef.current.forEach((rt) => {
        rt.pos += dx;
        rt.speed = dx * 18; // fling energy
      });
    }
  };

  const onPointerLeave = () => {
    pointerRef.current.active = false;
    const spot = spotlightRef.current;
    if (spot) {
      gsap.to(spot, { opacity: 0, duration: 0.5, overwrite: "auto" });
    }
    const rowsEl = rootRef.current?.querySelector(".floating-gift-field__rows");
    if (rowsEl) {
      gsap.to(rowsEl, { x: 0, y: 0, duration: 1.1, ease: EASE.out, overwrite: "auto" });
    }
    rootRef.current?.querySelectorAll<HTMLElement>(".floating-row").forEach((row) => {
      gsap.to(row, { y: 0, duration: 1.1, ease: EASE.out, overwrite: "auto" });
    });
    // Reset product scales
    rootRef.current?.querySelectorAll<HTMLElement>(".float-product").forEach((el) => {
      if (!el.matches(":hover")) {
        gsap.to(el, { scale: 1, y: 0, duration: 0.5, ease: EASE.out, overwrite: "auto" });
      }
    });
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    // Only drag on empty field — allow product buttons to receive clicks
    const t = e.target as HTMLElement;
    if (t.closest("button.float-product, a.float-product")) return;
    if (pausedRef.current) return;
    draggingRef.current = true;
    setDragging(true);
    dragLastXRef.current = e.clientX;
    rootRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    try {
      rootRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

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
              <div className="floating-row__half">
                {row.map((p, i) => (
                  <FloatProduct
                    key={`r${rowIndex}-a-${p.id}-${i}`}
                    product={p}
                    index={i + rowIndex * 3}
                    size={sizeFor(i, rowIndex)}
                    reduced={reduced}
                    onSelect={onProductSelect}
                  />
                ))}
              </div>
              {!reduced && (
                <div className="floating-row__half" aria-hidden="true">
                  {row.map((p, i) => (
                    <FloatProduct
                      key={`r${rowIndex}-b-${p.id}-${i}`}
                      product={p}
                      index={i + rowIndex * 3}
                      size={sizeFor(i, rowIndex)}
                      reduced={reduced}
                      onSelect={onProductSelect}
                    />
                  ))}
                </div>
              )}
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
  onSelect,
}: {
  product: GiftProduct;
  index: number;
  size: "sm" | "md" | "lg";
  reduced: boolean;
  onSelect?: (product: GiftProduct) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const label = product.name || product.title || "Timect watch";

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const img = ref.current.querySelector(".float-product__img");
      // Idle breath (kept small so products stay fully in frame)
      gsap.to(ref.current, {
        y: index % 2 === 0 ? -4 : 4,
        duration: 5 + (index % 5) * 0.55,
        ease: EASE.soft,
        yoyo: true,
        repeat: -1,
      });
      // Unique “watch tick” micro rotate on image only
      if (img) {
        gsap.to(img, {
          rotation: index % 2 === 0 ? 1.4 : -1.4,
          duration: 3.2 + (index % 3) * 0.4,
          ease: EASE.soft,
          yoyo: true,
          repeat: -1,
        });
      }
    },
    { dependencies: [index, reduced] }
  );

  const onEnter = () => {
    if (reduced || !ref.current) return;
    ref.current.dataset.hover = "1";
    // Soft-pause field while inspecting a piece
    const field = ref.current.closest(".floating-gift-field") as HTMLElement | null;
    if (field) field.dataset.productHover = "1";
    gsap.to(ref.current, {
      scale: 1.1,
      y: -8,
      duration: 0.5,
      ease: EASE.out,
      overwrite: "auto",
    });
    gsap.to(ref.current.querySelector(".float-product__label"), {
      autoAlpha: 1,
      y: 0,
      duration: 0.35,
      ease: EASE.out,
      overwrite: "auto",
    });
    gsap.to(ref.current.querySelector(".float-product__halo"), {
      autoAlpha: 1,
      scale: 1,
      duration: 0.45,
      ease: EASE.out,
      overwrite: "auto",
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.dataset.hover = "0";
    const field = ref.current.closest(".floating-gift-field") as HTMLElement | null;
    if (field) field.dataset.productHover = "0";
    gsap.to(ref.current, {
      scale: 1,
      y: 0,
      duration: 0.55,
      ease: EASE.out,
      overwrite: "auto",
    });
    gsap.to(ref.current.querySelector(".float-product__label"), {
      autoAlpha: 0,
      y: 8,
      duration: 0.28,
      overwrite: "auto",
    });
    gsap.to(ref.current.querySelector(".float-product__halo"), {
      autoAlpha: 0,
      scale: 0.85,
      duration: 0.4,
      overwrite: "auto",
    });
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`float-product float-product--${size} cursor-pointer`}
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
            loading="lazy"
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
