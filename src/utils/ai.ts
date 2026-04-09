const AI_RESPONSES: readonly string[] = [
  "That's an interesting question. Let me think about it from first principles.\n\nThe core challenge here is balancing simplicity with depth. In minimalist design, every element must justify its existence — and the same applies to ideas.\n\nWhat if we approached this by stripping away assumptions and building up from the essential truth?",
  "I see what you're getting at. The key insight is that complexity often arises from trying to solve too many problems at once.\n\nInstead, focus on the single most important outcome. When you optimize for that, many secondary concerns resolve themselves naturally.",
  "Great question. Here's my perspective:\n\n1. Start with the user's core need\n2. Remove everything that doesn't directly serve it\n3. Iterate on what remains until it feels effortless\n\nThe goal isn't to have less — it's to have nothing unnecessary.",
  "That resonates with something I've been exploring.\n\nThe most powerful interfaces are the ones that disappear. They become so natural that you stop noticing them entirely. That's the hallmark of great design — invisibility through clarity.",
  "Let me offer a different angle.\n\nWe often think of constraints as limitations, but they're actually the source of creativity. When you have infinite possibilities, you get analysis paralysis. When you have clear boundaries, you get focused innovation.\n\nThe question isn't what to add — it's what to remove.",
  "Here's what I've learned from studying exceptional products:\n\nThe best solutions feel obvious in retrospect. That's not because they're simple — it's because the designer put enormous effort into removing friction at every turn.\n\nWhat friction can you eliminate today?",
  "I think the answer lies in the space between what's said and what's meant.\n\nWhen someone asks for a feature, they're usually describing a symptom. The real work is understanding the underlying need. Once you see that, the solution is often much simpler than the request suggested.",
  "There's a principle I find useful: the complexity budget.\n\nEvery screen, every interaction, every choice you present to a user costs cognitive energy. You have a finite budget per session. Spend it wisely — on the things that matter most.\n\nEverything else should be automatic, hidden, or gone.",
  "Let me think about this differently.\n\nWhat would this look like if it were easy? Not easy because you're cutting corners — easy because you've found the right abstraction.\n\nMost hard problems are hard because we're solving them at the wrong level. Move up one layer and the complexity dissolves.",
  "The art is in knowing when to stop.\n\nIteration is essential, but there's a point where adding more doesn't improve the result — it just makes it different. Learning to recognize that point is one of the most valuable skills in any creative endeavor.",
];

const KEYWORD_RESPONSES: Record<string, readonly string[]> = {
  minimalism: [
    "Minimalism isn't about owning nothing — it's about everything you own having purpose.\n\nIn interface design, this means every pixel should serve the user. If an element doesn't help someone accomplish their goal, it's visual noise.\n\nAsk yourself: what can I remove without losing meaning?",
    "The essence of minimalism is intentionality.\n\nIt's not about having less for the sake of less. It's about making deliberate choices about what earns a place in your life — or on your screen. Every element should justify its existence.",
  ],
  focus: [
    "Focus is the ultimate competitive advantage.\n\nHere's a practical technique: identify the single most important outcome for today. Write it down. Then ruthlessly eliminate everything that doesn't contribute to it.\n\nThe clarity that follows is remarkable.",
    "To improve focus, reduce context switching.\n\nEach time you switch tasks, there's a cognitive cost — about 23 minutes to regain deep focus. Batch similar tasks, silence notifications, and protect your deep work hours like appointments.",
  ],
  design: [
    "Good design is invisible. Great design is inevitable.\n\nThe user should never have to think about the interface — they should only think about their goal. Every moment spent figuring out how to use something is a moment stolen from what they actually want to do.",
    "The best design advice I ever received: draw the ideal interface first, then work backwards.\n\nDon't start with constraints. Start with the perfect experience. Then figure out how to build it. You'll be surprised how often the 'impossible' parts have simple solutions.",
  ],
  explain: [
    "The Feynman technique works beautifully here:\n\n1. Explain the concept as if teaching a child\n2. Identify gaps in your explanation\n3. Go back and learn those gaps\n4. Simplify and use analogies\n\nIf you can't explain it simply, you don't understand it well enough yet.",
    "Here's the simplest framing I can offer:\n\nStrip away all the jargon and technical language. What's happening at the most basic level? Once you see that core mechanism, everything else is just layers of detail built on top of it.",
  ],
};

function pickRandom<T>(arr: readonly T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) throw new Error("Empty array");
  return item;
}

function findKeywordResponse(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keyword, responses] of Object.entries(KEYWORD_RESPONSES)) {
    if (lower.includes(keyword)) {
      return pickRandom(responses);
    }
  }
  return null;
}

let responseIndex = 0;

export function simulateAIResponse(message: string): Promise<string> {
  return new Promise((resolve) => {
    const delay = 600 + Math.random() * 1400;

    const keywordResponse = findKeywordResponse(message);
    const response =
      keywordResponse ??
      AI_RESPONSES[responseIndex % AI_RESPONSES.length] ??
      AI_RESPONSES[0]!;
    responseIndex += 1;

    setTimeout(() => {
      resolve(response);
    }, delay);
  });
}
