import type { Rendered } from '../../citation/render';
import { Paragraph } from '../Paragraph';

/** A paragraph whose [[spans]] are numbered and explained underneath. */
export function Annotated({ rendered, annotations, idPrefix }: { rendered: Rendered; annotations: Record<string, string>; idPrefix: string }) {
  const ids = Object.keys(annotations);
  return (
    <div className="stack">
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
      <ol className="anno-list" aria-label="What changed">
        {ids.map((id, i) => (
          <li key={id}>
            <span className="anno-num">{i + 1}</span>
            <span>{annotations[id]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
