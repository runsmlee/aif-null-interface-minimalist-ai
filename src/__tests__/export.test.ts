import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  exportAsJson,
  exportAsText,
  countWords,
  getDuration,
  downloadFile,
} from "../utils/export";
import type { Message } from "../types";

const mockMessages: readonly Message[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Hello, this is a test message",
    timestamp: 1000000,
  },
  {
    id: "msg-2",
    role: "assistant",
    content: "This is a test response from the AI",
    timestamp: 1005000,
  },
];

describe("exportAsJson", () => {
  it("exports messages as valid JSON", () => {
    const result = exportAsJson(mockMessages);
    const parsed = JSON.parse(result);
    expect(parsed.messageCount).toBe(2);
    expect(parsed.messages).toHaveLength(2);
  });

  it("includes export timestamp", () => {
    const result = exportAsJson(mockMessages);
    const parsed = JSON.parse(result);
    expect(parsed.exportedAt).toBeTruthy();
    expect(typeof parsed.exportedAt).toBe("string");
  });

  it("formats messages with ISO timestamps", () => {
    const result = exportAsJson(mockMessages);
    const parsed = JSON.parse(result);
    expect(parsed.messages[0]?.timestamp).toBe("1970-01-01T00:16:40.000Z");
  });

  it("handles empty messages array", () => {
    const result = exportAsJson([]);
    const parsed = JSON.parse(result);
    expect(parsed.messageCount).toBe(0);
    expect(parsed.messages).toHaveLength(0);
  });

  it("excludes id from exported messages", () => {
    const result = exportAsJson(mockMessages);
    const parsed = JSON.parse(result);
    expect(parsed.messages[0]).not.toHaveProperty("id");
    expect(parsed.messages[0]).toHaveProperty("role");
    expect(parsed.messages[0]).toHaveProperty("content");
  });
});

describe("exportAsText", () => {
  it("exports messages as readable text", () => {
    const result = exportAsText(mockMessages);
    expect(result).toContain("Null Interface — Conversation Export");
    expect(result).toContain("You:");
    expect(result).toContain("Hello, this is a test message");
    expect(result).toContain("AI:");
    expect(result).toContain("This is a test response from the AI");
  });

  it("handles empty messages array", () => {
    const result = exportAsText([]);
    expect(result).toContain("Null Interface — Conversation Export");
  });
});

describe("countWords", () => {
  it("counts words across all messages", () => {
    expect(countWords(mockMessages)).toBe(14);
  });

  it("returns 0 for empty messages array", () => {
    expect(countWords([])).toBe(0);
  });

  it("handles messages with extra whitespace", () => {
    const messages: readonly Message[] = [
      {
        id: "msg-1",
        role: "user",
        content: "  hello   world  ",
        timestamp: Date.now(),
      },
    ];
    expect(countWords(messages)).toBe(2);
  });

  it("handles empty content", () => {
    const messages: readonly Message[] = [
      {
        id: "msg-1",
        role: "user",
        content: "",
        timestamp: Date.now(),
      },
    ];
    expect(countWords(messages)).toBe(0);
  });
});

describe("getDuration", () => {
  it("returns duration in seconds between first and last message", () => {
    expect(getDuration(mockMessages)).toBe(5);
  });

  it("returns 0 for empty messages", () => {
    expect(getDuration([])).toBe(0);
  });

  it("returns 0 for single message", () => {
    const messages: readonly Message[] = [mockMessages[0]!];
    expect(getDuration(messages)).toBe(0);
  });
});

describe("downloadFile", () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createElementSpy = vi.spyOn(document, "createElement");
    appendChildSpy = vi.spyOn(document.body, "appendChild");
    removeChildSpy = vi.spyOn(document.body, "removeChild");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an anchor element and triggers download", () => {
    const anchor = document.createElement("a");
    const clickSpy = vi.spyOn(anchor, "click");
    createElementSpy.mockReturnValue(anchor);

    downloadFile("test content", "test.json", "application/json");

    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(anchor);
    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
  });
});
