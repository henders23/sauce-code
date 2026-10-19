import type { Locator, Person, Rich, RichPart } from './types';

const givenParts = (p: Person) => p.given.split(/\s+/).filter(Boolean);

/** "A." / "A. N." (APA, IEEE) */
export const initialsSpaced = (p: Person) => givenParts(p).map((g) => `${g[0]}.`).join(' ');
/** "A." / "A.N." (Harvard, Cite Them Right) */
export const initialsTight = (p: Person) => givenParts(p).map((g) => `${g[0]}.`).join('');
/** "A" / "AN" (Vancouver, OSCOLA bibliography) */
export const initialsBare = (p: Person) => givenParts(p).map((g) => g[0]).join('');

export const fullName = (p: Person) => `${p.given} ${p.family}`;

/** Joins ["A","B","C"] as "A, B and C" (UK) or "A, B, and C" (serial comma). */
export function joinList(items: string[], and: string, serialComma: boolean): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} ${and} ${items[1]}`;
  const head = items.slice(0, -1).join(', ');
  return `${head}${serialComma ? ',' : ''} ${and} ${items[items.length - 1]}`;
}

/**
 * Surnames for in-text use. `etAlFrom` is the number of authors at which the
 * style switches to "First et al."
 */
export function surnames(
  authors: Person[],
  opts: { and: string; etAlFrom: number; serialComma?: boolean },
): string {
  if (authors.length >= opts.etAlFrom) return `${authors[0].family} et al.`;
  return joinList(
    authors.map((a) => a.family),
    opts.and,
    opts.serialComma ?? false,
  );
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const EN_DASH = '–';

export function range(from: number, to: number | undefined, dash = EN_DASH): string {
  return to === undefined || to === from ? String(from) : `${from}${dash}${to}`;
}

/** Citing Medicine (Vancouver) drops repeated leading digits: 123-129 → 123-9. */
export function elidedRange(from: number, to: number): string {
  const a = String(from);
  const b = String(to);
  if (a.length !== b.length) return `${a}-${b}`;
  let i = 0;
  while (i < a.length - 1 && a[i] === b[i]) i++;
  return `${a}-${b.slice(i)}`;
}

export const isRange = (loc: Locator) => loc.to !== undefined && loc.to !== loc.from;

/** "p. 42" / "pp. 42–43" */
export const pageWithPrefix = (loc: Locator) =>
  `${isRange(loc) ? 'pp.' : 'p.'} ${range(loc.from, loc.to)}`;

/** Merges adjacent strings in a Rich array so output is tidy and testable. */
export function rich(...parts: (RichPart | Rich | false | undefined | '')[]): Rich {
  const out: Rich = [];
  const push = (p: RichPart) => {
    const last = out[out.length - 1];
    if (typeof p === 'string') {
      if (!p) return;
      if (typeof last === 'string') out[out.length - 1] = last + p;
      else out.push(p);
    } else {
      out.push(p);
    }
  };
  for (const part of parts) {
    if (!part) continue;
    if (Array.isArray(part)) part.forEach(push);
    else push(part);
  }
  return out;
}

export const richToString = (r: Rich) => r.map((p) => (typeof p === 'string' ? p : p.i)).join('');
/** Marks italics with *asterisks* — used by tests to check italic placement. */
export const richToMarked = (r: Rich) =>
  r.map((p) => (typeof p === 'string' ? p : `*${p.i}*`)).join('');
