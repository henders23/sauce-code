import { useMemo, useState, type ReactNode } from 'react';
import type { Item } from '../content/types';
import { ACTIVITY_LABEL, MODULES } from '../content';
import { itemTexts } from '../content/texts';
import { lookupSource } from '../content/sources';
import { renderText, type RenderFlags } from '../citation/render';
import { useSettings } from '../lib/settings';
import { FollowUp } from './FollowUp';
import { Arrow } from './Stage';
import { KeyPointStep, NotesStep, itemNotes } from './Summary';
import { CompareVersions } from './activities/CompareVersions';
import { FindTheSeam } from './activities/FindTheSeam';
import { HighlightVoices } from './activities/HighlightVoices';
import { PickTheVerb } from './activities/PickTheVerb';
import { FindProblem } from './activities/FindProblem';
import { SpotPatchwriting } from './activities/SpotPatchwriting';
import { CombineSources } from './activities/CombineSources';

/** What the reveal button shows, per activity. */
function revealLabel(item: Item): string {
  switch (item.activity) {
    case 'compare-versions':
      return `Show ${item.versions[0].label}`;
    case 'spot-patchwriting':
      return 'Show the texts';
    case 'combine-sources':
      return 'Show the claim';
    case 'find-problem':
      return item.sourcePassage ? 'Show the texts' : 'Show the paragraph';
    default:
      return 'Show the paragraph';
  }
}

function Activity({ item, outro, onContinue }: { item: Item; outro: ReactNode | null; onContinue: () => void }) {
  const { effectiveStyle: style } = useSettings();
  const props = { style, outro, onContinue };
  switch (item.activity) {
    case 'compare-versions':
      return <CompareVersions item={item} {...props} />;
    case 'find-seam':
      return <FindTheSeam item={item} {...props} />;
    case 'highlight-voices':
      return <HighlightVoices item={item} {...props} />;
    case 'pick-verb':
      return <PickTheVerb item={item} {...props} />;
    case 'find-problem':
      return <FindProblem item={item} {...props} />;
    case 'spot-patchwriting':
      return <SpotPatchwriting item={item} {...props} />;
    case 'combine-sources':
      return <CombineSources item={item} {...props} />;
  }
}

type Phase = 'intro' | 'activity' | 'followup' | 'notes' | 'keypoint';

interface Props {
  item: Item;
  /** Called once, when the student has answered everything in the item. */
  onFinished: () => void;
  next: { href: string; label: string };
}

/**
 * One item, one step at a time: the task, the activity, an optional follow-up,
 * notes, then the key point. After the first screen the task stays above the
 * texts, and every later step appears in the activity's own panel.
 */
export function ItemShell({ item, onFinished, next }: Props) {
  const { effectiveStyle: style, discipline } = useSettings();
  const [phase, setPhase] = useState<Phase>('intro');
  const module = MODULES.find((m) => m.id === item.module)!;

  const flags = useMemo<RenderFlags>(() => {
    const all = itemTexts(item).map((t) => renderText(t.text, style, lookupSource, { gap: { present: 'x', past: 'x' } }).flags);
    return {
      locator: all.some((f) => f.locator),
      ibid: all.some((f) => f.ibid),
      shortNote: all.some((f) => f.shortNote),
      mlaFullName: all.some((f) => f.mlaFullName),
      quotation: all.some((f) => f.quotation),
    };
  }, [item, style]);
  const notes = itemNotes(item, style, discipline, flags);

  const wrapUp = () => {
    onFinished();
    setPhase(notes.length > 0 ? 'notes' : 'keypoint');
  };

  if (phase === 'intro') {
    return (
      <section className="item-intro stack fade-in" aria-labelledby={`${item.id}-task`}>
        <p className="label">
          {module.name} · {ACTIVITY_LABEL[item.activity]}
        </p>
        {item.context && <p className="lede">{item.context}</p>}
        <div className="stack" style={{ gap: 6 }}>
          <p className="label">Your task</p>
          <h1 id={`${item.id}-task`} className="task-title">
            {item.question}
          </h1>
        </div>
        <div>
          <button type="button" className="btn btn-primary btn-large" onClick={() => setPhase('activity')}>
            {revealLabel(item)}
            <Arrow />
          </button>
        </div>
      </section>
    );
  }

  const outro =
    phase === 'followup' && item.followUp ? (
      <FollowUp data={item.followUp} onContinue={wrapUp} />
    ) : phase === 'notes' ? (
      <NotesStep notes={notes} style={style} onContinue={() => setPhase('keypoint')} />
    ) : phase === 'keypoint' ? (
      <KeyPointStep text={item.keyPoint} next={next} style={style} showBasics={notes.length === 0} />
    ) : null;

  return (
    <>
      <header className="task">
        <p className="label">Task</p>
        <h1 id={`${item.id}-task`} className="task-title">
          {item.question}
        </h1>
      </header>
      <Activity item={item} outro={outro} onContinue={() => (item.followUp ? setPhase('followup') : wrapUp())} />
    </>
  );
}
