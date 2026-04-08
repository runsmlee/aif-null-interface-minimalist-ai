import { useReducer, useCallback, useRef } from "react";
import type { ConversationState, ChatAction, Message } from "@/types";
import { generateId } from "@/utils/id";
import { simulateAIResponse } from "@/utils/ai";

const initialState: ConversationState = {
  messages: [],
  isLoading: false,
  error: null,
};

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
      return { ...state, messages: [...state.messages, message], isLoading: false };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "CLEAR_CONVERSATION":
      return initialState;
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortRef = useRef(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || state.isLoading) return;

      abortRef.current = false;

      dispatch({ type: "ADD_USER_MESSAGE", payload: trimmed });
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const response = await simulateAIResponse(trimmed);
        if (!abortRef.current) {
          dispatch({ type: "ADD_ASSISTANT_MESSAGE", payload: response });
        }
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Something went wrong. Please try again.",
        });
      }
    },
    [state.isLoading]
  );

  const clearConversation = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: "CLEAR_CONVERSATION" });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearConversation,
  };
}
