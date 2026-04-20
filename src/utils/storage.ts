import type { Message } from "@/types";

const STORAGE_KEY = "null-interface-messages";
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB safety limit
const DEBOUNCE_MS = 500;

interface RawStorageMessage {
  readonly id?: unknown;
  readonly role?: unknown;
  readonly content?: unknown;
  readonly timestamp?: unknown;
}

function isValidMessage(msg: unknown): msg is Message {
  if (typeof msg !== "object" || msg === null) return false;
  const m = msg as RawStorageMessage;
  return (
    typeof m.id === "string" &&
    m.id.length > 0 &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.timestamp === "number" &&
    m.timestamp > 0 &&
    Number.isFinite(m.timestamp)
  );
}

function sanitizeContent(content: string): string {
  // Truncate extremely long content as a safety measure
  const MAX_CONTENT_LENGTH = 100_000;
  if (content.length > MAX_CONTENT_LENGTH) {
    return content.slice(0, MAX_CONTENT_LENGTH);
  }
  return content;
}

export function saveMessages(messages: readonly Message[]): void {
  try {
    const sanitized = messages.map((m) => ({
      ...m,
      content: sanitizeContent(m.content),
    }));
    const serialized = JSON.stringify(sanitized);

    // Safety check: don't write excessively large data
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.warn(
        `Storage limit exceeded (${Math.round(serialized.length / 1024)}KB). Truncating to recent messages.`,
      );
      // Keep only the last 100 messages
      const truncated = sanitized.slice(-100);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(truncated));
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

/** Validate and narrow an unknown array into typed Message array. */
function validateMessageArray(raw: unknown): Message[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidMessage);
}

export function loadMessages(): Message[] {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    const parsed: unknown = JSON.parse(serialized);
    return validateMessageArray(parsed);
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

/**
 * Encapsulated debounce timer — avoids leaking module-level mutable state
 * across test runs or hot-module-reloading boundaries.
 */
const debounceState = {
  timer: null as ReturnType<typeof setTimeout> | null,

  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  schedule(fn: () => void, ms: number): void {
    this.cancel();
    this.timer = setTimeout(() => {
      this.timer = null;
      fn();
    }, ms);
  },
};

/** Debounced save — coalesces rapid state changes into a single write. */
export function debouncedSave(messages: readonly Message[]): void {
  debounceState.schedule(() => saveMessages(messages), DEBOUNCE_MS);
}

/** Cancel any pending debounced save (useful during cleanup). */
export function cancelPendingSave(): void {
  debounceState.cancel();
}
