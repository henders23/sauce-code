import { useState } from 'react';
import { STYLES, STYLE_ORDER, FAMILY_LABEL } from '../citation/styles';
import { DISCIPLINES } from '../content';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';

function Steps({ step }: { step: 1 | 2 }) {
  return (
    <div className="row" style={{ gap: 14 }}>
      <p className="eyebrow">Step {step} of 2{step === 2 ? ' · optional' : ''}</p>
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
        <div className="screen-inner stack" style={{ gap: 28 }}>
          <div className="stack" style={{ gap: 14 }}>
            <Steps step={1} />
            <h1 id="q-style" className="serif screen-title">
              Which referencing style do you use?
            </h1>
            <p className="muted" style={{ fontSize: 17 }}>Every example will appear in it. You can change it any time.</p>
          </div>
          <div className="choice-grid" role="radiogroup" aria-labelledby="q-style">
            {STYLE_ORDER.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={style === s} className="choice" onClick={() => setStyle(s)}>
                <span className="mark" aria-hidden="true" />
                <span className="choice-label">{STYLES[s].label}</span>
                <small>{FAMILY_LABEL[STYLES[s].family]}</small>
              </button>
            ))}
          </div>
          <div className="spread">
            <span className="faint" style={{ fontSize: 14 }}>Not sure? Pick Harvard.</span>
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
      <div className="screen-inner stack" style={{ gap: 28 }}>
        <div className="stack" style={{ gap: 14 }}>
          <Steps step={2} />
          <h1 id="q-disc" className="serif screen-title">
            What do you study?
          </h1>
          <p className="muted" style={{ fontSize: 17 }}>We’ll show examples from your subject first.</p>
        </div>
        <div className="choice-grid choice-grid-3" role="radiogroup" aria-labelledby="q-disc">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={discipline === d.id}
              className="choice"
              onClick={() => setDiscipline(discipline === d.id ? null : d.id)}
            >
              <span className="mark" aria-hidden="true" />
              <span className="choice-label">{d.label}</span>
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
