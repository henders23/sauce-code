import type { Rendered } from '../../citation/render';
import { Paragraph } from '../Paragraph';

/** A paragraph whose [[spans]] are numbered. Pair it with an AnnotationList in the panel. */
export function Annotated({ rendered, annotations, idPrefix }: { rendered: Rendered; annotations: Record<string, string>; idPrefix: string }) {
  const ids = Object.keys(annotations);
  return (
    <Paragraph
      rendered={rendered}
      idPrefix={idPrefix}
      renderSpan={(id, children) => (
        <span className="annotated">
          <span className="anno-num" aria-hidden="true">
            {ids.indexOf(id) + 1}
          </span>
          {children}
        </span>
      )}
    />
  );
}

/** What each numbered span does, in the same order as the numbers in the text. */
export function AnnotationList({ annotations, label }: { annotations: Record<string, string>; label: string }) {
  return (
    <ol className="anno-list" aria-label={label}>
      {Object.entries(annotations).map(([id, text], i) => (
        <li key={id}>
          <span className="anno-num">{i + 1}</span>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  );
}
