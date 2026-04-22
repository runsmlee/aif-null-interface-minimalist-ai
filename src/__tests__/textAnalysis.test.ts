import { describe, it, expect } from "vitest";
import {
  tokenize,
  extractKeywords,
  detectIntent,
  analyzeSentiment,
  analyzeText,
  generateResponse,
  detectDomain,
} from "../lib/text-analysis";

describe("tokenize", () => {
  it("splits a sentence into lowercase tokens", () => {
    expect(tokenize("Hello World")).toEqual(["hello", "world"]);
  });

  it("handles punctuation correctly", () => {
    expect(tokenize("What is minimalism?")).toEqual([
      "what",
      "is",
      "minimalism",
    ]);
  });

  it("returns empty array for empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("returns empty array for string with only spaces", () => {
    expect(tokenize("   ")).toEqual([]);
  });

  it("handles contractions", () => {
    const tokens = tokenize("I don't like it");
    expect(tokens).toContain("don't");
    expect(tokens).toContain("like");
  });
});

describe("extractKeywords", () => {
  it("removes stop words", () => {
    const result = extractKeywords(["what", "is", "the", "best", "way"]);
    expect(result).not.toContain("what");
    expect(result).not.toContain("is");
    expect(result).not.toContain("the");
    expect(result).toContain("best");
    expect(result).toContain("way");
  });

  it("removes very short tokens (length <= 2)", () => {
    const result = extractKeywords(["hi", "design", "ok"]);
    expect(result).not.toContain("hi");
    expect(result).not.toContain("ok");
    expect(result).toContain("design");
  });

  it("returns empty array for all stop words", () => {
    const result = extractKeywords(["the", "is", "a"]);
    expect(result).toEqual([]);
  });
});

describe("detectIntent", () => {
  it("detects greetings", () => {
    expect(detectIntent("Hello there", tokenize("Hello there"))).toBe(
      "greeting",
    );
    expect(detectIntent("Hi!", tokenize("Hi!"))).toBe("greeting");
    expect(detectIntent("Hey", tokenize("Hey"))).toBe("greeting");
  });

  it("detects questions by question mark", () => {
    expect(detectIntent("What is this?", tokenize("What is this?"))).toBe(
      "question",
    );
  });

  it("detects questions by question-starting words", () => {
    expect(detectIntent("What is this", tokenize("What is this"))).toBe(
      "question",
    );
    expect(detectIntent("How does it work", tokenize("How does it work"))).toBe(
      "question",
    );
  });

  it("detects imperative intent", () => {
    expect(
      detectIntent("Tell me about design", tokenize("Tell me about design")),
    ).toBe("imperative");
    expect(
      detectIntent("Explain this concept", tokenize("Explain this concept")),
    ).toBe("imperative");
    expect(
      detectIntent("Help me focus", tokenize("Help me focus")),
    ).toBe("imperative");
  });

  it("detects statements as default", () => {
    expect(
      detectIntent("I like this design", tokenize("I like this design")),
    ).toBe("statement");
  });

  it("question mark overrides imperative verb", () => {
    expect(
      detectIntent("Tell me what?", tokenize("Tell me what?")),
    ).toBe("question");
  });
});

describe("analyzeSentiment", () => {
  it("detects positive sentiment", () => {
    expect(analyzeSentiment(["great", "beautiful", "love"])).toBe("positive");
  });

  it("detects negative sentiment", () => {
    expect(analyzeSentiment(["bad", "hate", "terrible"])).toBe("negative");
  });

  it("returns neutral for balanced or neutral words", () => {
    expect(analyzeSentiment(["design", "system", "approach"])).toBe("neutral");
    expect(analyzeSentiment(["good", "bad"])).toBe("neutral");
  });

  it("returns neutral for empty tokens", () => {
    expect(analyzeSentiment([])).toBe("neutral");
  });
});

describe("analyzeText", () => {
  it("returns a complete analysis object", () => {
    const result = analyzeText("What is good design?");
    expect(result).toHaveProperty("tokens");
    expect(result).toHaveProperty("keywords");
    expect(result).toHaveProperty("intent");
    expect(result).toHaveProperty("sentiment");
    expect(result).toHaveProperty("wordCount");
    expect(result).toHaveProperty("hasQuestionMark");
  });

  it("detects question mark in input", () => {
    const result = analyzeText("What is this?");
    expect(result.hasQuestionMark).toBe(true);
  });

  it("reports no question mark when absent", () => {
    const result = analyzeText("Tell me about design");
    expect(result.hasQuestionMark).toBe(false);
  });

  it("counts words correctly", () => {
    const result = analyzeText("one two three four");
    expect(result.wordCount).toBe(4);
  });
});

describe("generateResponse", () => {
  it("generates a greeting response", () => {
    const analysis = analyzeText("Hello");
    const response = generateResponse(analysis);
    expect(response).toContain("Welcome");
    expect(response.length).toBeGreaterThan(10);
  });

  it("generates a question response", () => {
    const analysis = analyzeText("What is minimalism?");
    const response = generateResponse(analysis);
    expect(response.length).toBeGreaterThan(20);
  });

  it("generates an imperative response", () => {
    const analysis = analyzeText("Help me focus");
    const response = generateResponse(analysis);
    expect(response).toContain("1.");
    expect(response).toContain("2.");
    expect(response).toContain("3.");
  });

  it("generates a statement response", () => {
    const analysis = analyzeText("I love this design");
    const response = generateResponse(analysis);
    expect(response.length).toBeGreaterThan(20);
  });

  it("handles short questions with focused response", () => {
    const analysis = analyzeText("Why?");
    const response = generateResponse(analysis);
    expect(response).toContain("Good question");
  });

  it("handles negative sentiment in questions", () => {
    const analysis = analyzeText("Why is this so confusing and difficult?");
    const response = generateResponse(analysis);
    expect(response.length).toBeGreaterThan(20);
  });

  it("handles positive sentiment in statements", () => {
    const analysis = analyzeText("I really love this beautiful design");
    const response = generateResponse(analysis);
    expect(response).toContain("appreciate");
  });

  it("handles negative sentiment in statements", () => {
    const analysis = analyzeText("This is terrible and frustrating");
    const response = generateResponse(analysis);
    expect(response).toContain("challenging");
  });

  it("handles multi-keyword questions with structured response", () => {
    const analysis = analyzeText(
      "How do design, architecture, and usability relate?",
    );
    const response = generateResponse(analysis);
    expect(response).toContain("First");
    expect(response).toContain("Second");
  });
});

describe("detectDomain", () => {
  it("detects design domain from keywords", () => {
    expect(detectDomain(["design", "interface"])).toBe("design");
    expect(detectDomain(["ux", "layout"])).toBe("design");
    expect(detectDomain(["typography", "color"])).toBe("design");
  });

  it("detects technology domain from keywords", () => {
    expect(detectDomain(["code", "programming"])).toBe("technology");
    expect(detectDomain(["react", "javascript"])).toBe("technology");
    expect(detectDomain(["frontend", "debug"])).toBe("technology");
  });

  it("detects productivity domain from keywords", () => {
    expect(detectDomain(["focus", "productivity"])).toBe("productivity");
    expect(detectDomain(["habit", "routine"])).toBe("productivity");
    expect(detectDomain(["schedule", "priority"])).toBe("productivity");
  });

  it("detects creativity domain from keywords", () => {
    expect(detectDomain(["creative", "inspiration"])).toBe("creativity");
    expect(detectDomain(["art", "music"])).toBe("creativity");
    expect(detectDomain(["brainstorm", "idea"])).toBe("creativity");
  });

  it("detects philosophy domain from keywords", () => {
    expect(detectDomain(["think", "meaning"])).toBe("philosophy");
    expect(detectDomain(["purpose", "life"])).toBe("philosophy");
    expect(detectDomain(["wisdom", "truth"])).toBe("philosophy");
  });

  it("returns general for unrecognized keywords", () => {
    expect(detectDomain(["random", "words"])).toBe("general");
    expect(detectDomain([])).toBe("general");
  });

  it("prioritizes domain by iteration order when keywords match multiple", () => {
    // "design" is checked first in domain order, so it wins over technology keywords
    expect(detectDomain(["code", "design"])).toBe("design");
    // When only technology keywords are present, technology domain is detected
    expect(detectDomain(["code", "debug"])).toBe("technology");
  });
});

describe("generateResponse domain tips", () => {
  it("appends design tip for design-related input", () => {
    const analysis = analyzeText("What makes good interface design?");
    const response = generateResponse(analysis);
    expect(response).toContain("Design tip");
  });

  it("appends technology tip for tech-related input", () => {
    const analysis = analyzeText("How should I structure my React code?");
    const response = generateResponse(analysis);
    expect(response).toContain("Tech tip");
  });

  it("appends productivity tip for productivity-related input", () => {
    const analysis = analyzeText("How can I improve my focus and productivity?");
    const response = generateResponse(analysis);
    expect(response).toContain("Focus tip");
  });

  it("appends creativity tip for creativity-related input", () => {
    const analysis = analyzeText("Help me think more creatively about art and music");
    const response = generateResponse(analysis);
    expect(response).toContain("Creativity tip");
  });

  it("appends philosophy thought for philosophy-related input", () => {
    const analysis = analyzeText("What is the meaning and purpose of life?");
    const response = generateResponse(analysis);
    expect(response).toContain("Thought");
  });

  it("does not append tip for general domain input", () => {
    const analysis = analyzeText("The weather is nice today.");
    const response = generateResponse(analysis);
    expect(response).not.toContain("tip");
    expect(response).not.toContain("Tip");
    expect(response).not.toContain("Thought");
  });
});
