import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchAIResponse } from "../utils/ai";

describe("fetchAIResponse", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a POST request to /api/chat with the message", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: "Welcome!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await fetchAIResponse("hello");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/chat");
    expect(options?.method).toBe("POST");
    expect(JSON.parse(options?.body as string)).toEqual({ message: "hello" });
    expect(result).toBe("Welcome!");
  });

  it("returns the response string from the API", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: "Great question about focus." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await fetchAIResponse("How can I focus?");
    expect(result).toBe("Great question about focus.");
  });

  it("throws when the API returns a non-200 status", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("Server Error", { status: 500 }),
    );

    await expect(fetchAIResponse("test")).rejects.toThrow(
      "API request failed with status 500",
    );
  });

  it("throws when the API returns an empty response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ response: "" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(fetchAIResponse("test")).rejects.toThrow(
      "Invalid API response: empty or missing response field",
    );
  });

  it("throws when the API returns malformed JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    await expect(fetchAIResponse("test")).rejects.toThrow();
  });
});
