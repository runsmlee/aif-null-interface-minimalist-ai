import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MessageBubble } from "../components/MessageBubble";
import type { Message } from "../types";

describe("MessageBubble", () => {
  const userMessage: Message = {
    id: "msg-1",
    role: "user",
    content: "Hello from user",
    timestamp: Date.now(),
  };

  const assistantMessage: Message = {
    id: "msg-2",
    role: "assistant",
    content: "Hello from assistant",
    timestamp: Date.now(),
  };

  it("renders user message with correct role", () => {
    render(<MessageBubble message={userMessage} />);
    expect(screen.getByText("Hello from user")).toBeInTheDocument();
    expect(screen.getByText("you")).toBeInTheDocument();
  });

  it("renders assistant message with correct role", () => {
    render(<MessageBubble message={assistantMessage} />);
    expect(screen.getByText("Hello from assistant")).toBeInTheDocument();
    expect(screen.getByText("ai")).toBeInTheDocument();
  });

  it("has article role with aria-label", () => {
    render(<MessageBubble message={userMessage} />);
    const article = screen.getByRole("article");
    expect(article).toHaveAttribute(
      "aria-label",
      expect.stringContaining("You said")
    );
  });

  it("has a copy button with accessible label", () => {
    render(<MessageBubble message={assistantMessage} />);
    expect(
      screen.getByRole("button", { name: /copy message/i })
    ).toBeInTheDocument();
  });

  it("invokes clipboard API on copy button click", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<MessageBubble message={assistantMessage} />);

    // Use fireEvent since the button is opacity-0 by default (hover-revealed)
    const copyBtn = screen.getByRole("button", { name: /copy message/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("Hello from assistant");
  });
});
