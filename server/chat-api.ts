/**
 * Vite Server Plugin — /api/chat endpoint
 *
 * Adds a POST /api/chat middleware to Vite's dev server. The endpoint runs the
 * text-analysis pipeline on the user's message and returns a dynamically
 * generated response as an SSE stream, matching the same format as the
 * production API endpoint.
 */
import type { Plugin } from "vite";
import { analyzeText, generateResponse } from "../src/lib/text-analysis";

interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

interface ChatRequest {
  readonly messages?: readonly ChatMessage[];
  readonly message?: string;
}

export function chatApiPlugin(): Plugin {
  return {
    name: "null-interface-chat-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", (req, res) => {
        // Only accept POST
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        // Accumulate request body
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));

        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf-8");
            const data = JSON.parse(raw) as ChatRequest;

            // Accept both { messages: [...] } and { message: string } formats
            let userMessage: string;

            if (
              Array.isArray(data.messages) &&
              data.messages.length > 0
            ) {
              // Extract the last user message from the array
              const lastUserMsg = [...data.messages].reverse().find(
                (m) => m.role === "user",
              );
              if (!lastUserMsg || typeof lastUserMsg.content !== "string" || lastUserMsg.content.trim().length === 0) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error:
                      "A non-empty user message is required",
                  }),
                );
                return;
              }
              userMessage = lastUserMsg.content.trim();
            } else if (
              typeof data.message === "string" &&
              data.message.trim().length > 0
            ) {
              userMessage = data.message.trim();
            } else {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    "A non-empty messages array or message string is required",
                }),
              );
              return;
            }

            // Run the real text-analysis pipeline
            const analysis = analyzeText(userMessage);
            const response = generateResponse(analysis);

            // Stream response as SSE to match the production API format
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache, no-transform");
            res.setHeader("Connection", "keep-alive");

            // Stream character-by-character with a small delay for realism
            const words = response.split(" ");
            let wordIndex = 0;

            const sendNextChunk = (): void => {
              if (wordIndex < words.length) {
                const word = words[wordIndex]!;
                const chunk = wordIndex === 0 ? word : ` ${word}`;
                const sseData = JSON.stringify({ text: chunk });
                res.write(`data: ${sseData}\n\n`);
                wordIndex++;
                // Small delay between chunks for streaming feel
                setTimeout(sendNextChunk, 10);
              } else {
                res.write("data: [DONE]\n\n");
                res.end();
              }
            };

            sendNextChunk();
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({ error: "Invalid request body" }),
            );
          }
        });
      });
    },
  };
}
