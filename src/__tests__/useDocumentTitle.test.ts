import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

describe("useDocumentTitle", () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it("sets the document title", () => {
    renderHook(() => useDocumentTitle("Test Title"));
    expect(document.title).toBe("Test Title");
  });

  it("restores the previous title on unmount", () => {
    document.title = "Original";
    const { unmount } = renderHook(() => useDocumentTitle("New Title"));
    expect(document.title).toBe("New Title");

    unmount();
    expect(document.title).toBe("Original");
  });

  it("updates the title when the prop changes", () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: "First" } }
    );
    expect(document.title).toBe("First");

    rerender({ title: "Second" });
    expect(document.title).toBe("Second");
  });

  it("does not change title when given an empty string", () => {
    document.title = "Keep This";
    renderHook(() => useDocumentTitle(""));
    expect(document.title).toBe("Keep This");
  });
});
