import { useState } from 'react';
import { STYLES, STYLE_ORDER, FAMILY_LABEL } from '../citation/styles';
import { DISCIPLINES } from '../content';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';

/** Two short questions, one per screen: referencing style, then (optionally) discipline. */
export function Setup() {
  const { style, setStyle, discipline, setDiscipline } = useSettings();
  const [step, setStep] = useState<'style' | 'discipline'>('style');

  if (step === 'style') {
    return (
      <main id="main" className="wrap screen">
        <div className="screen-inner stack" style={{ gap: 24 }}>
          <div className="stack" style={{ gap: 10 }}>
            <p className="eyebrow">Step 1 of 2</p>
            <h1 id="q-style" className="serif screen-title">
              Which referencing style do you use?
            </h1>
            <p className="muted">Every example will appear in this style. You can change it at any time.</p>
          </div>
          <div className="chip-grid chip-grid-wide" role="radiogroup" aria-labelledby="q-style">
            {STYLE_ORDER.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={style === s} className="chip" onClick={() => setStyle(s)}>
                {STYLES[s].label}
                <small>{FAMILY_LABEL[STYLES[s].family]}</small>
              </button>
            ))}
          </div>
          <div className="spread">
            <span className="faint">Not sure? Choose Harvard.</span>
            <button type="button" className="btn btn-primary" disabled={style === null} onClick={() => setStep('discipline')}>
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="wrap screen">
      <div className="screen-inner stack" style={{ gap: 24 }}>
        <div className="stack" style={{ gap: 10 }}>
          <p className="eyebrow">Step 2 of 2 · optional</p>
          <h1 id="q-disc" className="serif screen-title">
            What do you study?
          </h1>
          <p className="muted">Using sources varies between subjects. We’ll show you examples from yours first.</p>
        </div>
        <div className="chip-grid chip-grid-wide" role="radiogroup" aria-labelledby="q-disc">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={discipline === d.id}
              className="chip"
              onClick={() => setDiscipline(discipline === d.id ? null : d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="spread">
          <button type="button" className="btn btn-ghost" onClick={() => setStep('style')}>
            Back
          </button>
          <a className="btn btn-primary" href={href.taste}>
            {discipline ? 'Continue' : 'Skip'}
          </a>
        </div>
      </div>
    </main>
  );
}
