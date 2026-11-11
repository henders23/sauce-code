import { useState } from 'react';
import { STYLES, STYLE_ORDER, FAMILY_LABEL } from '../citation/styles';
import { DISCIPLINES } from '../content';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { Arrow } from '../components/Stage';

function Steps({ step }: { step: 1 | 2 }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <p className="label">
        Setup · {step} of 2{step === 2 ? ' · optional' : ''}
      </p>
      <div className="steps-bar" aria-hidden="true">
        <span className="done" />
        <span className={step === 2 ? 'done' : ''} />
      </div>
    </div>
  );
}

/** Two short questions, one per screen: referencing style, then (optionally) discipline. */
export function Setup() {
  const { style, setStyle, discipline, setDiscipline } = useSettings();
  const [step, setStep] = useState<'style' | 'discipline'>('style');

  if (step === 'style') {
    return (
      <main id="main" className="wrap screen">
        <div className="screen-inner stack">
          <div className="stack" style={{ gap: 12 }}>
            <Steps step={1} />
            <h1 id="q-style" className="screen-title">
              Which referencing style do you use?
            </h1>
            <p className="muted">Every example will use it. You can change it at any time. Not sure? Choose Harvard.</p>
          </div>
          <div className="choice-grid" role="radiogroup" aria-labelledby="q-style">
            {STYLE_ORDER.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={style === s} className="option choice" onClick={() => setStyle(s)}>
                <span className="mark" aria-hidden="true" />
                <span className="option-label">{STYLES[s].label}</span>
                <small>{FAMILY_LABEL[STYLES[s].family]}</small>
              </button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-primary" disabled={style === null} onClick={() => setStep('discipline')}>
              Continue
              <Arrow />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="wrap screen">
      <div className="screen-inner stack">
        <div className="stack" style={{ gap: 12 }}>
          <Steps step={2} />
          <h1 id="q-disc" className="screen-title">
            What do you study?
          </h1>
          <p className="muted">Examples from your subject will come first.</p>
        </div>
        <div className="choice-grid choice-grid-3" role="radiogroup" aria-labelledby="q-disc">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={discipline === d.id}
              className="option choice"
              onClick={() => setDiscipline(discipline === d.id ? null : d.id)}
            >
              <span className="mark" aria-hidden="true" />
              <span className="option-label">{d.label}</span>
            </button>
          ))}
        </div>
        <div className="spread">
          <button type="button" className="btn btn-ghost" onClick={() => setStep('style')}>
            Back
          </button>
          <a className="btn btn-primary" href={href.first}>
            {discipline ? 'Continue' : 'Skip'}
            <Arrow />
          </a>
        </div>
      </div>
    </main>
  );
}
