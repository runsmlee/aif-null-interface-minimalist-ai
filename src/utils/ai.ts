/**
 * AI response client
 *
 * Sends the user's message to the /api/chat endpoint (served by the Vite
 * dev-server plugin) and returns the dynamically generated response.
 */
const API_ENDPOINT = "/api/chat";

interface ChatResponseBody {
  readonly response: string;
}

/**
 * Request an AI response for the given user message.
 *
 * Makes a real HTTP POST to the /api/chat endpoint.  The server runs a
 * tokenization → keyword extraction → intent classification → sentiment
 * analysis → response generation pipeline on the input and returns a
 * contextually relevant response.
 */
export async function fetchAIResponse(message: string): Promise<string> {
  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }

  const data: ChatResponseBody = await res.json();

  if (typeof data.response !== "string" || data.response.length === 0) {
    throw new Error("Invalid API response: empty or missing response field");
  }

  return data.response;
}
