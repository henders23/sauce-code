import { useState } from 'react';
import type { HighlightVoicesItem, Voice } from '../../content/types';
import { Paragraph } from '../Paragraph';
import { Feedback } from '../Feedback';
import { useRendered, type ActivityProps } from './useRendered';

const CYCLE: (Voice | null)[] = [null, 'source', 'writer', 'both'];
const LABEL: Record<Voice, string> = { source: 'Source', writer: 'Writer', both: 'Both' };
const BADGE: Record<Voice, string> = { source: 'S', writer: 'W', both: 'S+W' };

export function HighlightVoices({ item, style, onAnswered }: ActivityProps<HighlightVoicesItem>) {
  const rendered = useRendered(item.text, style);
  const ids = Object.keys(item.key);
  const [marks, setMarks] = useState<Record<string, Voice | null>>({});
  const [checked, setChecked] = useState(false);
  const allMarked = ids.every((id) => marks[id]);
  const score = ids.filter((id) => marks[id] === item.key[id].voice).length;

  const cycle = (id: string) => {
    if (checked) return;
    setMarks((m) => ({ ...m, [id]: CYCLE[(CYCLE.indexOf(m[id] ?? null) + 1) % CYCLE.length] }));
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="row faint" aria-label="Key">
        <span>Click each part to cycle through:</span>
        <span className="voice-source" style={{ padding: '2px 6px', borderRadius: 4 }}>
          <span className="voice-badge">S</span>Source
        </span>
        <span className="voice-writer" style={{ padding: '2px 6px', borderRadius: 4 }}>
          <span className="voice-badge">W</span>Writer
        </span>
        <span className="voice-both" style={{ padding: '2px 6px', borderRadius: 4 }}>
          <span className="voice-badge">S+W</span>Both
        </span>
      </div>
      <article className="card stack">
        <Paragraph
          rendered={rendered}
          idPrefix={item.id}
          linkFootnotes={false}
          renderSpan={(id, children, index) => {
            const shown = checked ? item.key[id].voice : marks[id];
            return (
              <button
                type="button"
                className={`voice-btn voice-${shown ?? 'none'}`}
                onClick={() => cycle(id)}
                aria-label={`Part ${index + 1}: ${shown ? LABEL[shown] : 'not marked'}. ${checked ? '' : 'Activate to change.'}`}
              >
                <span className="voice-badge" aria-hidden="true">
                  {shown ? BADGE[shown] : index + 1}
                </span>
                {children}
              </button>
            );
          }}
        />
      </article>

      <section className="panel stack" aria-label="Your answer">
        <div className="spread">
          <span className="muted">
            {checked ? 'Showing the intended analysis.' : `${ids.filter((id) => marks[id]).length} of ${ids.length} parts marked.`}
          </span>
          {!checked && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!allMarked}
              onClick={() => {
                setChecked(true);
                onAnswered();
              }}
            >
              Check my highlighting
            </button>
          )}
        </div>
        {checked && (
          <div className="stack" style={{ gap: 12 }}>
            <Feedback tone={score === ids.length ? 'good' : 'partial'} tag={`${score} of ${ids.length} match`}>
              {score === ids.length
                ? 'Every part matches. You can tell exactly where each source ends and the writer begins.'
                : 'A reasonable start. The parts marked “Both” are usually the hardest: the writer is building on a source, so neither label alone fits.'}
            </Feedback>
            <ol className="anno-list">
              {ids.map((id, i) => {
                const k = item.key[id];
                const mine = marks[id];
                return (
                  <li key={id}>
                    <span className="anno-num">{i + 1}</span>
                    <span>
                      <strong>{LABEL[k.voice]}</strong>
                      {mine && mine !== k.voice && <span className="muted"> (you said {LABEL[mine].toLowerCase()})</span>}. {k.note}
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
