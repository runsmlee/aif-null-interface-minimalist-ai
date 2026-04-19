import { useEffect, useRef, useCallback, type RefObject } from "react";

/**
 * Auto-scroll hook that keeps a container scrolled to the bottom.
 * Uses requestAnimationFrame to coalesce rapid DOM scroll operations
 * (e.g., during streaming) into a single frame-aligned update.
 *
 * @param dependencies - When these change, the container scrolls to the bottom.
 * @param externalRef - Optional external ref that will be synced with the internal ref.
 *                      Use this when the container ref needs to be shared with other components.
 */
export function useAutoScroll(
  dependencies: readonly unknown[],
  externalRef?: RefObject<HTMLDivElement | null>,
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef ?? internalRef;
  const rafId = useRef(0);

  const scrollToBottom = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [containerRef]);

  useEffect(() => {
    scrollToBottom();
    return () => cancelAnimationFrame(rafId.current);
  }, [scrollToBottom, ...dependencies]);

  return { containerRef, scrollToBottom };
}
