import { useState } from 'react';
import { itemById } from '../content';
import type { TasteTestItem } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { Paragraph } from '../components/Paragraph';
import { Feedback } from '../components/Feedback';
import { RATING_LABEL } from '../components/ratings';
import { useRendered } from '../components/activities/useRendered';

const DEMO = itemById('garnish-01') as TasteTestItem;

function DemoVersion({ v, revealed }: { v: TasteTestItem['versions'][number]; revealed: boolean }) {
  const { effectiveStyle } = useSettings();
  const rendered = useRendered(v.text, effectiveStyle);
  return (
    <article className="card stack" aria-label={v.label}>
      <div className="spread" style={{ minHeight: 28 }}>
        <span className="para-label">{v.label}</span>
        {revealed && <span className={v.rating === 'weak' ? 'pill pill-dashed' : 'pill pill-accent'}>{RATING_LABEL[v.rating]}</span>}
      </div>
      <Paragraph rendered={rendered} idPrefix={`demo-${v.id}`} />
    </article>
  );
}

/** A first exercise, so the student sees how every activity works before the menu. */
export function FirstTaste() {
  const [pick, setPick] = useState<string | null>(null);
  return (
    <main id="main" className="wrap stack" style={{ gap: 24, padding: '36px 16px 56px' }}>
      <header className="stack" style={{ gap: 10, maxWidth: 760 }}>
        <p className="eyebrow">Your first taste</p>
        <h1 className="serif screen-title">Which paragraph uses its quotation better?</h1>
        <p className="muted">Two history students quote the same book. Read both, then choose.</p>
      </header>

      <div className="grid-2">
        {DEMO.versions.map((v) => (
          <DemoVersion key={v.id} v={v} revealed={pick !== null} />
        ))}
      </div>

      <div className="panel">
        {pick === null ? (
          <div className="spread">
            <div className="row" role="group" aria-label="Choose a version">
              {DEMO.versions.map((v) => (
                <button key={v.id} type="button" className="btn" onClick={() => setPick(v.id)}>
                  {v.label} works better
                </button>
              ))}
            </div>
            <a className="faint" href={href.menu}>
              Skip to the menu
            </a>
          </div>
        ) : (
          <div className="stack">
            <Feedback tone={pick === DEMO.best ? 'good' : 'partial'} tag={pick === DEMO.best ? 'Spot on' : 'Fair instinct'}>
              {DEMO.picks[pick]}
            </Feedback>
            <div className="spread">
              <span className="muted">Every exercise works like this: you decide first, then we explain.</span>
              <a className="btn btn-primary" href={href.menu}>
                See the menu
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
