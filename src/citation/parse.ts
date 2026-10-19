import type { Locator } from './types';

// Content markup (see CONTENT_GUIDE.md):
//   {{cite:key}}                       parenthetical / bracketed / footnoted citation
//   {{cite:key1,key2}}                 several sources at one point
//   {{cite:key | integral}}            author named in the writer's sentence
//   {{cite:key | integral | page:42}}  …with a page (only for quotations)
//   {{cite:key | pages:42-43}}         page range
//   {{q:quoted words}}                 quotation, in the convention's quotation marks
//   {{sq:word}}                        scare quotes (not a quotation from a source)
//   {{v:argues|argued}}                reporting verb: present | past (APA uses past)
//   {{gap}}                            Pick the Verb gap
//   [[id:text]]                        a span the activity can refer to by id

export type Token =
  | { t: 'text'; text: string; span?: string }
  | { t: 'cite'; keys: string[]; integral: boolean; locator?: Locator; span?: string; raw: string }
  | { t: 'q'; text: string; scare: boolean; span?: string }
  | { t: 'v'; present: string; past: string; span?: string }
  | { t: 'gap'; span?: string };

export class ContentError extends Error {}

function parseCite(body: string, span: string | undefined, raw: string): Token {
  const [keyPart, ...opts] = body.split('|').map((s) => s.trim());
  const keys = keyPart
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length === 0) throw new ContentError(`Citation with no source key: ${raw}`);
  let integral = false;
  let locator: Locator | undefined;
  for (const opt of opts) {
    if (opt === 'integral') integral = true;
    else if (/^pages?:/.test(opt)) {
      const m = opt.match(/^pages?:\s*(\d+)\s*(?:[-–]\s*(\d+))?$/);
      if (!m) throw new ContentError(`Bad page locator "${opt}" in ${raw}`);
      locator = { from: Number(m[1]), to: m[2] ? Number(m[2]) : undefined };
      if (locator.to !== undefined && locator.to <= locator.from)
        throw new ContentError(`Page range must run forwards in ${raw}`);
    } else throw new ContentError(`Unknown citation option "${opt}" in ${raw}`);
  }
  if (integral && keys.length > 1)
    throw new ContentError(`An integral citation names one source; write two citations instead: ${raw}`);
  if (locator && keys.length > 1)
    throw new ContentError(`A page number can only belong to one source: ${raw}`);
  return { t: 'cite', keys, integral, locator, span, raw };
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let span: string | undefined;
  let buf = '';
  const flush = () => {
    if (buf) tokens.push({ t: 'text', text: buf, span });
    buf = '';
  };
  let i = 0;
  while (i < input.length) {
    if (input.startsWith('[[', i)) {
      if (span) throw new ContentError(`Spans cannot be nested (inside [[${span}:…]])`);
      const colon = input.indexOf(':', i);
      const id = input.slice(i + 2, colon);
      if (colon < 0 || !/^[A-Za-z0-9_-]+$/.test(id)) throw new ContentError(`Bad span opening near "${input.slice(i, i + 20)}"`);
      flush();
      span = id;
      i = colon + 1;
      continue;
    }
    if (input.startsWith(']]', i)) {
      if (!span) throw new ContentError(`"]]" without a matching "[[" near "${input.slice(Math.max(0, i - 20), i + 2)}"`);
      flush();
      span = undefined;
      i += 2;
      continue;
    }
    if (input.startsWith('{{', i)) {
      const end = input.indexOf('}}', i);
      if (end < 0) throw new ContentError(`Unclosed "{{" near "${input.slice(i, i + 30)}"`);
      const raw = input.slice(i, end + 2);
      const inner = input.slice(i + 2, end).trim();
      flush();
      if (inner.startsWith('cite:')) tokens.push(parseCite(inner.slice(5), span, raw));
      else if (inner.startsWith('q:')) tokens.push({ t: 'q', text: inner.slice(2).trim(), scare: false, span });
      else if (inner.startsWith('sq:')) tokens.push({ t: 'q', text: inner.slice(3).trim(), scare: true, span });
      else if (inner.startsWith('v:')) {
        const [present, past] = inner.slice(2).split('|').map((s) => s.trim());
        if (!present || !past) throw new ContentError(`A verb needs present and past forms: ${raw}`);
        tokens.push({ t: 'v', present, past, span });
      } else if (inner === 'gap') tokens.push({ t: 'gap', span });
      else throw new ContentError(`Unknown token ${raw}`);
      i = end + 2;
      continue;
    }
    buf += input[i];
    i++;
  }
  if (span) throw new ContentError(`Span [[${span}:…]] is never closed`);
  flush();
  return tokens;
}
