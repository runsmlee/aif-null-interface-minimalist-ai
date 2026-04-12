import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-6"
            aria-hidden="true"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-neutral-300 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-xl transition-colors duration-200 min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
