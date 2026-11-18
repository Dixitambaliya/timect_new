"use client";

import { useEffect } from "react";

export default function InspectionRestriction({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const devTools = event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.metaKey && event.altKey && ["i", "j", "c"].includes(key));
      const viewSource = (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && key === "u";
      if (devTools || viewSource) event.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);
  return null;
}
