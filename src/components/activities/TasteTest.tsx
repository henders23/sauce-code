import { useState } from 'react';
import type { TasteTestItem } from '../../content/types';
import { Feedback } from '../Feedback';
import { FollowUp } from '../FollowUp';
import { SourcePassageBox } from './SourcePassageBox';
import { VersionSteps } from './VersionSteps';
import type { ActivityProps } from './useRendered';

/**
 * One question at a time, in the answer panel beside the versions: which is
 * better, why, the feedback, then the follow-up. Answering replaces the panel's
 * content rather than adding below it, so the texts never scroll away.
 * Calls `onAnswered` once the follow-up (if any) is answered too.
 */
export function TasteTest({ item, style, onAnswered }: ActivityProps<TasteTestItem>) {
  const [pick, setPick] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [rechoosing, setRechoosing] = useState(false);
  const [onFollowUp, setOnFollowUp] = useState(false);
  const [done, setDone] = useState(false);
  const reasonData = item.reasons.find((r) => r.id === reason);
  const picked = item.versions.find((v) => v.id === pick);

  const finish = () => {
    if (!done) {
      setDone(true);
      onAnswered();
    }
  };

  let panel;
  if (onFollowUp && item.followUp) {
    panel = <FollowUp inline data={item.followUp} onAnswered={finish} />;
  } else if (!picked) {
    panel = (
      <>
        <span id={`${item.id}-pick`} style={{ fontWeight: 600, fontSize: 17 }}>
          {item.question}
        </span>
        <div className="row" role="radiogroup" aria-labelledby={`${item.id}-pick`}>
          {item.versions.map((v) => (
            <button key={v.id} type="button" role="radio" aria-checked={false} className="chip" style={{ minWidth: 160 }} onClick={() => setPick(v.id)}>
              {v.label} works better
            </button>
          ))}
        </div>
      </>
    );
  } else if (!reasonData || rechoosing) {
    panel = (
      <>
        <div className="spread">
          <span className="muted">You chose {picked.label}.</span>
          {!reasonData && (
            <button type="button" className="btn btn-small btn-ghost" onClick={() => setPick(null)}>
              Change
            </button>
          )}
        </div>
        <h3 id={`${item.id}-reasons`} style={{ fontSize: 17, fontWeight: 600 }}>
          {item.reasonQuestion}
        </h3>
        <div className="option-list" role="radiogroup" aria-labelledby={`${item.id}-reasons`}>
          {item.reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={reason === r.id}
              className="option"
              onClick={() => {
                setReason(r.id);
                setRechoosing(false);
                if (!item.followUp) finish();
              }}
            >
              <span className="mark" aria-hidden="true" />
              <span>{r.text}</span>
            </button>
          ))}
        </div>
      </>
    );
  } else {
    panel = (
      <>
        <Feedback tone={pick === item.best ? 'good' : 'partial'} tag={pick === item.best ? 'Correct' : 'Not quite'}>
          {item.picks[picked.id]}
        </Feedback>
        <Feedback
          key={reasonData.id}
          tone={reasonData.verdict === 'strong' ? 'good' : reasonData.verdict === 'partial' ? 'partial' : 'weak'}
          tag={reasonData.verdict === 'strong' ? 'Good reason' : reasonData.verdict === 'partial' ? 'Partly' : 'Think again'}
        >
          {reasonData.feedback}
        </Feedback>
        <div className="spread">
          <button type="button" className="btn btn-small btn-ghost" onClick={() => setRechoosing(true)}>
            Try another reason
          </button>
          {item.followUp && (
            <button type="button" className="btn btn-primary" onClick={() => setOnFollowUp(true)}>
              Next question
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <VersionSteps
      versions={item.versions}
      style={style}
      idPrefix={item.id}
      rated={reasonData !== undefined}
      selected={pick}
      source={item.sourcePassage && <SourcePassageBox passage={item.sourcePassage} />}
    >
      <section className="panel stack" aria-label="Your answer" aria-live="polite">
        {panel}
        {done && (
          <a className="faint" href={`#${item.id}-end`}>
            Notes and the next item are below ↓
          </a>
        )}
      </section>
    </VersionSteps>
  );
}
