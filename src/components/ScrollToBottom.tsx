import { useState, useEffect, useCallback, useRef } from "react";
import { IconArrowDown } from "./Icons";

interface ScrollToBottomProps {
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Floating scroll-to-bottom button that appears when the user scrolls
 * up during streaming or has many messages. Uses IntersectionObserver
 * for efficient scroll detection without scroll event listeners.
 *
 * The sentinel is always rendered (even when the button is hidden) so
 * the IntersectionObserver can continuously monitor scroll position.
 */
export function ScrollToBottom({ containerRef }: ScrollToBottomProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(!entry.isIntersecting);
        }
      },
      {
        root: container,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [containerRef]);

  const handleClick = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [containerRef]);

  return (
    <>
      {/* Sentinel element at the bottom of the scroll container — always rendered */}
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />
      {isVisible && (
        <div className="relative flex justify-center -mt-10 mb-2">
          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/90 border border-neutral-700/50 text-neutral-300 text-xs rounded-full shadow-lg hover:bg-neutral-700/90 hover:text-neutral-100 transition-all duration-200 min-h-[36px] focus-visible:outline-2 focus-visible:outline-primary-500 backdrop-blur-sm animate-fade-in"
            aria-label="Scroll to latest messages"
          >
            <IconArrowDown size={12} />
            <span>Latest</span>
          </button>
        </div>
      )}
    </>
  );
}
