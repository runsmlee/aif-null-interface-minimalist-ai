import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "../components/Header";

describe("Header", () => {
  it("renders the title", () => {
    render(<Header messageCount={0} onClear={vi.fn()} />);
    expect(screen.getByText("Null Interface")).toBeInTheDocument();
  });

  it("shows message count when there are messages", () => {
    render(<Header messageCount={5} onClear={vi.fn()} />);
    expect(screen.getByText("5 msgs")).toBeInTheDocument();
  });

  it("shows singular message count for 1 message", () => {
    render(<Header messageCount={1} onClear={vi.fn()} />);
    expect(screen.getByText("1 msg")).toBeInTheDocument();
  });

  it("disables clear button when no messages", () => {
    render(<Header messageCount={0} onClear={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /clear conversation/i })
    ).toBeDisabled();
  });

  it("enables clear button when there are messages", () => {
    render(<Header messageCount={3} onClear={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /clear conversation/i })
    ).not.toBeDisabled();
  });

  it("calls onClear when clear button is clicked", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    const onClear = vi.fn();
    render(<Header messageCount={2} onClear={onClear} />);

    await user.click(
      screen.getByRole("button", { name: /clear conversation/i })
    );
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("has a banner role", () => {
    render(<Header messageCount={0} onClear={vi.fn()} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
