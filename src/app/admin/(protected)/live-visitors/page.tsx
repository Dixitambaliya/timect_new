"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Users,
  Eye,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Clock,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  X,
  Layers,
  MapPin,
} from "lucide-react";
import type { VisitorSessionRecord, LiveVisitorStats } from "@/db/tracking-actions";

export default function LiveVisitorsPage() {
  const [stats, setStats] = useState<LiveVisitorStats>({
    totalActive: 0,
    authenticated: 0,
    anonymous: 0,
    viewingProduct: 0,
    viewingBlog: 0,
    viewingHome: 0,
    viewingOther: 0,
  });
  const [sessions, setSessions] = useState<VisitorSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<VisitorSessionRecord | null>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [pageTypeFilter, setPageTypeFilter] = useState("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveVisitors = async () => {
    try {
      const res = await fetch("/api/admin/live-visitors");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setSessions(data.sessions || []);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveVisitors();
    pollIntervalRef.current = setInterval(fetchLiveVisitors, 5000); // 5s live polling
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Fetch drawer history when session selected
  const handleSelectSession = async (session: VisitorSessionRecord) => {
    setSelectedSession(session);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/live-visitors?sessionId=${session.session_id}`);
      if (res.ok) {
        const data = await res.json();
        setSessionHistory(data.pageViews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        s.session_id.toLowerCase().includes(q) ||
        (s.user_name && s.user_name.toLowerCase().includes(q)) ||
        s.current_path.toLowerCase().includes(q) ||
        (s.current_page_title && s.current_page_title.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (deviceFilter !== "all" && s.device_type !== deviceFilter) return false;
    if (pageTypeFilter !== "all" && s.page_type !== pageTypeFilter) return false;
    if (visitorTypeFilter === "auth" && !s.user_id) return false;
    if (visitorTypeFilter === "anon" && s.user_id) return false;
    return true;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds < 0) return "Just arrived";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Pulse Indicator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-heading)]">
              Live Visitors & Active Sessions
            </h1>
            <p className="text-xs text-[var(--admin-muted)]">
              Real-time monitoring updating every 5s • Last ping {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchLiveVisitors}
          className="admin-btn admin-btn-secondary text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Now
        </button>
      </div>

      {/* Real-Time Live Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="admin-card p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Total Online</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-heading)]">{stats.totalActive}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Authenticated</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-heading)]">{stats.authenticated}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Anonymous</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-muted)]">{stats.anonymous}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">On Homepage</p>
          <p className="mt-1 text-2xl font-bold text-sky-500">{stats.viewingHome}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">On Products</p>
          <p className="mt-1 text-2xl font-bold text-indigo-500">{stats.viewingProduct}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">On Journal</p>
          <p className="mt-1 text-2xl font-bold text-amber-500">{stats.viewingBlog}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Other Pages</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-muted)]">{stats.viewingOther}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="text"
            placeholder="Search session ID, path, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="admin-input w-auto !py-1.5"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          <select
            value={pageTypeFilter}
            onChange={(e) => setPageTypeFilter(e.target.value)}
            className="admin-input w-auto !py-1.5"
          >
            <option value="all">All Pages</option>
            <option value="home">Homepage</option>
            <option value="product">Product Pages</option>
            <option value="blog">Journal / Articles</option>
            <option value="catalog">Watches Catalog</option>
            <option value="corporate">Corporate Gifting</option>
          </select>

          <select
            value={visitorTypeFilter}
            onChange={(e) => setVisitorTypeFilter(e.target.value)}
            className="admin-input w-auto !py-1.5"
          >
            <option value="all">All Visitors</option>
            <option value="anon">Anonymous</option>
            <option value="auth">Authenticated</option>
          </select>
        </div>
      </div>

      {/* Active Sessions Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--admin-line)] bg-[var(--admin-bg)] text-xs uppercase tracking-wider text-[var(--admin-muted)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Visitor & Session</th>
                <th className="px-4 py-3 font-semibold">Current Page</th>
                <th className="px-4 py-3 font-semibold">Device & Browser</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Last Activity</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-line)]">
              {loading && sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--admin-muted)]">
                    Connecting to live visitor stream...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--admin-muted)]">
                    {sessions.length === 0
                      ? "No active visitors currently on the website. Open a storefront page in another tab to see it appear live!"
                      : "No active sessions match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="transition hover:bg-[var(--admin-surface-2)] cursor-pointer"
                    onClick={() => handleSelectSession(session)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <div>
                          <p className="font-semibold text-[var(--admin-heading)] text-xs">
                            {session.user_name || "Anonymous Visitor"}
                          </p>
                          <p className="text-[11px] font-mono text-[var(--admin-muted)]">
                            {session.session_id.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="inline-block rounded-fuse-sm bg-[var(--admin-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--admin-muted)] mb-1">
                          {session.page_type}
                        </span>
                        <p className="text-xs font-mono text-[var(--admin-ink)] line-clamp-1 max-w-[200px]">
                          {session.current_path}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--admin-ink)]">
                      <div className="flex items-center gap-1.5">
                        {session.device_type === "mobile" ? (
                          <Smartphone className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                        ) : session.device_type === "tablet" ? (
                          <Tablet className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                        ) : (
                          <Laptop className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                        )}
                        <span>
                          {session.browser || "Browser"} / {session.operating_system || "OS"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--admin-muted)]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500/70" />
                        <span>{session.city || "Mumbai"}, {session.country || "IN"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-[var(--admin-ink)]">
                      {formatDuration(session.duration_seconds)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--admin-muted)] font-mono">
                      {new Date(session.last_seen_at).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSession(session);
                        }}
                        className="admin-btn admin-btn-secondary text-[11px] !py-1 !px-2.5"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Slide-over Drawer */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-md bg-[var(--admin-surface)] p-6 shadow-2xl border-l border-[var(--admin-line)] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--admin-line)] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-base font-bold text-[var(--admin-heading)]">
                    Session Profile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="rounded p-1 text-[var(--admin-muted)] hover:text-[var(--admin-heading)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Overview Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[var(--admin-muted)] uppercase tracking-wider font-semibold">Session ID</span>
                  <p className="font-mono text-[var(--admin-ink)] mt-0.5 break-all">{selectedSession.session_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[var(--admin-muted)] uppercase tracking-wider font-semibold">Visitor Type</span>
                    <p className="text-[var(--admin-heading)] font-semibold mt-0.5">
                      {selectedSession.user_name || "Anonymous Visitor"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--admin-muted)] uppercase tracking-wider font-semibold">Duration</span>
                    <p className="font-mono text-[var(--admin-heading)] font-semibold mt-0.5">
                      {formatDuration(selectedSession.duration_seconds)}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[var(--admin-muted)] uppercase tracking-wider font-semibold">Current Location</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono text-[var(--admin-ink)] break-all">{selectedSession.current_path}</p>
                    <Link
                      href={selectedSession.current_path}
                      target="_blank"
                      className="text-[var(--admin-accent)] hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--admin-line)]">
                  <div>
                    <span className="text-[var(--admin-muted)]">Device:</span>{" "}
                    <span className="font-medium text-[var(--admin-heading)] capitalize">{selectedSession.device_type}</span>
                  </div>
                  <div>
                    <span className="text-[var(--admin-muted)]">OS:</span>{" "}
                    <span className="font-medium text-[var(--admin-heading)]">{selectedSession.operating_system}</span>
                  </div>
                  <div>
                    <span className="text-[var(--admin-muted)]">Browser:</span>{" "}
                    <span className="font-medium text-[var(--admin-heading)]">{selectedSession.browser}</span>
                  </div>
                  <div>
                    <span className="text-[var(--admin-muted)]">Location:</span>{" "}
                    <span className="font-medium text-[var(--admin-heading)]">
                      {selectedSession.city}, {selectedSession.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation History */}
              <div className="pt-4 border-t border-[var(--admin-line)]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-heading)] mb-3">
                  Page Navigation Trail
                </h4>
                {historyLoading ? (
                  <p className="text-xs text-[var(--admin-muted)] py-4 text-center">Loading trail...</p>
                ) : sessionHistory.length === 0 ? (
                  <p className="text-xs text-[var(--admin-muted)]">Initial landing page active.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sessionHistory.map((pv, i) => (
                      <div
                        key={pv.id}
                        className="flex items-start justify-between text-xs p-2 rounded bg-[var(--admin-surface-2)]"
                      >
                        <div>
                          <p className="font-mono text-[var(--admin-heading)]">{pv.page_path}</p>
                          <span className="text-[10px] text-[var(--admin-muted)] uppercase">{pv.page_type}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--admin-muted)]">
                          {new Date(pv.entered_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--admin-line)]">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="w-full admin-btn admin-btn-secondary"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
