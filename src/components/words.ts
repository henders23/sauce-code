import type { Seg, SegKind } from '../citation/render';

export interface UnitPiece {
  k: SegKind;
  t: string;
  n?: number;
}

/** A clickable "word": text up to the next space. Citations stay whole. */
export interface Unit {
  pieces: UnitPiece[];
  span?: string;
}

export function toUnits(segs: Seg[]): { units: Unit[]; seamIndex: number | null } {
  const units: Unit[] = [];
  let cur: Unit | null = null;
  let seamIndex: number | null = null;
  const close = () => {
    if (cur && cur.pieces.length) units.push(cur);
    cur = null;
  };
  const add = (k: SegKind, t: string, span?: string, n?: number) => {
    if (!cur) cur = { pieces: [], span };
    const last = cur.pieces[cur.pieces.length - 1];
    if (last && last.k === k && k !== 'fn') last.t += t;
    else cur.pieces.push({ k, t, n });
  };
  for (const seg of segs) {
    if (seg.k === 'seam') {
      seamIndex = cur && (cur as Unit).pieces.length ? units.length + 1 : units.length;
      continue;
    }
    if (seg.k === 'text' || seg.k === 'quote') {
      for (const ch of seg.t) {
        if (/\s/.test(ch)) close();
        else add(seg.k, ch, seg.span);
      }
      continue;
    }
    if (seg.k === 'cite' && seg.t.startsWith(' ')) close();
    add(seg.k, seg.t.trimStart(), seg.span, seg.n);
  }
  close();
  return { units, seamIndex };
}

export const unitText = (u: Unit) => u.pieces.filter((p) => p.k !== 'fn').map((p) => p.t).join('');
