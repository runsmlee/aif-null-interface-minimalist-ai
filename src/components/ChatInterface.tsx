import { useRef, useCallback, useMemo, useState } from "react";
import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { ErrorBanner } from "./ErrorBanner";
import { ErrorBoundary } from "./ErrorBoundary";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { useChat } from "@/hooks/useChat";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { countWords, getDuration, exportAsJson, downloadFile } from "@/utils/export";

export function ChatInterface() {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    streamingText,
    sendMessage,
    clearConversation,
    deleteMessage,
    retryLastMessage,
    finalizeStreaming,
  } = useChat();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Compute conversation stats
  const stats = useMemo(() => {
    const wordCount = countWords(messages);
    const duration = getDuration(messages);
    return { wordCount, duration };
  }, [messages]);

  // Update document title based on conversation state
  const documentTitle = useMemo(() => {
    if (error) return "⚠ Null Interface — Error";
    if (isLoading || isStreaming) return "Null Interface — Thinking…";
    if (messages.length > 0) return `Null Interface — ${messages.length} message${messages.length === 1 ? "" : "s"}`;
    return "Null Interface";
  }, [messages.length, isLoading, isStreaming, error]);
  useDocumentTitle(documentTitle);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const toggleHelp = useCallback(() => {
    setIsHelpOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({ onFocusInput: focusInput, onToggleHelp: toggleHelp });

  const handleExport = useCallback(() => {
    if (messages.length === 0) return;
    const json = exportAsJson(messages);
    const date = new Date().toISOString().split("T")[0];
    downloadFile(json, `null-interface-${date}.json`, "application/json");
  }, [messages]);

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-neutral-950">
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-lg focus:text-sm focus:font-medium focus:outline-none focus:shadow-lg focus:shadow-primary-600/30 focus:min-h-[44px] focus:flex focus:items-center focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
      >
        Skip to chat input
      </a>
      <Header
        messageCount={messages.length}
        wordCount={stats.wordCount}
        onClear={clearConversation}
        onExport={handleExport}
      />
      <main className="flex-1 flex flex-col min-h-0" role="main">
        <ErrorBoundary>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            streamingText={streamingText}
            onSuggestionClick={sendMessage}
            onStreamingComplete={finalizeStreaming}
            onDeleteMessage={deleteMessage}
          />
        </ErrorBoundary>
        <ErrorBanner message={error} onRetry={retryLastMessage} />
        <InputBar
          onSend={sendMessage}
          isLoading={isLoading}
          inputRef={inputRef}
        />
      </main>
      <ShortcutsHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
