import { useState, useCallback, useRef, type KeyboardEvent, type FormEvent } from "react";

interface InputBarProps {
  readonly onSend: (message: string) => void;
  readonly isLoading: boolean;
}

export function InputBar({ onSend, isLoading }: InputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      onSend(input);
      setInput("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    [input, isLoading, onSend]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        onSend(input);
        setInput("");

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    },
    [input, isLoading, onSend]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    },
    []
  );

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm px-4 py-3 sticky bottom-0"
    >
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-neutral-800/50 border border-neutral-700/30 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 resize-none focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 disabled:opacity-50 transition-all duration-200 min-h-[44px] max-h-[160px]"
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-800 disabled:opacity-40 flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
          aria-label="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLoading ? "animate-pulse" : ""}
            aria-hidden="true"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-neutral-600 text-center mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}
