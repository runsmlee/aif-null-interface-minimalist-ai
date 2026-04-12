import { useReducer, useCallback, useRef, useEffect } from "react";
import type { ConversationState, ChatAction, Message } from "@/types";
import { generateId } from "@/utils/id";
import { fetchAIResponse } from "@/utils/ai";
import { saveMessages, loadMessages, clearMessages } from "@/utils/storage";

const initialState: ConversationState = {
  messages: [],
  isLoading: false,
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

function chatReducer(
  state: ConversationState,
  action: ChatAction
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
      };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "CLEAR_CONVERSATION":
      return initialState;
    case "RESTORE_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_STREAMING":
      return { ...state, streamingText: action.payload, isLoading: false };
    case "CLEAR_STREAMING":
      return { ...state, streamingText: null };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortRef = useRef(false);
  const hasRestored = useRef(false);
  const isLoadingRef = useRef(false);

  // Keep isLoadingRef in sync with state
  useEffect(() => {
    isLoadingRef.current = state.isLoading;
  }, [state.isLoading]);

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

  const handleResponse = useCallback(
    (response: string) => {
      if (!abortRef.current) {
        dispatch({ type: "SET_STREAMING", payload: response });
      }
    },
    []
  );

  const handleError = useCallback(() => {
    dispatch({
      type: "SET_ERROR",
      payload: "Something went wrong. Please try again.",
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoadingRef.current) return;

      abortRef.current = false;
      lastUserMessageRef.current = trimmed;

      dispatch({ type: "ADD_USER_MESSAGE", payload: trimmed });
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const response = await fetchAIResponse(trimmed);
        handleResponse(response);
      } catch {
        handleError();
      }
    },
    [handleResponse, handleError]
  );

  const retryLastMessage = useCallback(() => {
    const lastMsg = lastUserMessageRef.current;
    if (!lastMsg) return;

    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_LOADING", payload: true });

    fetchAIResponse(lastMsg).then(handleResponse).catch(handleError);
  }, [handleResponse, handleError]);

  const clearConversation = useCallback(() => {
    abortRef.current = true;
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
    error: state.error,
    streamingText: state.streamingText,
    sendMessage,
    clearConversation,
    retryLastMessage,
    finalizeStreaming,
  };
}
