import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatInterface } from "../components/ChatInterface";

const mockUseChat = {
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  streamingText: null,
  sendMessage: vi.fn(),
  clearConversation: vi.fn(),
  deleteMessage: vi.fn(),
  retryLastMessage: vi.fn(),
  finalizeStreaming: vi.fn(),
};

vi.mock("@/hooks/useChat", () => ({
  useChat: () => mockUseChat,
}));

// Track the callback passed to useKeyboardShortcuts
let capturedOnToggleHelp: (() => void) | undefined;

vi.mock("@/hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: (options: { onFocusInput: () => void; onToggleHelp?: () => void }) => {
    capturedOnToggleHelp = options.onToggleHelp;
  },
}));

describe("ChatInterface", () => {
  beforeEach(() => {
    capturedOnToggleHelp = undefined;
    vi.clearAllMocks();
  });

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

  it("skip link has proper styling attributes for focus state", () => {
    render(<ChatInterface />);
    const skipLink = screen.getByText("Skip to chat input");
    // The skip link should be sr-only by default but visible on focus
    expect(skipLink).toHaveClass("sr-only");
    expect(skipLink).toHaveClass("focus:not-sr-only");
  });

  it("renders keyboard shortcut hints", () => {
    render(<ChatInterface />);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("passes onToggleHelp to useKeyboardShortcuts", () => {
    render(<ChatInterface />);
    expect(capturedOnToggleHelp).toBeDefined();
    expect(typeof capturedOnToggleHelp).toBe("function");
  });

  it("opens shortcuts help dialog when onToggleHelp is called", () => {
    render(<ChatInterface />);
    // Shortcuts help should not be visible initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Simulate the keyboard shortcut triggering the toggle
    act(() => {
      capturedOnToggleHelp?.();
    });

    // Dialog should now be visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("closes shortcuts help dialog when onToggleHelp is called again", () => {
    render(<ChatInterface />);

    // Open it
    act(() => {
      capturedOnToggleHelp?.();
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close it
    act(() => {
      capturedOnToggleHelp?.();
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
