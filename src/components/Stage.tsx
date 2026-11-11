import type { ReactNode } from 'react';

/**
 * The layout of every exercise: texts on the left, one step at a time in the
 * panel on the right (below the texts on a narrow screen). Buttons only ever
 * appear in the panel, so the student always knows where the next action is.
 */
export function Stage({ texts, wide = false, children }: { texts: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? 'stage stage-wide' : 'stage'}>
      <div className="stage-texts">{texts}</div>
      <aside className="stage-panel" aria-label="Current step" aria-live="polite">
        {children}
      </aside>
    </div>
  );
}

/** One step in the panel: a label saying what it is, an optional heading, the content, then the buttons. */
export function Step({ label, title, titleId, actions, children }: { label: string; title?: string; titleId?: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <section className="step fade-in">
      <p className="label">{label}</p>
      {title && (
        <h2 id={titleId} className="step-title">
          {title}
        </h2>
      )}
      {children}
      {actions && <div className="step-actions">{actions}</div>}
    </section>
  );
}

/**
 * A text on the stage. `hint` marks the card the student should be working in
 * (accent border, short instruction in the corner).
 */
export function TextCard({ label, meta, hint, plain = false, children }: { label: string; meta?: ReactNode; hint?: string; plain?: boolean; children: ReactNode }) {
  const cls = ['text-card', hint ? 'active' : '', plain ? 'plain' : ''].filter(Boolean).join(' ');
  return (
    <article className={cls} aria-label={label}>
      <div className="text-head">
        <span className="label">{label}</span>
        {hint ? <span className="hint">{hint}</span> : meta}
      </div>
      {children}
    </article>
  );
}

export const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export function Continue({ onClick, label = 'Continue', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button type="button" className="btn btn-primary" onClick={onClick} disabled={disabled}>
      {label}
      <Arrow />
    </button>
  );
}
