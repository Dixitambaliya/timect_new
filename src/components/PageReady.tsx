"use client";

import { useEffect } from "react";
import { signalPageReady } from "@/lib/page-ready";

/** Lets the route overlay exit as soon as a server-rendered page has hydrated. */
export default function PageReady() {
  useEffect(() => {
    signalPageReady();
  }, []);
  return null;
}
