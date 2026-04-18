import { memo, useState, useCallback, useRef, useEffect } from "react";

interface HeaderProps {
  readonly messageCount: number;
  readonly onClear: () => void;
}

export const Header = memo(function Header({
  messageCount,
  onClear,
}: HeaderProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
      }
    };
  }, []);

  const handleClearClick = useCallback(() => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    } else {
      setConfirmClear(true);
      // Auto-dismiss confirmation after 3 seconds
      confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
    }
  }, [confirmClear, onClear]);

  return (
    <header
      className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/50 backdrop-blur-sm bg-neutral-950/80 sticky top-0 z-10"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <div className="relative" aria-hidden="true">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 pulse-glow" />
        </div>
        <h1 className="text-base font-medium tracking-tight text-neutral-100">
          Null Interface
        </h1>
        <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
          v2.3
        </span>
      </div>

      <div className="flex items-center gap-3">
        {messageCount > 0 && (
          <span
            className="text-xs text-neutral-500 tabular-nums"
            aria-label={`${messageCount} message${messageCount === 1 ? "" : "s"} in conversation`}
          >
            {messageCount} {messageCount === 1 ? "msg" : "msgs"}
          </span>
        )}
        <button
          onClick={handleClearClick}
          disabled={messageCount === 0}
          className={`text-xs transition-all duration-200 px-3 py-2 rounded-lg min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary-500 ${
            confirmClear
              ? "text-primary-400 bg-primary-500/10 border border-primary-500/30 hover:bg-primary-500/20"
              : "text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800/50"
          }`}
          aria-label={confirmClear ? "Confirm clear conversation" : "Clear conversation"}
        >
          {confirmClear ? "Confirm?" : "Clear"}
        </button>
      </div>
    </header>
  );
});
