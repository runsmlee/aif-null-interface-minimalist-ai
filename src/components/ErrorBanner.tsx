interface ErrorBannerProps {
  readonly message: string | null;
  readonly onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mx-4 mb-2 px-4 py-2.5 bg-primary-500/10 border border-primary-500/20 rounded-xl text-sm text-primary-300 animate-fade-in-up flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 min-w-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-400 flex-shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="truncate">
          <span className="text-primary-400 font-medium">Error: </span>
          {message}
        </span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 text-xs text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg transition-colors duration-200 min-h-[32px] focus-visible:outline-2 focus-visible:outline-primary-500"
          aria-label="Retry last message"
        >
          Retry
        </button>
      )}
    </div>
  );
}
