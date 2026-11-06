"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HEARTBEAT_INTERVAL_MS = 20_000; // 20 seconds heartbeat

/**
 * Lightweight, non-intrusive client-side visitor tracker.
 * Establishes persistent anonymous visitor ID and per-session ID.
 * Transmits page navigations and periodic heartbeats.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track public storefront pages (never track admin itself)
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    // 1. Resolve or create persistent Visitor ID (stored across visits)
    let visitorId = "";
    try {
      visitorId = localStorage.getItem("timect_vid") || "";
      if (!visitorId) {
        visitorId = `v_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
        localStorage.setItem("timect_vid", visitorId);
      }
    } catch {
      visitorId = `v_anon_${Date.now()}`;
    }

    // 2. Resolve or create Session ID (per browser session/tab window)
    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem("timect_sid") || "";
      if (!sessionId) {
        sessionId = `s_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
        sessionStorage.setItem("timect_sid", sessionId);
      }
    } catch {
      sessionId = `s_tab_${Date.now()}`;
    }

    // Determine device type
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /(iPad|Tablet|(Android(?!.*Mobile)))/i.test(ua);
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    // Determine simple browser & OS
    let browser = "Chrome";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";

    let operatingSystem = "Other";
    if (ua.includes("Win")) operatingSystem = "Windows";
    else if (ua.includes("Mac")) operatingSystem = "macOS";
    else if (ua.includes("Linux")) operatingSystem = "Linux";
    else if (ua.includes("Android")) operatingSystem = "Android";
    else if (ua.includes("like Mac")) operatingSystem = "iOS";

    // Determine page type
    let pageType = "other";
    if (pathname === "/") pageType = "home";
    else if (pathname.startsWith("/product/")) pageType = "product";
    else if (pathname.startsWith("/watches")) pageType = "catalog";
    else if (pathname.startsWith("/blog")) pageType = "blog";
    else if (pathname.startsWith("/corporate-gifting")) pageType = "corporate";

    const sendHeartbeat = (action: "heartbeat" | "end" = "heartbeat") => {
      const payload = {
        sessionId,
        visitorId,
        path: pathname,
        pageTitle: document.title,
        pageType,
        deviceType,
        browser,
        operatingSystem,
        referrer: document.referrer || null,
        action,
      };

      if (action === "end" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/tracking/heartbeat", JSON.stringify(payload));
      } else {
        fetch("/api/tracking/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Send immediate ping upon route landing
    sendHeartbeat("heartbeat");

    // Establish periodic heartbeat
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    heartbeatTimer.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat("heartbeat");
      }
    }, HEARTBEAT_INTERVAL_MS);

    // End session beacon on unload
    const onUnload = () => {
      sendHeartbeat("end");
    };

    window.addEventListener("beforeunload", onUnload);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [pathname]);

  return null;
}
