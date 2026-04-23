import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  exportAsJson,
  exportAsText,
  countWords,
  getDuration,
  formatDuration,
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

describe("formatDuration", () => {
  it("returns empty string for 0 seconds", () => {
    expect(formatDuration(0)).toBe("");
  });

  it("returns empty string for negative seconds", () => {
    expect(formatDuration(-1)).toBe("");
  });

  it('returns "just now" for less than 60 seconds', () => {
    expect(formatDuration(30)).toBe("just now");
    expect(formatDuration(59)).toBe("just now");
    expect(formatDuration(1)).toBe("just now");
  });

  it("formats single minutes correctly", () => {
    expect(formatDuration(60)).toBe("1m");
    expect(formatDuration(300)).toBe("5m");
    expect(formatDuration(3599)).toBe("59m");
  });

  it("formats hours and minutes correctly", () => {
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(5400)).toBe("1h 30m");
    expect(formatDuration(7200)).toBe("2h");
    expect(formatDuration(9000)).toBe("2h 30m");
    expect(formatDuration(3661)).toBe("1h 1m");
  });

  it("formats very long durations", () => {
    expect(formatDuration(86400)).toBe("24h");
    expect(formatDuration(90061)).toBe("25h 1m");
  });
});
