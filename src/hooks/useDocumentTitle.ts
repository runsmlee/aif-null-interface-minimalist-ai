import { useEffect, useRef } from "react";

/**
 * Declaratively set the document title. Restores the previous title on unmount.
 *
 * @param title - The title to set. If empty, the current title is left unchanged.
 */
export function useDocumentTitle(title: string): void {
  const prevTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!title) return;

    prevTitleRef.current = document.title;
    document.title = title;

    return () => {
      if (prevTitleRef.current !== null) {
        document.title = prevTitleRef.current;
      }
    };
  }, [title]);
}
