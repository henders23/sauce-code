import type { SourcePassage } from '../../content/types';
import { lookupSource } from '../../content/sources';
import { sourceLabel } from '../sourceLabel';
import { TextCard } from '../Stage';

export function SourcePassageBox({ passage }: { passage: SourcePassage }) {
  const s = lookupSource(passage.source)!;
  return (
    <TextCard label="Original source" plain>
      <p className="para small">{passage.text}</p>
      <p className="faint">
        {sourceLabel(s)}, {passage.where}. Fictional.
      </p>
    </TextCard>
  );
}
