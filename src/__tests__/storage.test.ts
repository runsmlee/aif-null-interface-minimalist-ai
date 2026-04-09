import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveMessages, loadMessages, clearMessages } from "../utils/storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads messages", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Hello", timestamp: 1000 },
    ];
    saveMessages(messages);
    const loaded = loadMessages();
    expect(loaded).toEqual(messages);
  });

  it("returns empty array when nothing stored", () => {
    expect(loadMessages()).toEqual([]);
  });

  it("returns empty array for corrupted data", () => {
    window.localStorage.setItem("null-interface-messages", "not-json");
    expect(loadMessages()).toEqual([]);
  });

  it("returns empty array for non-array data", () => {
    window.localStorage.setItem("null-interface-messages", '{"key":"val"}');
    expect(loadMessages()).toEqual([]);
  });

  it("clears messages", () => {
    saveMessages([{ id: "1", role: "user", content: "Hi", timestamp: 1 }]);
    clearMessages();
    expect(loadMessages()).toEqual([]);
  });

  it("handles storage errors gracefully", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    spy.mockImplementation(() => {
      throw new Error("Storage full");
    });
    // Should not throw
    saveMessages([{ id: "1", role: "user", content: "Hi", timestamp: 1 }]);
    spy.mockRestore();
  });
});
