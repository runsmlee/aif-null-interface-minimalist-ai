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

export function useTypewriter(
  text: string | null,
  options: TypewriterOptions = {}
): TypewriterResult {
  const { charDelay = 15, onComplete } = options;
  const prefersReducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(true);
  const indexRef = useRef(0);
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
    setDisplayedText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      indexRef.current += 1;
      const currentIndex = indexRef.current;

      if (currentIndex >= text.length) {
        clearInterval(interval);
        setDisplayedText(text);
        handleComplete();
        return;
      }

      // Reveal characters in chunks for performance
      const charsToReveal = Math.min(currentIndex, text.length);
      setDisplayedText(text.slice(0, charsToReveal));
    }, charDelay);

    return () => {
      clearInterval(interval);
    };
  }, [text, charDelay, handleComplete, prefersReducedMotion]);

  return { displayedText, isComplete };
}
