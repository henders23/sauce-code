import { useState } from 'react';
import { itemById } from '../content';
import type { TasteTestItem } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { Feedback } from '../components/Feedback';
import { VersionSteps } from '../components/activities/VersionSteps';

const DEMO = itemById('garnish-01') as TasteTestItem;
const BEST = DEMO.versions.find((v) => v.id === DEMO.best)!.label;

const HOW = [
  ['Read', 'Short paragraphs, one at a time. The task is always on screen.'],
  ['Decide', 'With every paragraph in front of you.'],
  ['See why', 'You decide first, then we explain.'],
];

const SANDWICH = [
  ['Introduce', 'who is speaking, and what point the quotation makes.'],
  ['Quote', 'the words that matter.'],
  ['Comment', 'what the quotation shows — and whether it holds up.'],
];

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** A first exercise, so the student sees how every activity works before choosing a module. */
export function FirstTaste() {
  const { effectiveStyle } = useSettings();
  const [started, setStarted] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [onPattern, setOnPattern] = useState(false);

  if (!started) {
    return (
      <main id="main" className="wrap screen">
        <div className="screen-inner stack" style={{ gap: 32, maxWidth: 760 }}>
          <div className="stack" style={{ gap: 12 }}>
            <p className="eyebrow">Your first exercise</p>
            <h1 className="serif screen-title">Every exercise works the same way</h1>
          </div>
          <ol className="how-steps">
            {HOW.map(([title, text], i) => (
              <li key={title}>
                <span className="step-num">{i + 1}</span>
                <strong>{title}</strong>
                <span className="muted">{text}</span>
              </li>
            ))}
          </ol>
          <div className="spread divided">
            <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 480 }}>
              First: two history students quote the same book about the 1840 penny post. You’ll decide which uses the quotation better.
            </p>
            <div className="stack" style={{ gap: 8, alignItems: 'center' }}>
              <button type="button" className="btn btn-primary btn-large" onClick={() => setStarted(true)}>
                Show {DEMO.versions[0].label}
              </button>
              <a className="faint" href={href.menu}>
                Skip to the modules
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const right = pick === DEMO.best;
  return (
    <main id="main" className="wrap stack" style={{ gap: 24, padding: '32px 16px 56px' }}>
      <header className="stack" style={{ gap: 16, maxWidth: 820 }}>
        <p className="eyebrow">Your first exercise</p>
        <section className="task" aria-labelledby="demo-task">
          <span className="eyebrow">Your task</span>
          <h1 id="demo-task" className="serif task-title">
            {DEMO.question}
          </h1>
          <p className="muted">Two history students quote the same book about the 1840 penny post.</p>
        </section>
      </header>

      <VersionSteps versions={DEMO.versions} style={effectiveStyle} idPrefix="demo" rated={checked} selected={pick}>
        {/* One step at a time in the panel beside the texts: choose, feedback, then the pattern. */}
        <section className="panel stack" aria-label="Your answer" aria-live="polite">
          {!checked || !pick ? (
            <>
              <span id="demo-pick" style={{ fontWeight: 600, fontSize: 17 }}>
                {DEMO.question}
              </span>
              <div className="row" role="radiogroup" aria-labelledby="demo-pick">
                {DEMO.versions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={pick === v.id}
                    className="chip"
                    style={{ minWidth: 160 }}
                    onClick={() => setPick(v.id)}
                  >
                    {v.label} works better
                  </button>
                ))}
              </div>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" disabled={pick === null} onClick={() => setChecked(true)}>
                  Check my answer
                </button>
              </div>
            </>
          ) : !onPattern ? (
            <>
              <Feedback tone={right ? 'good' : 'partial'} tag={right ? 'Correct' : 'Not quite'}>
                {DEMO.picks[pick]}
              </Feedback>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={() => setOnPattern(true)}>
                  Why {BEST} works
                  <Arrow />
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 600 }}>{BEST} follows a pattern often called a quote sandwich:</p>
              <ol className="anno-list">
                {SANDWICH.map(([step, text], i) => (
                  <li key={step}>
                    <span className="anno-num">{i + 1}</span>
                    <span>
                      <strong style={{ fontWeight: 600 }}>{step}</strong> — {text}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="stack divided" style={{ gap: 14 }}>
                <span className="muted">Every exercise works this way: you decide first, then see why.</span>
                <a className="btn btn-primary" href={href.menu}>
                  Choose a module
                  <Arrow />
                </a>
              </div>
            </>
          )}
        </section>
      </VersionSteps>
    </main>
  );
}
