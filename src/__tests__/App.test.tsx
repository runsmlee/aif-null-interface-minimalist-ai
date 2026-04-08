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
    expect(screen.getByText("Ask anything. Null Interface provides thoughtful, minimalist responses to help you think clearly.")).toBeInTheDocument();
  });

  it("renders the chat input", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
  });

  it("renders the send button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("has accessible landmarks", () => {
    render(<App />);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });
});
