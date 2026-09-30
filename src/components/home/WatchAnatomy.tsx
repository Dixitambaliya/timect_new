"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import SectionHeading from "@/components/home/SectionHeading";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { easeInOut, range, useScrollProgress } from "@/hooks/useScrollProgress";
import { LOGO_SRC } from "@/lib/cloudinary";

/** Top → bottom as they sit on the wrist. */
const LAYERS = [
  { key: "crystal", label: "Crystal", note: "Protects the dial" },
  { key: "hands", label: "Hands", note: "Hours, minutes, seconds" },
  { key: "dial", label: "Dial", note: "Indices & emblem" },
  { key: "case", label: "Case", note: "Bezel, lugs & crown" },
  { key: "movement", label: "Movement", note: "The beating heart" },
  { key: "caseback", label: "Caseback", note: "Seals the watch" },
] as const;

const TILT_X = 56; // degrees
const PERSPECTIVE = 1800;

/**
 * Exploded anatomy: the watch begins assembled, separates into its layers
 * as the reader scrolls, then closes again. An illustration of construction,
 * rendered with light and material rather than technical line-work.
 */
export default function WatchAnatomy() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const secondsRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  const onProgress = useCallback((p: number) => {
    const scene = sceneRef.current;
    const stack = stackRef.current;
    if (!scene || !stack) return;
    const size = scene.clientWidth;
    const explode = easeInOut(range(p, 0.1, 0.42)) * (1 - easeInOut(range(p, 0.74, 0.96)));
    const tiltX = TILT_X - 6 * explode;
    const turn = -26 + 16 * easeInOut(range(p, 0.05, 0.95));
    stack.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateZ(${turn.toFixed(2)}deg)`;

    const spread = size * 0.2;
    const n = LAYERS.length;
    const rad = (tiltX * Math.PI) / 180;
    const narrow = window.innerWidth < 768;

    LAYERS.forEach((_, i) => {
      // Crystal on top (highest z); centre the stack around the origin.
      const assembled = (n - 1 - i) * 5;
      const z = assembled + ((n - 1) / 2 - i) * spread * explode;
      const el = layerRefs.current[i];
      if (el) el.style.transform = `translate3d(0,0,${z.toFixed(1)}px)`;

      // Project the layer centre to place its label beside it.
      const lift = (z * Math.sin(rad) * PERSPECTIVE) / (PERSPECTIVE - z * Math.cos(rad));
      const label = labelRefs.current[i];
      const show = range(explode, 0.45 + i * 0.06, 0.75 + i * 0.06);
      if (label) {
        label.style.transform = `translate3d(0, ${(-lift).toFixed(1)}px, 0)`;
        label.style.opacity = narrow ? "0" : show.toFixed(3);
      }
    });

    if (activeRef.current) {
      const idx = explode > 0.6 ? Math.min(n - 1, Math.floor(range(p, 0.42, 0.74) * n)) : -1;
      activeRef.current.textContent = idx >= 0 ? `${String(idx + 1).padStart(2, "0")} — ${LAYERS[idx].label}` : "";
      activeRef.current.style.opacity = narrow && idx >= 0 ? "1" : "0";
    }

    // The seconds hand sweeps a full turn across the section.
    if (secondsRef.current) secondsRef.current.style.transform = `rotate(${(p * 360).toFixed(2)}deg)`;
  }, []);
  useScrollProgress(sectionRef, onProgress, "pin");

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      aria-labelledby="anatomy-title"
      className={`relative bg-[var(--noir)] text-[var(--ivory)] ${reduced ? "" : "h-[300svh]"}`}
    >
      <div className={`${reduced ? "" : "sticky top-0 h-[100svh]"} min-h-[600px] overflow-hidden flex flex-col`}>
        <div className="lux-container pt-[calc(var(--header-h)+3svh)] md:pt-[calc(var(--header-h)+6svh)] relative z-10">
          <SectionHeading
            index="02"
            eyebrow="Anatomy"
            tone="dark"
            title={
              <span id="anatomy-title">
                Engineered <em>in layers.</em>
              </span>
            }
            lede="Six components, one instrument. Each layer is aligned, fitted and checked by hand before the case is closed."
          />
        </div>

        <div className="relative flex-1 flex items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(38% 46% at 50% 58%, rgba(179,154,107,0.10), transparent 70%)",
            }}
          />
          <div
            ref={sceneRef}
            className="anatomy-scene relative"
            style={{ width: "min(62vw, 42svh, 440px)", height: "min(62vw, 42svh, 440px)" }}
            role="img"
            aria-label="Illustration of a watch separating into crystal, hands, dial, case, movement and caseback"
          >
            <div ref={stackRef} className="anatomy-stack absolute inset-0">
              {LAYERS.map((layer, i) => (
                <div
                  key={layer.key}
                  ref={(el) => {
                    layerRefs.current[i] = el;
                  }}
                  className="anatomy-layer"
                  style={{ transform: `translate3d(0,0,${(LAYERS.length - 1 - i) * 5}px)` }}
                >
                  <Layer kind={layer.key} secondsRef={layer.key === "hands" ? secondsRef : undefined} />
                </div>
              ))}
            </div>

            {/* Leader labels (desktop) */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              {LAYERS.map((layer, i) => (
                <div
                  key={layer.key}
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="absolute top-1/2 left-[104%] -mt-4 flex items-center gap-4 whitespace-nowrap"
                  style={{ opacity: 0 }}
                >
                  <span className="h-px w-10 lg:w-16 bg-[var(--champagne)]/60" />
                  <span>
                    <span className="eyebrow block text-[var(--ivory)]">
                      <span className="numeral text-[var(--champagne)] tracking-normal mr-3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {layer.label}
                    </span>
                    <span className="block mt-1 text-[0.8rem] font-light text-[var(--muted-dark)]">{layer.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p
            ref={activeRef}
            className="md:hidden absolute bottom-[7svh] left-0 right-0 text-center eyebrow text-[var(--champagne)] transition-opacity duration-500"
            style={{ opacity: 0 }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

const steel =
  "conic-gradient(from 210deg, #2a2a28, #8d8a83 12%, #3a3936 26%, #b9b5ab 40%, #4a4845 55%, #9c988f 70%, #2e2d2b 84%, #2a2a28)";

function Layer({
  kind,
  secondsRef,
}: {
  kind: (typeof LAYERS)[number]["key"];
  secondsRef?: React.RefObject<HTMLDivElement | null>;
}) {
  switch (kind) {
    case "crystal":
      return (
        <div
          className="absolute rounded-full"
          style={{
            inset: "13%",
            background:
              "linear-gradient(125deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.08) 78%, rgba(255,255,255,0.18) 100%)",
            border: "1px solid rgba(243,239,231,0.35)",
            boxShadow: "inset 0 0 30px rgba(255,255,255,0.06)",
          }}
        />
      );
    case "hands":
      return (
        <div className="absolute" style={{ inset: "13%" }}>
          <Hand length={0.3} width={0.034} angle={-58} />
          <Hand length={0.42} width={0.026} angle={52} />
          <div ref={secondsRef} className="absolute inset-0">
            <div
              className="absolute left-1/2 bottom-[42%] w-px -translate-x-1/2 bg-[var(--champagne)]"
              style={{ height: "46%" }}
            />
          </div>
          <div className="absolute left-1/2 top-1/2 w-[4.5%] h-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8d3c8] shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" />
        </div>
      );
    case "dial":
      return (
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            inset: "14%",
            background:
              "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.05) 0deg 0.6deg, rgba(0,0,0,0.04) 0.6deg 1.2deg), radial-gradient(circle at 40% 35%, #f1eee8, #c9c5bc 60%, #a8a399)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-[#2c3440]"
                style={{ top: "6%", width: i % 3 === 0 ? "2.4%" : "1.4%", height: i % 3 === 0 ? "12%" : "8%" }}
              />
            </div>
          ))}
          <div className="absolute left-1/2 top-[24%] -translate-x-1/2 w-[20%] opacity-80">
            <Image src={LOGO_SRC} alt="" width={1552} height={889} className="w-full h-auto" />
          </div>
        </div>
      );
    case "case":
      return (
        <div className="absolute inset-0">
          {/* lugs */}
          {[
            { left: "27%", top: "-4%" },
            { right: "27%", top: "-4%" },
            { left: "27%", bottom: "-4%" },
            { right: "27%", bottom: "-4%" },
          ].map((pos, i) => (
            <div key={i} className="absolute w-[9%] h-[18%] rounded-[2px]" style={{ ...pos, background: steel }} />
          ))}
          {/* crown */}
          <div
            className="absolute top-1/2 -translate-y-1/2 right-[1%] w-[7%] h-[12%] rounded-[3px]"
            style={{ background: "repeating-linear-gradient(90deg, #6f6c66 0 2px, #b3afa6 2px 4px)" }}
          />
          <div
            className="absolute rounded-full"
            style={{
              inset: "6%",
              background: steel,
              WebkitMaskImage: "radial-gradient(circle, transparent 57%, #000 57.5%)",
              maskImage: "radial-gradient(circle, transparent 57%, #000 57.5%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
          <div className="absolute rounded-full border border-[#1f3556]" style={{ inset: "12%", borderWidth: "3px" }} />
        </div>
      );
    case "movement":
      return (
        <div
          className="absolute rounded-full overflow-hidden"
          style={{ inset: "15%", background: "radial-gradient(circle at 45% 40%, #3b3a37, #1c1b1a 75%)" }}
        >
          {[
            { s: 34, x: 30, y: 34 },
            { s: 22, x: 62, y: 30 },
            { s: 26, x: 58, y: 62 },
            { s: 16, x: 30, y: 66 },
          ].map((g, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${g.s}%`,
                height: `${g.s}%`,
                left: `${g.x - g.s / 2}%`,
                top: `${g.y - g.s / 2}%`,
                background:
                  "radial-gradient(circle, #1c1b1a 18%, transparent 19%), repeating-conic-gradient(#b39a6b 0deg 6deg, #6e5f42 6deg 12deg)",
                WebkitMaskImage: "radial-gradient(circle, #000 64%, transparent 66%)",
                maskImage: "radial-gradient(circle, #000 64%, transparent 66%)",
                opacity: 0.85,
              }}
            />
          ))}
          <div className="absolute inset-[8%] rounded-full border border-[var(--champagne)]/25" />
        </div>
      );
    case "caseback":
      return (
        <div
          className="absolute rounded-full"
          style={{
            inset: "8%",
            background: `repeating-radial-gradient(circle, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px), ${steel}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] opacity-30">
            <Image src={LOGO_SRC} alt="" width={1552} height={889} className="w-full h-auto invert" />
          </div>
        </div>
      );
  }
}

function Hand({ length, width, angle }: { length: number; width: number; angle: number }) {
  return (
    <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-[#d9d5cc]"
        style={{
          bottom: "48%",
          height: `${length * 100}%`,
          width: `${width * 100}%`,
          clipPath: "polygon(50% 0, 100% 12%, 100% 100%, 0 100%, 0 12%)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
