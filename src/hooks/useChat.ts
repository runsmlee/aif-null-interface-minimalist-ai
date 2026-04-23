import { useReducer, useCallback, useRef, useEffect } from "react";
import type { ConversationState, ChatAction, Message } from "@/types";
import type { ChatMessage } from "@/utils/ai";
import { generateId } from "@/utils/id";
import { fetchAIStream } from "@/utils/ai";
import { loadMessages, clearMessages, debouncedSave, cancelPendingSave } from "@/utils/storage";

const initialState: ConversationState = {
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  streamingText: null,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("429"))
      return "Rate limit reached. Please wait a moment before trying again.";
    if (msg.includes("network") || msg.includes("fetch"))
      return "Network error. Please check your connection and try again.";
    if (msg.includes("401") || msg.includes("unauthorized"))
      return "Service authentication issue. Please try again later.";
    if (msg.includes("not configured") || msg.includes("503"))
      return "AI service is not configured yet. Please check back soon.";
    if (msg.includes("empty"))
      return "Received an empty response. Please try a different message.";
  }
  return "Something went wrong. Please try again.";
}

function chatReducer(
  state: ConversationState,
  action: ChatAction,
): ConversationState {
  switch (action.type) {
    case "ADD_USER_MESSAGE": {
      const message: Message = {
        id: generateId(),
        role: "user",
        content: action.payload,
        timestamp: Date.now(),
      };
      return { ...state, messages: [...state.messages, message] };
    }
    case "ADD_ASSISTANT_MESSAGE": {
      const message: Message = {
        id: generateId(),
        role: "assistant",
        content: action.payload,
        timestamp: Date.now(),
      };
      return {
        ...state,
        messages: [...state.messages, message],
        isLoading: false,
        isStreaming: false,
      };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_STREAMING_ACTIVE":
      return {
        ...state,
        isStreaming: action.payload,
        isLoading: action.payload ? false : state.isLoading,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isStreaming: false,
      };
    case "CLEAR_CONVERSATION":
      return initialState;
    case "RESTORE_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_STREAMING":
      return {
        ...state,
        streamingText: action.payload,
        isLoading: false,
        isStreaming: false,
      };
    case "APPEND_STREAMING":
      return {
        ...state,
        streamingText: (state.streamingText ?? "") + action.payload,
        isLoading: false,
        isStreaming: true,
      };
    case "CLEAR_STREAMING":
      return { ...state, streamingText: null };
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
      };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortRef = useRef<AbortController | null>(null);
  const hasRestored = useRef(false);
  const isLoadingRef = useRef(false);
  const messagesRef = useRef(state.messages);

  const streamingTextRef = useRef(state.streamingText);

  // Keep refs in sync with state
  useEffect(() => {
    isLoadingRef.current = state.isLoading;
  }, [state.isLoading]);
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);
  useEffect(() => {
    streamingTextRef.current = state.streamingText;
  }, [state.streamingText]);

  // Restore messages from localStorage on mount
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    const stored = loadMessages();
    if (stored.length > 0) {
      dispatch({ type: "RESTORE_MESSAGES", payload: stored });
    }
  }, []);

  // Persist messages to localStorage when they change (debounced to coalesce rapid updates)
  useEffect(() => {
    if (!hasRestored.current) return;
    if (state.messages.length > 0) {
      debouncedSave(state.messages);
    }
  }, [state.messages]);

  const lastUserMessageRef = useRef<string | null>(null);

  /** Shared streaming fetch logic used by both sendMessage and retryLastMessage. */
  const executeStreamRequest = useCallback(
    async (history: readonly ChatMessage[]) => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await fetchAIStream(
          history,
          (chunk) => {
            dispatch({ type: "APPEND_STREAMING", payload: chunk });
          },
          { signal: controller.signal },
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        dispatch({
          type: "SET_ERROR",
          payload: getErrorMessage(error),
        });
      } finally {
        abortRef.current = null;
        dispatch({ type: "SET_STREAMING_ACTIVE", payload: false });
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoadingRef.current) return;

      lastUserMessageRef.current = trimmed;

      dispatch({ type: "ADD_USER_MESSAGE", payload: trimmed });
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Build conversation history from stored messages
      const history: ChatMessage[] = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: "user", content: trimmed });

      await executeStreamRequest(history);
    },
    [executeStreamRequest],
  );

  const retryLastMessage = useCallback(async () => {
    const lastMsg = lastUserMessageRef.current;
    if (!lastMsg) return;

    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_LOADING", payload: true });

    const history: ChatMessage[] = messagesRef.current.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: "user", content: lastMsg });

    await executeStreamRequest(history);
  }, [executeStreamRequest]);

  const clearConversation = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    cancelPendingSave();
    dispatch({ type: "CLEAR_CONVERSATION" });
    clearMessages();
  }, []);

  const deleteMessage = useCallback((id: string) => {
    dispatch({ type: "DELETE_MESSAGE", payload: id });
  }, []);

  const finalizeStreaming = useCallback(() => {
    const current = streamingTextRef.current;
    if (current !== null) {
      dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: current });
      dispatch({ type: "CLEAR_STREAMING" });
    }
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    streamingText: state.streamingText,
    sendMessage,
    clearConversation,
    deleteMessage,
    retryLastMessage,
    finalizeStreaming,
  };
}
