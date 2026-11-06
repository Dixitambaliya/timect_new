"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Laptop, Smartphone, Users } from "lucide-react";
import type { LiveVisitorStats } from "@/db/tracking-actions";

export default function LiveVisitorWidget() {
  const [stats, setStats] = useState<LiveVisitorStats>({
    totalActive: 0,
    authenticated: 0,
    anonymous: 0,
    viewingProduct: 0,
    viewingBlog: 0,
    viewingHome: 0,
    viewingOther: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/live-visitors");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        // silent fail
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-card p-5 border-l-4 border-l-emerald-500 mb-6 transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--admin-heading)]">
                {stats.totalActive} Live Visitor{stats.totalActive === 1 ? "" : "s"} Online Now
              </h3>
              <span className="rounded-fuse-sm bg-[var(--admin-success-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--admin-success)]">
                Live Stream
              </span>
            </div>
            <p className="text-xs text-[var(--admin-muted)] mt-0.5">
              {stats.authenticated} authenticated • {stats.anonymous} anonymous •{" "}
              {stats.viewingProduct} viewing watches • {stats.viewingBlog} on journal
            </p>
          </div>
        </div>

        <Link
          href="/admin/live-visitors"
          className="admin-btn admin-btn-secondary text-xs shrink-0 self-start sm:self-auto"
        >
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          Open Live Monitor <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
