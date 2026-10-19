import type { Article, Book, Chapter, CiteRef, Locator, Person, Rich, Source, StyleId } from './types';
import {
  EN_DASH,
  elidedRange,
  fullName,
  initialsBare,
  initialsSpaced,
  initialsTight,
  joinList,
  ordinal,
  pageWithPrefix,
  range,
  rich,
  surnames,
} from './names';

export type StyleFamily = 'author-date' | 'author-page' | 'numeric' | 'note';

export interface NoteContext {
  /** Note number in which this source was first cited in full, if any. */
  firstNoteOf(id: string): number | undefined;
  /** Source ids cited in the immediately preceding note. */
  previousNoteIds: string[] | undefined;
}

export interface NarrativeContext {
  number(id: string): number;
  /** True the first time this source is named in the writer's own sentence. */
  firstMention: boolean;
  includeLocator: boolean;
}

export interface StyleDef {
  id: StyleId;
  /** Full name shown in pickers. */
  label: string;
  /** Short name for tight spaces. */
  shortLabel: string;
  /** Which edition or variant the app follows. */
  edition: string;
  family: StyleFamily;
  quotes: [string, string];
  /** American convention: full stops and commas go inside closing quotation marks. */
  punctuationInsideQuotes: boolean;
  /** APA recommends past tense for reporting verbs. */
  pastTenseVerbs: boolean;
  /** In a narrative citation, does the page go after the quotation (APA, MLA)? */
  locatorAfterQuote: boolean;
  referencesHeading: string;
  sortReferences: 'alpha' | 'citation';
  referencePrefix?: (n: number) => string;
  notePrefix?: (n: number) => string;
  /** Bracketed / parenthetical citation for author-date, author-page and numeric styles. */
  parenthetical(cites: CiteRef[], number: (id: string) => number): string;
  /** Citation when the writer names the author in their own sentence. */
  narrative(cite: CiteRef, ctx: NarrativeContext): string;
  /** APA "(p. 42)", MLA "(42)" — placed after the quotation. */
  afterQuoteLocator?(loc: Locator): string;
  /** Footnote text (note styles only), without the closing full stop. */
  note?(cites: CiteRef[], ctx: NoteContext): Rich;
  reference(source: Source): Rich;
}

const LSQ = '‘';
const RSQ = '’';
const LDQ = '“';
const RDQ = '”';

const pages = (s: Article | Chapter, dash = EN_DASH) => range(s.pages[0], s.pages[1], dash);
const bare = (loc: Locator) => range(loc.from, loc.to);

const byType = <T,>(
  s: Source,
  f: { article: (a: Article) => T; book: (b: Book) => T; chapter: (c: Chapter) => T },
): T => (s.type === 'article' ? f.article(s) : s.type === 'book' ? f.book(s) : f.chapter(s));

/* ------------------------------------------------------------------ Harvard */
// Follows Cite Them Right (the most widely used UK Harvard guide).

const harvardRefNames = (people: Person[]) =>
  joinList(
    people.map((p) => `${p.family}, ${initialsTight(p)}`),
    'and',
    false,
  );
const harvardInText = (a: Person[]) => surnames(a, { and: 'and', etAlFrom: 4 });

const harvard: StyleDef = {
  id: 'harvard',
  label: 'Harvard',
  shortLabel: 'Harvard',
  edition: 'Cite Them Right',
  family: 'author-date',
  quotes: [LSQ, RSQ],
  punctuationInsideQuotes: false,
  pastTenseVerbs: false,
  locatorAfterQuote: false,
  referencesHeading: 'Reference list',
  sortReferences: 'alpha',
  parenthetical: (cites) =>
    `(${cites
      .map(
        (c) =>
          `${harvardInText(c.source.authors)}, ${c.source.year}` +
          (c.locator ? `, ${pageWithPrefix(c.locator)}` : ''),
      )
      .join('; ')})`,
  narrative: (c, ctx) =>
    `${harvardInText(c.source.authors)} (${c.source.year}` +
    (ctx.includeLocator && c.locator ? `, ${pageWithPrefix(c.locator)}` : '') +
    ')',
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(
          `${harvardRefNames(a.authors)} (${a.year}) ${LSQ}${a.title}${RSQ}, `,
          { i: a.journal },
          `, ${a.volume}(${a.issue}), pp. ${pages(a)}.`,
        ),
      book: (b) =>
        rich(
          `${harvardRefNames(b.authors)} (${b.year}) `,
          { i: b.title },
          '. ',
          b.edition && b.edition > 1 ? `${ordinal(b.edition)} edn. ` : '',
          `${b.place}: ${b.publisher}.`,
        ),
      chapter: (c) =>
        rich(
          `${harvardRefNames(c.authors)} (${c.year}) ${LSQ}${c.title}${RSQ}, in ${harvardRefNames(c.editors)} (${c.editors.length > 1 ? 'eds.' : 'ed.'}) `,
          { i: c.bookTitle },
          `. ${c.place}: ${c.publisher}, pp. ${pages(c)}.`,
        ),
    }),
};

/* ---------------------------------------------------------------------- APA */

const apaRefNames = (people: Person[]) => {
  const names = people.map((p) => `${p.family}, ${initialsSpaced(p)}`);
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}`;
};
const apaEditors = (people: Person[]) => {
  const names = people.map((p) => `${initialsSpaced(p)} ${p.family}`);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}`;
};

const apa: StyleDef = {
  id: 'apa',
  label: 'APA 7th',
  shortLabel: 'APA',
  edition: '7th edition',
  family: 'author-date',
  quotes: [LDQ, RDQ],
  punctuationInsideQuotes: true,
  pastTenseVerbs: true,
  locatorAfterQuote: true,
  referencesHeading: 'References',
  sortReferences: 'alpha',
  parenthetical: (cites) => {
    // APA orders multiple works in one parenthesis alphabetically.
    const sorted = [...cites].sort((a, b) => alphaKey(a.source).localeCompare(alphaKey(b.source)));
    return `(${sorted
      .map(
        (c) =>
          `${surnames(c.source.authors, { and: '&', etAlFrom: 3 })}, ${c.source.year}` +
          (c.locator ? `, ${pageWithPrefix(c.locator)}` : ''),
      )
      .join('; ')})`;
  },
  narrative: (c, ctx) =>
    `${surnames(c.source.authors, { and: 'and', etAlFrom: 3 })} (${c.source.year}` +
    (ctx.includeLocator && c.locator ? `, ${pageWithPrefix(c.locator)}` : '') +
    ')',
  afterQuoteLocator: (loc) => `(${pageWithPrefix(loc)})`,
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(
          `${apaRefNames(a.authors)} (${a.year}). ${a.title}. `,
          { i: a.journal },
          ', ',
          { i: String(a.volume) },
          `(${a.issue}), ${pages(a)}.`,
        ),
      book: (b) =>
        rich(
          `${apaRefNames(b.authors)} (${b.year}). `,
          { i: b.title },
          b.edition && b.edition > 1 ? ` (${ordinal(b.edition)} ed.)` : '',
          `. ${b.publisher}.`,
        ),
      chapter: (c) =>
        rich(
          `${apaRefNames(c.authors)} (${c.year}). ${c.title}. In ${apaEditors(c.editors)} (${c.editors.length > 1 ? 'Eds.' : 'Ed.'}), `,
          { i: c.bookTitle },
          ` (pp. ${pages(c)}). ${c.publisher}.`,
        ),
    }),
};

/* ---------------------------------------------------------------------- MLA */

const mlaRefNames = (people: Person[]) => {
  const first = `${people[0].family}, ${people[0].given}`;
  if (people.length === 1) return `${first}.`;
  if (people.length === 2) return `${first}, and ${fullName(people[1])}.`;
  return `${first}, et al.`;
};
const mlaInText = (a: Person[]) => surnames(a, { and: 'and', etAlFrom: 3 });
const mlaFirstMention = (a: Person[]) =>
  a.length >= 3 ? `${fullName(a[0])} et al.` : joinList(a.map(fullName), 'and', false);

const mla: StyleDef = {
  id: 'mla',
  label: 'MLA 9th',
  shortLabel: 'MLA',
  edition: '9th edition',
  family: 'author-page',
  quotes: [LDQ, RDQ],
  punctuationInsideQuotes: true,
  pastTenseVerbs: false,
  locatorAfterQuote: true,
  referencesHeading: 'Works Cited',
  sortReferences: 'alpha',
  parenthetical: (cites) =>
    `(${cites
      .map((c) => mlaInText(c.source.authors) + (c.locator ? ` ${bare(c.locator)}` : ''))
      .join('; ')})`,
  narrative: (c, ctx) => {
    const name = ctx.firstMention ? mlaFirstMention(c.source.authors) : mlaInText(c.source.authors);
    return ctx.includeLocator && c.locator ? `${name} (${bare(c.locator)})` : name;
  },
  afterQuoteLocator: (loc) => `(${bare(loc)})`,
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(
          `${mlaRefNames(a.authors)} ${LDQ}${a.titleTC}.${RDQ} `,
          { i: a.journal },
          `, vol. ${a.volume}, no. ${a.issue}, ${a.year}, pp. ${pages(a)}.`,
        ),
      book: (b) =>
        rich(
          `${mlaRefNames(b.authors)} `,
          { i: b.titleTC },
          '. ',
          b.edition && b.edition > 1 ? `${ordinal(b.edition)} ed., ` : '',
          `${b.publisher}, ${b.year}.`,
        ),
      chapter: (c) =>
        rich(
          `${mlaRefNames(c.authors)} ${LDQ}${c.titleTC}.${RDQ} `,
          { i: c.bookTitleTC },
          `, edited by ${joinList(c.editors.map(fullName), 'and', false)}, ${c.publisher}, ${c.year}, pp. ${pages(c)}.`,
        ),
    }),
};

/* ------------------------------------------------------------------ Chicago */
// Both Chicago systems follow the 18th edition (2024): "et al." from three
// authors, no place of publication, shortened notes rather than "ibid."

/** "Okafor, Ada." / "Okafor, Ada, and Wei Lin." / "Okafor, Ada, Wei Lin, and Maria Varga." */
const chicagoRefNames = (people: Person[]) => {
  const first = `${people[0].family}, ${people[0].given}`;
  if (people.length === 1) return `${first}.`;
  // Chicago 18: more than six authors → first three, then et al.
  if (people.length > 6)
    return `${[first, ...people.slice(1, 3).map(fullName)].join(', ')}, et al.`;
  const names = [first, ...people.slice(1).map(fullName)];
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}.`;
};
const chicagoInText = (a: Person[]) => surnames(a, { and: 'and', etAlFrom: 3 });
const chicagoNoteNames = (a: Person[]) =>
  a.length >= 3 ? `${fullName(a[0])} et al.` : joinList(a.map(fullName), 'and', false);
const chicagoEditors = (e: Person[]) => joinList(e.map(fullName), 'and', true);

const chicagoAD: StyleDef = {
  id: 'chicago-ad',
  label: 'Chicago author-date',
  shortLabel: 'Chicago A-D',
  edition: '18th edition',
  family: 'author-date',
  quotes: [LDQ, RDQ],
  punctuationInsideQuotes: true,
  pastTenseVerbs: false,
  locatorAfterQuote: false,
  referencesHeading: 'References',
  sortReferences: 'alpha',
  parenthetical: (cites) =>
    `(${cites
      .map(
        (c) =>
          `${chicagoInText(c.source.authors)} ${c.source.year}` + (c.locator ? `, ${bare(c.locator)}` : ''),
      )
      .join('; ')})`,
  narrative: (c, ctx) =>
    `${chicagoInText(c.source.authors)} (${c.source.year}` +
    (ctx.includeLocator && c.locator ? `, ${bare(c.locator)}` : '') +
    ')',
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(
          `${chicagoRefNames(a.authors)} ${a.year}. ${LDQ}${a.titleTC}.${RDQ} `,
          { i: a.journal },
          ` ${a.volume}, no. ${a.issue}: ${pages(a)}.`,
        ),
      book: (b) =>
        rich(
          `${chicagoRefNames(b.authors)} ${b.year}. `,
          { i: b.titleTC },
          '. ',
          b.edition && b.edition > 1 ? `${ordinal(b.edition)} ed. ` : '',
          `${b.publisher}.`,
        ),
      chapter: (c) =>
        rich(
          `${chicagoRefNames(c.authors)} ${c.year}. ${LDQ}${c.titleTC}.${RDQ} In `,
          { i: c.bookTitleTC },
          `, edited by ${chicagoEditors(c.editors)}, ${pages(c)}. ${c.publisher}.`,
        ),
    }),
};

function chicagoFullNote(c: CiteRef): Rich {
  const s = c.source;
  const loc = c.locator ? bare(c.locator) : undefined;
  return byType<Rich>(s, {
    article: (a) =>
      rich(
        `${chicagoNoteNames(a.authors)}, ${LDQ}${a.titleTC},${RDQ} `,
        { i: a.journal },
        ` ${a.volume}, no. ${a.issue} (${a.year}): ${loc ?? pages(a)}`,
      ),
    book: (b) =>
      rich(
        `${chicagoNoteNames(b.authors)}, `,
        { i: b.titleTC },
        b.edition && b.edition > 1 ? `, ${ordinal(b.edition)} ed.` : '',
        ` (${b.publisher}, ${b.year})`,
        loc ? `, ${loc}` : '',
      ),
    chapter: (ch) =>
      rich(
        `${chicagoNoteNames(ch.authors)}, ${LDQ}${ch.titleTC},${RDQ} in `,
        { i: ch.bookTitleTC },
        `, ${ch.editors.length > 1 ? 'eds.' : 'ed.'} ${chicagoEditors(ch.editors)} (${ch.publisher}, ${ch.year}), ${loc ?? pages(ch)}`,
      ),
  });
}

function chicagoShortNote(c: CiteRef): Rich {
  const s = c.source;
  const names = chicagoInText(s.authors);
  const loc = c.locator ? bare(c.locator) : undefined;
  if (s.type === 'book') return rich(`${names}, `, { i: s.shortTitleTC }, loc ? `, ${loc}` : '');
  // Article and chapter titles go in quotation marks; the comma sits inside.
  return loc
    ? rich(`${names}, ${LDQ}${s.shortTitleTC},${RDQ} ${loc}`)
    : rich(`${names}, ${LDQ}${s.shortTitleTC}${RDQ}`);
}

const chicagoNB: StyleDef = {
  id: 'chicago-nb',
  label: 'Chicago notes-bibliography',
  shortLabel: 'Chicago notes',
  edition: '18th edition',
  family: 'note',
  quotes: [LDQ, RDQ],
  punctuationInsideQuotes: true,
  pastTenseVerbs: false,
  locatorAfterQuote: false,
  referencesHeading: 'Bibliography',
  sortReferences: 'alpha',
  notePrefix: (n) => `${n}.`,
  parenthetical: () => '',
  narrative: (c) => chicagoInText(c.source.authors),
  note: (cites, ctx) => {
    const parts = cites.map((c) =>
      ctx.firstNoteOf(c.source.id) === undefined ? chicagoFullNote(c) : chicagoShortNote(c),
    );
    return rich(...parts.flatMap((p, i) => (i === 0 ? [p] : ['; ', p])));
  },
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(
          `${chicagoRefNames(a.authors)} ${LDQ}${a.titleTC}.${RDQ} `,
          { i: a.journal },
          ` ${a.volume}, no. ${a.issue} (${a.year}): ${pages(a)}.`,
        ),
      book: (b) =>
        rich(
          `${chicagoRefNames(b.authors)} `,
          { i: b.titleTC },
          '. ',
          b.edition && b.edition > 1 ? `${ordinal(b.edition)} ed. ` : '',
          `${b.publisher}, ${b.year}.`,
        ),
      chapter: (c) =>
        rich(
          `${chicagoRefNames(c.authors)} ${LDQ}${c.titleTC}.${RDQ} In `,
          { i: c.bookTitleTC },
          `, edited by ${chicagoEditors(c.editors)}, ${pages(c)}. ${c.publisher}, ${c.year}.`,
        ),
    }),
};

/* --------------------------------------------------------------------- IEEE */

const ieeeNames = (people: Person[]) => {
  if (people.length >= 7) return `${initialsSpaced(people[0])} ${people[0].family} et al.`;
  return joinList(
    people.map((p) => `${initialsSpaced(p)} ${p.family}`),
    'and',
    true,
  );
};
const numericInText = (a: Person[]) => surnames(a, { and: 'and', etAlFrom: 3 });

/** [1], [3] — runs of three or more become [1]–[3]. */
function compressNumbers(nums: number[], fmt: (a: number, b?: number) => string, sep: string): string {
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const out: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    if (j - i >= 2) out.push(fmt(sorted[i], sorted[j]));
    else for (let k = i; k <= j; k++) out.push(fmt(sorted[k]));
    i = j + 1;
  }
  return out.join(sep);
}

const ieee: StyleDef = {
  id: 'ieee',
  label: 'IEEE',
  shortLabel: 'IEEE',
  edition: 'IEEE Reference Guide',
  family: 'numeric',
  quotes: [LDQ, RDQ],
  punctuationInsideQuotes: true,
  pastTenseVerbs: false,
  locatorAfterQuote: false,
  referencesHeading: 'References',
  sortReferences: 'citation',
  referencePrefix: (n) => `[${n}]`,
  parenthetical: (cites, number) => {
    if (cites.length === 1 && cites[0].locator)
      return `[${number(cites[0].source.id)}, ${pageWithPrefix(cites[0].locator)}]`;
    return compressNumbers(
      cites.map((c) => number(c.source.id)),
      (a, b) => (b === undefined ? `[${a}]` : `[${a}]${EN_DASH}[${b}]`),
      ', ',
    );
  },
  narrative: (c, ctx) =>
    `${numericInText(c.source.authors)} [${ctx.number(c.source.id)}` +
    (ctx.includeLocator && c.locator ? `, ${pageWithPrefix(c.locator)}` : '') +
    ']',
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(
          `${ieeeNames(a.authors)}, ${LDQ}${a.title},${RDQ} `,
          { i: a.journal },
          `, vol. ${a.volume}, no. ${a.issue}, pp. ${pages(a)}, ${a.year}.`,
        ),
      book: (b) =>
        rich(
          `${ieeeNames(b.authors)}, `,
          { i: b.titleTC },
          b.edition && b.edition > 1 ? `, ${ordinal(b.edition)} ed.` : '.',
          ` ${b.place}, ${b.country}: ${b.publisher}, ${b.year}.`,
        ),
      chapter: (c) =>
        rich(
          `${ieeeNames(c.authors)}, ${LDQ}${c.title},${RDQ} in `,
          { i: c.bookTitleTC },
          `, ${ieeeNames(c.editors)}, ${c.editors.length > 1 ? 'Eds.' : 'Ed.'} ${c.place}, ${c.country}: ${c.publisher}, ${c.year}, pp. ${pages(c)}.`,
        ),
    }),
};

/* ---------------------------------------------------------------- Vancouver */
// Reference entries follow Citing Medicine (NLM). No italics, no full stops
// in initials, hyphenated and elided page ranges.

const vancouverNames = (people: Person[]) => {
  const list = people.slice(0, 6).map((p) => `${p.family} ${initialsBare(p)}`);
  return list.join(', ') + (people.length > 6 ? ', et al' : '');
};
const vancouverPages = (s: Article | Chapter) => elidedRange(s.pages[0], s.pages[1]);

const vancouver: StyleDef = {
  id: 'vancouver',
  label: 'Vancouver',
  shortLabel: 'Vancouver',
  edition: 'Citing Medicine (NLM)',
  family: 'numeric',
  quotes: [LSQ, RSQ],
  punctuationInsideQuotes: false,
  pastTenseVerbs: false,
  locatorAfterQuote: false,
  referencesHeading: 'References',
  sortReferences: 'citation',
  referencePrefix: (n) => `${n}.`,
  parenthetical: (cites, number) => {
    if (cites.length === 1 && cites[0].locator)
      return `(${number(cites[0].source.id)}, ${pageWithPrefix(cites[0].locator)})`;
    return `(${compressNumbers(
      cites.map((c) => number(c.source.id)),
      (a, b) => (b === undefined ? `${a}` : `${a}-${b}`),
      ',',
    )})`;
  },
  narrative: (c, ctx) =>
    `${numericInText(c.source.authors)} (${ctx.number(c.source.id)}` +
    (ctx.includeLocator && c.locator ? `, ${pageWithPrefix(c.locator)}` : '') +
    ')',
  reference: (s) =>
    byType<Rich>(s, {
      article: (a) =>
        rich(`${vancouverNames(a.authors)}. ${a.title}. ${a.journal}. ${a.year};${a.volume}(${a.issue}):${vancouverPages(a)}.`),
      book: (b) =>
        rich(
          `${vancouverNames(b.authors)}. ${b.title}. `,
          b.edition && b.edition > 1 ? `${ordinal(b.edition)} ed. ` : '',
          `${b.place}: ${b.publisher}; ${b.year}.`,
        ),
      chapter: (c) =>
        rich(
          `${vancouverNames(c.authors)}. ${c.title}. In: ${vancouverNames(c.editors)}, ${c.editors.length > 1 ? 'editors' : 'editor'}. ${c.bookTitle}. ${c.place}: ${c.publisher}; ${c.year}. p. ${vancouverPages(c)}.`,
        ),
    }),
};

/* ------------------------------------------------------------------- OSCOLA */
// OSCOLA 4th edition. Footnotes end with a full stop; bibliography entries do
// not. Subsequent citations use "ibid" (immediately preceding footnote) or a
// short form with a cross-reference: Adeyemi (n 1) 16.

const oscolaNoteNames = (a: Person[]) =>
  a.length >= 4 ? `${fullName(a[0])} and others` : joinList(a.map(fullName), 'and', false);
const oscolaBibNames = (a: Person[]) =>
  a.length >= 4
    ? `${a[0].family} ${initialsBare(a[0])} and others`
    : joinList(
        a.map((p) => `${p.family} ${initialsBare(p)}`),
        'and',
        false,
      );
const oscolaShortNames = (a: Person[]) =>
  a.length >= 4 ? `${a[0].family} and others` : joinList(a.map((p) => p.family), 'and', false);
const oscolaEditors = (e: Person[]) =>
  `${joinList(e.map(fullName), 'and', false)} (${e.length > 1 ? 'eds' : 'ed'})`;

function oscolaFull(c: CiteRef, names: string): Rich {
  const loc = c.locator ? bare(c.locator) : undefined;
  return byType<Rich>(c.source, {
    article: (a) =>
      rich(`${names}, ${LSQ}${a.titleTC}${RSQ} (${a.year}) ${a.volume} ${a.journal} ${a.pages[0]}`, loc ? `, ${loc}` : ''),
    book: (b) =>
      rich(
        `${names}, `,
        { i: b.titleTC },
        ` (${b.edition && b.edition > 1 ? `${ordinal(b.edition)} edn, ` : ''}${b.publisher} ${b.year})`,
        loc ? ` ${loc}` : '',
      ),
    chapter: (ch) =>
      rich(
        `${names}, ${LSQ}${ch.titleTC}${RSQ} in ${oscolaEditors(ch.editors)}, `,
        { i: ch.bookTitleTC },
        ` (${ch.publisher} ${ch.year})`,
        loc ? ` ${loc}` : '',
      ),
  });
}

const oscola: StyleDef = {
  id: 'oscola',
  label: 'OSCOLA',
  shortLabel: 'OSCOLA',
  edition: '4th edition',
  family: 'note',
  quotes: [LSQ, RSQ],
  punctuationInsideQuotes: false,
  pastTenseVerbs: false,
  locatorAfterQuote: false,
  referencesHeading: 'Bibliography',
  sortReferences: 'alpha',
  notePrefix: (n) => `${n}`,
  parenthetical: () => '',
  narrative: (c) => oscolaShortNames(c.source.authors),
  note: (cites, ctx) => {
    const parts = cites.map((c) => {
      const loc = c.locator ? ` ${bare(c.locator)}` : '';
      const prev = ctx.previousNoteIds;
      if (cites.length === 1 && prev && prev.length === 1 && prev[0] === c.source.id) {
        return rich(`ibid${loc}`);
      }
      const first = ctx.firstNoteOf(c.source.id);
      if (first !== undefined) return rich(`${oscolaShortNames(c.source.authors)} (n ${first})${loc}`);
      return oscolaFull(c, oscolaNoteNames(c.source.authors));
    });
    return rich(...parts.flatMap((p, i) => (i === 0 ? [p] : ['; ', p])));
  },
  reference: (s) => {
    const entry = oscolaFull({ source: s }, oscolaBibNames(s.authors));
    return entry;
  },
};

/* ---------------------------------------------------------------- registry */

export const STYLES: Record<StyleId, StyleDef> = {
  harvard,
  apa,
  mla,
  'chicago-ad': chicagoAD,
  'chicago-nb': chicagoNB,
  ieee,
  vancouver,
  oscola,
};

export const STYLE_ORDER: StyleId[] = [
  'harvard',
  'apa',
  'mla',
  'chicago-ad',
  'chicago-nb',
  'ieee',
  'vancouver',
  'oscola',
];

export const FAMILY_LABEL: Record<StyleFamily, string> = {
  'author-date': 'author-date',
  'author-page': 'author-page',
  numeric: 'numeric',
  note: 'footnotes',
};

export function alphaKey(s: Source): string {
  return `${s.authors.map((a) => `${a.family} ${a.given}`).join(' ')} ${s.year}`.toLowerCase();
}
