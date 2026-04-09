const STORAGE_KEY = "null-interface-messages";

export function saveMessages(messages: readonly unknown[]): void {
  try {
    const serialized = JSON.stringify(messages);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

export function loadMessages(): unknown[] {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed;
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
