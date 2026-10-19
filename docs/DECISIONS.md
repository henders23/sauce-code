# Decisions and conventions

## Citation rendering: a small custom renderer, not citation-js

The brief asked whether to use `citation-js` with CSL styles. I recommend
against it for this app, and built a small custom renderer instead
(`src/citation/`). The reasons:

1. **CSL formats citations, not prose.** This app's teaching depends on how a
   citation sits *in a sentence*. CSL processors have only partial support for
   narrative (integral) citations (citeproc-js's "author-only" /
   "suppress-author" modes vary by style). They don't handle any of these:
   * APA and MLA moving a quotation's page number to *after* the quotation when
     the author is named: *Holloway (2019) argued that "…" (p. 57).*
   * American conventions putting the full stop inside the closing quotation
     mark, but only when no bracketed citation follows: *…outcomes."* vs
     *…outcomes" (p. 57).*
   * Footnote markers moving to after the sentence's punctuation.
   * MLA giving the full name at an author's first mention in the writer's own
     prose.
   * APA's past-tense reporting verbs.
2. **Exactness is testable.** Every format is pinned down by hand-written
   expected strings in `src/citation/render.test.ts`. A CSL style file from a
   repository can change between versions, and some community CSL files
   (Harvard variants, OSCOLA) don't match their guides exactly.
3. **Scope is small.** Seed content needs three source types (journal article,
   book, book chapter) with one or two authors. A CSL processor and its style
   files would add roughly 1 MB to the bundle for that.

The trade-off: adding a new source type (web pages, reports, legislation, cases)
means writing its format for eight conventions plus tests. If the app ever
needs dozens of source types, CSL becomes more attractive for the *reference
list only*, with the in-sentence logic kept custom.

## Editions followed

| Convention | Follows | Notes |
|---|---|---|
| Harvard | Cite Them Right | Harvard varies by institution. The style is one object in `styles.ts`, so a second variant can be added alongside it. |
| APA | 7th edition | |
| MLA | 9th edition | |
| Chicago author-date | 18th edition (2024) | No place of publication; "et al." from three authors. |
| Chicago notes-bibliography | 18th edition (2024) | Shortened notes for later citations; no "ibid." (CMOS 18 discourages it). |
| IEEE | IEEE Reference Guide | |
| Vancouver | Citing Medicine (NLM) for references; ICMJE round brackets in text | Guides differ on in-text page numbers; the app says so when one appears. |
| OSCOLA | 4th edition | "ibid" for the immediately preceding footnote; otherwise `Surname (n X)`. |

House-style choices, flagged in the app where relevant:

* Harvard and Vancouver don't fix the quotation-mark style. The app uses single
  quotation marks, the usual UK practice.
* Vancouver in-text numbers are shown in round brackets; some institutions use
  superscript.
* Journal abbreviations (IEEE, Vancouver, OSCOLA) aren't used because the
  fictional journals have none. Each reference list says so.

## Content rules that keep the teaching accurate

* **Page numbers only for quotations** (enforced by `npm test`). Summaries of a
  source's overall argument take no page number in any of the eight
  conventions. Paraphrases of one specific passage are avoided, because the
  conventions disagree (Harvard (Cite Them Right), MLA, Chicago and OSCOLA
  expect a page; APA makes it optional; Vancouver guides vary). Cite Them
  Right's own guide is behind a login; the Harvard rule here follows UK
  university library guides based on it (e.g. Wolverhampton, Sheffield).
* **No block quotations**: quotations are kept under about 30 words, below
  every convention's block-quotation threshold.
* **Stacked citations** are written in an order that is both alphabetical and
  chronological, so the result is right whichever ordering rule a Harvard
  variant uses.
* **Titles stored in both cases**, and titles avoid words whose capitalisation
  the conventions disagree on.

## Defaults I chose (the brief's §13 questions)

These are easy to change. They're listed here so the owner can confirm them.

* **Default Harvard variant:** Cite Them Right. To add or switch, add a style
  object in `src/citation/styles.ts`.
* **Discipline selection:** included in phase 1. It is optional, reorders items
  within each module (matching discipline first), and unlocks discipline notes.
* **Hosting:** none yet. The build is a plain static site (`npm run build` →
  `dist/`), so Vercel or Netlify both work with zero configuration. The
  phase 2 proxy will decide between them.
* **Title:** "Sauce Code" (working title).
* **Before a convention is chosen**, paragraphs render in Harvard.

## Not yet built

* **Phase 2 (AI layer):** Ask the Chef, free-text reason evaluation, the
  serverless proxy. The item format already carries what that layer needs
  (teaching point via notes and annotations, the student's response, the
  convention).
* **Phase 3:** Bring Your Own Sauce.
