import type { Source } from '../citation/types';
import { fullName, joinList } from '../citation/names';

const TYPE: Record<Source['type'], string> = { article: 'journal article', book: 'book', chapter: 'book chapter' };

/** Convention-neutral description, e.g. "Ada Okafor · 2021 · journal article". */
export function sourceLabel(s: Source): string {
  return `${joinList(s.authors.map(fullName), 'and', false)} · ${s.year} · ${TYPE[s.type]}`;
}
