import { memo, useState, useCallback } from "react";
import type { Message } from "@/types";
import { formatTimestamp } from "@/utils/id";

interface MessageBubbleProps {
  readonly message: Message;
}

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [message.content]);

  return (
    <div
      className={`animate-fade-in-up flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}
      role="article"
      aria-label={`${isUser ? "You" : "Assistant"} said: ${message.content.slice(0, 100)}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] relative ${
          isUser
            ? "bg-primary-600/20 border border-primary-600/30 text-neutral-100"
            : "bg-neutral-800/50 border border-neutral-700/30 text-neutral-200"
        } rounded-2xl px-4 py-3`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isUser ? "text-primary-400" : "text-neutral-500"
            }`}
          >
            {isUser ? "you" : "ai"}
          </span>
          <span
            className="text-[10px] text-neutral-600"
            aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}
          >
            {formatTimestamp(message.timestamp)}
          </span>
          {/* Copy button — appears on hover */}
          <button
            type="button"
            onClick={handleCopy}
            className="ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-neutral-700/50"
            aria-label={copied ? "Copied to clipboard" : "Copy message"}
          >
            {copied ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-400"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-500"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
});
