"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cursorOuter = cursorOuterRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursorOuter || !cursorInner) return;

    let mouse = { x: 0, y: 0 };
    let cursorOuterPos = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      gsap.to(cursorInner, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.1,
        ease: "power2.out",
      });
    };

    const tickerCursor = () => {
      cursorOuterPos.x += (mouse.x - cursorOuterPos.x) * 0.2;
      cursorOuterPos.y += (mouse.y - cursorOuterPos.y) * 0.2;
      gsap.set(cursorOuter, { x: cursorOuterPos.x, y: cursorOuterPos.y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(tickerCursor);

    // Event delegation for hover states
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if target or any parent matches our hover elements
      const interactiveEl = target.closest(
        "a, button, .watch-wrap, .cursor-pointer"
      );
      if (interactiveEl) {
        cursorOuter.classList.add("hover");
        if (interactiveEl.classList.contains("watch-wrap")) {
          cursorInner.classList.add("view");
        }
      } else {
        cursorOuter.classList.remove("hover");
        cursorInner.classList.remove("view");
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      gsap.ticker.remove(tickerCursor);
    };
  }, []);

  return (
    <>
      <div ref={cursorOuterRef} className="cursor-outer hidden md:block"></div>
      <div ref={cursorInnerRef} className="cursor-inner hidden md:block"></div>
    </>
  );
}
