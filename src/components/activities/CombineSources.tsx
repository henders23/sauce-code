import { useState } from 'react';
import type { CombineSourcesItem, SourceRole } from '../../content/types';
import { lookupSource } from '../../content/sources';
import { sourceLabel } from '../sourceLabel';
import { Feedback } from '../Feedback';
import { Options } from '../Options';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { Annotated, AnnotationList } from './Annotated';
import { useRendered, type ActivityProps } from './useRendered';

const ROLES: { id: SourceRole; label: string }[] = [
  { id: 'supports', label: 'Supports the claim' },
  { id: 'complicates', label: 'Complicates the claim' },
  { id: 'irrelevant', label: 'Not relevant to the claim' },
];
const ROLE_LABEL: Record<SourceRole, string> = { supports: 'Supports', complicates: 'Complicates', irrelevant: 'Not relevant' };
const letter = (i: number) => String.fromCharCode(65 + i);

/** One source at a time against the claim, then a paragraph that combines them. */
export function CombineSources({ item, style, outro, onContinue }: ActivityProps<CombineSourcesItem>) {
  const synthesis = useRendered(item.synthesis, style);
  const [index, setIndex] = useState(0);
  const [roles, setRoles] = useState<Record<string, SourceRole>>({});
  const total = item.summaries.length;
  const combining = index >= total;
  const score = item.summaries.filter((s) => roles[s.id] === s.role).length;

  const claim = (
    <TextCard label="Claim" plain>
      <p className="claim">{item.claim}</p>
    </TextCard>
  );
  const sourceCard = (i: number, opts: { hint?: string; answer?: boolean } = {}) => {
    const s = item.summaries[i];
    return (
      <TextCard key={s.id} label={`Source ${letter(i)}`} hint={opts.hint} meta={opts.answer && <span className="pill">{ROLE_LABEL[s.role]}</span>}>
        <p className="para small">{s.text}</p>
        <p className="faint">{sourceLabel(lookupSource(s.source)!)}</p>
      </TextCard>
    );
  };

  if (!combining) {
    const s = item.summaries[index];
    const mine = roles[s.id];
    const last = index === total - 1;
    return (
      <Stage
        texts={
          <>
            {claim}
            {sourceCard(index, { hint: mine ? undefined : 'Read this' })}
          </>
        }
      >
        <Step
          key={s.id}
          label={`Source ${letter(index)} · ${index + 1} of ${total}`}
          title="What does this source do for the claim?"
          titleId={`${item.id}-${s.id}`}
          actions={mine && <Continue label={last ? 'Show a combined paragraph' : `Show Source ${letter(index + 1)}`} onClick={() => setIndex(index + 1)} />}
        >
          <Options
            labelledBy={`${item.id}-${s.id}`}
            value={mine ?? null}
            locked={Boolean(mine)}
            onChange={(r) => setRoles((x) => ({ ...x, [s.id]: r as SourceRole }))}
            options={ROLES}
          />
          {mine && (
            <Feedback tone={mine === s.role ? 'good' : 'partial'} tag={mine === s.role ? 'Correct' : `Answer: ${ROLE_LABEL[s.role]}`}>
              {s.feedback[mine]}
            </Feedback>
          )}
        </Step>
      </Stage>
    );
  }

  return (
    <Stage
      wide
      texts={
        <>
          {claim}
          <TextCard label="Combined paragraph" meta={<span className="faint">Numbers mark each move</span>}>
            <Annotated rendered={synthesis} annotations={item.annotations} idPrefix={`${item.id}-synthesis`} />
          </TextCard>
          <div className="text-grid text-grid-wrap">{item.summaries.map((_, i) => sourceCard(i, { answer: true }))}</div>
        </>
      }
    >
      {outro ?? (
        <Step label={`Combined paragraph · you matched ${score} of ${total}`} title="One way to combine the sources" actions={<Continue onClick={onContinue} />}>
          <AnnotationList annotations={item.annotations} label="How the paragraph combines the sources" />
        </Step>
      )}
    </Stage>
  );
}
