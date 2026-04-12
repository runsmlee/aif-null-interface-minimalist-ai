import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchAIStream } from "../utils/ai";
import type { ChatMessage } from "../utils/ai";

/**
 * Helper: create a ReadableStream that emits SSE-formatted text chunks.
 */
function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        const chunk = chunks[index]!;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        index++;
      } else {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

describe("fetchAIStream", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const messages: ChatMessage[] = [
    { role: "user", content: "Hello" },
  ];

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a POST request to /api/chat with the messages array", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(sseStream(["Welcome!"]), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const onChunk = vi.fn();
    const result = await fetchAIStream(messages, onChunk);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/chat");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(options?.body as string)).toEqual({ messages });
    expect(result).toBe("Welcome!");
    expect(onChunk).toHaveBeenCalledWith("Welcome!");
  });

  it("streams multiple chunks and calls onChunk for each", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(sseStream(["Hello", ", ", "world", "!"]), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const onChunk = vi.fn();
    const result = await fetchAIStream(messages, onChunk);

    expect(result).toBe("Hello, world!");
    expect(onChunk).toHaveBeenCalledTimes(4);
    expect(onChunk.mock.calls).toEqual([
      ["Hello"],
      [", "],
      ["world"],
      ["!"],
    ]);
  });

  it("throws when the API returns a non-200 status", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Bad request" }), { status: 400 }),
    );

    await expect(fetchAIStream(messages, vi.fn())).rejects.toThrow(
      "Bad request",
    );
  });

  it("throws when the API returns an error in SSE data", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "Model overloaded" })}\n\n`,
              ),
            );
            controller.close();
          },
        }),
        { status: 200, headers: { "Content-Type": "text/event-stream" } },
      ),
    );

    await expect(fetchAIStream(messages, vi.fn())).rejects.toThrow(
      "Model overloaded",
    );
  });

  it("throws when the response body is empty (no text chunks)", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(sseStream([]), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    await expect(fetchAIStream(messages, vi.fn())).rejects.toThrow(
      "Received an empty response from the AI.",
    );
  });

  it("throws when the response has no body", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    await expect(fetchAIStream(messages, vi.fn())).rejects.toThrow(
      "No response body received",
    );
  });

  it("passes AbortSignal to fetch and rejects on abort", async () => {
    const controller = new AbortController();

    fetchMock.mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));

    await expect(
      fetchAIStream(messages, vi.fn(), { signal: controller.signal }),
    ).rejects.toThrow("Aborted");
  });

  it("skips malformed SSE lines without crashing", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode("data: not-valid-json\n\n"));
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: "ok" })}\n\n`),
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        }),
        { status: 200, headers: { "Content-Type": "text/event-stream" } },
      ),
    );

    const result = await fetchAIStream(messages, vi.fn());
    expect(result).toBe("ok");
  });

  it("sends the full conversation history including previous messages", async () => {
    const history: ChatMessage[] = [
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello!" },
      { role: "user", content: "How are you?" },
    ];

    fetchMock.mockResolvedValueOnce(
      new Response(sseStream(["I'm doing well."]), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    await fetchAIStream(history, vi.fn());

    const [, options] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(options?.body as string);
    expect(body.messages).toEqual(history);
  });
});
