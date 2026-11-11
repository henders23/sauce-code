import { useState } from 'react';
import type { FollowUp as FollowUpData } from '../content/types';
import { Feedback } from './Feedback';
import { Options } from './Options';
import { Continue, Step } from './Stage';

/** A second question about the same texts, asked in the panel while they stay in view. */
export function FollowUp({ data, onContinue }: { data: FollowUpData; onContinue: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = data.options.find((o) => o.id === picked);
  return (
    <Step label="One more question" title={data.question} titleId="followup-q" actions={<Continue onClick={onContinue} disabled={!choice} />}>
      <Options labelledBy="followup-q" value={picked} onChange={setPicked} options={data.options.map((o) => ({ id: o.id, label: o.text }))} />
      {choice && (
        <Feedback key={choice.id} tone={choice.good ? 'good' : 'info'} tag={choice.good ? 'Correct' : 'Try another'}>
          {choice.feedback}
        </Feedback>
      )}
    </Step>
  );
}
