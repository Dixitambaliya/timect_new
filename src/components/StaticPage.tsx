"use client";

import { useEffect, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import { signalPageReady } from "@/lib/page-ready";

type StaticPageProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  maxWidth?: string;
  /** @deprecated spacing is now set by the editorial layout */
  headerPy?: string;
  /** @deprecated spacing is now set by the editorial layout */
  contentPy?: string;
  children: ReactNode;
};

/** Editorial shell for brand, service and legal pages. */
export default function StaticPage({
  title,
  subtitle,
  eyebrow = "Timect",
  maxWidth = "max-w-[820px]",
  children,
}: StaticPageProps) {
  useEffect(() => {
    signalPageReady();
  }, []);

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <Header />
      <main className="min-h-[60vh]">
        <div className="bg-[var(--ivory)] border-b border-[var(--line)]">
          <div className="lux-container pt-16 md:pt-28 pb-14 md:pb-20 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8 items-end">
            <div className="md:col-span-7">
              <Reveal as="p" className="eyebrow text-[var(--champagne)]">
                {eyebrow}
              </Reveal>
              <Reveal as="h1" delay={80} className="display display-lg mt-6 md:mt-8">
                {title}
              </Reveal>
            </div>
            {subtitle ? (
              <Reveal as="p" delay={160} className="md:col-span-5 lede text-[var(--muted)] md:pb-2">
                {subtitle}
              </Reveal>
            ) : null}
          </div>
        </div>
        <div className="lux-container py-16 md:py-24">
          <div className={`${maxWidth} static-content text-[0.98rem] font-light leading-[1.85] text-[var(--ink)]/85`}>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
