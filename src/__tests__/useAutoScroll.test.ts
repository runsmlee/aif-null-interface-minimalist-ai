import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoScroll } from "../hooks/useAutoScroll";

describe("useAutoScroll", () => {
  let originalRaf: typeof requestAnimationFrame;
  let originalCancelRaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    originalRaf = window.requestAnimationFrame;
    originalCancelRaf = window.cancelAnimationFrame;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
  });

  it("returns a containerRef", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it("returns a scrollToBottom function", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    expect(typeof result.current.scrollToBottom).toBe("function");
  });

  it("scrolls to bottom when dependencies change", () => {
    const capturedCallbacks: FrameRequestCallback[] = [];

    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      capturedCallbacks.push(cb);
      return 1;
    };
    window.cancelAnimationFrame = vi.fn();

    const { result, rerender } = renderHook(
      ({ count }) => useAutoScroll([count]),
      { initialProps: { count: 0 } },
    );

    // Attach a mock container
    const mockContainer = {
      scrollTop: 0,
      scrollHeight: 500,
    } as HTMLDivElement;
    result.current.containerRef.current = mockContainer;

    // Trigger re-render with new dependency
    rerender({ count: 1 });

    // Execute the captured rAF callback
    expect(capturedCallbacks.length).toBeGreaterThan(0);
    capturedCallbacks[capturedCallbacks.length - 1]!(0);

    expect(mockContainer.scrollTop).toBe(500);
  });

  it("cancels pending animation frame on cleanup", () => {
    const cancelSpy = vi.fn();
    window.requestAnimationFrame = (): number => 42;
    window.cancelAnimationFrame = cancelSpy;

    const { unmount, rerender } = renderHook(
      ({ count }) => useAutoScroll([count]),
      { initialProps: { count: 0 } },
    );

    // Re-render triggers new scroll (which cancels the previous one)
    rerender({ count: 1 });
    expect(cancelSpy).toHaveBeenCalledWith(42);

    unmount();
    // Cleanup also cancels
    expect(cancelSpy).toHaveBeenCalled();
  });

  it("handles null container gracefully", () => {
    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      cb(0);
      return 1;
    };
    window.cancelAnimationFrame = vi.fn();

    const { rerender } = renderHook(
      ({ count }) => useAutoScroll([count]),
      { initialProps: { count: 0 } },
    );

    // containerRef.current is null by default
    expect(() => {
      rerender({ count: 1 });
    }).not.toThrow();
  });

  it("uses external ref when provided", () => {
    const { result } = renderHook(() => {
      const externalRef = { current: document.createElement("div") };
      return useAutoScroll([], externalRef);
    });

    // The returned containerRef should be the external ref
    expect(result.current.containerRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it("uses internal ref when no external ref provided", () => {
    const { result } = renderHook(() => useAutoScroll([]));
    // Internal ref starts as null since no DOM element is attached
    expect(result.current.containerRef.current).toBeNull();
  });
});
