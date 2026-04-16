import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MessageList } from "../components/MessageList";
import type { Message } from "../types";

const mockMessages: readonly Message[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Hello, this is a test message",
    timestamp: Date.now() - 10000,
  },
  {
    id: "msg-2",
    role: "assistant",
    content: "This is a test response from the AI",
    timestamp: Date.now(),
  },
];

describe("MessageList", () => {
  it("shows empty state when no messages", () => {
    render(<MessageList messages={[]} isLoading={false} isStreaming={false}
        streamingText={null} />);
    expect(screen.getByText("Start a conversation")).toBeInTheDocument();
  });

  it("renders messages correctly", () => {
    render(<MessageList messages={mockMessages} isLoading={false} isStreaming={false}
        streamingText={null} />);
    expect(
      screen.getByText("Hello, this is a test message")
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is a test response from the AI")
    ).toBeInTheDocument();
  });

  it("shows typing indicator when loading", () => {
    render(<MessageList messages={[]} isLoading={true} isStreaming={false}
        streamingText={null} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not show empty state when there are messages", () => {
    render(<MessageList messages={mockMessages} isLoading={false} isStreaming={false}
        streamingText={null} />);
    expect(
      screen.queryByText("Start a conversation")
    ).not.toBeInTheDocument();
  });

  it("has correct ARIA role", () => {
    render(<MessageList messages={mockMessages} isLoading={false} isStreaming={false}
        streamingText={null} />);
    expect(
      screen.getByRole("log", { name: /chat messages/i })
    ).toBeInTheDocument();
  });

  it("renders suggestion buttons when empty", () => {
    const onSuggestionClick = vi.fn();
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        isStreaming={false}
        streamingText={null}
        onSuggestionClick={onSuggestionClick}
      />
    );
    const suggestions = screen.getAllByRole("button");
    expect(suggestions.length).toBe(6);
  });

  it("calls onSuggestionClick when a suggestion is clicked", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    const onSuggestionClick = vi.fn();
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        isStreaming={false}
        streamingText={null}
        onSuggestionClick={onSuggestionClick}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /suggestion: what is minimalism/i })
    );
    expect(onSuggestionClick).toHaveBeenCalledWith("What is minimalism?");
  });

  it("renders streaming bubble when streaming text is present", () => {
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        isStreaming={true}
        streamingText="Hello from the AI"
      />
    );
    expect(
      screen.getByRole("article", { name: /assistant is responding/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Hello from the AI")).toBeInTheDocument();
  });

  it("does not show empty state when streaming text is present", () => {
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        isStreaming={true}
        streamingText="Test response"
      />
    );
    expect(
      screen.queryByText("Start a conversation")
    ).not.toBeInTheDocument();
  });

  it("shows typing cursor class while streaming is active", () => {
    render(
      <MessageList
        messages={[]}
        isLoading={false}
        isStreaming={true}
        streamingText="Test"
      />
    );
    const textEl = screen.getByText("Test");
    expect(textEl.className).toContain("typing-cursor");
  });

  it("renders messages alongside streaming bubble", () => {
    render(
      <MessageList
        messages={mockMessages}
        isLoading={false}
        isStreaming={true}
        streamingText="Additional response"
      />
    );
    expect(
      screen.getByText("Hello, this is a test message")
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is a test response from the AI")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: /assistant is responding/i })
    ).toBeInTheDocument();
  });
});
