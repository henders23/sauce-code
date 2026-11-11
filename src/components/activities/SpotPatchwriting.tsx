import { useState } from 'react';
import type { SpotPatchwritingItem } from '../../content/types';
import { Paragraph, spanOrder, spanText } from '../Paragraph';
import { Feedback } from '../Feedback';
import { InlineToggle } from '../InlineToggle';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { SourcePassageBox } from './SourcePassageBox';
import { useRendered, type ActivityProps } from './useRendered';

export function SpotPatchwriting({ item, style, outro, onContinue }: ActivityProps<SpotPatchwritingItem>) {
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
    <Stage
      wide
      texts={
        <div className="text-grid">
          <SourcePassageBox passage={item.sourcePassage} />
          <TextCard label="Student’s paraphrase" hint={checked ? undefined : 'Select underlined phrases'}>
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
          </TextCard>
        </div>
      }
    >
      {outro ??
        (!checked ? (
          <Step label="Your answer" actions={<Continue label="Check" disabled={selected.size === 0} onClick={() => setChecked(true)} />}>
            <p className="muted">
              {selected.size === 0 ? 'Select phrases in the student’s paraphrase. Select again to undo.' : `${selected.size} phrase${selected.size === 1 ? '' : 's'} selected.`}
            </p>
          </Step>
        ) : (
          <Step label="Feedback" actions={<Continue onClick={onContinue} />}>
            <Feedback tone={verdict === 'all' ? 'good' : 'partial'} tag={`${found.length} of ${lifted.length} found`}>
              {item.feedback[verdict]}
            </Feedback>
            {falsePositives > 0 && <Feedback tone="info">{item.feedback.falsePositives}</Feedback>}
            <p className="muted">Copied phrases now have a wavy underline.</p>
            <ol className="anno-list">
              {lifted.map((id, i) => (
                <li key={id}>
                  <span className="anno-num">{i + 1}</span>
                  <span>
                    <strong>“{spanText(rendered, id)}”</strong> <span className="muted">({found.includes(id) ? 'found' : 'missed'})</span>
                    <br />
                    {item.lifted[id]}
                  </span>
                </li>
              ))}
            </ol>
          </Step>
        ))}
    </Stage>
  );
}
