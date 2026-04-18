import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface TypewriterOptions {
  readonly charDelay?: number;
  readonly onComplete?: () => void;
}

interface TypewriterResult {
  readonly displayedText: string;
  readonly isComplete: boolean;
}

/**
 * Typewriter hook that progressively reveals text character by character.
 * Uses requestAnimationFrame for smooth, frame-aligned updates instead of
 * setInterval, reducing layout thrash during rapid streaming updates.
 */
export function useTypewriter(
  text: string | null,
  options: TypewriterOptions = {}
): TypewriterResult {
  const { charDelay = 15, onComplete } = options;
  const prefersReducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(true);
  const indexRef = useRef(0);
  const rafIdRef = useRef(0);
  const lastTimeRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    onCompleteRef.current?.();
  }, []);

  useEffect(() => {
    if (!text || text.length === 0) {
      setDisplayedText("");
      setIsComplete(true);
      return;
    }

    // Respect prefers-reduced-motion: show full text immediately
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    // Reset for new text
    indexRef.current = 0;
    lastTimeRef.current = 0;
    setDisplayedText("");
    setIsComplete(false);

    const animate = (timestamp: number): void => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      if (elapsed >= charDelay) {
        // Calculate how many characters to advance based on elapsed time
        const steps = Math.floor(elapsed / charDelay);
        indexRef.current = Math.min(indexRef.current + steps, text.length);
        lastTimeRef.current = timestamp - (elapsed % charDelay);

        if (indexRef.current >= text.length) {
          setDisplayedText(text);
          handleComplete();
          return;
        }

        setDisplayedText(text.slice(0, indexRef.current));
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [text, charDelay, handleComplete, prefersReducedMotion]);

  return { displayedText, isComplete };
}
