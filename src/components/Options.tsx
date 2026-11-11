import type { ReactNode } from 'react';

export interface Option {
  id: string;
  label: ReactNode;
  detail?: ReactNode;
}

/** The one multiple-choice control used across the app. */
export function Options({
  options,
  value,
  onChange,
  labelledBy,
  label,
  locked = false,
}: {
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
  labelledBy?: string;
  label?: string;
  /** After an answer is final: the choice stays marked, the rest fade. */
  locked?: boolean;
}) {
  return (
    <div className="option-list" role="radiogroup" aria-labelledby={labelledBy} aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className="option" disabled={locked} onClick={() => onChange(o.id)}>
          <span className="mark" aria-hidden="true" />
          <span className="option-label">
            {o.label}
            {o.detail && <small>{o.detail}</small>}
          </span>
        </button>
      ))}
    </div>
  );
}
