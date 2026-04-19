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

  it("filters out invalid messages", () => {
    const mixed = JSON.stringify([
      { id: "1", role: "user", content: "Hello", timestamp: 1000 },
      { id: "2" }, // missing required fields
      { id: "3", role: "invalid", content: "Bad", timestamp: 1001 },
      { id: "4", role: "assistant", content: "Good", timestamp: 1002 },
    ]);
    window.localStorage.setItem("null-interface-messages", mixed);
    const loaded = loadMessages();
    expect(loaded).toHaveLength(2);
    expect(loaded[0]?.content).toBe("Hello");
    expect(loaded[1]?.content).toBe("Good");
  });

  it("filters out messages with empty id", () => {
    const data = JSON.stringify([
      { id: "", role: "user", content: "No ID", timestamp: 1000 },
      { id: "valid", role: "user", content: "Valid", timestamp: 1001 },
    ]);
    window.localStorage.setItem("null-interface-messages", data);
    const loaded = loadMessages();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.content).toBe("Valid");
  });

  it("filters out messages with zero timestamp", () => {
    const data = JSON.stringify([
      { id: "1", role: "user", content: "No time", timestamp: 0 },
      { id: "2", role: "user", content: "Has time", timestamp: 1000 },
    ]);
    window.localStorage.setItem("null-interface-messages", data);
    const loaded = loadMessages();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.content).toBe("Has time");
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
