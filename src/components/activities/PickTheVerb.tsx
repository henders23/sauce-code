import { useState } from 'react';
import type { PickVerbItem } from '../../content/types';
import { STYLES } from '../../citation/styles';
import { Paragraph } from '../Paragraph';
import { Feedback } from '../Feedback';
import { useRendered, type ActivityProps } from './useRendered';

const TONE = { good: 'good', possible: 'partial', clash: 'weak' } as const;
const TAG = { good: 'Works well', possible: 'Possible', clash: 'Clashes' } as const;

export function PickTheVerb({ item, style, onAnswered }: ActivityProps<PickVerbItem>) {
  const past = STYLES[style].pastTenseVerbs;
  const [picked, setPicked] = useState<number | null>(null);
  const [tried, setTried] = useState<number[]>([]);
  const opt = picked === null ? undefined : item.options[picked];
  const rendered = useRendered(item.text, style, opt ? { gap: { present: opt.present, past: opt.past } } : undefined);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <article className="card stack">
        <Paragraph rendered={rendered} idPrefix={item.id} />
      </article>
      <section className="panel stack" aria-label="Your answer">
        <div className="chip-grid" role="radiogroup" aria-label="Reporting verbs">
          {item.options.map((o, i) => (
            <button
              key={o.present}
              type="button"
              role="radio"
              aria-checked={picked === i}
              className="chip"
              onClick={() => {
                if (tried.length === 0) onAnswered();
                setPicked(i);
                setTried((t) => (t.includes(i) ? t : [...t, i]));
              }}
            >
              {past ? o.past : o.present}
              {tried.includes(i) && picked !== i && <small>tried</small>}
            </button>
          ))}
        </div>
        {opt && (
          <div className="stack" style={{ gap: 8 }}>
            <Feedback key={picked} tone={TONE[opt.verdict]} tag={TAG[opt.verdict]}>
              <strong>{past ? opt.past : opt.present}:</strong> <span className="muted">{opt.signal}</span>
              <br />
              {opt.feedback}
            </Feedback>
            {tried.length < 3 && <p className="faint">Try another verb and watch how the writer’s stance changes.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
