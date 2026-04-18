import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorBanner } from "../components/ErrorBanner";

describe("ErrorBanner", () => {
  it("renders nothing when message is null", () => {
    const { container } = render(<ErrorBanner message={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders error message when provided", () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("shows error label prefix", () => {
    render(<ErrorBanner message="Network error" />);
    expect(screen.getByText("Error:")).toBeInTheDocument();
  });

  it("does not show retry button when onRetry is not provided", () => {
    render(<ErrorBanner message="Test error" />);
    expect(
      screen.queryByRole("button", { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    render(<ErrorBanner message="Test error" onRetry={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /retry last message/i })
    ).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(
      <ErrorBanner message="Test error" onRetry={onRetry} />
    );
    fireEvent.click(
      screen.getByRole("button", { name: /retry last message/i })
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has alert role for accessibility", () => {
    render(<ErrorBanner message="Test error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses assertive aria-live for immediate screen reader announcement", () => {
    render(<ErrorBanner message="Test error" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});
