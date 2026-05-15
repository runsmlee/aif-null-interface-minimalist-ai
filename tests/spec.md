# Test Specification — Null Interface

## Overview

This document specifies the test coverage requirements for the Null Interface MVP.
All tests use Vitest + React Testing Library with jsdom environment.

**Coverage target:** App component + all main feature components (ChatInterface, MessageList, InputBar, Header)

---

## Component Tests

### App (`src/__tests__/App.test.tsx`)
- Renders without crashing
- Shows empty state with conversation starters
- Renders chat input with placeholder
- Renders send button
- Has accessible landmarks (log, main, banner)
- Renders all 6 suggestion chips as accessible buttons
- Shows version badge

### ChatInterface (`src/__tests__/ChatInterface.test.tsx`)
- Renders main landmark
- Renders header with app title
- Renders input bar with placeholder
- Renders skip-to-content accessibility link
- Has all required ARIA landmarks (banner, main, log)
- Skip link has proper sr-only + focus-visible styling
- Renders keyboard shortcut hints
- Passes onToggleHelp callback to useKeyboardShortcuts
- Opens/closes shortcuts help dialog via toggle

### Header (`src/__tests__/Header.test.tsx`)
- Renders title and version
- Shows message/word count stats
- Shows formatted duration (minutes, hours+minutes)
- Hides duration when 0
- Disable/enable clear button based on message count
- Clear requires double-click confirmation
- Shows/hides export button based on message count
- Has banner role
- Has correct aria-labels

### InputBar (`src/__tests__/InputBar.test.tsx`)
- Renders input field and send button
- Calls onSend on form submit
- Blocks empty input submission
- Disables input during loading
- Send button disabled when empty or over limit
- Has accessible labels (input, hints)
- Shows character count near limit
- Disables send when character limit exceeded

### MessageBubble (`src/__tests__/MessageBubble.test.tsx`)
- Renders user message with correct styling
- Renders assistant message with correct styling
- Has article role with descriptive aria-label
- Has copy button with accessible label
- Copy invokes clipboard API
- Delete button only shown when onDelete provided
- Delete calls onDelete with correct message id

### MessageList (`src/__tests__/MessageList.test.tsx`)
- Shows empty state when no messages
- Renders message bubbles
- Shows typing indicator when loading
- Has log role with aria-live="polite"
- Renders suggestion buttons
- Calls onSuggestionClick
- Renders streaming bubble during streaming
- Does not show empty state during loading/streaming
- Shows typing cursor during streaming
- Has screen-reader-only thinking text
- Log has aria-relevant="additions"

### ErrorBanner (`src/__tests__/ErrorBanner.test.tsx`)
- Renders nothing when message is null
- Renders error with "Error:" prefix
- Shows/hides retry button based on onRetry prop
- Calls onRetry when clicked
- Has alert role with aria-live="assertive"

### ErrorBoundary (`src/__tests__/ErrorBoundary.test.tsx`)
- Renders children when no error
- Shows fallback UI on render error
- Renders retry button in fallback
- Has accessible alert role on error state
- Retry button resets boundary and re-renders children
- Supports custom fallback prop

### ScrollToBottom (`src/__tests__/ScrollToBottom.test.tsx`)
- Button hidden when sentinel visible
- Button shown when sentinel not intersecting
- Has correct aria-label
- Observer disconnects on unmount
- Renders "Latest" text
- Calls observe with sentinel
- Hides when sentinel becomes visible again

### ShortcutsHelp (`src/__tests__/ShortcutsHelp.test.tsx`)
- Does not render when closed
- Renders when open with correct ARIA (dialog, aria-modal)
- Renders shortcut descriptions and key labels
- Calls onClose from close button, Escape, backdrop click
- Focuses close button when opened
- Renders footer with close hint

---

## Hook Tests

### useChat (`src/__tests__/useChat.test.ts`)
- Starts with empty state (no messages, no error, not loading)
- Adds user message and accumulates streaming text on send
- Finalizes streaming to assistant message
- Clears conversation and resets state
- Ignores empty/whitespace-only messages
- Handles errors with user-friendly messages
- Handles rate limit, network, auth, and generic errors
- Sends conversation history with new messages
- Persists messages to localStorage (debounced)
- Restores messages from localStorage on mount
- Retry resends last user message
- Delete removes specific message by id
- Delete handles non-existent id gracefully

### useTypewriter (`src/__tests__/useTypewriter.test.ts`)
- Returns empty string for null/empty text
- Reveals characters progressively over time
- Completes and shows full text
- Resets for new text value
- Calls onComplete callback when done
- Clears animation on null transition

### useAutoScroll (`src/__tests__/useAutoScroll.test.ts`)
- Returns containerRef and scrollToBottom
- Scrolls to bottom when dependencies change
- Cancels pending rAF on cleanup
- Handles null container gracefully
- Uses external ref when provided
- Uses internal ref when no external ref

### useKeyboardShortcuts (`src/__tests__/useKeyboardShortcuts.test.tsx`)
- "/" focuses input (outside input fields only)
- Cmd/Ctrl+K focuses input (works in input)
- "/" does not fire inside input fields
- Removes listener on unmount
- K alone does nothing
- "?" toggles help (outside inputs)
- Escape blurs current input

### useDocumentTitle (`src/__tests__/useDocumentTitle.test.ts`)
- Sets document.title
- Restores previous title on unmount
- Updates when prop changes
- Ignores empty strings

### useReducedMotion (`src/__tests__/useReducedMotion.test.ts`)
- Returns false by default
- Returns true when prefers-reduced-motion matches
- Subscribes to media query changes

---

## Utility Tests

### AI (`src/__tests__/ai.test.ts`)
- Sends POST to /api/chat with messages
- Streams chunks via onChunk callback
- Throws on non-200 status
- Throws on SSE error data
- Throws on empty response
- Throws on missing body
- Passes AbortSignal to fetch
- Skips malformed SSE lines

### ID (`src/__tests__/id.test.ts`)
- generateId returns "msg-" prefixed unique IDs
- generateId uses crypto.randomUUID
- formatTimestamp shows time for today
- formatTimestamp shows date+time for older dates
- formatTimestamp handles midnight edge case

### Storage (`src/__tests__/storage.test.ts`)
- Save and load messages roundtrip
- Returns empty array for no data / corrupted / non-array
- Filters invalid messages (missing fields, empty id, zero timestamp)
- Clear removes all messages
- Handles storage errors gracefully
- Debounced save coalesces rapid writes

### Export (`src/__tests__/export.test.ts`)
- exportAsJson produces valid JSON with metadata
- exportAsText produces readable text format
- countWords tallies across all messages
- getDuration computes first-to-last interval
- downloadFile creates blob URL and triggers download
- formatDuration handles all ranges (0, negative, seconds, minutes, hours)

### Text Analysis (`src/__tests__/textAnalysis.test.ts`)
- tokenize: splits, handles punctuation, empty, contractions
- extractKeywords: removes stop words and short tokens
- detectIntent: greeting, question (?), imperative, statement, question-start words
- analyzeSentiment: positive, negative, neutral
- analyzeText: complete pipeline with all fields
- generateResponse: greeting, question, imperative, statement, short question,
  negative sentiment, positive statement, multi-keyword structured analysis
- detectDomain: all 6 domains (design, tech, productivity, creativity, philosophy, general)
- Domain tips appended for relevant domains, omitted for general

### Constants (`src/__tests__/constants.test.ts`)
- APP_NAME is non-empty
- APP_VERSION starts with "v"
- STORAGE_KEY is non-empty
- EXPORT_PREFIX is non-empty
