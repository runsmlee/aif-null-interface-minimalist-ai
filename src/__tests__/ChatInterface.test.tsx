import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatInterface } from "../components/ChatInterface";

vi.mock("@/hooks/useChat", () => ({
  useChat: () => ({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    streamingText: null,
    sendMessage: vi.fn(),
    clearConversation: vi.fn(),
    retryLastMessage: vi.fn(),
    finalizeStreaming: vi.fn(),
  }),
}));

vi.mock("@/hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: vi.fn(),
}));

describe("ChatInterface", () => {
  it("renders the main landmark", () => {
    render(<ChatInterface />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders header with app title", () => {
    render(<ChatInterface />);
    expect(screen.getByText("Null Interface")).toBeInTheDocument();
  });

  it("renders input bar with placeholder text", () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
  });

  it("renders skip-to-content link for accessibility", () => {
    render(<ChatInterface />);
    const skipLink = screen.getByText("Skip to chat input");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#chat-input");
  });

  it("renders all required ARIA landmarks", () => {
    render(<ChatInterface />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("log")).toBeInTheDocument();
  });
});
