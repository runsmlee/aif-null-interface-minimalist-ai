import { memo } from "react";

interface HeaderProps {
  readonly messageCount: number;
  readonly onClear: () => void;
}

export const Header = memo(function Header({ messageCount, onClear }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/50 backdrop-blur-sm bg-neutral-950/80 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 pulse-glow" />
        </div>
        <h1 className="text-base font-medium tracking-tight text-neutral-100">
          Null Interface
        </h1>
        <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
          v1.0
        </span>
      </div>

      <div className="flex items-center gap-3">
        {messageCount > 0 && (
          <span
            className="text-xs text-neutral-500 tabular-nums"
            aria-label={`${messageCount} messages in conversation`}
          >
            {messageCount} {messageCount === 1 ? "msg" : "msgs"}
          </span>
        )}
        <button
          onClick={onClear}
          disabled={messageCount === 0}
          className="text-xs text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 px-2 py-1 rounded focus-visible:outline-2 focus-visible:outline-primary-500"
          aria-label="Clear conversation"
        >
          Clear
        </button>
      </div>
    </header>
  );
});
