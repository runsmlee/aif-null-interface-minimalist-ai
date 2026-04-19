import { useEffect, useCallback, useRef } from "react";
import { IconX } from "./Icons";

interface ShortcutsHelpProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["/"], description: "Focus chat input" },
  { keys: ["⌘", "K"], description: "Focus chat input" },
  { keys: ["Esc"], description: "Blur current input" },
  { keys: ["Enter"], description: "Send message" },
  { keys: ["Shift", "Enter"], description: "New line" },
  { keys: ["?"], description: "Show shortcuts" },
] as const;

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus close button when opened
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // Trap focus within the modal
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        className="bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl shadow-black/40 max-w-sm w-full mx-4 overflow-hidden animate-fade-in-up"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/50">
          <h2 className="text-sm font-medium text-neutral-200">
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 p-1 rounded-lg hover:bg-neutral-800/50 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary-500"
            aria-label="Close shortcuts help"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="px-5 py-3">
          <ul className="space-y-1" role="list">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.keys.join("+")}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-neutral-800/30 transition-colors duration-150"
              >
                <span className="text-sm text-neutral-400">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1" aria-hidden="true">
                  {shortcut.keys.map((key, i) => (
                    <span key={key}>
                      {i > 0 && (
                        <span className="text-neutral-600 text-xs mx-0.5">+</span>
                      )}
                      <kbd className="px-2 py-1 bg-neutral-800 border border-neutral-700/50 rounded-md text-xs text-neutral-300 font-mono min-w-[28px] text-center inline-block">
                        {key}
                      </kbd>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-3 border-t border-neutral-800/50">
          <p className="text-[11px] text-neutral-600 text-center">
            Press <kbd className="px-1 py-0.5 bg-neutral-800/50 rounded text-neutral-500 font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
