import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "../components/Header";

describe("Header", () => {
  const defaultProps = {
    messageCount: 0,
    wordCount: 0,
    duration: 0,
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

  it("does not show duration when duration is 0", () => {
    render(<Header {...defaultProps} messageCount={3} wordCount={45} duration={0} />);
    // The stats text should end with word count, not have a duration suffix
    const desktopStats = screen.getByText(/3 msgs · 45 words/);
    // Text content should be exactly "3 msgs · 45 words" (no trailing duration)
    expect(desktopStats.textContent).toMatch(/3 msgs · 45 words$/);
    expect(desktopStats.textContent).not.toContain("just now");
  });

  it("shows formatted duration when duration is non-zero", () => {
    render(<Header {...defaultProps} messageCount={3} wordCount={45} duration={300} />);
    // Duration "5m" should appear in both desktop and mobile stats
    const matchingElements = screen.getAllByText(/5m/);
    expect(matchingElements.length).toBeGreaterThanOrEqual(2);
  });

  it("shows hours and minutes duration", () => {
    render(<Header {...defaultProps} messageCount={3} wordCount={45} duration={5400} />);
    // Both desktop and mobile spans should contain the duration
    const matchingElements = screen.getAllByText(/1h 30m/);
    expect(matchingElements.length).toBeGreaterThanOrEqual(2);
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
    render(<Header {...defaultProps} messageCount={2} wordCount={30} duration={0} onClear={onClear} />);

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
    render(<Header {...defaultProps} messageCount={2} wordCount={30} duration={0} onExport={onExport} />);

    await user.click(
      screen.getByRole("button", { name: /export conversation/i })
    );
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("has correct aria-label without stray characters", () => {
    render(<Header {...defaultProps} messageCount={3} wordCount={45} duration={300} />);
    const desktopStats = screen.getByText(/3 msgs · 45 words/);
    const label = desktopStats.getAttribute("aria-label");
    // The aria-label should NOT contain a stray "}" after "words"
    expect(label).not.toContain("words}");
    expect(label).toBe("3 messages, 45 words, duration 5m");
  });

  it("has correct aria-label without duration when duration is 0", () => {
    render(<Header {...defaultProps} messageCount={2} wordCount={30} duration={0} />);
    const desktopStats = screen.getByText(/2 msgs · 30 words/);
    const label = desktopStats.getAttribute("aria-label");
    expect(label).not.toContain("words}");
    expect(label).toBe("2 messages, 30 words");
  });
});
