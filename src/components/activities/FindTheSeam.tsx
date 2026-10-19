import { useState } from 'react';
import type { FindSeamItem } from '../../content/types';
import { Paragraph, spanOrder, spanText } from '../Paragraph';
import { Feedback } from '../Feedback';
import { InlineToggle } from '../InlineToggle';
import { useRendered, type ActivityProps } from './useRendered';

export function FindTheSeam({ item, style, onAnswered }: ActivityProps<FindSeamItem>) {
  const rendered = useRendered(item.text, style);
  const order = spanOrder(rendered);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const diff = pick === null ? 0 : order.indexOf(pick) - order.indexOf(item.answer);
  const verdict = diff === 0 ? 'correct' : diff < 0 ? 'early' : 'late';

  return (
    <div className="stack" style={{ gap: 20 }}>
      <article className="card stack">
        <p className="faint">Tap a phrase. The phrases you can choose are underlined.</p>
        <Paragraph
          rendered={rendered}
          idPrefix={item.id}
          linkFootnotes={false}
          renderSpan={(id, children) => {
            const showCorrect = checked && id === item.answer;
            const showPick = id === pick && !showCorrect;
            return (
              <>
                {showCorrect && <span className="seam-marker correct" aria-hidden="true" />}
                {showPick && <span className="seam-marker" aria-hidden="true" />}
                <InlineToggle
                  className={`phrase-btn${pick === id ? ' phrase-selected' : ''}`}
                  pressed={pick === id}
                  disabled={checked}
                  onToggle={() => setPick(id)}
                >
                  {children}
                </InlineToggle>
              </>
            );
          }}
        />
      </article>

      <section className="panel stack" aria-label="Your answer">
        <div className="spread">
          <span className="muted">
            {pick === null ? 'No phrase chosen yet.' : `You chose: “${spanText(rendered, pick)}”`}
          </span>
          {!checked && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={pick === null}
              onClick={() => {
                setChecked(true);
                onAnswered();
              }}
            >
              Check
            </button>
          )}
        </div>
        {checked && (
          <>
            <Feedback tone={verdict === 'correct' ? 'good' : 'partial'} tag={verdict === 'correct' ? 'Spot on' : 'Fair instinct'}>
              {item.feedback[verdict]}
            </Feedback>
            <p className="faint">
              <span className="seam-marker correct" aria-hidden="true" /> The green line marks the seam, just before “{spanText(rendered, item.answer)}”.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
