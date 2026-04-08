import { useEffect, useRef, useCallback } from "react";

export function useAutoScroll(dependencies: readonly unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, ...dependencies]);

  return { containerRef, scrollToBottom };
}
