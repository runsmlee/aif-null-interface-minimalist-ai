import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  it("calls onFocusInput when '/' is pressed outside of inputs", () => {
    const onFocusInput = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onFocusInput }));

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "/", bubbles: true })
      );
    });

    expect(onFocusInput).toHaveBeenCalledTimes(1);
  });

  it("does not call onFocusInput when '/' is pressed inside an input", () => {
    const onFocusInput = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onFocusInput }));

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "/", bubbles: true })
      );
    });

    expect(onFocusInput).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it("removes event listener on unmount", () => {
    const onFocusInput = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({ onFocusInput })
    );

    unmount();

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "/", bubbles: true })
      );
    });

    expect(onFocusInput).not.toHaveBeenCalled();
  });

  it("calls onFocusInput when Cmd+K is pressed", () => {
    const onFocusInput = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onFocusInput }));

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
      );
    });

    expect(onFocusInput).toHaveBeenCalledTimes(1);
  });

  it("calls onFocusInput when Ctrl+K is pressed", () => {
    const onFocusInput = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onFocusInput }));

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
      );
    });

    expect(onFocusInput).toHaveBeenCalledTimes(1);
  });

  it("does not call onFocusInput when K is pressed without modifier", () => {
    const onFocusInput = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onFocusInput }));

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", bubbles: true })
      );
    });

    expect(onFocusInput).not.toHaveBeenCalled();
  });

  it("Cmd+K works even when an input is focused", () => {
    const onFocusInput = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onFocusInput }));

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
      );
    });

    expect(onFocusInput).toHaveBeenCalledTimes(1);
    document.body.removeChild(textarea);
  });
});
