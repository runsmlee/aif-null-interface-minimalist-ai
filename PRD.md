# Null Interface — Minimalist AI Chat

## Product Overview
Null Interface is a minimalist AI chat application that provides a distraction-free conversational experience. It features real-time streaming responses, conversation persistence, and a dark-themed interface designed for clarity and focus.

## Target User
Users who want a clean, no-frills AI chat experience that prioritizes readability and focus over feature density.

## Core Features
1. **Chat Interface** — Send messages and receive AI-powered streaming responses
2. **Message History** — Conversations persist across sessions via localStorage
3. **Streaming Responses** — Real-time SSE streaming with typewriter effect
4. **Error Recovery** — Graceful error handling with retry capabilities
5. **Keyboard Shortcuts** — `/` to focus input, `Esc` to blur, `Enter` to send
6. **Accessibility** — WCAG 2.1 AA compliant with semantic HTML, ARIA labels, and keyboard navigation

## Design Tokens
- **Primary Color:** #EF4444 (red)
- **Typography:** system-ui (system font stack)
- **Style:** Balanced, pragmatic
- **Tone:** Professional

## Technical Stack
- React 19 + TypeScript (strict mode)
- Vite 8 build tool
- Tailwind CSS v4
- Vitest + React Testing Library

## Acceptance Criteria
- [ ] App renders without crashing
- [ ] Users can type and send messages
- [ ] Messages display with correct role indicators (user/ai)
- [ ] Streaming responses show with typewriter effect
- [ ] Error states display with retry option
- [ ] Conversation can be cleared (with confirmation)
- [ ] Messages persist across page reloads via localStorage
- [ ] Keyboard shortcuts work (`/` focus, `Esc` blur, `Enter` send)
- [ ] All interactive elements have accessible labels
- [ ] Build passes with zero TypeScript errors
- [ ] All tests pass
