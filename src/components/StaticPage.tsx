"use client";

import { useEffect, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signalPageReady } from "@/lib/page-ready";

type StaticPageProps = {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  headerPy?: string;
  contentPy?: string;
  children: ReactNode;
};

export default function StaticPage({
  title,
  subtitle,
  maxWidth = "max-w-[800px]",
  headerPy = "py-8 md:py-10",
  contentPy = "py-8 md:py-10",
  children,
}: StaticPageProps) {
  useEffect(() => {
    signalPageReady();
  }, []);

  return (
    <div>
      <Header />
      <main className="min-h-[60vh]">
        <div className="border-b border-[var(--line)] bg-[#fafafa]">
          <div className={`${maxWidth} mx-auto px-8 ${headerPy}`}>
            <p className="tracked-sm text-[11px] text-[var(--muted)] mb-2">
              TIMECT
            </p>
            <h1 className="serif text-[32px] md:text-[40px] font-medium leading-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2.5 text-[14px] text-[var(--muted)] leading-relaxed max-w-[600px]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className={`${maxWidth} mx-auto px-8 ${contentPy}`}>
          <div className="static-content text-[15px] leading-[1.8] text-[#333]">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
