import type { Message } from "@/types";

const STORAGE_KEY = "null-interface-messages";

function isValidMessage(msg: unknown): msg is Message {
  if (typeof msg !== "object" || msg === null) return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.timestamp === "number"
  );
}

export function saveMessages(messages: readonly Message[]): void {
  try {
    const serialized = JSON.stringify(messages);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

export function loadMessages(): Message[] {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidMessage);
  } catch {
    return [];
  }
}

export function clearMessages(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently degrade
  }
}
