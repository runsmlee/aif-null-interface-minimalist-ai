import { useState, useEffect } from "react";

/**
 * Reactive hook that tracks the user's `prefers-reduced-motion` media query.
 * Returns `true` when the user has requested reduced motion.
 *
 * Useful for disabling typewriter effects, animations, and transitions
 * to respect the user's accessibility preferences (WCAG 2.1 AA).
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent): void => {
      setPrefersReducedMotion(e.matches);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
