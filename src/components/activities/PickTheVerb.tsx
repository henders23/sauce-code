import { useState } from 'react';
import type { PickVerbItem } from '../../content/types';
import { STYLES } from '../../citation/styles';
import { Paragraph } from '../Paragraph';
import { Feedback } from '../Feedback';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { useRendered, type ActivityProps } from './useRendered';

const TONE = { good: 'good', possible: 'partial', clash: 'weak' } as const;
const TAG = { good: 'Works well', possible: 'Possible', clash: 'Clashes' } as const;

export function PickTheVerb({ item, style, outro, onContinue }: ActivityProps<PickVerbItem>) {
  const past = STYLES[style].pastTenseVerbs;
  const [picked, setPicked] = useState<number | null>(null);
  const [tried, setTried] = useState<number[]>([]);
  const opt = picked === null ? undefined : item.options[picked];
  const rendered = useRendered(item.text, style, opt ? { gap: { present: opt.present, past: opt.past } } : undefined);

  return (
    <Stage
      texts={
        <TextCard label="Paragraph">
          <Paragraph rendered={rendered} idPrefix={item.id} />
        </TextCard>
      }
    >
      {outro ?? (
        <Step label="Your answer" title="Choose a verb for the gap." titleId={`${item.id}-verbs`} actions={<Continue onClick={onContinue} disabled={!opt} />}>
          <div className="chip-grid" role="radiogroup" aria-labelledby={`${item.id}-verbs`}>
            {item.options.map((o, i) => (
              <button
                key={o.present}
                type="button"
                role="radio"
                aria-checked={picked === i}
                className="chip"
                onClick={() => {
                  setPicked(i);
                  setTried((t) => (t.includes(i) ? t : [...t, i]));
                }}
              >
                {past ? o.past : o.present}
                {tried.includes(i) && picked !== i && <small>tried</small>}
              </button>
            ))}
          </div>
          {opt ? (
            <Feedback key={picked} tone={TONE[opt.verdict]} tag={TAG[opt.verdict]}>
              <strong>{past ? opt.past : opt.present}:</strong> <span className="muted">{opt.signal}</span>
              <br />
              {opt.feedback}
            </Feedback>
          ) : (
            <p className="muted">The verb appears in the paragraph when you choose it.</p>
          )}
          {opt && tried.length < 3 && <p className="faint">Try another verb to compare.</p>}
        </Step>
      )}
    </Stage>
  );
}
