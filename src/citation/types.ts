// Source records are stored once, convention-neutral, and formatted at display
// time. Titles are stored twice — sentence case and title case — because the
// eight conventions disagree about capitalisation, and automatic case
// conversion gets proper nouns and small words wrong.

export type StyleId =
  | 'harvard'
  | 'apa'
  | 'mla'
  | 'chicago-ad'
  | 'chicago-nb'
  | 'ieee'
  | 'vancouver'
  | 'oscola';

export interface Person {
  given: string;
  family: string;
}

interface SourceBase {
  id: string;
  authors: Person[];
  year: number;
  /** Sentence case, e.g. "Urban gardens and the survival of wild bees". */
  title: string;
  /** Title case, e.g. "Urban Gardens and the Survival of Wild Bees". */
  titleTC: string;
  /** Up to four words of the title, title case, for Chicago shortened notes. */
  shortTitleTC: string;
}

export interface Article extends SourceBase {
  type: 'article';
  journal: string;
  volume: number;
  issue: number;
  pages: [number, number];
}

export interface Book extends SourceBase {
  type: 'book';
  edition?: number;
  publisher: string;
  place: string;
  country: string;
}

export interface Chapter extends SourceBase {
  type: 'chapter';
  editors: Person[];
  /** Sentence case. */
  bookTitle: string;
  /** Title case. */
  bookTitleTC: string;
  publisher: string;
  place: string;
  country: string;
  pages: [number, number];
}

export type Source = Article | Book | Chapter;

/** A run of text that may be italic. Reference entries are arrays of these. */
export type RichPart = string | { i: string };
export type Rich = RichPart[];

export interface Locator {
  from: number;
  to?: number;
}

export interface CiteRef {
  source: Source;
  locator?: Locator;
}
