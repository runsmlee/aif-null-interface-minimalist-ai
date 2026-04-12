/**
 * AI response client
 *
 * Streams responses from the /api/chat endpoint (Vercel serverless)
 * which calls the Anthropic Claude API. Supports real-time SSE streaming.
 */

export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

interface SSEData {
  readonly text?: string;
  readonly error?: string;
}

/**
 * Stream an AI response for the given conversation history.
 *
 * Sends the full message history to /api/chat and processes the
 * SSE stream, calling onChunk for each text delta. Returns the
 * complete accumulated text when the stream ends.
 */
export async function fetchAIStream(
  messages: readonly ChatMessage[],
  onChunk: (text: string) => void,
  options?: { signal?: AbortSignal },
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal: options?.signal,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(
      errorData.error || `API request failed with status ${res.status}`,
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body received");

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") continue;

        let parsed: SSEData;
        try {
          parsed = JSON.parse(raw);
        } catch {
          // Skip malformed SSE data lines
          continue;
        }
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.text) {
          fullText += parsed.text;
          onChunk(parsed.text);
        }
      }
    }
  }

  if (fullText.length === 0) {
    throw new Error("Received an empty response from the AI.");
  }

  return fullText;
}
