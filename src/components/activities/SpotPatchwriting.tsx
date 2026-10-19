import { useState } from 'react';
import type { SpotPatchwritingItem } from '../../content/types';
import { Paragraph, spanOrder, spanText } from '../Paragraph';
import { Feedback } from '../Feedback';
import { InlineToggle } from '../InlineToggle';
import { SourcePassageBox } from './SourcePassageBox';
import { useRendered, type ActivityProps } from './useRendered';

export function SpotPatchwriting({ item, style, onAnswered }: ActivityProps<SpotPatchwritingItem>) {
  const rendered = useRendered(item.text, style);
  const lifted = spanOrder(rendered).filter((id) => id in item.lifted);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const found = lifted.filter((id) => selected.has(id));
  const falsePositives = [...selected].filter((id) => !(id in item.lifted)).length;
  const verdict = found.length === lifted.length ? 'all' : found.length === 0 ? 'none' : 'some';

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="stack" style={{ gap: 20 }}>
      <SourcePassageBox passage={item.sourcePassage} />
      <article className="card stack">
        <div className="spread">
          <span className="para-label">The student’s paraphrase</span>
          <span className="faint">Tap a phrase to select it. Tap again to deselect.</span>
        </div>
        <Paragraph
          rendered={rendered}
          idPrefix={item.id}
          linkFootnotes={false}
          renderSpan={(id, children) => {
            const isSel = selected.has(id);
            const isLifted = checked && id in item.lifted;
            const cls = ['phrase-btn', isSel ? 'phrase-selected' : '', isLifted ? 'lifted' : ''].filter(Boolean).join(' ');
            return (
              <InlineToggle className={cls} pressed={isSel} disabled={checked} onToggle={() => toggle(id)}>
                {isSel && (
                  <span className="phrase-tick" aria-hidden="true">
                    ✓
                  </span>
                )}
                {children}
              </InlineToggle>
            );
          }}
        />
      </article>

      <section className="panel stack" aria-label="Your answer">
        <div className="spread">
          <span className="muted">
            {selected.size === 0 ? 'Nothing selected yet.' : `${selected.size} phrase${selected.size === 1 ? '' : 's'} selected.`}
          </span>
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
              Check
            </button>
          )}
        </div>
        {checked && (
          <div className="stack" style={{ gap: 12 }}>
            <Feedback tone={verdict === 'all' ? 'good' : 'partial'} tag={`${found.length} of ${lifted.length} found`}>
              {item.feedback[verdict]}
            </Feedback>
            {falsePositives > 0 && <Feedback tone="info">{item.feedback.falsePositives}</Feedback>}
            <p className="faint">The lifted phrases now have a wavy underline:</p>
            <ol className="anno-list">
              {lifted.map((id, i) => (
                <li key={id}>
                  <span className="anno-num">{i + 1}</span>
                  <span>
                    <span className="serif">“{spanText(rendered, id)}”</span> — {found.includes(id) ? 'you found this. ' : 'missed. '}
                    <span className="muted">{item.lifted[id]}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
