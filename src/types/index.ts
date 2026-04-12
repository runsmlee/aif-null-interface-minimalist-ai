export interface Message {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: number;
}

export interface ConversationState {
  readonly messages: readonly Message[];
  readonly isLoading: boolean;
  readonly isStreaming: boolean;
  readonly error: string | null;
  readonly streamingText: string | null;
}

export type ChatAction =
  | { type: "ADD_USER_MESSAGE"; payload: string }
  | { type: "ADD_ASSISTANT_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_STREAMING_ACTIVE"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_CONVERSATION" }
  | { type: "RESTORE_MESSAGES"; payload: readonly Message[] }
  | { type: "SET_STREAMING"; payload: string }
  | { type: "APPEND_STREAMING"; payload: string }
  | { type: "CLEAR_STREAMING" };
