/**
 * Vite Server Plugin — /api/chat endpoint
 *
 * Adds a POST /api/chat middleware to Vite's dev server. The endpoint runs the
 * text-analysis pipeline on the user's message and returns a dynamically
 * generated response.
 */
import type { Plugin } from "vite";
import { analyzeText, generateResponse } from "../src/lib/text-analysis";

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
            const data = JSON.parse(raw) as { message?: unknown };

            if (typeof data.message !== "string" || data.message.trim().length === 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "A non-empty message string is required" }));
              return;
            }

            const message = data.message.trim();

            // Run the real text-analysis pipeline
            const analysis = analyzeText(message);
            const response = generateResponse(analysis);

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ response }));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid request body" }));
          }
        });
      });
    },
  };
}
