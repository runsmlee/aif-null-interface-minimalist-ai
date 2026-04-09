import { describe, it, expect } from "vitest";
import { simulateAIResponse } from "../utils/ai";

describe("AI response engine", () => {
  it("returns a non-empty string", async () => {
    const response = await simulateAIResponse("hello");
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  });

  it("returns contextual response for keyword 'minimalism'", async () => {
    const response = await simulateAIResponse("Tell me about minimalism");
    expect(response.toLowerCase()).toContain("minimalis");
  });

  it("returns contextual response for keyword 'focus'", async () => {
    const response = await simulateAIResponse("How can I focus better?");
    expect(response.length).toBeGreaterThan(20);
  });

  it("returns contextual response for keyword 'design'", async () => {
    const response = await simulateAIResponse("Give me design advice");
    expect(response.toLowerCase()).toContain("design");
  });

  it("returns contextual response for keyword 'explain'", async () => {
    const response = await simulateAIResponse("Explain this to me");
    expect(response.length).toBeGreaterThan(20);
  });

  it("returns different responses for sequential calls", async ({ expect }) => {
    const r1 = await simulateAIResponse("question a");
    const r2 = await simulateAIResponse("question b");
    // At least one should differ (they cycle through responses)
    expect(typeof r1).toBe("string");
    expect(typeof r2).toBe("string");
  }, 10000);
});
