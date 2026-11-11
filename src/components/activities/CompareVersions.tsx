import { useState } from 'react';
import type { StyleId } from '../../citation/types';
import type { CompareVersionsItem, Rating } from '../../content/types';
import { Feedback } from '../Feedback';
import { Options } from '../Options';
import { Paragraph } from '../Paragraph';
import { Continue, Stage, Step, TextCard } from '../Stage';
import { SourcePassageBox } from './SourcePassageBox';
import { useRendered, type ActivityProps } from './useRendered';

type Version = CompareVersionsItem['versions'][number];

/** Ratings describe paragraphs, never students. */
const RATING_LABEL: Record<Rating, string> = { weak: 'Weaker', developing: 'Getting there', strong: 'Strong', excellent: 'Excellent' };

function VersionCard({ v, style, idPrefix, rated, chosen, hint }: { v: Version; style: StyleId; idPrefix: string; rated: boolean; chosen: boolean; hint?: string }) {
  const rendered = useRendered(v.text, style);
  const meta = (
    <span className="row" style={{ gap: 6 }}>
      {chosen && <span className="pill pill-solid">Your choice</span>}
      {rated && <span className={v.rating === 'weak' ? 'pill pill-dashed' : 'pill'}>{RATING_LABEL[v.rating]}</span>}
    </span>
  );
  return (
    <TextCard label={v.label} hint={hint} meta={meta}>
      <Paragraph rendered={rendered} idPrefix={idPrefix} />
    </TextCard>
  );
}

/**
 * Read the versions one at a time, then see them side by side and decide:
 * which is better, why, then the feedback. Each step replaces the last in the
 * panel, so the texts never scroll away.
 */
export function CompareVersions({ item, style, outro, onContinue }: ActivityProps<CompareVersionsItem>) {
  const { versions } = item;
  const [reading, setReading] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [rechoosing, setRechoosing] = useState(false);
  const comparing = reading >= versions.length;
  const picked = versions.find((v) => v.id === pick);
  const reasonData = item.reasons.find((r) => r.id === reason);
  const source = item.sourcePassage && <SourcePassageBox passage={item.sourcePassage} />;

  if (!comparing) {
    const v = versions[reading];
    const last = reading === versions.length - 1;
    return (
      <Stage
        texts={
          <>
            {source}
            <VersionCard key={v.id} v={v} style={style} idPrefix={`${item.id}-${v.id}`} rated={false} chosen={false} hint="Read this" />
          </>
        }
      >
        <Step
          key={v.id}
          label={`Read · ${reading + 1} of ${versions.length}`}
          title={`Read ${v.label}.`}
          actions={
            <>
              {reading > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setReading(reading - 1)}>
                  Back
                </button>
              )}
              <Continue onClick={() => setReading(reading + 1)} label={last ? (versions.length === 2 ? 'Compare both' : 'Compare them all') : `Show ${versions[reading + 1].label}`} />
            </>
          }
        >
          <p className="muted">{last ? 'Next, you’ll see the versions side by side and choose.' : 'You’ll compare the versions after reading each one.'}</p>
        </Step>
      </Stage>
    );
  }

  let step;
  if (outro) {
    step = outro;
  } else if (!picked) {
    step = (
      <Step label="Decide" title="Which version is better?" titleId={`${item.id}-pick`}>
        <Options labelledBy={`${item.id}-pick`} value={null} onChange={setPick} options={versions.map((v) => ({ id: v.id, label: v.label }))} />
      </Step>
    );
  } else if (!reasonData || rechoosing) {
    step = (
      <Step
        label={`Reason · you chose ${picked.label}`}
        title={item.reasonQuestion}
        titleId={`${item.id}-reasons`}
        actions={
          !reasonData && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPick(null)}
            >
              Change version
            </button>
          )
        }
      >
        <Options
          labelledBy={`${item.id}-reasons`}
          value={reason}
          onChange={(id) => {
            setReason(id);
            setRechoosing(false);
          }}
          options={item.reasons.map((r) => ({ id: r.id, label: r.text }))}
        />
      </Step>
    );
  } else {
    step = (
      <Step
        label="Feedback"
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setRechoosing(true)}>
              Try another reason
            </button>
            <Continue onClick={onContinue} />
          </>
        }
      >
        <Feedback tone={pick === item.best ? 'good' : 'partial'} tag={pick === item.best ? `${picked.label}: correct` : `${picked.label}: not quite`}>
          {item.picks[picked.id]}
        </Feedback>
        <Feedback
          key={reasonData.id}
          tone={reasonData.verdict === 'strong' ? 'good' : reasonData.verdict === 'partial' ? 'partial' : 'weak'}
          tag={reasonData.verdict === 'strong' ? 'Your reason: good' : reasonData.verdict === 'partial' ? 'Your reason: partly' : 'Your reason: think again'}
        >
          {reasonData.feedback}
        </Feedback>
      </Step>
    );
  }

  return (
    <Stage
      wide
      texts={
        <>
          {source}
          <div className="text-grid">
            {versions.map((v) => (
              <VersionCard key={v.id} v={v} style={style} idPrefix={`${item.id}-${v.id}`} rated={reasonData !== undefined} chosen={pick === v.id} />
            ))}
          </div>
        </>
      }
    >
      {step}
    </Stage>
  );
}
