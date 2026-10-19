import type { ReactNode } from 'react';

export type Tone = 'good' | 'partial' | 'weak' | 'info';

const TAG: Record<Tone, string> = { good: 'Spot on', partial: 'Partly', weak: 'Not quite', info: 'Note' };

/** Feedback never relies on colour alone: every box carries a text tag. */
export function Feedback({ tone, tag, children }: { tone: Tone; tag?: string; children: ReactNode }) {
  return (
    <div className={`feedback ${tone} fade-in`} role="status">
      <span className="tag">{tag ?? TAG[tone]}</span>
      <div>{children}</div>
    </div>
  );
}
