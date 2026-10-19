import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { SpotPatchwritingItem } from '../../content/types';
import { NotesAndReferences } from '../References';
import { Feedback } from '../Feedback';
import { UnitPieces } from '../UnitView';
import { toUnits, unitText } from '../words';
import { SourcePassageBox } from './SourcePassageBox';
import { useRendered, type ActivityProps } from './useRendered';

export function SpotPatchwriting({ item, style, onAnswered }: ActivityProps<SpotPatchwritingItem>) {
  const rendered = useRendered(item.text, style);
  const { units } = useMemo(() => toUnits(rendered.segs), [rendered]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [focus, setFocus] = useState(0);
  const [checked, setChecked] = useState(false);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  const spans = Object.keys(item.lifted);
  const spanOf = (i: number) => units[i].span;
  const found = spans.filter((s) => [...selected].some((i) => spanOf(i) === s));
  const falsePositives = [...selected].filter((i) => !spanOf(i)).length;

  const toggle = (i: number) => {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const focusUnit = (i: number) => {
    const j = Math.max(0, Math.min(units.length - 1, i));
    setFocus(j);
    refs.current[j]?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') focusUnit(i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') focusUnit(i - 1);
    else if (e.key === 'Home') focusUnit(0);
    else if (e.key === 'End') focusUnit(units.length - 1);
    else if (e.key === ' ' || e.key === 'Enter') toggle(i);
    else return;
    e.preventDefault();
  };

  const verdict = found.length === spans.length ? 'all' : found.length === 0 ? 'none' : 'some';

  return (
    <div className="stack" style={{ gap: 20 }}>
      <SourcePassageBox passage={item.sourcePassage} />
      <article className="card stack">
        <div className="spread">
          <span className="para-label">The student’s paraphrase</span>
          <span className="faint" id={`${item.id}-help`}>
            Click words to select them. Keyboard: arrow keys to move, Space to select.
          </span>
        </div>
        <p className="para" role="group" aria-label="Paraphrase — select lifted words" aria-describedby={`${item.id}-help`}>
          {units.map((u, i) => {
            const isSel = selected.has(i);
            const lifted = checked && u.span && spans.includes(u.span);
            const cls = ['unit', isSel ? 'selected-unit' : '', lifted ? 'lifted' : '', lifted && isSel ? 'found' : ''].filter(Boolean).join(' ');
            return (
              <span key={i}>
                {i > 0 && ' '}
                <span
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className={cls}
                  role="checkbox"
                  aria-checked={isSel}
                  aria-label={unitText(u)}
                  tabIndex={i === focus ? 0 : -1}
                  onClick={() => {
                    setFocus(i);
                    toggle(i);
                  }}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <UnitPieces unit={u} idPrefix={item.id} />
                </span>
              </span>
            );
          })}
        </p>
        <NotesAndReferences rendered={rendered} idPrefix={item.id} />
      </article>

      <section className="panel stack" aria-label="Your answer">
        <div className="spread">
          <span className="muted">{selected.size === 0 ? 'Nothing selected yet.' : `${selected.size} word${selected.size === 1 ? '' : 's'} selected.`}</span>
          {!checked && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={selected.size === 0}
              onClick={() => {
                setChecked(true);
                onAnswered();
              }}
            >
              Check my selection
            </button>
          )}
        </div>
        {checked && (
          <div className="stack" style={{ gap: 12 }}>
            <Feedback tone={verdict === 'all' ? 'good' : 'partial'} tag={`${found.length} of ${spans.length} found`}>
              {item.feedback[verdict]}
            </Feedback>
            {falsePositives > 0 && <Feedback tone="info">{item.feedback.falsePositives}</Feedback>}
            <p className="faint">Lifted phrases now have a wavy underline. Here is each one:</p>
            <ol className="anno-list">
              {spans.map((s, i) => {
                const words = units.filter((u) => u.span === s).map(unitText).join(' ');
                return (
                  <li key={s}>
                    <span className="anno-num">{i + 1}</span>
                    <span>
                      <span className="serif">“{words}”</span> — {found.includes(s) ? 'you found this. ' : 'missed. '}
                      <span className="muted">{item.lifted[s]}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
