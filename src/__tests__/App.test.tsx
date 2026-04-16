import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { App } from "../App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Null Interface")).toBeInTheDocument();
  });

  it("shows the empty state with suggestions", () => {
    render(<App />);
    expect(screen.getByText("Start a conversation")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ask anything. Null Interface provides thoughtful, minimalist responses to help you think clearly."
      )
    ).toBeInTheDocument();
  });

  it("renders the chat input", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
  });

  it("renders the send button", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument();
  });

  it("has accessible landmarks", () => {
    render(<App />);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("renders suggestion chips as buttons", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /suggestion: what is minimalism/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /suggestion: help me focus/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /suggestion: explain simply/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /suggestion: design advice/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /suggestion: how to think clearly/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /suggestion: what makes good ux/i })
    ).toBeInTheDocument();
  });

  it("shows version badge on larger screens", () => {
    render(<App />);
    expect(screen.getByText("v2.2")).toBeInTheDocument();
  });

  it("has a main landmark for page semantics", () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
