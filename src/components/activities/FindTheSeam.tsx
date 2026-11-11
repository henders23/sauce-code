import { useState } from 'react';
import type { FindSeamItem } from '../../content/types';
import { Paragraph, spanOrder, spanText } from '../Paragraph';
import { Feedback } from '../Feedback';
import { InlineToggle } from '../InlineToggle';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { useRendered, type ActivityProps } from './useRendered';

export function FindTheSeam({ item, style, outro, onContinue }: ActivityProps<FindSeamItem>) {
  const rendered = useRendered(item.text, style);
  const order = spanOrder(rendered);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const diff = pick === null ? 0 : order.indexOf(pick) - order.indexOf(item.answer);
  const verdict = diff === 0 ? 'correct' : diff < 0 ? 'early' : 'late';

  return (
    <Stage
      texts={
        <TextCard label="Paragraph" hint={checked ? undefined : 'Select an underlined phrase'}>
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
                  <InlineToggle className={`phrase-btn${pick === id ? ' phrase-selected' : ''}`} pressed={pick === id} disabled={checked} onToggle={() => setPick(id)}>
                    {children}
                  </InlineToggle>
                </>
              );
            }}
          />
        </TextCard>
      }
    >
      {outro ??
        (!checked ? (
          <Step label="Your answer" actions={<Continue label="Check" disabled={pick === null} onClick={() => setChecked(true)} />}>
            {pick === null ? (
              <p className="muted">Select a phrase in the paragraph.</p>
            ) : (
              <>
                <p className="muted">The writer’s own point begins at:</p>
                <p className="chosen">“{spanText(rendered, pick)}”</p>
              </>
            )}
          </Step>
        ) : (
          <Step label="Feedback" actions={<Continue onClick={onContinue} />}>
            <Feedback tone={verdict === 'correct' ? 'good' : 'partial'} tag={verdict === 'correct' ? 'Correct' : verdict === 'early' ? 'Too early' : 'Too late'}>
              {item.feedback[verdict]}
            </Feedback>
            <p className="muted">
              <span className="seam-marker correct" aria-hidden="true" /> The green line in the paragraph marks where the writer’s point begins.
            </p>
          </Step>
        ))}
    </Stage>
  );
}
