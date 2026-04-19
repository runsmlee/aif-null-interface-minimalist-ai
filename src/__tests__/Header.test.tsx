import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "../components/Header";

describe("Header", () => {
  const defaultProps = {
    messageCount: 0,
    wordCount: 0,
    onClear: vi.fn(),
    onExport: vi.fn(),
  };

  it("renders the title", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Null Interface")).toBeInTheDocument();
  });

  it("shows message count when there are messages", () => {
    render(<Header {...defaultProps} messageCount={5} wordCount={120} />);
    expect(screen.getByText(/5 msgs/)).toBeInTheDocument();
  });

  it("shows singular message count for 1 message", () => {
    render(<Header {...defaultProps} messageCount={1} wordCount={12} />);
    expect(screen.getByText(/1 msg/)).toBeInTheDocument();
  });

  it("shows word count in header", () => {
    render(<Header {...defaultProps} messageCount={3} wordCount={45} />);
    expect(screen.getByText(/45 words/)).toBeInTheDocument();
  });

  it("disables clear button when no messages", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /clear conversation/i })
    ).toBeDisabled();
  });

  it("enables clear button when there are messages", () => {
    render(<Header {...defaultProps} messageCount={3} wordCount={45} />);
    expect(
      screen.getByRole("button", { name: /clear conversation/i })
    ).not.toBeDisabled();
  });

  it("calls onClear when clear button is clicked twice (confirm flow)", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    const onClear = vi.fn();
    render(<Header {...defaultProps} messageCount={2} wordCount={30} onClear={onClear} />);

    // First click shows confirmation
    await user.click(
      screen.getByRole("button", { name: /clear conversation/i })
    );
    expect(onClear).not.toHaveBeenCalled();

    // Second click confirms
    await user.click(
      screen.getByRole("button", { name: /confirm clear conversation/i })
    );
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("has a banner role", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("does not show export button when no messages", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.queryByRole("button", { name: /export conversation/i })
    ).not.toBeInTheDocument();
  });

  it("shows export button when there are messages", () => {
    render(<Header {...defaultProps} messageCount={2} wordCount={30} />);
    expect(
      screen.getByRole("button", { name: /export conversation/i })
    ).toBeInTheDocument();
  });

  it("calls onExport when export button is clicked", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    const onExport = vi.fn();
    render(<Header {...defaultProps} messageCount={2} wordCount={30} onExport={onExport} />);

    await user.click(
      screen.getByRole("button", { name: /export conversation/i })
    );
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
