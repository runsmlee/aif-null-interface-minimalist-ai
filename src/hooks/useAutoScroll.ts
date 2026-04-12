import { useEffect, useRef, useCallback } from "react";

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
