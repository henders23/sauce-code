import { useState } from 'react';
import { STYLES, STYLE_ORDER, FAMILY_LABEL } from '../citation/styles';
import { itemById, MODULES } from '../content';
import type { TasteTestItem } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { DisciplineSelect } from '../components/TopBar';
import { Paragraph } from '../components/Paragraph';
import { Feedback } from '../components/Feedback';
import { RATING_LABEL } from '../components/ratings';
import { useRendered } from '../components/activities/useRendered';

const DEMO = itemById('garnish-01') as TasteTestItem;

function DemoVersion({ v, revealed }: { v: TasteTestItem['versions'][number]; revealed: boolean }) {
  const { effectiveStyle } = useSettings();
  const rendered = useRendered(v.text, effectiveStyle);
  return (
    <article className="card stack" aria-label={`Paragraph ${v.id.toUpperCase()}`}>
      <div className="spread" style={{ minHeight: 28 }}>
        <span className="para-label">Paragraph {v.id.toUpperCase()}</span>
        {revealed && <span className={v.rating === 'weak' ? 'pill pill-dashed' : 'pill pill-accent'}>{RATING_LABEL[v.rating]}</span>}
      </div>
      <Paragraph rendered={rendered} idPrefix={`demo-${v.id}`} />
    </article>
  );
}

export function Landing() {
  const { style, setStyle } = useSettings();
  const [pick, setPick] = useState<string | null>(null);

  return (
    <main id="main" className="wrap stack" style={{ gap: 36, padding: '40px 16px 56px' }}>
      <section className="spread" style={{ alignItems: 'flex-end', gap: 20 }}>
        <div className="stack" style={{ gap: 12, maxWidth: 780 }}>
          <p className="eyebrow">Using sources in academic writing · no sign-up, no lecture</p>
          <h1 className="serif" style={{ fontSize: 'clamp(38px, 6vw, 60px)', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.04 }}>
            Two paragraphs. One source. <em style={{ color: 'var(--accent)' }}>Which one works?</em>
          </h1>
        </div>
        <p className="muted" style={{ maxWidth: 320, fontSize: 15 }}>
          Sauce Code shows you, rather than tells you: where the source ends, where your own voice begins, and how each referencing convention changes the picture.
        </p>
      </section>

      <section className="stack" aria-labelledby="pick-convention" style={{ gap: 12 }}>
        <div className="spread">
          <h2 id="pick-convention" style={{ fontSize: 18, fontWeight: 600 }}>
            First, which referencing convention do you use?
          </h2>
          <span className="faint">Every paragraph re-renders in it. You can switch at any time.</span>
        </div>
        <div className="chip-grid" role="radiogroup" aria-labelledby="pick-convention">
          {STYLE_ORDER.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={style === s} className="chip" onClick={() => setStyle(s)}>
              {STYLES[s].label}
              <small>
                {FAMILY_LABEL[STYLES[s].family]} · {STYLES[s].edition}
              </small>
            </button>
          ))}
        </div>
        <div className="row">
          <DisciplineSelect id="landing-discipline" />
          <span className="faint">Optional. It changes which paragraphs you see first, and adds notes for your subject.</span>
        </div>
      </section>

      <section className="stack" aria-labelledby="demo-q" style={{ gap: 20 }}>
        <p className="muted" style={{ fontSize: 17 }}>
          {DEMO.context}
        </p>
        <div className="grid-2">
          {DEMO.versions.map((v) => (
            <DemoVersion key={v.id} v={v} revealed={pick !== null} />
          ))}
        </div>
        <div className="panel spread">
          {pick === null ? (
            <>
              <div className="row" role="group" aria-labelledby="demo-q">
                <span id="demo-q" style={{ fontSize: 17, fontWeight: 600, marginRight: 6 }}>
                  Which uses its quotation better?
                </span>
                {DEMO.versions.map((v) => (
                  <button key={v.id} type="button" className="btn" onClick={() => setPick(v.id)}>
                    {v.id.toUpperCase()} works better
                  </button>
                ))}
              </div>
              <a className="btn btn-ghost" href={href.menu}>
                Skip to the five Mother Sauces
              </a>
            </>
          ) : (
            <div className="stack" style={{ flex: 1 }}>
              <Feedback tone={pick === DEMO.best ? 'good' : 'partial'} tag={pick === DEMO.best ? 'Spot on' : 'Fair instinct'}>
                {DEMO.picks[pick]}
              </Feedback>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setPick(null)}>
                  Try again
                </button>
                <a className="btn btn-primary" href={href.menu}>
                  Start cooking
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="spread" aria-label="What's on the menu">
        <div className="row">
          {MODULES.map((m) => (
            <span key={m.id} className="pill" style={{ fontSize: 14, padding: '8px 12px' }}>
              {m.name} <span className="muted">· {m.plain}</span>
            </span>
          ))}
        </div>
        <p className="faint">All sources in Sauce Code are fictional, written for teaching. Your progress stays in this browser.</p>
      </section>
    </main>
  );
}
