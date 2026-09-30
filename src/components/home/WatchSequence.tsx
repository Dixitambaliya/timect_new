"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cld } from "@/lib/cloudinary";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easeInOut, lerp, range, useScrollProgress } from "@/hooks/useScrollProgress";

/** Camera keyframe: image point (fx, fy) is placed at screen point (sx, sy) at `zoom`. */
export type CameraKey = { at: number; fx: number; fy: number; sx: number; sy: number; zoom: number };

export type SequenceChapter = {
  from: number;
  to: number;
  index: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  /** Desktop text placement; mobile always sits low. */
  align: "left" | "right" | "center";
};

type Props = {
  /** Single high-resolution still — the camera travels across it. */
  src: string;
  /** Intrinsic size of `src`. */
  width: number;
  height: number;
  /**
   * Optional image-sequence frames (e.g. a 24–36 frame turntable). When provided,
   * scroll scrubs through frames while the camera path still applies.
   */
  frames?: string[];
  alt: string;
  desktopPath: CameraKey[];
  mobilePath: CameraKey[];
  chapters: SequenceChapter[];
  /** Opening scene content (hero typography), fades as the camera moves in. */
  intro: ReactNode;
  id?: string;
};

const BG = "#000";
const MAX_DPR = 2;
const COMPACT_SHIFT = 0.06;
const COMPACT_ZOOM = 0.9;

function sampleCamera(path: CameraKey[], p: number) {
  if (p <= path[0].at) return path[0];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (p <= b.at) {
      const t = easeInOut((p - a.at) / (b.at - a.at));
      return {
        at: p,
        fx: lerp(a.fx, b.fx, t),
        fy: lerp(a.fy, b.fy, t),
        sx: lerp(a.sx, b.sx, t),
        sy: lerp(a.sy, b.sy, t),
        zoom: lerp(a.zoom, b.zoom, t),
      };
    }
  }
  return path[path.length - 1];
}

/** Bake a copy of the image with feathered edges so it dissolves into the black stage. */
function featherImage(img: CanvasImageSource, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.globalCompositeOperation = "destination-in";
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)");
  gx.addColorStop(0.16, "rgba(0,0,0,1)");
  gx.addColorStop(0.84, "rgba(0,0,0,1)");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(0.1, "rgba(0,0,0,1)");
  gy.addColorStop(0.82, "rgba(0,0,0,1)");
  gy.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);
  return c;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()).then(() => resolve(img));
    img.onerror = reject;
    img.src = url;
  });
}

export default function WatchSequence({
  src,
  width: iw,
  height: ih,
  frames,
  alt,
  desktopPath,
  mobilePath,
  chapters,
  intro,
  id,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef(0);
  const sourcesRef = useRef<(HTMLCanvasElement | null)[]>([]);
  const frameRef = useRef(0);
  const [ready, setReady] = useState(false);

  const draw = useCallback(() => {
    frameRef.current = 0;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vw = stage.clientWidth;
    const vh = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
    }

    const p = progressRef.current;
    const portrait = vw / vh <= 1;
    const cam = sampleCamera(portrait ? mobilePath : desktopPath, p);

    // Compact landscape (small laptops, tablets): pull back and move the watch
    // outward so chapter copy never sits on the dial. Mirrored in CSS for the poster.
    const compact = !portrait && vw < 1200;
    const sx = compact ? cam.sx + (cam.sx > 0.52 ? COMPACT_SHIFT : cam.sx < 0.48 ? -COMPACT_SHIFT : 0) : cam.sx;
    const base = Math.min(vw / iw, vh / ih);
    const scale = base * cam.zoom * (compact ? COMPACT_ZOOM : 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = sx * vw - cam.fx * dw;
    const dy = cam.sy * vh - cam.fy * dh;

    // Pick the frame (sequence) or the single still.
    const sources = sourcesRef.current;
    let source: HTMLCanvasElement | null = null;
    if (sources.length > 1) {
      const target = Math.round(p * (sources.length - 1));
      for (let d = 0; d < sources.length && !source; d++) {
        source = sources[target - d] ?? sources[target + d] ?? null;
      }
    } else {
      source = sources[0] ?? null;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, vw, vh);
    if (source) {
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, dx, dy, dw, dh);
    }

    // Lighting: a soft key light that tracks the camera, stronger in close-ups.
    const closeness = range(cam.zoom, 1.3, 2.4);
    stage.style.setProperty("--light-x", `${(cam.sx * 100).toFixed(2)}%`);
    stage.style.setProperty("--light-y", `${(cam.sy * 100).toFixed(2)}%`);
    stage.style.setProperty("--light-o", (0.18 + closeness * 0.22).toFixed(3));
    stage.style.setProperty("--vignette-o", (0.55 + closeness * 0.35).toFixed(3));

    // Typography choreography.
    const introOut = range(p, 0.015, 0.11);
    if (introRef.current) {
      introRef.current.style.opacity = String(1 - introOut);
      introRef.current.style.transform = `translate3d(0, ${(-48 * introOut).toFixed(1)}px, 0)`;
      introRef.current.style.visibility = introOut >= 1 ? "hidden" : "visible";
    }
    chapters.forEach((ch, i) => {
      const el = chapterRefs.current[i];
      if (!el) return;
      const span = ch.to - ch.from;
      const tin = range(p, ch.from, ch.from + span * 0.28);
      const tout = ch.to >= 1 ? 0 : range(p, ch.to - span * 0.24, ch.to);
      const o = Math.min(tin, 1 - tout);
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - tin) * 28 - tout * 28).toFixed(1)}px, 0)`;
      el.style.visibility = o <= 0.001 ? "hidden" : "visible";
      el.style.filter = o < 1 ? `blur(${((1 - o) * 6).toFixed(2)}px)` : "none";
    });
    if (railRef.current) railRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
  }, [chapters, desktopPath, mobilePath, iw, ih]);

  const schedule = useCallback(() => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const onProgress = useCallback(
    (p: number) => {
      progressRef.current = p;
      schedule();
    },
    [schedule],
  );
  useScrollProgress(sectionRef, onProgress, "pin");

  // Progressive loading: a light version first, then full resolution.
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const portrait = window.innerWidth / window.innerHeight <= 1;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const fullW = Math.min(
      iw,
      Math.round((portrait ? window.innerWidth * 2.2 : window.innerHeight * (iw / ih) * 2.4) * dpr),
    );

    const bake = (img: HTMLImageElement) => featherImage(img, img.naturalWidth, img.naturalHeight);

    const takeOver = () => {
      draw();
      setReady(true);
    };

    if (frames && frames.length > 1) {
      // Sequence: first frame → every 4th (coarse scrub) → the rest. Sized to the device.
      const sized = frames.map((f) => cld(f, { w: fullW }));
      sourcesRef.current = new Array(frames.length).fill(null);
      const order = [
        0,
        ...sized.map((_, i) => i).filter((i) => i % 4 === 0 && i),
        ...sized.map((_, i) => i).filter((i) => i % 4),
      ];
      let first = true;
      (async () => {
        for (const i of order) {
          if (cancelled) return;
          try {
            const img = await loadImage(sized[i]);
            if (cancelled) return;
            sourcesRef.current[i] = bake(img);
            if (first) {
              first = false;
              takeOver();
            } else schedule();
          } catch {
            /* skip missing frame — nearest loaded frame is drawn */
          }
        }
      })();
    } else {
      const poster = posterRef.current;
      const low = poster?.currentSrc || cld(src, { w: 900 });
      loadImage(low)
        .then((img) => {
          if (cancelled) return;
          sourcesRef.current = [bake(img)];
          takeOver();
          return loadImage(cld(src, { w: fullW }));
        })
        .then((img) => {
          if (cancelled || !img) return;
          sourcesRef.current = [bake(img)];
          schedule();
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
      sourcesRef.current = [];
    };
  }, [src, frames, iw, ih, reduced, draw, schedule]);

  useEffect(() => {
    if (reduced) return;
    const ro = new ResizeObserver(schedule);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [reduced, schedule]);

  const k0d = desktopPath[0];
  const k0m = mobilePath[0];

  // Reduced motion: one composed frame, chapters as calm editorial text.
  if (reduced) {
    return (
      <section id={id} data-header-theme="dark" className="relative bg-black text-[var(--ivory)]">
        <div className="relative h-[100svh] min-h-[560px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cld(src, { w: 1400 })}
            alt={alt}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-auto max-w-none md:right-[8%] opacity-90"
            style={{ maskImage: "radial-gradient(closest-side, #000 70%, transparent)" }}
          />
          <div className="relative h-full">{intro}</div>
        </div>
        <div className="lux-container grid md:grid-cols-3 gap-12 py-24 border-t border-[var(--line-dark)]">
          {chapters.slice(0, 3).map((ch) => (
            <div key={ch.index}>
              <p className="eyebrow text-[var(--champagne)]">
                {ch.index} — {ch.eyebrow}
              </p>
              <h3 className="display display-sm mt-5">{ch.title}</h3>
              <p className="lede mt-4 text-[var(--muted-dark)]">{ch.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      data-header-theme="dark"
      aria-label="The Timect reveal"
      className="relative h-[380svh] md:h-[440svh] bg-black text-[var(--ivory)]"
    >
      <div
        ref={stageRef}
        className="sequence-stage sticky top-0 h-[100svh] min-h-[540px] overflow-hidden"
        style={{
          ["--light-x" as string]: `${k0d.sx * 100}%`,
          ["--light-y" as string]: `${k0d.sy * 100}%`,
        }}
      >
        <div className="sequence-media absolute inset-0">
          {/* Poster: server-rendered first frame, positioned exactly like camera key 0. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={posterRef}
            src={cld(src, { w: 900 })}
            srcSet={`${cld(src, { w: 600 })} 600w, ${cld(src, { w: 900 })} 900w, ${cld(src, { w: 1300 })} 1300w`}
            sizes="(orientation: portrait) 100vw, 60vh"
            alt={alt}
            fetchPriority="high"
            decoding="async"
            className={`sequence-poster absolute max-w-none ${ready ? "invisible" : ""}`}
            style={
              {
                ["--k0d-zoom" as string]: k0d.zoom,
                ["--k0d-sx" as string]: k0d.sx,
                ["--k0d-sy" as string]: k0d.sy,
                ["--k0d-fx" as string]: k0d.fx,
                ["--k0d-fy" as string]: k0d.fy,
                ["--k0m-zoom" as string]: k0m.zoom,
                ["--k0m-sx" as string]: k0m.sx,
                ["--k0m-sy" as string]: k0m.sy,
                ["--k0m-fx" as string]: k0m.fx,
                ["--k0m-fy" as string]: k0m.fy,
                ["--ratio" as string]: ih / iw,
                aspectRatio: `${iw} / ${ih}`,
              } as React.CSSProperties
            }
          />
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />
        </div>

        {/* Key light + vignette (composited overlays, values fed per frame) */}
        <div aria-hidden className="sequence-light pointer-events-none absolute inset-0 mix-blend-screen" />
        <div aria-hidden className="sequence-vignette pointer-events-none absolute inset-0" />
        {/* Portrait: copy sits below the watch — keep it legible over bright steel. */}
        <div
          aria-hidden
          className="landscape:hidden pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/80 to-transparent"
        />
        <div aria-hidden className="sequence-curtain pointer-events-none absolute inset-0 bg-black" />

        <div ref={introRef} className="absolute inset-0 will-change-transform">
          {intro}
        </div>

        {chapters.map((ch, i) => (
          <div
            key={ch.index}
            ref={(el) => {
              chapterRefs.current[i] = el;
            }}
            className={`sequence-chapter absolute inset-0 pb-[9svh] landscape:pb-0 lux-container flex items-end landscape:items-center pointer-events-none ${
              ch.align === "right"
                ? "landscape:justify-end"
                : ch.align === "center"
                  ? "landscape:justify-center landscape:text-center"
                  : "landscape:justify-start"
            }`}
            style={{ visibility: "hidden" }}
          >
            <div className="max-w-[26rem] md:max-w-[24rem] lg:max-w-[27rem] md:px-4 lg:px-10">
              <p className="eyebrow text-[var(--champagne)] flex items-center gap-4">
                <span className="numeral text-[0.95rem] tracking-normal">{ch.index}</span>
                <span className="h-px w-8 bg-current opacity-60" aria-hidden />
                {ch.eyebrow}
              </p>
              <h2 className="display display-md mt-5 md:mt-7">{ch.title}</h2>
              <p className="lede mt-4 md:mt-6 text-[var(--ivory)]/65">{ch.body}</p>
            </div>
          </div>
        ))}

        {/* Progress rail */}
        <div
          className="absolute right-[var(--gutter)] top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-4"
          aria-hidden
        >
          <span className="numeral text-[0.8rem] text-[var(--ivory)]/50">0</span>
          <div className="relative h-28 w-px bg-[var(--ivory)]/15 overflow-hidden">
            <div
              ref={railRef}
              className="absolute inset-0 origin-top bg-[var(--champagne)]"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
          <span className="numeral text-[0.8rem] text-[var(--ivory)]/50">60</span>
        </div>
      </div>
    </section>
  );
}
