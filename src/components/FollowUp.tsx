import { useState } from 'react';
import type { FollowUp as FollowUpData } from '../content/types';
import { Feedback } from './Feedback';

export function FollowUp({ data, onAnswered }: { data: FollowUpData; onAnswered: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = data.options.find((o) => o.id === picked);
  return (
    <section className="card stack fade-in" aria-labelledby="followup-q">
      <p className="eyebrow">One more question</p>
      <h3 id="followup-q" style={{ fontSize: 19, fontWeight: 600 }}>
        {data.question}
      </h3>
      <div className="option-list" role="radiogroup" aria-labelledby="followup-q">
        {data.options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={picked === o.id}
            className="option"
            onClick={() => {
              const first = picked === null;
              setPicked(o.id);
              if (first) onAnswered();
            }}
          >
            <span className="mark" aria-hidden="true" />
            <span>{o.text}</span>
          </button>
        ))}
      </div>
      {choice && (
        <Feedback key={choice.id} tone={choice.good ? 'good' : 'info'} tag={choice.good ? 'Correct' : 'Think again'}>
          {choice.feedback}
          {!choice.good && <span className="muted"> Try another option if you like.</span>}
        </Feedback>
      )}
    </section>
  );
}
