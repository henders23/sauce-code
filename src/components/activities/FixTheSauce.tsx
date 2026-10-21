import { useState } from 'react';
import type { FixSauceItem } from '../../content/types';
import { Paragraph } from '../Paragraph';
import { Feedback } from '../Feedback';
import { Annotated } from './Annotated';
import { SourcePassageBox } from './SourcePassageBox';
import { useRendered, type ActivityProps } from './useRendered';

export function FixTheSauce({ item, style, onAnswered }: ActivityProps<FixSauceItem>) {
  const flawed = useRendered(item.text, style);
  const repaired = useRendered(item.repaired, style);
  const [picked, setPicked] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const choice = item.problems.find((p) => p.id === picked);

  const reveal = () => {
    if (!revealed) {
      setRevealed(true);
      onAnswered();
    }
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      {item.sourcePassage && <SourcePassageBox passage={item.sourcePassage} />}
      <article className="card stack">
        <span className="para-label">The paragraph</span>
        <Paragraph rendered={flawed} idPrefix={`${item.id}-flawed`} />
      </article>

      <section className="panel stack" aria-label="Your answer">
        <h3 id={`${item.id}-q`} style={{ fontSize: 17, fontWeight: 600 }}>
          Choose the main problem:
        </h3>
        <div className="option-list" role="radiogroup" aria-labelledby={`${item.id}-q`}>
          {item.problems.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={picked === p.id}
              className="option"
              onClick={() => {
                setPicked(p.id);
                setAttempts((a) => a + 1);
                if (p.correct) reveal();
              }}
            >
              <span className="mark" aria-hidden="true" />
              <span>{p.text}</span>
            </button>
          ))}
        </div>
        {choice && (
          <Feedback key={choice.id} tone={choice.correct ? 'good' : 'partial'} tag={choice.correct ? 'Correct' : 'Not the main problem'}>
            {choice.feedback}
          </Feedback>
        )}
        {choice && !choice.correct && !revealed && attempts >= 1 && (
          <div className="row">
            <span className="muted">Try another option, or</span>
            <button type="button" className="btn btn-small btn-ghost" onClick={reveal}>
              show me the repaired version
            </button>
          </div>
        )}
      </section>

      {revealed && (
        <article className="card stack fade-in">
          <div className="spread">
            <span className="para-label">A repaired version</span>
            <span className="faint">A repair of the sample paragraph — never of your own work.</span>
          </div>
          <Annotated rendered={repaired} annotations={item.annotations} idPrefix={`${item.id}-repaired`} />
        </article>
      )}
    </div>
  );
}
