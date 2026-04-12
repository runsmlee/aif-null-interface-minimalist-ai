import { useReducer, useCallback, useRef, useEffect } from "react";
import type { ConversationState, ChatAction, Message } from "@/types";
import type { ChatMessage } from "@/utils/ai";
import { generateId } from "@/utils/id";
import { fetchAIStream } from "@/utils/ai";
import { saveMessages, loadMessages, clearMessages } from "@/utils/storage";

const initialState: ConversationState = {
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  streamingText: null,
};

function isValidMessage(msg: unknown): msg is Message {
  if (typeof msg !== "object" || msg === null) return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.timestamp === "number"
  );
}

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

  // Keep refs in sync
  useEffect(() => {
    isLoadingRef.current = state.isLoading;
  }, [state.isLoading]);
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  // Restore messages from localStorage on mount
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    const stored = loadMessages();
    const valid: Message[] = stored.filter(isValidMessage) as Message[];
    if (valid.length > 0) {
      dispatch({ type: "RESTORE_MESSAGES", payload: valid });
    }
  }, []);

  // Persist messages to localStorage when they change
  useEffect(() => {
    if (!hasRestored.current) return;
    if (state.messages.length > 0) {
      saveMessages(state.messages);
    }
  }, [state.messages]);

  const lastUserMessageRef = useRef<string | null>(null);

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
        // Stream completed — streamingText now has the full text
        // The finalizeStreaming mechanism will convert it to a message
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

  const retryLastMessage = useCallback(() => {
    const lastMsg = lastUserMessageRef.current;
    if (!lastMsg) return;

    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_LOADING", payload: true });

    const history: ChatMessage[] = messagesRef.current.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: "user", content: lastMsg });

    const controller = new AbortController();
    abortRef.current = controller;

    fetchAIStream(
      history,
      (chunk) => {
        dispatch({ type: "APPEND_STREAMING", payload: chunk });
      },
      { signal: controller.signal },
    )
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        dispatch({
          type: "SET_ERROR",
          payload: getErrorMessage(error),
        });
      })
      .finally(() => {
        abortRef.current = null;
        dispatch({ type: "SET_STREAMING_ACTIVE", payload: false });
      });
  }, []);

  const clearConversation = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: "CLEAR_CONVERSATION" });
    clearMessages();
  }, []);

  const finalizeStreaming = useCallback(() => {
    if (state.streamingText !== null) {
      dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: state.streamingText });
      dispatch({ type: "CLEAR_STREAMING" });
    }
  }, [state.streamingText]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    streamingText: state.streamingText,
    sendMessage,
    clearConversation,
    retryLastMessage,
    finalizeStreaming,
  };
}
