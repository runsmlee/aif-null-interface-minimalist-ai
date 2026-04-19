import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ShortcutsHelp } from "../components/ShortcutsHelp";

describe("ShortcutsHelp", () => {
  it("does not render when isOpen is false", () => {
    const onClose = vi.fn();
    render(<ShortcutsHelp isOpen={false} onClose={onClose} />);
    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has correct aria-modal and aria-label attributes", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Keyboard shortcuts");
  });

  it("renders the title", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("renders keyboard shortcut descriptions", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    // "Focus chat input" appears twice (for / and ⌘K) so use getAllByText
    expect(screen.getAllByText("Focus chat input").length).toBe(2);
    expect(screen.getByText("Blur current input")).toBeInTheDocument();
    expect(screen.getByText("Send message")).toBeInTheDocument();
    expect(screen.getByText("New line")).toBeInTheDocument();
    expect(screen.getByText("Show shortcuts")).toBeInTheDocument();
  });

  it("renders keyboard shortcut key labels", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    // There are multiple "Enter" elements and an "Esc" element
    // Check the unique "?" key which only appears once
    const dialog = screen.getByRole("dialog");
    const allKbd = dialog.querySelectorAll("kbd");
    const keyTexts = Array.from(allKbd).map((k) => k.textContent);
    expect(keyTexts).toContain("?");
    expect(keyTexts).toContain("Esc");
    expect(keyTexts).toContain("Enter");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<ShortcutsHelp isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close shortcuts help"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<ShortcutsHelp isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<ShortcutsHelp isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("focuses close button when opened", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    const closeButton = screen.getByLabelText("Close shortcuts help");
    expect(closeButton).toHaveFocus();
  });

  it("renders footer with close hint", () => {
    render(<ShortcutsHelp isOpen={true} onClose={vi.fn()} />);
    // Check that the footer section exists with border-t styling
    const dialog = screen.getByRole("dialog");
    // The footer contains a paragraph with "to close"
    const paragraphs = dialog.querySelectorAll("p");
    const hasCloseHint = Array.from(paragraphs).some(
      (p) => p.textContent?.includes("to close"),
    );
    expect(hasCloseHint).toBe(true);
  });
});
