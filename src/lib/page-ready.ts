/** Fired by pages when primary data is ready so the Timect preloader can exit. */
export const PAGE_READY_EVENT = "timect:page-ready";

export function signalPageReady() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PAGE_READY_EVENT));
}
