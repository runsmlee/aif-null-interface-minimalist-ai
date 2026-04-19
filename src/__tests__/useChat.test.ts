import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "../hooks/useChat";
import * as ai from "../utils/ai";

describe("useChat", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(ai, "fetchAIStream").mockImplementation(
      async (_messages, onChunk) => {
        // Simulate streaming by calling onChunk with each word
        const words = ["This", " ", "is", " ", "a", " ", "test", " ", "response", "."];
        for (const word of words) {
          onChunk(word);
        }
        return "This is a test response.";
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty messages and no error", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.streamingText).toBeNull();
  });

  it("adds user message and accumulates streaming text on send", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Tell me about minimalism");
    });

    // User message should be added
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0]?.role).toBe("user");
    expect(result.current.messages[0]?.content).toBe("Tell me about minimalism");

    // Streaming text should accumulate from chunks
    expect(result.current.streamingText).toBe("This is a test response.");
  });

  it("finalizes streaming by converting to an assistant message", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.streamingText).not.toBeNull();
    const streamingContent = result.current.streamingText!;

    act(() => {
      result.current.finalizeStreaming();
    });

    // Streaming text should be cleared and converted to a message
    expect(result.current.streamingText).toBeNull();
    const assistantMsg = result.current.messages.find(
      (m) => m.role === "assistant",
    );
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg?.content).toBe(streamingContent);
  });

  it("clears conversation and resets state", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.clearConversation();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.streamingText).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isStreaming).toBe(false);
  });

  it("ignores empty messages", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      result.current.sendMessage("   ");
    });

    expect(result.current.messages.length).toBe(0);
    expect(ai.fetchAIStream).not.toHaveBeenCalled();
  });

  it("handles error state", async () => {
    vi.spyOn(ai, "fetchAIStream").mockRejectedValueOnce(
      new Error("Unknown failure"),
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("handles rate limit errors", async () => {
    vi.spyOn(ai, "fetchAIStream").mockRejectedValueOnce(
      new Error("Rate limit: 429"),
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).toContain("Rate limit");
    });
  });

  it("handles network errors", async () => {
    vi.spyOn(ai, "fetchAIStream").mockRejectedValueOnce(
      new Error("network fetch failed"),
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).toContain("Network error");
    });
  });

  it("sends conversation history with new message", async () => {
    const { result } = renderHook(() => useChat());

    // Send first message to build history
    await act(async () => {
      await result.current.sendMessage("First message");
    });

    // Finalize to add assistant response to messages
    act(() => {
      result.current.finalizeStreaming();
    });

    // Send second message — history should include prior messages
    await act(async () => {
      await result.current.sendMessage("Second message");
    });

    const calls = vi.mocked(ai.fetchAIStream).mock.calls;
    const lastCall = calls[calls.length - 1]!;
    const sentMessages = lastCall[0] as readonly ai.ChatMessage[];

    // Should have at least the previous assistant response + new user message
    expect(sentMessages.length).toBeGreaterThanOrEqual(3); // first user + assistant + second user
    expect(sentMessages[sentMessages.length - 1]?.content).toBe("Second message");
  });

  it("persists messages to localStorage", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    act(() => {
      result.current.finalizeStreaming();
    });

    const stored = JSON.parse(
      window.localStorage.getItem("null-interface-messages") ?? "[]",
    );
    expect(stored.length).toBe(2); // user + assistant
  });

  it("restores messages from localStorage on mount", async () => {
    // Pre-populate localStorage
    const saved = [
      { id: "1", role: "user", content: "Hello", timestamp: 1000 },
      { id: "2", role: "assistant", content: "Hi!", timestamp: 1001 },
    ];
    window.localStorage.setItem("null-interface-messages", JSON.stringify(saved));

    const { result } = renderHook(() => useChat());
    // Wait for restoration effect
    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
    });

    expect(result.current.messages[0]?.content).toBe("Hello");
    expect(result.current.messages[1]?.content).toBe("Hi!");
  });

  it("retryLastMessage resends the last user message", async () => {
    vi.spyOn(ai, "fetchAIStream")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockImplementationOnce(async (_messages, onChunk) => {
        onChunk("Retry response");
        return "Retry response";
      });

    const { result } = renderHook(() => useChat());

    // First attempt fails
    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Retry should succeed
    act(() => {
      result.current.retryLastMessage();
    });

    await waitFor(() => {
      expect(result.current.streamingText).toBe("Retry response");
    });

    expect(ai.fetchAIStream).toHaveBeenCalledTimes(2);
  });

  it("deleteMessage removes a specific message by id", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    act(() => {
      result.current.finalizeStreaming();
    });

    expect(result.current.messages.length).toBe(2);

    const userMsgId = result.current.messages[0]?.id!;
    act(() => {
      result.current.deleteMessage(userMsgId);
    });

    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0]?.role).toBe("assistant");
  });

  it("deleteMessage handles non-existent id gracefully", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    act(() => {
      result.current.finalizeStreaming();
    });

    const countBefore = result.current.messages.length;
    act(() => {
      result.current.deleteMessage("non-existent-id");
    });

    expect(result.current.messages.length).toBe(countBefore);
  });
});
