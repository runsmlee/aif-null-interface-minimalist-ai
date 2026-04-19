import { useEffect, useCallback } from "react";

interface ShortcutOptions {
  readonly onFocusInput: () => void;
}

export function useKeyboardShortcuts({ onFocusInput }: ShortcutOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // "/" focuses the chat input (only when not already in an input)
      if (e.key === "/" && !isInputFocused) {
        e.preventDefault();
        onFocusInput();
      }

      // Cmd/Ctrl+K also focuses the input (works even in input)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onFocusInput();
      }

      // Escape blurs the current input
      if (e.key === "Escape" && isInputFocused) {
        target.blur();
      }
    },
    [onFocusInput],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
