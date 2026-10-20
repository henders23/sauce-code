import { useEffect, useMemo, useState } from 'react';
import type { Item } from '../content/types';
import { ACTIVITY_LABEL, MODULES, disciplineLabel } from '../content';
import { itemTexts } from '../content/texts';
import { lookupSource } from '../content/sources';
import { renderText, type RenderFlags } from '../citation/render';
import { useSettings } from '../lib/settings';
import { ConventionNotes } from './ConventionNotes';
import { FollowUp } from './FollowUp';
import { TasteTest } from './activities/TasteTest';
import { FindTheSeam } from './activities/FindTheSeam';
import { HighlightVoices } from './activities/HighlightVoices';
import { PickTheVerb } from './activities/PickTheVerb';
import { FixTheSauce } from './activities/FixTheSauce';
import { SpotPatchwriting } from './activities/SpotPatchwriting';
import { BuildBlend } from './activities/BuildBlend';

/** What the reveal button shows, per activity. */
function revealLabel(item: Item): string {
  switch (item.activity) {
    case 'taste-test':
      return `Show ${item.versions[0].label}`;
    case 'spot-patchwriting':
      return 'Show the texts';
    case 'build-blend':
      return 'Show the sources';
    default:
      return 'Show the paragraph';
  }
}

/** What happens after the reveal, when it isn't obvious. */
function revealHint(item: Item): string | null {
  return item.activity === 'taste-test' ? 'You’ll read each version in turn, then compare them.' : null;
}

function Activity({ item, onAnswered }: { item: Item; onAnswered: () => void }) {
  const { effectiveStyle: style } = useSettings();
  switch (item.activity) {
    case 'taste-test':
      return <TasteTest item={item} style={style} onAnswered={onAnswered} />;
    case 'find-seam':
      return <FindTheSeam item={item} style={style} onAnswered={onAnswered} />;
    case 'highlight-voices':
      return <HighlightVoices item={item} style={style} onAnswered={onAnswered} />;
    case 'pick-verb':
      return <PickTheVerb item={item} style={style} onAnswered={onAnswered} />;
    case 'fix-sauce':
      return <FixTheSauce item={item} style={style} onAnswered={onAnswered} />;
    case 'spot-patchwriting':
      return <SpotPatchwriting item={item} style={style} onAnswered={onAnswered} />;
    case 'build-blend':
      return <BuildBlend item={item} style={style} onAnswered={onAnswered} />;
  }
}

interface Props {
  item: Item;
  onFinished: () => void;
  next: { href: string; label: string };
}

export function ItemShell({ item, onFinished, next }: Props) {
  const { effectiveStyle: style, discipline } = useSettings();
  const hint = revealHint(item);
  const [shown, setShown] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [followUpDone, setFollowUpDone] = useState(false);
  const module = MODULES.find((m) => m.id === item.module)!;
  const activity = ACTIVITY_LABEL[item.activity];
  // Compare-versions asks its follow-up inside its own answer panel, beside the texts.
  const ownFollowUp = item.activity === 'taste-test';
  const finished = answered && (ownFollowUp || !item.followUp || followUpDone);

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

  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="stack" style={{ gap: 20, maxWidth: 820 }}>
        <div className="stack" style={{ gap: 6 }}>
          <p className="eyebrow">{module.name}</p>
          <p className="faint" style={{ fontSize: 14 }}>
            {[activity, ...item.disciplines.map(disciplineLabel)].join(' · ')}
          </p>
        </div>
        {item.context && <p style={{ fontSize: 18, color: 'var(--text-2)' }}>{item.context}</p>}
        <section className="task" aria-labelledby={`${item.id}-task`}>
          <span className="eyebrow">Your task</span>
          <h1 id={`${item.id}-task`} className="serif task-title">
            {item.question}
          </h1>
          {!shown && (
            <div className="spread">
              {hint ? <span className="faint" style={{ fontSize: 14 }}>{hint}</span> : <span />}
              <button type="button" className="btn btn-primary btn-large" onClick={() => setShown(true)}>
                {revealLabel(item)}
              </button>
            </div>
          )}
        </section>
      </header>

      {shown && (
        <div className="fade-in">
          <Activity item={item} onAnswered={() => setAnswered(true)} />
        </div>
      )}

      {answered && item.followUp && !ownFollowUp && <FollowUp data={item.followUp} onAnswered={() => setFollowUpDone(true)} />}

      {finished && (
        <FinishedSection
          item={item}
          flags={flags}
          discipline={discipline}
          style={style}
          next={next}
          onShown={onFinished}
        />
      )}
    </div>
  );
}

function FinishedSection({
  item,
  flags,
  discipline,
  style,
  next,
  onShown,
}: {
  item: Item;
  flags: RenderFlags;
  discipline: ReturnType<typeof useSettings>['discipline'];
  style: ReturnType<typeof useSettings>['effectiveStyle'];
  next: Props['next'];
  onShown: () => void;
}) {
  useEffect(() => {
    onShown();
    // Runs once, when the student first reaches the end of the item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div id={`${item.id}-end`} className="stack" style={{ gap: 24, scrollMarginTop: 84 }}>
      <ConventionNotes style={style} discipline={discipline} itemDisciplines={item.disciplines} notes={item.notes} flags={flags} />
      <div className="key-point stack fade-in" style={{ gap: 4 }}>
        <span className="eyebrow">Key point</span>
        <p>{item.chefsNote}</p>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <a className="btn btn-primary" href={next.href}>
          {next.label}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
