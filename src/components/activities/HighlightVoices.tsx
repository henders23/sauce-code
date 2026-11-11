import { useState } from 'react';
import type { HighlightVoicesItem, Voice } from '../../content/types';
import { Paragraph, spanOrder } from '../Paragraph';
import { Feedback } from '../Feedback';
import { InlineToggle } from '../InlineToggle';
import { Options } from '../Options';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { useRendered, type ActivityProps } from './useRendered';

const LABEL: Record<Voice, string> = { source: 'Source', writer: 'Writer', both: 'Both' };
const BADGE: Record<Voice, string> = { source: 'S', writer: 'W', both: 'S+W' };
const CHOICES = [
  { id: 'source', label: 'Source', detail: 'An idea from the source' },
  { id: 'writer', label: 'Writer', detail: 'The writer’s own point' },
  { id: 'both', label: 'Both', detail: 'The writer building on the source' },
];

/** One part at a time: the part is outlined in the paragraph, the question is in the panel. */
export function HighlightVoices({ item, style, outro, onContinue }: ActivityProps<HighlightVoicesItem>) {
  const rendered = useRendered(item.text, style);
  const ids = spanOrder(rendered).filter((id) => id in item.key);
  const [marks, setMarks] = useState<Record<string, Voice>>({});
  const [current, setCurrent] = useState(ids[0]);
  const [checked, setChecked] = useState(false);
  const marked = ids.filter((id) => marks[id]).length;
  const score = ids.filter((id) => marks[id] === item.key[id].voice).length;

  const mark = (voice: Voice) => {
    const next = { ...marks, [current]: voice };
    setMarks(next);
    // Move on to the next part that still needs an answer.
    const from = ids.indexOf(current);
    const todo = [...ids.slice(from + 1), ...ids.slice(0, from)].find((id) => !next[id]);
    if (todo) setCurrent(todo);
  };

  return (
    <Stage
      texts={
        <TextCard label="Paragraph" hint={checked ? undefined : 'Outlined: the part in question'}>
          <Paragraph
            rendered={rendered}
            idPrefix={item.id}
            linkFootnotes={false}
            renderSpan={(id, children, index) => {
              const shown = checked ? item.key[id].voice : marks[id];
              const isCurrent = !checked && id === current;
              return (
                <InlineToggle
                  className={`voice-btn voice-${shown ?? 'none'}${isCurrent ? ' voice-current' : ''}`}
                  pressed={isCurrent}
                  disabled={checked}
                  onToggle={() => setCurrent(id)}
                  label={`Part ${index + 1}: ${shown ? LABEL[shown] : 'not marked'}.${checked ? '' : ' Activate to answer for this part.'}`}
                >
                  <span className="voice-badge" aria-hidden="true">
                    {index + 1}
                    {shown ? ` ${BADGE[shown]}` : ''}
                  </span>
                  {children}
                </InlineToggle>
              );
            }}
          />
        </TextCard>
      }
    >
      {outro ??
        (!checked ? (
          <Step
            label={`Part ${ids.indexOf(current) + 1} of ${ids.length}`}
            title="Who is speaking in the outlined part?"
            titleId={`${item.id}-voice`}
            actions={<Continue label={marked === ids.length ? 'Check' : `Check · ${marked} of ${ids.length} marked`} disabled={marked < ids.length} onClick={() => setChecked(true)} />}
          >
            <Options labelledBy={`${item.id}-voice`} value={marks[current] ?? null} onChange={(v) => mark(v as Voice)} options={CHOICES} />
            <p className="faint">To change an answer, select that part in the paragraph.</p>
          </Step>
        ) : (
          <Step label="Feedback" actions={<Continue onClick={onContinue} />}>
            <Feedback tone={score === ids.length ? 'good' : 'partial'} tag={`${score} of ${ids.length} correct`}>
              {score === ids.length
                ? 'You can tell where each source ends and the writer begins.'
                : '“Both” is usually the hardest: the writer is building on a source, so neither label fits alone.'}
            </Feedback>
            <p className="muted">The paragraph now shows the answers.</p>
            <ol className="anno-list">
              {ids.map((id, i) => {
                const k = item.key[id];
                const mine = marks[id];
                return (
                  <li key={id}>
                    <span className="anno-num">{i + 1}</span>
                    <span>
                      <strong>{LABEL[k.voice]}</strong>
                      {mine !== k.voice && <span className="muted"> (you said {LABEL[mine].toLowerCase()})</span>}. {k.note}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Step>
        ))}
    </Stage>
  );
}
