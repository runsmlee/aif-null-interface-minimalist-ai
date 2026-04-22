import { useMemo, type RefObject } from "react";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { ScrollToBottom } from "./ScrollToBottom";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useTypewriter } from "@/hooks/useTypewriter";
import { IconLayers } from "./Icons";

interface MessageListProps {
  readonly messages: readonly Message[];
  readonly isLoading: boolean;
  readonly isStreaming: boolean;
  readonly streamingText: string | null;
  readonly onSuggestionClick?: (text: string) => void;
  readonly onStreamingComplete?: () => void;
  readonly onDeleteMessage?: (id: string) => void;
  readonly containerRef?: RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  isLoading,
  isStreaming,
  streamingText,
  onSuggestionClick,
  onStreamingComplete,
  onDeleteMessage,
  containerRef: externalContainerRef,
}: MessageListProps) {
  // During active streaming, show text directly (chunks arrive naturally).
  // When stream is done but text remains (fallback), use typewriter for smooth reveal.
  const displayText = streamingText ?? null;
  const useTypewriterHook = !isStreaming && displayText !== null;
  const { displayedText, isComplete } = useTypewriter(
    useTypewriterHook ? displayText : null,
    { charDelay: 12, onComplete: onStreamingComplete },
  );

  const shownText = useTypewriterHook ? displayedText : displayText;
  // Typing cursor: show during active streaming or while typewriter is still revealing
  const bubbleIsComplete = isStreaming ? false : isComplete;

  const memoizedDeps = useMemo(
    () => [messages.length, isLoading, shownText?.length ?? 0] as const,
    [messages.length, isLoading, shownText?.length ?? 0],
  );
  const { containerRef } = useAutoScroll(memoizedDeps, externalContainerRef);

  const showEmptyState = messages.length === 0 && !isLoading && !streamingText;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      aria-relevant="additions"
    >
      {showEmptyState && (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onDelete={onDeleteMessage} />
      ))}

      {streamingText && shownText && shownText.length > 0 && (
        <StreamingBubble text={shownText} isComplete={bubbleIsComplete} />
      )}

      {isLoading && !streamingText && <TypingIndicator />}
      <ScrollToBottom containerRef={containerRef} />
    </div>
  );
}

const SUGGESTIONS = [
  "What is minimalism?",
  "Help me focus",
  "Explain simply",
  "Design advice",
  "How to think clearly?",
  "What makes good UX?",
] as const;

function EmptyState({
  onSuggestionClick,
}: {
  readonly onSuggestionClick?: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
      <div className="mb-6" aria-hidden="true">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto">
          <IconLayers className="text-primary-500" />
        </div>
      </div>
      <h2 className="text-lg font-medium text-neutral-300 mb-2">
        Start a conversation
      </h2>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
        Ask anything. Null Interface provides thoughtful, minimalist responses to
        help you think clearly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2 stagger-enter" role="group" aria-label="Conversation starters">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionClick?.(suggestion)}
            className="text-xs text-neutral-400 bg-neutral-800/50 border border-neutral-700/30 hover:border-primary-500/30 hover:text-neutral-200 hover:bg-neutral-800 px-3 py-2 rounded-full transition-all duration-200 cursor-pointer min-h-[44px]"
            aria-label={`Suggestion: ${suggestion}`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="flex justify-start mb-4 animate-fade-in-up"
      role="status"
      aria-label="Assistant is typing"
      aria-live="polite"
    >
      <div className="bg-neutral-800/50 border border-neutral-700/30 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            ai
          </span>
          <div className="flex items-center gap-1 ml-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary-500/60"
                style={{
                  animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="sr-only">thinking…</span>
        </div>
      </div>
    </div>
  );
}

function StreamingBubble({
  text,
  isComplete,
}: {
  readonly text: string;
  readonly isComplete: boolean;
}) {
  return (
    <div
      className="flex justify-start mb-4 animate-fade-in-up"
      role="article"
      aria-label={isComplete ? "Assistant response" : "Assistant is responding"}
    >
      <div className="max-w-[85%] sm:max-w-[70%] bg-neutral-800/50 border border-neutral-700/30 text-neutral-200 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            ai
          </span>
          {!isComplete && (
            <span className="text-[10px] text-primary-400 animate-pulse" aria-hidden="true">
              streaming
            </span>
          )}
        </div>
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            !isComplete ? "typing-cursor" : ""
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
