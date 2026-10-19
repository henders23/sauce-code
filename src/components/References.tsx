import { STYLES } from '../citation/styles';
import type { Rendered } from '../citation/render';
import { RichText } from './RichText';

const ABBREVIATION_NOTE: Partial<Record<string, string>> = {
  ieee: 'IEEE normally abbreviates journal titles. These fictional journals have no standard abbreviation, so the full title is given.',
  vancouver: 'Vancouver normally uses NLM journal abbreviations. These fictional journals have none, so the full title is given.',
  oscola: 'OSCOLA normally uses standard abbreviations for law journals. These fictional journals have none, so the full title is given.',
};

/** Footnotes (always visible — they are part of the text) and a collapsible reference list. */
export function NotesAndReferences({ rendered, idPrefix }: { rendered: Rendered; idPrefix: string }) {
  const style = STYLES[rendered.style];
  return (
    <>
      {rendered.notes.length > 0 && (
        <ol className="notes-list" aria-label="Footnotes">
          {rendered.notes.map((n) => (
            <li key={n.n} id={`${idPrefix}-fn-${n.n}`}>
              <span className="num">{style.notePrefix ? style.notePrefix(n.n) : n.n}</span>
              <span>
                <RichText value={n.text} />
              </span>
            </li>
          ))}
        </ol>
      )}
      {rendered.references.length > 0 && (
        <details className="refs">
          <summary>
            {style.referencesHeading} <span className="faint">({style.label})</span>
          </summary>
          <ol>
            {rendered.references.map((r) => (
              <li key={r.id} className={r.prefix ? 'numbered' : undefined}>
                {r.prefix && <span className="num">{r.prefix}</span>}
                <span>
                  <RichText value={r.text} />
                </span>
              </li>
            ))}
          </ol>
          <p className="faint" style={{ marginTop: 10 }}>
            All sources are fictional, invented for teaching.
            {ABBREVIATION_NOTE[style.id] ? ` ${ABBREVIATION_NOTE[style.id]}` : ''}
          </p>
        </details>
      )}
    </>
  );
}
