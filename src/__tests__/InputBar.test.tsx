import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { InputBar } from "../components/InputBar";

describe("InputBar", () => {
  it("renders the input field and send button", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument();
  });

  it("calls onSend when submitting a message", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    const input = screen.getByPlaceholderText("Ask anything...");
    await user.type(input, "Hello, AI!{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hello, AI!");
  });

  it("does not call onSend with empty input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    const input = screen.getByPlaceholderText("Ask anything...");
    await user.type(input, "{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables input when loading", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={true} />);

    expect(screen.getByPlaceholderText("Ask anything...")).toBeDisabled();
  });

  it("send button is disabled when input is empty", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeDisabled();
  });

  it("has accessible label for input", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    const textarea = screen.getByLabelText("Chat message input");
    expect(textarea).toBeInTheDocument();
  });

  it("has input hint element", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    // The hint div should exist with id="input-hint" for aria-describedby
    const hint = document.getElementById("input-hint");
    expect(hint).toBeInTheDocument();
    expect(hint?.textContent).toContain("Enter to send");
  });

  it("shows character count when approaching limit", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    const input = screen.getByPlaceholderText("Ask anything...");
    // Type enough to trigger char count (> 50% of 2000)
    const longText = "a".repeat(1001);
    await user.type(input, longText);

    // Should show character count
    expect(screen.getByText(`${longText.length}/2000`)).toBeInTheDocument();
  });

  it("disables send when input exceeds character limit", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    // Directly set the value to exceed the limit instead of typing 2001 chars
    const input = screen.getByPlaceholderText("Ask anything...");
    fireEvent.change(input, { target: { value: "a".repeat(2001) } });

    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeDisabled();
  });
});
