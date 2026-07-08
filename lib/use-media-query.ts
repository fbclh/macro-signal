"use client";

import { useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. Returns false during SSR and the first client
 * render (matching the desktop-first default), then the real match once
 * hydrated — so narrow-screen tweaks apply without a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
