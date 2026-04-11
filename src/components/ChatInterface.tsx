import { useRef, useCallback } from "react";
import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { ErrorBanner } from "./ErrorBanner";
import { useChat } from "@/hooks/useChat";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function ChatInterface() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
  } = useChat();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useKeyboardShortcuts({ onFocusInput: focusInput });

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-neutral-950">
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:outline-none"
      >
        Skip to chat input
      </a>
      <Header messageCount={messages.length} onClear={clearConversation} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={sendMessage}
      />
      <ErrorBanner message={error} onRetry={retryLastMessage} />
      <InputBar
        onSend={sendMessage}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
}
