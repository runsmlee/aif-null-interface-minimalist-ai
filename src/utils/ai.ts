const AI_RESPONSES: readonly string[] = [
  "That's an interesting question. Let me think about it from first principles.\n\nThe core challenge here is balancing simplicity with depth. In minimalist design, every element must justify its existence — and the same applies to ideas.\n\nWhat if we approached this by stripping away assumptions and building up from the essential truth?",
  "I see what you're getting at. The key insight is that complexity often arises from trying to solve too many problems at once.\n\nInstead, focus on the single most important outcome. When you optimize for that, many secondary concerns resolve themselves naturally.",
  "Great question. Here's my perspective:\n\n1. Start with the user's core need\n2. Remove everything that doesn't directly serve it\n3. Iterate on what remains until it feels effortless\n\nThe goal isn't to have less — it's to have nothing unnecessary.",
  "That resonates with something I've been exploring.\n\nThe most powerful interfaces are the ones that disappear. They become so natural that you stop noticing them entirely. That's the hallmark of great design — invisibility through clarity.",
  "Let me offer a different angle.\n\nWe often think of constraints as limitations, but they're actually the source of creativity. When you have infinite possibilities, you get analysis paralysis. When you have clear boundaries, you get focused innovation.\n\nThe question isn't what to add — it's what to remove.",
];

let responseIndex = 0;

export function simulateAIResponse(_message: string): Promise<string> {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 1200;
    const response = AI_RESPONSES[responseIndex % AI_RESPONSES.length] ?? AI_RESPONSES[0]!;
    responseIndex += 1;

    setTimeout(() => {
      resolve(response);
    }, delay);
  });
}
