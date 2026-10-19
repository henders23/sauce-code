import type { KeyboardEvent, ReactNode } from 'react';

/**
 * A toggle that flows inline with the paragraph text. A real <button> can't
 * wrap across lines like text, so this is a span with button semantics and
 * keyboard support (Tab to reach, Enter or Space to activate).
 */
export function InlineToggle({
  pressed,
  disabled,
  onToggle,
  className,
  label,
  children,
}: {
  pressed: boolean;
  disabled?: boolean;
  onToggle: () => void;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  const onKey = (e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };
  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      aria-label={label}
      className={className}
      onClick={() => !disabled && onToggle()}
      onKeyDown={onKey}
    >
      {children}
    </span>
  );
}
