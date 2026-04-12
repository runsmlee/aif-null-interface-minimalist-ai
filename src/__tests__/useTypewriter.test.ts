import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypewriter } from "../hooks/useTypewriter";

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
      vi.advanceTimersByTime(30);
    });

    expect(result.current.displayedText.length).toBeGreaterThan(0);
  });

  it("reveals full text after sufficient time", () => {
    const { result } = renderHook(() =>
      useTypewriter("Hello", { charDelay: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(200);
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
      vi.advanceTimersByTime(200);
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
      vi.advanceTimersByTime(200);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete for null text", () => {
    const onComplete = vi.fn();
    renderHook(() => useTypewriter(null, { onComplete }));

    expect(onComplete).not.toHaveBeenCalled();
  });
});
