import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypewriter } from "../hooks/useTypewriter";

describe("useTypewriter", () => {
  let rafCallbacks: Array<(time: number) => void>;
  let rafTime: number;
  let originalRaf: typeof requestAnimationFrame;
  let originalCancelRaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame to be controllable via fake timers
    rafCallbacks = [];
    rafTime = 0;
    originalRaf = window.requestAnimationFrame;
    originalCancelRaf = window.cancelAnimationFrame;

    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      const id = rafCallbacks.length;
      rafCallbacks.push(cb as (time: number) => void);
      // Schedule via setTimeout so fake timers can advance it
      setTimeout(() => {
        rafTime += 16; // ~60fps frame
        if (rafCallbacks[id]) {
          (rafCallbacks[id] as FrameRequestCallback)(rafTime);
        }
      }, 0);
      return id;
    };

    window.cancelAnimationFrame = (id: number): void => {
      if (id >= 0 && id < rafCallbacks.length) {
        rafCallbacks[id] = () => {};
      }
    };
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCancelRaf;
    vi.useRealTimers();
  });

  it("returns empty string when text is null", () => {
    const { result } = renderHook(() => useTypewriter(null));
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);
  });

  it("returns empty string when text is empty", () => {
    const { result } = renderHook(() => useTypewriter(""));
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);
  });

  it("starts revealing characters progressively", () => {
    const { result } = renderHook(() => useTypewriter("Hi"));

    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.displayedText.length).toBeGreaterThan(0);
  });

  it("reveals full text after sufficient time", () => {
    const { result } = renderHook(() =>
      useTypewriter("Hello", { charDelay: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.displayedText).toBe("Hello");
    expect(result.current.isComplete).toBe(true);
  });

  it("resets when text changes to a new value", () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, { charDelay: 10 }),
      { initialProps: { text: "First" } }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.displayedText).toBe("First");
    expect(result.current.isComplete).toBe(true);

    // Change to new text
    rerender({ text: "Second" });

    // Should reset
    expect(result.current.isComplete).toBe(false);
  });

  it("calls onComplete when finished", () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useTypewriter("Hi", { charDelay: 10, onComplete })
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete for null text", () => {
    const onComplete = vi.fn();
    renderHook(() => useTypewriter(null, { onComplete }));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("clears animation when text changes to null", () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, { charDelay: 10 }),
      { initialProps: { text: "Hello" } }
    );

    // Advance partially through
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Change to null mid-animation
    rerender({ text: null as unknown as string });
    expect(result.current.displayedText).toBe("");
    expect(result.current.isComplete).toBe(true);
  });
});
