import { memo } from "react";
import type { Message } from "@/types";
import { formatTimestamp } from "@/utils/id";

interface MessageBubbleProps {
  readonly message: Message;
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`animate-fade-in-up flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      role="article"
      aria-label={`${isUser ? "You" : "Assistant"} said: ${message.content.slice(0, 100)}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] ${
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
          <span className="text-[10px] text-neutral-600" aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
});
