import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { StyleId } from '../../citation/types';
import type { TasteTestItem } from '../../content/types';
import { Paragraph } from '../Paragraph';
import { RATING_LABEL } from '../ratings';
import { useRendered } from './useRendered';

type Version = TasteTestItem['versions'][number];

/** "Version A" → "A", for the small version tabs. */
const short = (label: string) => label.replace(/^Version\s+/i, '');

function VersionCard({ v, style, idPrefix, rated, selected }: { v: Version; style: StyleId; idPrefix: string; rated: boolean; selected?: boolean }) {
  const rendered = useRendered(v.text, style);
  return (
    <article className={selected ? 'card card-selected stack' : 'card stack'} aria-label={v.label}>
      <div className="spread" style={{ minHeight: 28 }}>
        <span className="para-label">{v.label}</span>
        {rated && <span className={v.rating === 'weak' ? 'pill pill-dashed' : 'pill pill-accent'}>{RATING_LABEL[v.rating]}</span>}
      </div>
      <Paragraph rendered={rendered} idPrefix={idPrefix} />
    </article>
  );
}

/**
 * Shows the versions one at a time, then all of them side by side. The
 * decision (`children`) only appears once every version is on screen, so the
 * student never judges a text they can't see.
 */
export function VersionSteps({
  versions,
  style,
  idPrefix,
  rated,
  selected,
  source,
  children,
}: {
  versions: Version[];
  style: StyleId;
  idPrefix: string;
  /** Show each version's rating — once the student has answered. */
  rated: boolean;
  selected?: string | null;
  /** An original passage the versions are judged against: kept on screen with them. */
  source?: ReactNode;
  children: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const compare = useRef<HTMLDivElement>(null);
  const comparing = step >= versions.length;
  // Bring the whole comparison, and the decision under it, into view together.
  useEffect(() => {
    if (comparing) compare.current?.scrollIntoView({ block: 'start' });
  }, [comparing]);

  if (!comparing) {
    const v = versions[step];
    const last = step === versions.length - 1;
    return (
      <div key={v.id} className="stack fade-in" style={{ gap: 16 }}>
        <div className="spread">
          <p style={{ fontWeight: 600 }}>{step === 0 ? `Read ${v.label} first.` : `Now read ${v.label}.`}</p>
          <div className="row" style={{ gap: 6 }} role="group" aria-label="Versions">
            {versions.map((x, i) =>
              i <= step ? (
                <button
                  key={x.id}
                  type="button"
                  className="version-tab"
                  aria-label={x.label}
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => setStep(i)}
                >
                  {short(x.label)}
                </button>
              ) : (
                <span key={x.id} className="version-tab locked" role="img" aria-label={`${x.label}, not shown yet`}>
                  {short(x.label)}
                </span>
              ),
            )}
          </div>
        </div>
        {source}
        <VersionCard v={v} style={style} idPrefix={`${idPrefix}-${v.id}`} rated={false} />
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
            {last ? (versions.length === 2 ? 'Compare both' : 'Compare them all') : `Show ${versions[step + 1].label}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={compare} className="compare fade-in">
      <div className="stack" style={{ gap: 16 }}>
        {source}
        <div className="compare-grid">
          {versions.map((v) => (
            <VersionCard key={v.id} v={v} style={style} idPrefix={`${idPrefix}-${v.id}`} rated={rated} selected={selected === v.id} />
          ))}
        </div>
      </div>
      {/* Beside the texts on wide screens, so every question is answered with them in view. */}
      <div className="compare-panel">{children}</div>
    </div>
  );
}
