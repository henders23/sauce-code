import { useState } from 'react';
import type { FindProblemItem } from '../../content/types';
import { Paragraph } from '../Paragraph';
import { Feedback } from '../Feedback';
import { Options } from '../Options';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { Annotated, AnnotationList } from './Annotated';
import { SourcePassageBox } from './SourcePassageBox';
import { useRendered, type ActivityProps } from './useRendered';

export function FindProblem({ item, style, outro, onContinue }: ActivityProps<FindProblemItem>) {
  const flawed = useRendered(item.text, style);
  const repaired = useRendered(item.repaired, style);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const choice = item.problems.find((p) => p.id === picked);
  const source = item.sourcePassage && <SourcePassageBox passage={item.sourcePassage} />;
  const original = (
    <TextCard label={revealed ? 'Original paragraph' : 'Paragraph'}>
      <Paragraph rendered={flawed} idPrefix={`${item.id}-flawed`} />
    </TextCard>
  );

  if (!revealed) {
    return (
      <Stage
        wide={Boolean(source)}
        texts={
          source ? (
            <div className="text-grid">
              {source}
              {original}
            </div>
          ) : (
            original
          )
        }
      >
        <Step
          label="Your answer"
          title="Choose the main problem."
          titleId={`${item.id}-q`}
          actions={
            choice &&
            (choice.correct ? (
              <Continue label="Show a repaired version" onClick={() => setRevealed(true)} />
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => setRevealed(true)}>
                Skip to a repaired version
              </button>
            ))
          }
        >
          <Options labelledBy={`${item.id}-q`} value={picked} onChange={setPicked} locked={choice?.correct} options={item.problems.map((p) => ({ id: p.id, label: p.text }))} />
          {choice && (
            <Feedback key={choice.id} tone={choice.correct ? 'good' : 'partial'} tag={choice.correct ? 'Correct' : 'Not the main problem — try another'}>
              {choice.feedback}
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
          {source}
          <div className="text-grid">
            {original}
            <TextCard label="Repaired version" meta={<span className="faint">Numbers mark the changes</span>}>
              <Annotated rendered={repaired} annotations={item.annotations} idPrefix={`${item.id}-repaired`} />
            </TextCard>
          </div>
        </>
      }
    >
      {outro ?? (
        <Step label="Repaired version" title="What changed" actions={<Continue onClick={onContinue} />}>
          <AnnotationList annotations={item.annotations} label="What changed" />
        </Step>
      )}
    </Stage>
  );
}
