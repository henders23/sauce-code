import { useState } from 'react';
import type { TasteTestItem } from '../../content/types';
import { Feedback } from '../Feedback';
import { SourcePassageBox } from './SourcePassageBox';
import { VersionSteps } from './VersionSteps';
import type { ActivityProps } from './useRendered';

export function TasteTest({ item, style, onAnswered }: ActivityProps<TasteTestItem>) {
  const [pick, setPick] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const reasonData = item.reasons.find((r) => r.id === reason);
  const revealed = reason !== null;

  return (
    <div className="stack" style={{ gap: 20 }}>
      {item.sourcePassage && <SourcePassageBox passage={item.sourcePassage} />}
      <VersionSteps versions={item.versions} style={style} idPrefix={item.id} rated={revealed} selected={pick}>
        <section className="panel stack" aria-label="Your answer">
          <span id={`${item.id}-pick`} style={{ fontWeight: 600, fontSize: 17 }}>
            {item.question}
          </span>
          <div className="row" role="radiogroup" aria-labelledby={`${item.id}-pick`}>
            {item.versions.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={pick === v.id}
                className="chip"
                style={{ minWidth: 160 }}
                disabled={revealed}
                onClick={() => setPick(v.id)}
              >
                {v.label} works better
              </button>
            ))}
          </div>

          {pick && (
            <div className="stack fade-in" style={{ gap: 10 }}>
              <h3 id={`${item.id}-reasons`} style={{ fontSize: 17, fontWeight: 600 }}>
                {item.reasonQuestion}
              </h3>
              <div className="option-list" role="radiogroup" aria-labelledby={`${item.id}-reasons`}>
                {item.reasons.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={reason === r.id}
                    className="option"
                    onClick={() => {
                      if (reason === null) onAnswered();
                      setReason(r.id);
                    }}
                  >
                    <span className="mark" aria-hidden="true" />
                    <span>{r.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {revealed && pick && reasonData && (
            <div className="stack" style={{ gap: 10 }}>
              <Feedback tone={pick === item.best ? 'good' : 'partial'} tag={pick === item.best ? 'Correct' : 'Not quite'}>
                {item.picks[pick]}
              </Feedback>
              <Feedback
                key={reasonData.id}
                tone={reasonData.verdict === 'strong' ? 'good' : reasonData.verdict === 'partial' ? 'partial' : 'weak'}
                tag={reasonData.verdict === 'strong' ? 'Good reason' : reasonData.verdict === 'partial' ? 'Partly' : 'Think again'}
              >
                {reasonData.feedback}
                {reasonData.verdict !== 'strong' && <span className="muted"> You can pick another reason to compare.</span>}
              </Feedback>
            </div>
          )}
        </section>
      </VersionSteps>
    </div>
  );
}
