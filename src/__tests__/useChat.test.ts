import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "../hooks/useChat";
import * as ai from "../utils/ai";

describe("useChat", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(ai, "simulateAIResponse").mockResolvedValue(
      "This is a test AI response for streaming."
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty messages and no error", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.streamingText).toBeNull();
  });

  it("adds user message and sets streaming text on send", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Tell me about minimalism");
    });

    // User message should be added immediately
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0]?.role).toBe("user");
    expect(result.current.messages[0]?.content).toBe("Tell me about minimalism");

    // Streaming text should be set after AI responds
    expect(result.current.streamingText).toBe(
      "This is a test AI response for streaming."
    );
  });

  it("clears conversation", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.clearConversation();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.streamingText).toBeNull();
  });

  it("finalizes streaming by converting to a message", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.streamingText).not.toBeNull();
    const streamingContent = result.current.streamingText!;

    act(() => {
      result.current.finalizeStreaming();
    });

    // Should add assistant message with the streaming text
    expect(result.current.streamingText).toBeNull();
    const assistantMsg = result.current.messages.find(
      (m) => m.role === "assistant"
    );
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg?.content).toBe(streamingContent);
  });

  it("ignores empty messages", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      result.current.sendMessage("   ");
    });

    expect(result.current.messages.length).toBe(0);
  });

  it("handles error state", async () => {
    vi.spyOn(ai, "simulateAIResponse").mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBe(
      "Something went wrong. Please try again."
    );
  });
});
