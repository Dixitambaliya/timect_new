"use client";

import Link from "next/link";
import { saveScrollForCurrent } from "@/lib/scroll-memory";

export default function ForHimHer() {
  return (
    <section
      id="for-him-her"
      className="max-w-[1400px] mx-auto px-8 pb-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/watches?gender=Men"
          scroll={false}
          onClick={saveScrollForCurrent}
          className="relative h-[420px] flex items-end justify-start p-8 group cursor-pointer"
          style={{ background: "linear-gradient(160deg,#d9d9d9,#bbb)" }}
        >
          <img
            src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048483/timect/man_watch_cat.jpg"
            alt="For Him"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-70"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            <div className="text-[18px] font-semibold tracked-sm">
              FOR HIM
            </div>
            <div className="text-[11px] font-medium tracked-sm mt-1.5 underline underline-offset-4">
              EXPLORE ›
            </div>
          </div>
        </Link>
        <Link
          href="/watches?gender=Women"
          scroll={false}
          onClick={saveScrollForCurrent}
          className="relative h-[420px] flex items-end justify-start p-8 group cursor-pointer"
          style={{ background: "linear-gradient(160deg,#2a2a2a,#000)" }}
        >
          <img
            src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048495/timect/woman_watch_cat.jpg"
            alt="For Her"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-70"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            <div className="text-[18px] font-semibold tracked-sm">
              FOR HER
            </div>
            <div className="text-[11px] font-medium tracked-sm mt-1.5 underline underline-offset-4">
              EXPLORE ›
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
