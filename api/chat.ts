import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT =
  "You are a minimalist AI assistant for Null Interface. " +
  "Respond with clarity and brevity. Favor subtraction over addition. " +
  "Help users think more clearly through focused, direct conversation. " +
  "Keep responses concise — aim for quality over quantity. " +
  "Do not use emojis, headers, or markdown formatting unless the user asks for them.";

type MessageRole = "user" | "assistant";

interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export async function POST(req: Request): Promise<Response> {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !Array.isArray(body.messages) ||
    body.messages.length === 0
  ) {
    return Response.json(
      { error: "A non-empty messages array is required" },
      { status: 400 },
    );
  }

  // Validate message shapes
  for (const msg of body.messages) {
    if (
      typeof msg.role !== "string" ||
      (msg.role !== "user" && msg.role !== "assistant") ||
      typeof msg.content !== "string"
    ) {
      return Response.json(
        { error: "Each message must have role ('user'|'assistant') and content (string)" },
        { status: 400 },
      );
    }
  }

  // Check for API key availability
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI service is not configured. Please set the ANTHROPIC_API_KEY environment variable." },
      { status: 503 },
    );
  }

  try {
    const stream = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: body.messages,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              event.delta.text
            ) {
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      const status = error.status ?? 500;
      let message: string;
      if (status === 429) {
        message = "Rate limit reached. Please wait a moment before trying again.";
      } else if (status === 401 || status === 403) {
        message = "API key is invalid or unauthorized.";
      } else if (status === 400) {
        message = "Invalid request. Please check your message and try again.";
      } else {
        message = "Failed to generate a response. Please try again.";
      }
      return Response.json({ error: message }, { status });
    }

    return Response.json(
      { error: "Failed to generate a response. Please try again." },
      { status: 500 },
    );
  }
}
