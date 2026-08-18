"use client";

import { useSyncExternalStore } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * Replaces the equivalent hook from a motion library — this was the only piece
 * of it the site used, and it is a media query.
 *
 * `useSyncExternalStore` is the right primitive here: `matchMedia` is an
 * external store, so subscribing through it avoids the cascading re-render
 * that `useState` + `useEffect` causes, and gives a correct server snapshot
 * without a hydration mismatch.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;

/** The server cannot know the preference; assume motion is allowed. */
const getServerSnapshot = (): boolean => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
