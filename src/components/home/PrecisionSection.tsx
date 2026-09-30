"use client";

import { useEffect, useRef } from "react";
import SectionHeading from "@/components/home/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const C = 200; // viewBox centre

/**
 * "Time, refined." — a quiet instrument showing the reader's own time.
 * The seconds hand sweeps continuously; each passing second lights its mark.
 */
export default function PrecisionSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<SVGGElement>(null);
  const minuteRef = useRef<SVGGElement>(null);
  const secondRef = useRef<SVGGElement>(null);
  const ticksRef = useRef<SVGGElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let timer = 0;
    let running = false;
    let lastSecond = -1;
    const ticks = ticksRef.current ? (Array.from(ticksRef.current.children) as SVGLineElement[]) : [];

    const render = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds() + (reduced ? 0 : ms / 1000);
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      secondRef.current?.setAttribute("transform", `rotate(${(s * 6).toFixed(3)} ${C} ${C})`);
      minuteRef.current?.setAttribute("transform", `rotate(${(m * 6).toFixed(3)} ${C} ${C})`);
      hourRef.current?.setAttribute("transform", `rotate(${(h * 30).toFixed(3)} ${C} ${C})`);

      const sec = now.getSeconds();
      if (sec !== lastSecond) {
        lastSecond = sec;
        ticks.forEach((t, i) => {
          const age = (sec - i + 60) % 60; // 0 = current second
          t.style.opacity = age === 0 ? "1" : age < 10 ? String(0.9 - age * 0.06) : "";
          t.style.stroke = age < 10 ? "var(--champagne)" : "";
        });
        if (readoutRef.current) {
          readoutRef.current.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        }
      }
    };

    const loop = () => {
      render();
      if (running) frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      if (reduced) {
        render();
        timer = window.setInterval(render, 1000);
      } else loop();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };

    render();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "10% 0px" });
    io.observe(root);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <section
      data-header-theme="dark"
      aria-labelledby="precision-title"
      className="bg-[var(--noir)] text-[var(--ivory)] py-28 md:py-40 overflow-hidden"
    >
      <div className="lux-container grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-16 items-center">
        <div className="col-span-12 lg:col-span-5">
          <SectionHeading
            index="08"
            eyebrow="Precision"
            tone="dark"
            title={
              <span id="precision-title">
                Time, <em>refined.</em>
              </span>
            }
          />
          <Reveal as="p" delay={160} className="lede mt-8 text-[var(--muted-dark)]">
            Sixty seconds to the minute, sixty minutes to the hour. A watch keeps every one of them — quietly, and
            without pause.
          </Reveal>
          <Reveal delay={240} className="mt-12 flex items-baseline gap-5">
            <span className="eyebrow text-[var(--muted-dark)]">Your time</span>
            <span ref={readoutRef} className="numeral text-[1.6rem] tracking-[0.06em]" suppressHydrationWarning />
          </Reveal>
        </div>

        <Reveal variant="focus" className="col-span-12 lg:col-span-6 lg:col-start-7 flex justify-center">
          <div ref={rootRef} className="relative w-[min(86vw,34rem)] aspect-square">
            <div
              aria-hidden
              className="absolute inset-[-10%] rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(179,154,107,0.10), transparent)" }}
            />
            <svg
              viewBox="0 0 400 400"
              className="relative w-full h-full"
              role="img"
              aria-label="Analogue dial showing the current local time"
            >
              <circle cx={C} cy={C} r={196} fill="none" stroke="rgba(243,239,231,0.10)" />
              <circle cx={C} cy={C} r={150} fill="none" stroke="rgba(243,239,231,0.06)" />
              <circle cx={C} cy={C} r={58} fill="none" stroke="rgba(243,239,231,0.06)" />

              {/* Minute track — the passing seconds light up */}
              <g ref={ticksRef} stroke="rgba(243,239,231,0.28)" strokeWidth={1} style={{ transition: "none" }}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <line
                    key={i}
                    x1={C}
                    y1={10}
                    x2={C}
                    y2={i % 5 === 0 ? 30 : 20}
                    transform={`rotate(${i * 6} ${C} ${C})`}
                    style={{ transition: "opacity 0.9s ease, stroke 0.9s ease" }}
                  />
                ))}
              </g>

              {/* Hour numerals at the quarters */}
              {[
                ["XII", C, 62],
                ["III", 342, C + 6],
                ["VI", C, 350],
                ["IX", 58, C + 6],
              ].map(([t, x, y]) => (
                <text
                  key={t as string}
                  x={x as number}
                  y={y as number}
                  textAnchor="middle"
                  fill="rgba(243,239,231,0.55)"
                  style={{ font: "300 17px var(--font-cormorant), serif", letterSpacing: "0.08em" }}
                >
                  {t}
                </text>
              ))}

              <g ref={hourRef}>
                <path
                  d={`M${C - 3.2} ${C + 14} L${C - 2.2} ${C - 88} L${C} ${C - 96} L${C + 2.2} ${C - 88} L${C + 3.2} ${C + 14} Z`}
                  fill="#e9e4da"
                />
              </g>
              <g ref={minuteRef}>
                <path
                  d={`M${C - 2.4} ${C + 18} L${C - 1.6} ${C - 142} L${C} ${C - 152} L${C + 1.6} ${C - 142} L${C + 2.4} ${C + 18} Z`}
                  fill="#e9e4da"
                />
              </g>
              <g ref={secondRef}>
                <line x1={C} y1={C + 34} x2={C} y2={C - 176} stroke="var(--champagne)" strokeWidth={1} />
                <circle cx={C} cy={C + 34} r={3.5} fill="none" stroke="var(--champagne)" strokeWidth={1} />
              </g>
              <circle cx={C} cy={C} r={4.5} fill="var(--noir)" stroke="var(--champagne)" strokeWidth={1} />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
