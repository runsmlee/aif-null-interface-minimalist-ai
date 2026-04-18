import { useEffect, useRef, useCallback } from "react";

/**
 * Auto-scroll hook that keeps a container scrolled to the bottom.
 * Uses requestAnimationFrame to coalesce rapid DOM scroll operations
 * (e.g., during streaming) into a single frame-aligned update.
 */
export function useAutoScroll(dependencies: readonly unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);

  const scrollToBottom = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
    return () => cancelAnimationFrame(rafId.current);
  }, [scrollToBottom, ...dependencies]);

  return { containerRef, scrollToBottom };
}
