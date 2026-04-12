import { describe, it, expect } from "vitest";
import {
  tokenize,
  extractKeywords,
  detectIntent,
  analyzeSentiment,
  analyzeText,
  generateResponse,
} from "../lib/text-analysis";

// ---------------------------------------------------------------------------
// Tokenize
// ---------------------------------------------------------------------------
describe("tokenize", () => {
  it("splits text into lowercase words", () => {
    expect(tokenize("Hello World")).toEqual(["hello", "world"]);
  });

  it("handles punctuation by ignoring it", () => {
    expect(tokenize("What's the deal?")).toEqual(["what's", "the", "deal"]);
  });

  it("returns empty array for empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("keeps contractions as single tokens", () => {
    const tokens = tokenize("I don't think it'll work");
    expect(tokens).toContain("don't");
    expect(tokens).toContain("it'll");
  });
});

// ---------------------------------------------------------------------------
// Extract keywords
// ---------------------------------------------------------------------------
describe("extractKeywords", () => {
  it("removes stop words", () => {
    const tokens = ["i", "think", "minimalism", "is", "important"];
    expect(extractKeywords(tokens)).toEqual(["think", "minimalism", "important"]);
  });

  it("removes very short tokens", () => {
    const tokens = ["a", "be", "do", "it"];
    expect(extractKeywords(tokens)).toEqual([]);
  });

  it("preserves meaningful terms", () => {
    const tokens = ["great", "design", "principles", "matter"];
    expect(extractKeywords(tokens)).toEqual([
      "great",
      "design",
      "principles",
      "matter",
    ]);
  });

  it("returns empty for all-stop-word input", () => {
    expect(extractKeywords(["the", "is", "a", "of"])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Detect intent
// ---------------------------------------------------------------------------
describe("detectIntent", () => {
  it("detects greetings", () => {
    expect(detectIntent("hello", ["hello"])).toBe("greeting");
    expect(detectIntent("Hey there!", ["hey", "there"])).toBe("greeting");
    expect(detectIntent("Good morning", ["good", "morning"])).toBe("greeting");
  });

  it("detects questions by trailing ?", () => {
    expect(detectIntent("What is design?", ["what", "is", "design"])).toBe("question");
  });

  it("detects questions by leading wh-word", () => {
    expect(detectIntent("How can I focus better?", ["how", "can", "focus", "better"])).toBe("question");
  });

  it("detects imperative commands", () => {
    expect(detectIntent("Tell me about minimalism", ["tell", "me", "minimalism"])).toBe("imperative");
    expect(detectIntent("Explain this concept", ["explain", "this", "concept"])).toBe("imperative");
  });

  it("classifies statements with no special markers", () => {
    expect(detectIntent("Design is important", ["design", "is", "important"])).toBe("statement");
  });
});

// ---------------------------------------------------------------------------
// Analyze sentiment
// ---------------------------------------------------------------------------
describe("analyzeSentiment", () => {
  it("detects positive sentiment", () => {
    expect(analyzeSentiment(["this", "is", "great", "and", "beautiful"])).toBe("positive");
  });

  it("detects negative sentiment", () => {
    expect(analyzeSentiment(["this", "is", "terrible", "and", "broken"])).toBe("negative");
  });

  it("detects neutral sentiment", () => {
    expect(analyzeSentiment(["the", "system", "processes", "data"])).toBe("neutral");
  });

  it("counts multiple sentiment words", () => {
    // Two positive > one negative
    expect(analyzeSentiment(["good", "beautiful", "but", "complex"])).toBe("positive");
    // Two negative > one positive
    expect(analyzeSentiment(["good", "but", "ugly", "and", "slow"])).toBe("negative");
  });
});

// ---------------------------------------------------------------------------
// Full pipeline: analyzeText
// ---------------------------------------------------------------------------
describe("analyzeText", () => {
  it("returns a complete analysis object", () => {
    const result = analyzeText("How can I focus better?");
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.keywords).toContain("focus");
    expect(result.intent).toBe("question");
    expect(result.wordCount).toBe(5);
    expect(result.hasQuestionMark).toBe(true);
  });

  it("classifies greetings correctly", () => {
    const result = analyzeText("Hello, how are you?");
    expect(result.intent).toBe("greeting");
  });

  it("extracts keywords from real messages", () => {
    const result = analyzeText("Tell me about minimalism and design principles");
    expect(result.keywords).toContain("minimalism");
    expect(result.keywords).toContain("design");
    expect(result.keywords).toContain("principles");
  });

  it("handles single-word input", () => {
    const result = analyzeText("Focus");
    expect(result.intent).toBe("statement");
    expect(result.keywords).toEqual(["focus"]);
  });

  it("handles empty input gracefully", () => {
    const result = analyzeText("");
    expect(result.tokens).toEqual([]);
    expect(result.keywords).toEqual([]);
    expect(result.intent).toBe("statement");
  });
});

// ---------------------------------------------------------------------------
// Response generation — proves output is composed from analysis
// ---------------------------------------------------------------------------
describe("generateResponse", () => {
  it("produces a greeting response for greeting intent", () => {
    const analysis = analyzeText("hello");
    const response = generateResponse(analysis);
    expect(response).toContain("Null Interface");
    expect(response.length).toBeGreaterThan(50);
  });

  it("incorporates extracted keywords into question responses", () => {
    const analysis = analyzeText("What is minimalism about?");
    const response = generateResponse(analysis);
    // The response should reference the keyword
    expect(response.toLowerCase()).toContain("minimalism");
  });

  it("references multiple keywords for complex questions", () => {
    const analysis = analyzeText("How do minimalism, design, and focus work together?");
    const response = generateResponse(analysis);
    const lower = response.toLowerCase();
    expect(lower).toContain("minimalism");
    expect(lower).toContain("design");
    expect(lower).toContain("focus");
  });

  it("handles imperative commands with structured output", () => {
    const analysis = analyzeText("Explain design principles to me");
    expect(analysis.intent).toBe("imperative");
    const response = generateResponse(analysis);
    expect(response).toContain("design");
    // Imperative responses include numbered steps
    expect(response).toContain("1.");
  });

  it("adapts tone to negative sentiment", () => {
    const analysis = analyzeText("I hate how complex and overwhelming this is");
    const response = generateResponse(analysis);
    const lower = response.toLowerCase();
    // Negative sentiment should produce empathetic response
    expect(lower).toMatch(/frustrat|challeng|difficult|signal|data/);
  });

  it("adapts tone to positive sentiment", () => {
    const analysis = analyzeText("I love how clean and simple this design is");
    const response = generateResponse(analysis);
    const lower = response.toLowerCase();
    expect(lower).toMatch(/appreciate|value|pattern|amplify/);
  });

  it("produces different responses for different intents", () => {
    const q = generateResponse(analyzeText("What is focus?"));
    const g = generateResponse(analyzeText("hello"));
    const i = generateResponse(analyzeText("Explain focus to me"));

    // All non-empty and meaningfully different
    expect(q.length).toBeGreaterThan(50);
    expect(g.length).toBeGreaterThan(50);
    expect(i.length).toBeGreaterThan(50);
    // Greeting should be unique
    expect(q).not.toBe(g);
    expect(i).not.toBe(g);
  });

  it("produces different responses for different topics", () => {
    const r1 = generateResponse(analyzeText("Tell me about design"));
    const r2 = generateResponse(analyzeText("Tell me about programming"));
    expect(r1).not.toBe(r2);
    expect(r1.toLowerCase()).toContain("design");
    expect(r2.toLowerCase()).toContain("programming");
  });

  it("always returns non-empty string for any valid input", () => {
    const inputs = [
      "focus",
      "Why does design matter?",
      "Help me understand this",
      "I'm feeling stuck and overwhelmed",
      "This product is amazing and beautiful",
      "What are the best practices for clean code?",
      "Compare simplicity and complexity",
    ];
    for (const input of inputs) {
      const response = generateResponse(analyzeText(input));
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(20);
    }
  });
});
