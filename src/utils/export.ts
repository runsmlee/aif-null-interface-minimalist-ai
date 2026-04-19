import type { Message } from "@/types";

/**
 * Export a conversation as a JSON string.
 */
export function exportAsJson(messages: readonly Message[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      })),
    },
    null,
    2,
  );
}

/**
 * Export a conversation as plain text.
 */
export function exportAsText(messages: readonly Message[]): string {
  const lines = messages.map((m) => {
    const time = new Date(m.timestamp).toLocaleString();
    const role = m.role === "user" ? "You" : "AI";
    return `[${time}] ${role}:\n${m.content}`;
  });
  return `Null Interface — Conversation Export\n${"=".repeat(40)}\n\n${lines.join("\n\n")}`;
}

/**
 * Count total words across all messages.
 */
export function countWords(messages: readonly Message[]): number {
  return messages.reduce((total, m) => {
    const words = m.content.trim().split(/\s+/);
    return total + (m.content.trim() ? words.length : 0);
  }, 0);
}

/**
 * Get conversation duration in seconds (from first to last message).
 */
export function getDuration(messages: readonly Message[]): number {
  if (messages.length < 2) return 0;
  const first = messages[0]?.timestamp ?? 0;
  const last = messages[messages.length - 1]?.timestamp ?? 0;
  return Math.round((last - first) / 1000);
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
