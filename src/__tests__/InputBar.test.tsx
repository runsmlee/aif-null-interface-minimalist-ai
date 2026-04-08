import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { InputBar } from "../components/InputBar";

describe("InputBar", () => {
  it("renders the input field and send button", () => {
    const onSend = vi.fn();
    render(<InputBar onSend={onSend} isLoading={false} />);

    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });
});
