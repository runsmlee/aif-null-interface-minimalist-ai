interface ErrorBannerProps {
  readonly message: string | null;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mx-4 mb-2 px-4 py-2.5 bg-primary-500/10 border border-primary-500/20 rounded-xl text-sm text-primary-300 animate-fade-in-up"
    >
      <span className="text-primary-400 font-medium">Error: </span>
      {message}
    </div>
  );
}
