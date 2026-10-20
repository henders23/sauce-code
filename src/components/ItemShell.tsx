import { useEffect, useMemo, useState } from 'react';
import type { Item } from '../content/types';
import { ACTIVITY_LABEL, MODULES, disciplineLabel } from '../content';
import { itemTexts } from '../content/texts';
import { lookupSource } from '../content/sources';
import { renderText, type RenderFlags } from '../citation/render';
import { STYLES } from '../citation/styles';
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

const DIFFICULTY = ['', 'Starter', 'Main', 'Chef’s special'];

/** What the reveal button shows, per activity. */
function revealLabel(item: Item): string {
  switch (item.activity) {
    case 'taste-test':
      return `Show the ${item.versions.length === 2 ? 'two' : item.versions.length} versions`;
    case 'spot-patchwriting':
      return 'Show the texts';
    case 'build-blend':
      return 'Show the sources';
    default:
      return 'Show the paragraph';
  }
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
  const [shown, setShown] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [followUpDone, setFollowUpDone] = useState(false);
  const module = MODULES.find((m) => m.id === item.module)!;
  const activity = ACTIVITY_LABEL[item.activity];
  const finished = answered && (!item.followUp || followUpDone);

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
      <header className="stack" style={{ gap: 10 }}>
        <p className="eyebrow">
          {module.name} · <span style={{ textTransform: 'none', letterSpacing: 0 }}>{module.plain}</span>
        </p>
        <h1 className="serif" style={{ fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 400 }}>
          {item.title}
        </h1>
        <div className="row">
          <span className="pill">
            {activity.name} <span className="muted">— {activity.plain}</span>
          </span>
          {item.disciplines.map((d) => (
            <span key={d} className="pill">
              {disciplineLabel(d)}
            </span>
          ))}
          <span className="pill">{DIFFICULTY[item.difficulty]}</span>
          <span className="pill">
            Shown in {STYLES[style].label}
          </span>
        </div>
        {item.context && <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 760 }}>{item.context}</p>}
        <p style={{ fontSize: 19, fontWeight: 600, maxWidth: 760 }}>{item.question}</p>
      </header>

      {shown ? (
        <div className="fade-in">
          <Activity item={item} onAnswered={() => setAnswered(true)} />
        </div>
      ) : (
        <div>
          <button type="button" className="btn btn-primary btn-large" onClick={() => setShown(true)}>
            {revealLabel(item)}
          </button>
        </div>
      )}

      {answered && item.followUp && <FollowUp data={item.followUp} onAnswered={() => setFollowUpDone(true)} />}

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
    <>
      <ConventionNotes style={style} discipline={discipline} itemDisciplines={item.disciplines} notes={item.notes} flags={flags} />
      <div className="chef fade-in">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: 2 }}>
          <path d="M6 13.9V20h12v-6.1A4 4 0 0 0 17 6a5 5 0 0 0-10 0 4 4 0 0 0-1 7.9z" />
          <path d="M6 17h12" />
        </svg>
        <div className="stack" style={{ gap: 4 }}>
          <span className="eyebrow">Chef’s note</span>
          <p>{item.chefsNote}</p>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <a className="btn btn-primary" href={next.href}>
          {next.label}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </>
  );
}
