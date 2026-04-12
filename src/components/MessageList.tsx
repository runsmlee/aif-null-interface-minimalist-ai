import { useMemo } from "react";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useTypewriter } from "@/hooks/useTypewriter";

interface MessageListProps {
  readonly messages: readonly Message[];
  readonly isLoading: boolean;
  readonly streamingText: string | null;
  readonly onSuggestionClick?: (text: string) => void;
  readonly onStreamingComplete?: () => void;
}

export function MessageList({
  messages,
  isLoading,
  streamingText,
  onSuggestionClick,
  onStreamingComplete,
}: MessageListProps) {
  const { displayedText, isComplete } = useTypewriter(streamingText, {
    charDelay: 12,
    onComplete: onStreamingComplete,
  });

  const memoizedDeps = useMemo(
    () => [messages.length, isLoading, displayedText.length] as const,
    [messages.length, isLoading, displayedText.length]
  );
  const { containerRef } = useAutoScroll(memoizedDeps);

  const showEmptyState = messages.length === 0 && !isLoading && !streamingText;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {showEmptyState && (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {streamingText && displayedText.length > 0 && (
        <StreamingBubble text={displayedText} isComplete={isComplete} />
      )}

      {isLoading && !streamingText && <TypingIndicator />}
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
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary-500"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>
      <h2 className="text-lg font-medium text-neutral-300 mb-2">
        Start a conversation
      </h2>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
        Ask anything. Null Interface provides thoughtful, minimalist responses to
        help you think clearly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionClick?.(suggestion)}
            className="text-xs text-neutral-400 bg-neutral-800/50 border border-neutral-700/30 hover:border-primary-500/30 hover:text-neutral-200 hover:bg-neutral-800 px-3 py-2 rounded-full transition-all duration-200 cursor-pointer min-h-[44px]"
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
    >
      <div className="bg-neutral-800/50 border border-neutral-700/30 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mr-2">
            ai
          </span>
          <div className="flex gap-1">
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
      aria-label="Assistant is responding"
    >
      <div className="max-w-[85%] sm:max-w-[70%] bg-neutral-800/50 border border-neutral-700/30 text-neutral-200 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            ai
          </span>
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
