import { Fragment, type ReactNode } from 'react';
import type { Rendered, Seg } from '../citation/render';
import { NotesAndReferences } from './References';

export function SegView({ seg, idPrefix, linkFootnotes = true }: { seg: Seg; idPrefix: string; linkFootnotes?: boolean }) {
  switch (seg.k) {
    case 'cite': {
      const lead = seg.t.startsWith(' ') ? ' ' : '';
      return (
        <>
          {lead}
          <span className="cite">{seg.t.trimStart()}</span>
        </>
      );
    }
    case 'fn':
      if (!linkFootnotes) return <sup aria-label={`footnote ${seg.n}`}>{seg.n}</sup>;
      return (
        <sup>
          <a href={`#${idPrefix}-fn-${seg.n}`} aria-label={`Footnote ${seg.n}`}>
            {seg.n}
          </a>
        </sup>
      );
    case 'gap':
      return seg.t ? (
        <span className="gap-filled">{seg.t}</span>
      ) : (
        <span className="gap" aria-label="blank">
          {' '}
        </span>
      );
    default:
      return <>{seg.t}</>;
  }
}

/** Groups consecutive segments by span id. */
export function groupBySpan(segs: Seg[]): { span?: string; segs: Seg[] }[] {
  const groups: { span?: string; segs: Seg[] }[] = [];
  for (const seg of segs) {
    const last = groups[groups.length - 1];
    if (last && last.span === seg.span) last.segs.push(seg);
    else groups.push({ span: seg.span, segs: [seg] });
  }
  return groups;
}

interface Props {
  rendered: Rendered;
  idPrefix: string;
  renderSpan?: (spanId: string, children: ReactNode, index: number) => ReactNode;
  references?: boolean;
  /** Turn off when spans become buttons: a link may not sit inside a button. */
  linkFootnotes?: boolean;
}

export function Paragraph({ rendered, idPrefix, renderSpan, references = true, linkFootnotes = true }: Props) {
  const spanOrder: string[] = [];
  return (
    <div className="stack" style={{ gap: 14 }}>
      <p className="para">
        {groupBySpan(rendered.segs).map((g, i) => {
          const inner = g.segs.map((s, j) => <SegView key={j} seg={s} idPrefix={idPrefix} linkFootnotes={linkFootnotes} />);
          if (g.span && renderSpan) {
            if (!spanOrder.includes(g.span)) spanOrder.push(g.span);
            return <Fragment key={i}>{renderSpan(g.span, inner, spanOrder.indexOf(g.span))}</Fragment>;
          }
          return <Fragment key={i}>{inner}</Fragment>;
        })}
      </p>
      {references && <NotesAndReferences rendered={rendered} idPrefix={idPrefix} />}
    </div>
  );
}

/** Ids of the [[spans]] in a rendered paragraph, in reading order. */
export function spanOrder(rendered: Rendered): string[] {
  return [...new Set(rendered.segs.map((s) => s.span).filter(Boolean))] as string[];
}

/** Plain text of one span, for listing phrases back to the student. */
export function spanText(rendered: Rendered, id: string): string {
  return rendered.segs
    .filter((s) => s.span === id && s.k !== 'fn')
    .map((s) => s.t)
    .join('')
    .trim();
}
