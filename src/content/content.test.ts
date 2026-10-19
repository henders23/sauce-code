// Content checks. These run every item in every convention, so a content
// author gets a failing test (with a reason) rather than a broken screen.

import { describe, expect, it } from 'vitest';
import { ITEMS, MODULES } from './index';
import { SOURCES, lookupSource } from './sources';
import { renderText, segsToPlain } from '../citation/render';
import { tokenize, type Token } from '../citation/parse';
import { STYLE_ORDER } from '../citation/styles';
import { richToString } from '../citation/names';
import type { Item } from './types';

/** Every paragraph-like string in an item, with a label for error messages. */
function texts(item: Item): { label: string; text: string; paragraph: boolean }[] {
  const out: { label: string; text: string; paragraph: boolean }[] = [];
  switch (item.activity) {
    case 'taste-test':
      item.versions.forEach((v) => out.push({ label: `version ${v.id}`, text: v.text, paragraph: true }));
      break;
    case 'fix-sauce':
      out.push({ label: 'flawed', text: item.text, paragraph: true }, { label: 'repaired', text: item.repaired, paragraph: true });
      break;
    case 'build-blend':
      out.push({ label: 'synthesis', text: item.synthesis, paragraph: true });
      break;
    default:
      out.push({ label: 'text', text: item.text, paragraph: true });
  }
  return out;
}

const spanIds = (tokens: Token[]) => [...new Set(tokens.map((t) => t.span).filter(Boolean))] as string[];

/**
 * Page numbers belong to quotations. A narrative citation with a page must be
 * followed by its quotation; a bracketed citation with a page must follow one.
 * And every quotation must be paired with a page.
 */
function checkQuotationPages(tokens: Token[]): string[] {
  const problems: string[] = [];
  const quoted = new Set<number>();
  tokens.forEach((tok, i) => {
    if (tok.t !== 'cite' || !tok.locator) return;
    const dir = tok.integral ? 1 : -1;
    let j = i + dir;
    while (j >= 0 && j < tokens.length && tokens[j].t !== 'cite') {
      const tj = tokens[j];
      if (tj.t === 'q' && !tj.scare) {
        quoted.add(j);
        return;
      }
      j += dir;
    }
    problems.push(`${tok.raw} has a page number but no quotation ${tok.integral ? 'after' : 'before'} it`);
  });
  tokens.forEach((tok, i) => {
    if (tok.t === 'q' && !tok.scare && !quoted.has(i)) problems.push(`quotation "${tok.text.slice(0, 30)}…" has no citation with a page number`);
  });
  return problems;
}

describe('seed content', () => {
  it('has at least two items per module and ten in total', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(10);
    for (const m of MODULES) expect(ITEMS.filter((i) => i.module === m.id).length, m.id).toBeGreaterThanOrEqual(2);
  });

  it('covers every activity type', () => {
    const types = new Set(ITEMS.map((i) => i.activity));
    for (const t of ['taste-test', 'find-seam', 'highlight-voices', 'pick-verb', 'fix-sauce', 'spot-patchwriting', 'build-blend'])
      expect(types.has(t as Item['activity']), t).toBe(true);
  });

  it('spans at least three disciplines', () => {
    expect(new Set(ITEMS.flatMap((i) => i.disciplines)).size).toBeGreaterThanOrEqual(3);
  });

  it('has unique ids', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });

  it('marks every source as fictional', () => {
    for (const s of SOURCES) expect(s.id).toMatch(/^[a-z]+\d{4}$/);
  });
});

describe.each(ITEMS.map((i) => [i.id, i] as const))('%s', (_id, item) => {
  for (const { label, text, paragraph } of texts(item)) {
    it(`${label}: renders in all eight conventions`, () => {
      for (const style of STYLE_ORDER) {
        const out = renderText(text, style, lookupSource, { gap: { present: 'suggests', past: 'suggested' } });
        const plain = segsToPlain(out.segs) + out.notes.map((n) => richToString(n.text)).join(' ') + out.references.map((r) => richToString(r.text)).join(' ');
        expect(plain, style).not.toMatch(/undefined|NaN|\{\{|\}\}|\[\[|\]\]/);
        expect(plain, style).not.toMatch(/ {2}| [.,;:]/);
      }
    });

    it(`${label}: quotations and page numbers are paired`, () => {
      expect(checkQuotationPages(tokenize(text))).toEqual([]);
    });

    if (paragraph) {
      it(`${label}: is 100–180 words`, () => {
        const words = segsToPlain(renderText(text, 'harvard', lookupSource, { gap: { present: 'suggests', past: 'suggested' } }).segs)
          .split(/\s+/)
          .filter(Boolean).length;
        expect(words).toBeGreaterThanOrEqual(100);
        expect(words).toBeLessThanOrEqual(180);
      });
    }
  }

  it('activity data is consistent', () => {
    switch (item.activity) {
      case 'taste-test':
        expect(item.versions.map((v) => v.id)).toContain(item.best);
        for (const v of item.versions) expect(item.picks[v.id], `pick feedback for ${v.id}`).toBeTruthy();
        expect(item.reasons.some((r) => r.verdict === 'strong')).toBe(true);
        break;
      case 'find-seam': {
        const ids = spanIds(tokenize(item.text));
        expect(ids).toContain(item.answer);
        expect(ids.indexOf(item.answer), 'at least one phrase before the answer').toBeGreaterThan(0);
        break;
      }
      case 'pick-verb':
        expect(tokenize(item.text).filter((t) => t.t === 'gap')).toHaveLength(1);
        expect(item.options.some((o) => o.verdict === 'good')).toBe(true);
        break;
      case 'highlight-voices':
        expect(spanIds(tokenize(item.text)).sort()).toEqual(Object.keys(item.key).sort());
        break;
      case 'fix-sauce':
        expect(item.problems.filter((p) => p.correct).length).toBeGreaterThanOrEqual(1);
        expect(spanIds(tokenize(item.repaired)).sort()).toEqual(Object.keys(item.annotations).sort());
        break;
      case 'spot-patchwriting': {
        expect(lookupSource(item.sourcePassage.source)).toBeTruthy();
        const ids = spanIds(tokenize(item.text));
        const lifted = Object.keys(item.lifted);
        for (const id of lifted) expect(ids).toContain(id);
        expect(ids.length - lifted.length, 'phrases that are not lifted').toBeGreaterThanOrEqual(2);
        // Every lifted phrase must really appear in the original passage.
        for (const tok of tokenize(item.text))
          if (tok.t === 'text' && tok.span && lifted.includes(tok.span))
            expect(item.sourcePassage.text, tok.span).toContain(tok.text);
        break;
      }
      case 'build-blend':
        for (const s of item.summaries) expect(lookupSource(s.source), s.source).toBeTruthy();
        expect(spanIds(tokenize(item.synthesis)).sort()).toEqual(Object.keys(item.annotations).sort());
        break;
    }
    if (item.activity === 'taste-test' && item.sourcePassage) expect(lookupSource(item.sourcePassage.source)).toBeTruthy();
  });
});
