import type { SourcePassage } from '../../content/types';
import { lookupSource } from '../../content/sources';
import { sourceLabel } from '../sourceLabel';

export function SourcePassageBox({ passage }: { passage: SourcePassage }) {
  const s = lookupSource(passage.source)!;
  return (
    <figure className="source-box" style={{ margin: 0 }}>
      <figcaption className="faint">
        <strong style={{ color: 'var(--text-2)' }}>Original source</strong> — {sourceLabel(s)}, {passage.where} (fictional)
      </figcaption>
      <p className="text">{passage.text}</p>
    </figure>
  );
}
