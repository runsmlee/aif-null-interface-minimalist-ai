import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { ErrorBanner } from "./ErrorBanner";
import { useChat } from "@/hooks/useChat";

export function ChatInterface() {
  const { messages, isLoading, error, sendMessage, clearConversation } =
    useChat();

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-neutral-950">
      <Header messageCount={messages.length} onClear={clearConversation} />
      <MessageList messages={messages} isLoading={isLoading} />
      <ErrorBanner message={error} />
      <InputBar onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
