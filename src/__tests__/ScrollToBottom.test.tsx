import { render, screen, act } from "@testing-library/react";
import { type RefObject } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScrollToBottom } from "../components/ScrollToBottom";

// Store the original IntersectionObserver from the global setup
const OriginalIntersectionObserver = window.IntersectionObserver;

function ScrollToBottomTestHarness({
  containerRef,
}: {
  readonly containerRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={containerRef} style={{ height: 200, overflow: "auto" }}>
      <div style={{ height: 500 }}>Scrollable content</div>
      <ScrollToBottom containerRef={containerRef} />
    </div>
  );
}

describe("ScrollToBottom", () => {
  let observerCallback: (entries: IntersectionObserverEntry[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDisconnect: ReturnType<typeof vi.fn<(...args: any[]) => void>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockObserve: ReturnType<typeof vi.fn<(...args: any[]) => void>>;
  let containerRef: RefObject<HTMLDivElement | null>;

  beforeEach(() => {
    observerCallback = vi.fn();
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();
    containerRef = { current: null };

    // Override the global mock with a spy that captures the callback
    window.IntersectionObserver = vi.fn().mockImplementation(function (
      this: IntersectionObserver,
      cb: (entries: IntersectionObserverEntry[]) => void,
    ) {
      observerCallback = cb;
      this.observe = mockObserve;
      this.unobserve = vi.fn();
      this.disconnect = mockDisconnect;
    }) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    window.IntersectionObserver = OriginalIntersectionObserver;
  });

  it("does not render the button initially when sentinel is visible", () => {
    render(<ScrollToBottomTestHarness containerRef={containerRef} />);
    expect(
      screen.queryByLabelText("Scroll to latest messages"),
    ).not.toBeInTheDocument();
  });

  it("renders the button when the sentinel is not intersecting", async () => {
    render(<ScrollToBottomTestHarness containerRef={containerRef} />);

    await act(async () => {
      observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });

    expect(
      screen.getByLabelText("Scroll to latest messages"),
    ).toBeInTheDocument();
  });

  it("has correct aria-label for accessibility", async () => {
    render(<ScrollToBottomTestHarness containerRef={containerRef} />);

    await act(async () => {
      observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });

    const button = screen.getByLabelText("Scroll to latest messages");
    expect(button.tagName).toBe("BUTTON");
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(
      <ScrollToBottomTestHarness containerRef={containerRef} />,
    );
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("renders the Latest text in the button when visible", async () => {
    render(<ScrollToBottomTestHarness containerRef={containerRef} />);

    await act(async () => {
      observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });

    expect(screen.getByText("Latest")).toBeInTheDocument();
  });

  it("calls observe with the sentinel element on mount", () => {
    render(<ScrollToBottomTestHarness containerRef={containerRef} />);
    expect(mockObserve).toHaveBeenCalled();
  });

  it("hides the button when the sentinel becomes visible again", async () => {
    render(<ScrollToBottomTestHarness containerRef={containerRef} />);

    // Show button
    await act(async () => {
      observerCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });
    expect(screen.getByLabelText("Scroll to latest messages")).toBeInTheDocument();

    // Hide button
    await act(async () => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(
      screen.queryByLabelText("Scroll to latest messages"),
    ).not.toBeInTheDocument();
  });
});
