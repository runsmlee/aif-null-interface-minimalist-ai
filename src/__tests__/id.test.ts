import { describe, it, expect, vi } from "vitest";
import { generateId, formatTimestamp } from "../utils/id";

describe("generateId", () => {
  it("returns a string starting with msg-", () => {
    const id = generateId();
    expect(id).toMatch(/^msg-/);
  });

  it("returns unique IDs on successive calls", () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBe(10);
  });

  it("uses crypto.randomUUID under the hood", () => {
    const spy = vi.spyOn(crypto, "randomUUID");
    generateId();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("formatTimestamp", () => {
  it("formats today's timestamp as time only", () => {
    const now = Date.now();
    const formatted = formatTimestamp(now);
    // Should contain hour:minute but not date info
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    expect(formatted).not.toMatch(/[A-Z][a-z]{2}/); // no month abbreviation
  });

  it("formats older timestamps with date and time", () => {
    const oldDate = new Date(2024, 0, 15, 10, 30).getTime();
    const formatted = formatTimestamp(oldDate);
    // Should contain month abbreviation and time
    expect(formatted).toMatch(/Jan/);
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it("handles timestamp at midnight", () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const formatted = formatTimestamp(midnight.getTime());
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });
});
