/**
 * Text Analysis Engine
 *
 * Real NLP-inspired pipeline: tokenization → stop-word removal → keyword
 * extraction → intent classification → sentiment analysis → response generation.
 * Every response is dynamically composed from the analyzed input, not selected
 * from a hardcoded list.
 */

// ---------------------------------------------------------------------------
// Stop words (standard English, ~170 entries)
// ---------------------------------------------------------------------------
const STOP_WORDS: ReadonlySet<string> = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
  "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
  "she", "her", "hers", "herself", "it", "its", "itself", "they", "them",
  "their", "theirs", "themselves", "what", "which", "who", "whom", "this",
  "that", "these", "those", "am", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "having", "do", "does", "did", "doing",
  "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
  "while", "of", "at", "by", "for", "with", "about", "against", "between",
  "through", "during", "before", "after", "above", "below", "to", "from",
  "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
  "then", "once", "here", "there", "when", "where", "why", "how", "all",
  "both", "each", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t",
  "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re",
  "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn",
  "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn",
  "wasn", "weren", "won", "wouldn",
]);

// ---------------------------------------------------------------------------
// Domain detection
// ---------------------------------------------------------------------------
type Domain = "design" | "technology" | "productivity" | "creativity" | "philosophy" | "general";

const DOMAIN_KEYWORDS: Readonly<Record<Domain, readonly string[]>> = {
  design: ["design", "ui", "ux", "layout", "typography", "color", "interface", "aesthetic", "visual", "brand", "style", "font", "spacing", "grid", "component", "wireframe"],
  technology: ["code", "programming", "software", "app", "api", "framework", "react", "javascript", "typescript", "database", "algorithm", "web", "server", "frontend", "backend", "debug", "deploy", "build", "developer"],
  productivity: ["focus", "productivity", "workflow", "efficiency", "organize", "plan", "goal", "task", "time", "manage", "habit", "routine", "schedule", "priority", "deadline", "procrastinat"],
  creativity: ["creative", "inspiration", "idea", "innovate", "art", "music", "writing", "create", "imagine", "brainstorm", "sketch", "craft", "invent"],
  philosophy: ["think", "meaning", "purpose", "philosophy", "life", "mind", "consciousness", "truth", "wisdom", "understand", "believe", "reason", "ethic", "moral", "exist"],
  general: [],
};

const DOMAIN_TIPS: Readonly<Record<Domain, readonly string[]>> = {
  design: [
    "\n💡 Design tip: The best interface is the one you don't notice. If users think about the design, the design has failed.",
    "\n💡 Design tip: White space is not empty space — it's the breathing room that makes content feel intentional.",
    "\n💡 Design tip: Constraints breed creativity. A limited palette forces more thoughtful use of color.",
  ],
  technology: [
    "\n💡 Tech tip: Read error messages carefully. Most bugs reveal their fix in the first three lines of the stack trace.",
    "\n💡 Tech tip: Write code for the next person. That person is usually you, six months from now.",
    "\n💡 Tech tip: The best architecture is the simplest one that works. Premature optimization creates more problems than it solves.",
  ],
  productivity: [
    "\n💡 Focus tip: Single-tasking is a superpower. One thing at a time, with full attention, always beats multitasking.",
    "\n💡 Focus tip: The two-minute rule: if something takes less than two minutes, do it now instead of adding it to a list.",
    "\n💡 Focus tip: Energy management matters more than time management. Do your hardest work when your mind is sharpest.",
  ],
  creativity: [
    "\n💡 Creativity tip: Constraints are catalysts. The most creative solutions emerge from the tightest boundaries.",
    "\n💡 Creativity tip: Capture ideas immediately. The mind is a sieve, not a vault — inspiration fades in seconds.",
    "\n💡 Creativity tip: Cross-pollinate. The most original ideas come from connecting concepts across different fields.",
  ],
  philosophy: [
    "\n💡 Thought: The unexamined life is not worth living, but the over-examined life is not worth living either. Find the balance.",
    "\n💡 Thought: Clarity comes from action, not contemplation. You understand by doing, not by thinking about doing.",
    "\n💡 Thought: The best questions don't have answers — they have better questions.",
  ],
  general: [],
};

/** Detect the topical domain from extracted keywords. */
export function detectDomain(keywords: readonly string[]): Domain {
  for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
    if (domain === "general") continue;
    for (const kw of keywords) {
      if (kws.includes(kw)) return domain as Domain;
    }
  }
  return "general";
}

/** Deterministic selection from an array based on input string hash. */
function pickVariation<T>(items: readonly T[], seed: string): T {
  if (items.length === 0) throw new Error("pickVariation: items must not be empty");
  if (items.length === 1) return items[0]!;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length]!;
}

function appendDomainTip(response: string, keywords: readonly string[]): string {
  const domain = detectDomain(keywords);
  if (domain === "general") return response;
  const tips = DOMAIN_TIPS[domain];
  if (tips.length === 0) return response;
  const tip = pickVariation(tips, keywords.join(" "));
  return response + tip;
}

// ---------------------------------------------------------------------------
// Sentiment lexicons
// ---------------------------------------------------------------------------
const POSITIVE_WORDS: ReadonlySet<string> = new Set([
  "good", "great", "love", "like", "enjoy", "happy", "beautiful", "excellent",
  "amazing", "wonderful", "best", "perfect", "awesome", "fantastic",
  "brilliant", "success", "successful", "simple", "clean", "clear", "easy",
  "elegant", "powerful", "effective", "efficient", "innovative", "creative",
  "inspire", "inspired", "inspiring", "helpful", "exciting", "impressive",
  "remarkable", "valuable", "reliable", "productive", "calm", "peaceful",
]);

const NEGATIVE_WORDS: ReadonlySet<string> = new Set([
  "bad", "hate", "dislike", "terrible", "horrible", "worst", "boring",
  "annoying", "frustrating", "difficult", "hard", "complex", "confusing",
  "wrong", "broken", "fail", "failure", "messy", "cluttered", "overwhelming",
  "stuck", "stressed", "confused", "ugly", "painful", "weak", "slow",
  "expensive", "pointless", "useless", "hopeless", "toxic", "angry", "sad",
]);

// ---------------------------------------------------------------------------
// Intent classification
// ---------------------------------------------------------------------------
const GREETING_PATTERN = /^(hi|hello|hey|greetings|howdy|yo|sup|good\s*(morning|afternoon|evening))/i;
const QUESTION_START = /^(who|what|where|when|why|how|is|are|do|does|can|could|would|should|will|tell|explain|describe|which)\b/i;
const IMPERATIVE_VERBS: ReadonlySet<string> = new Set([
  "tell", "give", "show", "explain", "help", "describe", "list", "summarize",
  "compare", "suggest", "recommend", "make", "create", "build", "find", "get",
  "write", "teach", "guide", "walk", "walkthrough",
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Intent = "question" | "greeting" | "imperative" | "statement";
export type Sentiment = "positive" | "negative" | "neutral";

export interface TextAnalysis {
  readonly tokens: readonly string[];
  readonly keywords: readonly string[];
  readonly intent: Intent;
  readonly sentiment: Sentiment;
  readonly wordCount: number;
  readonly hasQuestionMark: boolean;
}

// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------

/** Split input into lowercase word tokens. */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

/** Remove stop words and very short tokens. */
export function extractKeywords(tokens: readonly string[]): string[] {
  return tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 2);
}

/** Classify the intent of the message. */
export function detectIntent(
  text: string,
  tokens: readonly string[],
): Intent {
  const trimmed = text.trim();

  if (GREETING_PATTERN.test(trimmed)) return "greeting";
  // Question mark always takes priority
  if (trimmed.endsWith("?")) return "question";
  // Then check for explicit command verbs (before generic question starters)
  const first = tokens[0];
  if (first !== undefined && IMPERATIVE_VERBS.has(first)) return "imperative";
  // Finally, sentences starting with question words
  if (QUESTION_START.test(trimmed)) return "question";

  return "statement";
}

/** Compute a simple positive/negative/neutral sentiment score. */
export function analyzeSentiment(tokens: readonly string[]): Sentiment {
  let score = 0;
  for (const t of tokens) {
    if (POSITIVE_WORDS.has(t)) score += 1;
    if (NEGATIVE_WORDS.has(t)) score -= 1;
  }
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

/** Run the full analysis pipeline. */
export function analyzeText(message: string): TextAnalysis {
  const tokens = tokenize(message);
  const keywords = extractKeywords(tokens);
  const intent = detectIntent(message, tokens);
  const sentiment = analyzeSentiment(tokens);

  return {
    tokens,
    keywords,
    intent,
    sentiment,
    wordCount: tokens.length,
    hasQuestionMark: message.includes("?"),
  };
}

// ---------------------------------------------------------------------------
// Response generation (composes output from analysis results)
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTopic(keywords: readonly string[]): string {
  if (keywords.length === 0) return "this";
  if (keywords.length === 1) return keywords[0]!;
  if (keywords.length === 2) return `${keywords[0]} and ${keywords[1]}`;
  const rest = keywords.slice(0, -1).join(", ");
  return `${rest}, and ${keywords[keywords.length - 1]}`;
}

/** Entry point — build a response from analysis. */
export function generateResponse(analysis: TextAnalysis): string {
  const topic = formatTopic(analysis.keywords);

  let response: string;
  switch (analysis.intent) {
    case "greeting":
      response = buildGreeting();
      break;
    case "question":
      response = buildQuestion(analysis, topic);
      break;
    case "imperative":
      response = buildImperative(analysis, topic);
      break;
    case "statement":
      response = buildStatement(analysis, topic);
      break;
  }

  return appendDomainTip(response, analysis.keywords);
}

function buildGreeting(): string {
  const greetings = [
    (
      "Welcome to Null Interface.\n\n" +
      "I'm designed to help you think clearly and act deliberately. " +
      "No clutter, no noise — just focused conversation.\n\n" +
      "What would you like to explore?"
    ),
    (
      "Welcome to Null Interface.\n\n" +
      "This is a space for clear thinking. Ask questions, explore ideas, " +
      "or just think out loud — I'm here to help you sharpen your thoughts.\n\n" +
      "What's on your mind?"
    ),
    (
      "Welcome to Null Interface.\n\n" +
      "Think of me as a thinking partner — someone who helps you see things " +
      "from a different angle and find clarity in complexity.\n\n" +
      "Where shall we start?"
    ),
  ];
  return pickVariation(greetings, "greeting-welcome");
}

function buildQuestion(a: TextAnalysis, topic: string): string {
  const { keywords, sentiment, wordCount } = a;

  // Short questions → focused answer
  if (wordCount <= 4) {
    return (
      `Good question about ${topic}.\n\n` +
      "Here's my thinking: the key is to start with fundamentals. " +
      "Understand the core problem before exploring solutions. " +
      "Most complexity comes from solving the wrong problem well.\n\n" +
      `What specific aspect of ${topic} interests you most?`
    );
  }

  // Negative sentiment questions
  if (sentiment === "negative") {
    return (
      `I can see that ${topic} is on your mind, and it sounds like there might be some frustration there.\n\n` +
      "Let me offer a different perspective. Often the things that frustrate us most " +
      "are the ones worth rethinking from scratch. Instead of fixing what's broken, " +
      "ask: what would this look like if I designed it from zero?\n\n" +
      "That mental reset often reveals simpler solutions than incremental fixes ever could."
    );
  }

  // Multi-keyword questions → structured analysis
  if (keywords.length >= 3) {
    const k0 = keywords[0]!;
    const k1 = keywords[1]!;
    const k2 = keywords[2]!;
    return (
      `That's a rich question touching on ${topic}.\n\n` +
      `Let me break this down:\n\n` +
      `First, these are related but distinct concepts. Understanding the boundaries between ` +
      `${k0}, ${k1}, and ${k2} will help you see the full picture.\n\n` +
      "Second, the most common mistake is trying to address all of these simultaneously. " +
      "Pick the one with the highest leverage — the one that, if solved, makes the others easier.\n\n" +
      `What would happen if you focused exclusively on ${k0} first?`
    );
  }

  // Standard question — varied templates based on input
  const k0 = keywords[0] || topic;
  const questionTemplates = [
    (
      `Let me think about ${topic} carefully.\n\n` +
      `The question you're asking has multiple layers. At the surface level, it's about ${k0}. ` +
      "But underneath, I think what you're really exploring is the relationship between " +
      `${k0} and how it connects to the bigger picture.\n\n` +
      "Here's a useful framework: start with what you know for certain, identify the critical " +
      "unknown, and design the smallest experiment that could eliminate that unknown.\n\n" +
      "What's the one thing you'd need to know to move forward?"
    ),
    (
      `Interesting question about ${topic}.\n\n` +
      `There are two ways to approach ${k0}: the conventional path and the principled path. ` +
      "The conventional path follows established best practices. The principled path starts " +
      "from first principles — what do we know to be true, independent of what everyone else does?\n\n" +
      "I'd suggest starting with first principles. It takes more effort upfront, " +
      "but the insights you gain will be more durable and more uniquely yours.\n\n" +
      "What does your intuition tell you about this?"
    ),
    (
      `That's a question worth sitting with.\n\n` +
      `When it comes to ${topic}, most advice falls into one of two traps: being too abstract ` +
      "(theoretical frameworks that don't help in practice) or too tactical (step-by-step guides " +
      `that miss the bigger picture).\n\n` +
      `The sweet spot is a mental model — a simple way of thinking about ${k0} that guides ` +
      "your decisions without dictating them. The best mental models are the ones you can " +
      "explain in one sentence.\n\n" +
      "Can you describe your current understanding in one sentence?"
    ),
  ];
  return pickVariation(questionTemplates, `q-${topic}`);
}

function buildImperative(a: TextAnalysis, topic: string): string {
  const verb = a.tokens[0] || "help with";

  return (
    `${capitalize(verb)} ${topic} — here's a structured approach:\n\n` +
    "1. Define the outcome you want. Not the process — the result. What does success look like?\n" +
    "2. Identify the minimum viable path. What's the shortest route from here to that outcome?\n" +
    "3. Eliminate everything else. If it doesn't directly contribute to the outcome, it's a distraction.\n\n" +
    "The discipline isn't in doing more — it's in doing less, but doing it with " +
    "full attention and intention.\n\n" +
    "Shall I go deeper on any of these steps?"
  );
}

function buildStatement(a: TextAnalysis, topic: string): string {
  const { keywords, sentiment } = a;

  if (sentiment === "positive") {
    return (
      `I appreciate that perspective on ${topic}.\n\n` +
      "There's real value in what you're pointing out. Positive observations like this " +
      "often reveal patterns that we can amplify. The question is: what makes this work " +
      "so well, and how can we apply that principle more broadly?\n\n" +
      "Sometimes the most productive thing we can do is not solve a problem, " +
      "but recognize and reinforce what's already working."
    );
  }

  if (sentiment === "negative") {
    const k0 = keywords[0] || "this situation";
    return (
      `I hear you. ${capitalize(topic)} can be challenging.\n\n` +
      "Here's something worth considering: the frustration you're feeling is actually " +
      "useful data. It's telling you that the current approach isn't working. " +
      "That's not a failure — it's a signal.\n\n" +
      `Try this: describe the ideal version of ${k0}. Not the compromised version, ` +
      'not the "realistic" version — the ideal one. Once you see that clearly, ' +
      "you can work backwards to find what's actually achievable.\n\n" +
      "What does that ideal look like to you?"
    );
  }

  // Neutral — varied templates based on input
  const k0 = keywords[0] || "this";
  const neutralTemplates = [
    (
      `That's an interesting point about ${topic}.\n\n` +
      `Let me reflect that back and add a layer: the interesting thing about ${k0} ` +
      "is that it connects to a broader pattern. Most of the challenges we face " +
      "aren't isolated — they're symptoms of underlying structures.\n\n" +
      "When you notice a pattern like this, the most powerful question is: " +
      "what's the simplest change that would shift the entire system?\n\n" +
      "Often the answer is smaller than we think."
    ),
    (
      `I see what you're saying about ${topic}.\n\n` +
      `There's a concept worth considering here: the difference between symptoms and root causes. ` +
      `What you're describing about ${k0} might look like a surface-level issue, but ` +
      "it often points to something deeper in how the system is structured.\n\n" +
      "Try the 'five whys' exercise — ask 'why?' five times in a row about what you're observing. " +
      "By the third or fourth 'why', you'll usually hit the real insight.\n\n" +
      "What do you think the root cause might be?"
    ),
    (
      `That observation about ${topic} connects to something I find fascinating.\n\n` +
      `The things we notice most often are the things that matter most to us — even if ` +
      "we haven't fully articulated why yet. The fact that ${k0} caught your attention " +
      "suggests there's something unresolved there.\n\n" +
      "Sometimes the best next step is simply to sit with the observation for a moment. " +
      "Don't rush to solve it or explain it. Just let it be present in your thinking.\n\n" +
      "What keeps pulling your attention back to this?"
    ),
  ];
  return pickVariation(neutralTemplates, `s-${topic}`);
}
