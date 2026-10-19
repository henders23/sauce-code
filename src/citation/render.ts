import { ContentError, tokenize, type Token } from './parse';
import { alphaKey, STYLES, type StyleDef } from './styles';
import { rich, richToString } from './names';
import type { CiteRef, Rich, Source, StyleId } from './types';

export type SegKind = 'text' | 'quote' | 'cite' | 'fn' | 'qopen' | 'qclose' | 'gap';

export interface Seg {
  k: SegKind;
  t: string;
  span?: string;
  /** Footnote number, for k === 'fn'. */
  n?: number;
  /** Italic text, e.g. a book title in the writer's sentence. */
  italic?: boolean;
}

export interface RenderedNote {
  n: number;
  text: Rich;
}

export interface RenderedReference {
  id: string;
  n?: number;
  prefix?: string;
  text: Rich;
}

export interface RenderFlags {
  /** A page number appeared in a citation. */
  locator: boolean;
  /** OSCOLA "ibid" was used. */
  ibid: boolean;
  /** A shortened note (Chicago) or cross-referenced short form (OSCOLA) was used. */
  shortNote: boolean;
  /** MLA gave an author's full name at first mention. */
  mlaFullName: boolean;
  /** A quotation appeared. */
  quotation: boolean;
}

export interface Rendered {
  style: StyleId;
  segs: Seg[];
  notes: RenderedNote[];
  references: RenderedReference[];
  flags: RenderFlags;
}

export interface RenderOptions {
  /** Fills a {{gap}}. Leave undefined to render a blank. */
  gap?: { present: string; past: string };
}

export type SourceLookup = (key: string) => Source | undefined;

const SENTENCE_END = /[.!?](?=\s|$)/g;

export function renderText(
  text: string,
  styleId: StyleId,
  lookup: SourceLookup,
  opts: RenderOptions = {},
): Rendered {
  const style = STYLES[styleId];
  const tokens = tokenize(text);
  const segs: Seg[] = [];
  const pendingFn = new Set<Seg>();
  const notes: RenderedNote[] = [];
  const cited: string[] = [];
  const numbers = new Map<string, number>();
  const mentioned = new Set<string>();
  const firstNote = new Map<string, number>();
  let previousNoteIds: string[] | undefined;
  let afterQuote: string | undefined;
  const flags: RenderFlags = { locator: false, ibid: false, shortNote: false, mlaFullName: false, quotation: false };

  const source = (key: string) => {
    const s = lookup(key);
    if (!s) throw new ContentError(`Unknown source "${key}"`);
    if (!cited.includes(s.id)) cited.push(s.id);
    if (!numbers.has(s.id)) numbers.set(s.id, numbers.size + 1);
    return s;
  };
  const number = (id: string) => numbers.get(id)!;
  const lastText = () => {
    for (let i = segs.length - 1; i >= 0; i--) if (segs[i].k === 'text') return segs[i];
    return undefined;
  };

  tokens.forEach((tok, idx) => {
    switch (tok.t) {
      case 'text':
        segs.push({ k: 'text', t: tok.text, span: tok.span });
        break;
      case 'i':
        segs.push({ k: 'text', t: tok.text, span: tok.span, italic: true });
        break;
      case 'v':
        segs.push({ k: 'text', t: style.pastTenseVerbs ? tok.past : tok.present, span: tok.span });
        break;
      case 'gap':
        segs.push({
          k: 'gap',
          t: opts.gap ? (style.pastTenseVerbs ? opts.gap.past : opts.gap.present) : '',
          span: tok.span,
        });
        break;
      case 'q':
        if (!tok.scare) flags.quotation = true;
        segs.push({ k: 'qopen', t: style.quotes[0], span: tok.span });
        segs.push({ k: 'quote', t: tok.text, span: tok.span });
        segs.push({ k: 'qclose', t: style.quotes[1], span: tok.span });
        if (afterQuote && !tok.scare) {
          segs.push({ k: 'cite', t: ` ${afterQuote}`, span: tok.span });
          afterQuote = undefined;
        }
        break;
      case 'cite':
        renderCite(tok, idx);
        break;
    }
  });

  function renderCite(tok: Extract<Token, { t: 'cite' }>, idx: number) {
    const sources = tok.keys.map(source);
    const cites: CiteRef[] = sources.map((s) => ({ source: s, locator: tok.locator }));
    if (tok.locator) {
      flags.locator = true;
      for (const s of sources) {
        if (s.type !== 'book' && (tok.locator.from < s.pages[0] || (tok.locator.to ?? tok.locator.from) > s.pages[1]))
          throw new ContentError(`Page ${tok.locator.from} is outside ${s.id}'s page range (${s.pages.join('–')})`);
      }
    }

    if (style.family === 'note') {
      if (tok.integral) {
        segs.push({ k: 'cite', t: style.narrative(cites[0], { number, firstMention: true, includeLocator: false }), span: tok.span });
      } else {
        // The citation moves to the footnote, so drop the space the writer left before it.
        const next = tokens[idx + 1];
        if (!next || (next.t === 'text' && /^[\s.,;:!?]/.test(next.text))) {
          const lt = lastText();
          if (lt) lt.t = lt.t.replace(/\s+$/, '');
        }
      }
      const noteText = style.note!(cites, {
        firstNoteOf: (id) => firstNote.get(id),
        previousNoteIds,
      });
      const plain = richToString(noteText);
      if (plain.startsWith('ibid')) flags.ibid = true;
      else if (sources.some((s) => firstNote.has(s.id))) flags.shortNote = true;
      const n = notes.length + 1;
      notes.push({ n, text: closeNote(noteText, style) });
      for (const s of sources) if (!firstNote.has(s.id)) firstNote.set(s.id, n);
      previousNoteIds = sources.map((s) => s.id);
      const seg: Seg = { k: 'fn', t: String(n), n, span: tok.span };
      pendingFn.add(seg);
      segs.push(seg);
      return;
    }

    if (tok.integral) {
      const s = sources[0];
      const firstMention = !mentioned.has(s.id);
      mentioned.add(s.id);
      if (style.id === 'mla' && firstMention) flags.mlaFullName = true;
      const deferLocator = Boolean(tok.locator && style.locatorAfterQuote);
      if (deferLocator) {
        if (afterQuote) throw new ContentError(`Two quotation page numbers are waiting for one quotation near ${tok.raw}`);
        afterQuote = style.afterQuoteLocator!(tok.locator!);
      }
      segs.push({
        k: 'cite',
        t: style.narrative(cites[0], { number, firstMention, includeLocator: !deferLocator }),
        span: tok.span,
      });
      return;
    }

    segs.push({ k: 'cite', t: style.parenthetical(cites, number), span: tok.span });
  }

  if (afterQuote) throw new ContentError('A narrative citation has a page number but no quotation follows it');

  placeFootnoteMarkers(segs, pendingFn);
  if (style.punctuationInsideQuotes) movePunctuationInsideQuotes(segs);

  const references: RenderedReference[] = cited
    .map((id) => lookup(id)!)
    .sort((a, b) => (style.sortReferences === 'alpha' ? alphaKey(a).localeCompare(alphaKey(b)) : number(a.id) - number(b.id)))
    .map((s) => ({
      id: s.id,
      n: style.sortReferences === 'citation' ? number(s.id) : undefined,
      prefix: style.referencePrefix ? style.referencePrefix(number(s.id)) : undefined,
      text: style.reference(s),
    }));

  return { style: styleId, segs: segs.filter((s) => s.t !== '' || s.k === 'gap'), notes, references, flags };
}

/** Footnotes end with a full stop. American styles keep it inside a closing quotation mark. */
function closeNote(text: Rich, style: StyleDef): Rich {
  const out = [...text];
  const last = out[out.length - 1];
  if (typeof last !== 'string') return rich(out, '.');
  if (/[.?!]$/.test(last)) return out;
  if (style.punctuationInsideQuotes && last.endsWith('”')) {
    out[out.length - 1] = `${last.slice(0, -1)}.”`;
    return out;
  }
  return rich(out, '.');
}

/**
 * Note markers go at the end of the sentence, after its punctuation
 * (Chicago and OSCOLA both place them there), never inside a quotation.
 */
function placeFootnoteMarkers(segs: Seg[], pending: Set<Seg>) {
  for (const marker of [...segs].filter((s) => pending.has(s))) {
    const from = segs.indexOf(marker);
    segs.splice(from, 1);
    let inQuote = false;
    let placed = false;
    for (let j = from; j < segs.length && !placed; j++) {
      const seg = segs[j];
      if (seg.k === 'qopen') inQuote = true;
      else if (seg.k === 'qclose') inQuote = false;
      if (seg.k !== 'text' || inQuote) continue;
      SENTENCE_END.lastIndex = 0;
      const m = SENTENCE_END.exec(seg.t);
      if (!m) continue;
      const cut = m.index + 1;
      const head: Seg = { ...seg, t: seg.t.slice(0, cut) };
      const tail: Seg = { ...seg, t: seg.t.slice(cut) };
      segs.splice(j, 1, head, tail);
      // Keep markers already placed at this sentence end in number order.
      let at = j + 1;
      while (at < segs.length && segs[at].k === 'text' && segs[at].t === '' && segs[at + 1]?.k === 'fn') at += 2;
      while (at < segs.length && segs[at].k === 'fn') at++;
      segs.splice(at, 0, marker);
      placed = true;
    }
    if (!placed) segs.push(marker);
  }
}

/** American convention: “…on it.” rather than “…on it”. */
function movePunctuationInsideQuotes(segs: Seg[]) {
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].k !== 'qclose') continue;
    let j = i + 1;
    while (segs[j] && segs[j].k === 'text' && segs[j].t === '') j++;
    const next = segs[j];
    const inner = segs[i - 1];
    if (!next || next.k !== 'text' || !inner || inner.k !== 'quote') continue;
    const m = next.t.match(/^[.,]/);
    if (!m || /[.,!?]$/.test(inner.t)) continue;
    inner.t += m[0];
    next.t = next.t.slice(1);
  }
}

/** Plain text of a rendered paragraph, e.g. for word counts. */
export function segsToPlain(segs: Seg[]): string {
  return segs.map((s) => (s.k === 'fn' ? '' : s.t)).join('');
}
