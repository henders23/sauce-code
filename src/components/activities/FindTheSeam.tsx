import { useMemo, useState, type KeyboardEvent } from 'react';
import type { FindSeamItem } from '../../content/types';
import { NotesAndReferences } from '../References';
import { Feedback } from '../Feedback';
import { UnitPieces } from '../UnitView';
import { toUnits, unitText } from '../words';
import { useRendered, type ActivityProps } from './useRendered';

export function FindTheSeam({ item, style, onAnswered }: ActivityProps<FindSeamItem>) {
  const rendered = useRendered(item.text, style);
  const { units, seamIndex } = useMemo(() => toUnits(rendered.segs), [rendered]);
  const correct = seamIndex ?? 0;
  const [pos, setPos] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const idPrefix = item.id;

  const diff = pos === null ? 0 : pos - correct;
  const verdict = Math.abs(diff) <= item.tolerance ? 'correct' : diff < 0 ? 'early' : 'late';

  const move = (to: number) => {
    if (checked) return;
    setPos(Math.max(1, Math.min(units.length - 1, to)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (checked) return;
    const cur = pos ?? Math.floor(units.length / 2);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(cur + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(cur - 1);
    else if (e.key === 'Home') move(1);
    else if (e.key === 'End') move(units.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <article className="card stack">
        <p className="faint" id={`${idPrefix}-help`}>
          Click a word to put the seam just before it. With a keyboard, focus the paragraph and use the arrow keys.
        </p>
        <p
          className="para seam-area"
          role="slider"
          tabIndex={0}
          aria-label="Seam position"
          aria-describedby={`${idPrefix}-help`}
          aria-valuemin={1}
          aria-valuemax={units.length - 1}
          aria-valuenow={pos ?? undefined}
          aria-valuetext={pos === null ? 'No seam placed yet' : `Seam before “${unitText(units[pos])}”`}
          onKeyDown={onKey}
        >
          {units.map((u, i) => (
            <span key={i}>
              {i > 0 && ' '}
              {checked && i === correct && <span className="seam-marker correct" aria-hidden="true" />}
              {pos === i && !(checked && i === correct) && <span className="seam-marker" aria-hidden="true" />}
              <span className="unit" onClick={() => i > 0 && move(i)}>
                <UnitPieces unit={u} idPrefix={idPrefix} />
              </span>
            </span>
          ))}
        </p>
        <NotesAndReferences rendered={rendered} idPrefix={idPrefix} />
      </article>

      <section className="panel stack" aria-label="Your answer">
        <div className="spread">
          <span className="muted">
            {pos === null ? 'No seam placed yet.' : `Your seam: just before “${unitText(units[pos])}”.`}
          </span>
          {!checked && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={pos === null}
              onClick={() => {
                setChecked(true);
                onAnswered();
              }}
            >
              Check my seam
            </button>
          )}
        </div>
        {checked && (
          <>
            <Feedback tone={verdict === 'correct' ? 'good' : 'partial'} tag={verdict === 'correct' ? 'Spot on' : 'Fair instinct'}>
              {item.feedback[verdict]}
            </Feedback>
            <p className="faint">
              <span className="seam-marker correct" aria-hidden="true" /> The green line marks the seam, just before “{unitText(units[correct])}”.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
