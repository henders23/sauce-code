# Writing content for Sauce Code

Every activity in the app is one JSON file in `src/content/items/`. You can add,
edit or remove items without touching any code. This guide explains the format.

> **All sources must be fictional.** Seed content uses invented authors,
> journals, publishers and quotations, so the app never attributes made-up claims
> to real scholars. Keep it that way, or replace a fictional source with a real
> one *and* real, checked quotations.

## How to check your work

```
npm install      # once
npm test         # checks every item in all eight conventions
npm run dev      # opens the app at http://localhost:5173
```

`npm test` renders every paragraph in every convention and fails, with a
reason, if anything is wrong: an unknown source, a page number outside an
article's page range, a quotation with no page number, a paragraph outside
100–180 words, a span that doesn't match its annotation, and so on.

## 1. Sources: `src/content/sources.json`

Each source is written once. The app formats it for each convention, so **never
type a formatted citation into a paragraph**.

```json
{
  "id": "okafor2021",                       // used in paragraphs: {{cite:okafor2021}}
  "type": "article",                        // "article", "book" or "chapter"
  "authors": [{ "given": "Ada", "family": "Okafor" }],
  "year": 2021,
  "title": "Sleep and stress in nursing students on placement",       // sentence case
  "titleTC": "Sleep and Stress in Nursing Students on Placement",     // title case
  "shortTitleTC": "Sleep and Stress",       // ≤ 4 words, for Chicago short notes
  "journal": "Fernhill Journal of Nursing Education",
  "volume": 12,
  "issue": 3,
  "pages": [40, 55]
}
```

Why two titles? APA, Harvard, IEEE (articles) and Vancouver use sentence case;
MLA, Chicago and OSCOLA use title case. Automatic conversion gets proper nouns
and small words wrong, so write both by hand. Avoid words whose capitalisation
the conventions disagree on (e.g. *that*, *among*, *without*, *as*).

Books add `publisher`, `place`, `country` (IEEE needs it, e.g. `"U.K."`) and an
optional `edition` (a number; omit for first editions). Chapters add `editors`,
`bookTitle`, `bookTitleTC`, `publisher`, `place`, `country` and `pages`.

## 2. Markup inside paragraphs

| You write | What it means |
|---|---|
| `{{cite:okafor2021}}` | Citation in brackets / as a number / as a footnote, depending on convention. Put it **before** the full stop: `…on placement {{cite:okafor2021}}.` Footnote styles move it after the full stop automatically. |
| `{{cite:lin2018,okafor2021}}` | Several sources at one point. APA reorders them alphabetically; other conventions keep your order, so put them in an order that is both alphabetical and chronological if you can. |
| `{{cite:okafor2021 \| integral}}` | The author is named in the writer's sentence: *Okafor (2021) argues…* / *Okafor [1] argues…* / *Ada Okafor argues…* (MLA, first mention). |
| `{{cite:okafor2021 \| page:42}}` | Adds a page. **Only for quotations.** Use `pages:42-43` for a range. |
| `{{q:quoted words}}` | A quotation. The app adds the right quotation marks (single for Harvard, OSCOLA, Vancouver; double for APA, MLA, Chicago, IEEE) and moves full stops inside the closing mark for American conventions. Don't put the sentence's full stop inside the braces. |
| `{{sq:word}}` | Scare quotes — quotation marks that are not a quotation from a source. |
| `{{v:argues\|argued}}` | A reporting verb: present \| past. APA recommends the past tense, so APA shows the second form. |
| `{{seam}}` | *Find the Seam* only: the correct boundary. |
| `{{gap}}` | *Pick the Verb* only: the blank. |
| `[[c1:some text]]` | A span the activity refers to by id (annotations, voices, lifted phrases). Spans can contain citations but cannot be nested. |

### The page-number rule

Page numbers belong to **quotations**. The test suite enforces this:

* a narrative citation with a page must be followed by its quotation:
  `{{cite:holloway2019|integral|page:57}} argues that {{q:…}}.`
* a bracketed citation with a page must follow its quotation:
  `{{q:…}} {{cite:holloway2019|page:57}}.`
* every quotation needs one of those.

When you summarise a source's overall argument, give **no** page number — that
is correct in all eight conventions. Avoid paraphrasing one specific passage of
a paginated source: the conventions disagree about whether it needs a page.
(If you need one, take the passage from an abstract, as `remix-01` does.)

### Long quotations

Keep quotations under about 30 words. APA sets 40+ words as a block quotation;
OSCOLA does so from more than three lines; MLA from more than four. The app
renders inline quotations only.

### Same source twice in a row (footnote styles)

That's fine. OSCOLA renders the second footnote as `ibid`; Chicago (18th ed.)
renders a shortened note.

## 3. Item files

Every item has these fields:

```json
{
  "_note": "Fictional sources for teaching: every source cited here is invented.",
  "id": "garnish-01",                  // unique
  "module": "garnish",                 // reduction | remix | garnish | blend | seasoning
  "activity": "taste-test",            // see below
  "title": "The dropped quote",        // humour is fine here
  "disciplines": ["humanities"],       // humanities | social-sciences | life-sciences | engineering | law | health
  "difficulty": 1,                     // 1 Starter, 2 Main, 3 Chef's special
  "context": "Two history students are writing about…",   // optional, plain English
  "question": "Which version uses the quotation better?",
  "followUp": { … },                   // optional — see below
  "notes": [ … ],                      // optional — see below
  "chefsNote": "A quote without a comment is a garnish on an empty plate."
}
```

Keep instructions and feedback **plain and clear**; many students write in
English as an additional language. Humour belongs in titles and chef's notes.
Laugh at paragraphs, never at the student: a wrong answer is "a reasonable
instinct", not "wrong".

### Notes

Shown after the student has answered.

```json
"notes": [
  { "text": "Shown to everyone." },
  { "styles": ["ieee", "vancouver"], "text": "Shown only in these conventions." },
  { "disciplines": ["law"], "text": "Shown if the student chose Law (or no discipline)." }
]
```

Convention ids: `harvard`, `apa`, `mla`, `chicago-ad`, `chicago-nb`, `ieee`,
`vancouver`, `oscola`. A one-line summary of the chosen convention is always
added automatically.

### Follow-up question

```json
"followUp": {
  "question": "Which sentence is the 'comment' slice of the quote sandwich?",
  "options": [
    { "id": "comment", "text": "…", "good": true, "feedback": "Yes. …" },
    { "id": "intro",   "text": "…", "feedback": "That's the introduction: …" }
  ]
}
```

## 4. Activity types — the extra fields

**taste-test** — `versions` (each `{ id, label, rating, text }`, rating is
`weak | getting | proper | michelin`), `best`, `picks` (feedback per version
id), `reasonQuestion`, `reasons` (each `{ id, text, verdict: strong | partial |
weak, feedback }`), optional `sourcePassage`.

**find-seam** — `text` with one `{{seam}}`, `tolerance` (words either side that
still count; 0 for a sentence boundary), `feedback: { correct, early, late }`.

**highlight-voices** — `text` where every part to classify is a `[[span]]`, and
`key: { spanId: { voice: source | writer | both, note } }`.

**pick-verb** — `text` with one `{{gap}}`, `options` (each `{ present, past,
verdict: good | possible | clash, signal, feedback }`). Several can be good.

**fix-sauce** — `text` (the flawed paragraph), `problems` (each `{ id, text,
correct, feedback }`), `repaired` (the app's own repair, with `[[spans]]`) and
`annotations: { spanId: "what changed" }`. Repairs are always of the sample
paragraph, never of a student's work.

**spot-patchwriting** — `sourcePassage: { source, where, text }`, `text` (the
patchwritten paraphrase; each lifted phrase is a `[[span]]` and must appear
word for word in the source passage), `lifted: { spanId: comment }`,
`feedback: { all, some, none, falsePositives }`.

**build-blend** — `claim`, `summaries` (each `{ id, source, text, role:
supports | complicates | irrelevant, feedback: { supports, complicates,
irrelevant } }`), `synthesis` (a paragraph with `[[spans]]`) and `annotations`.

## 5. A complete annotated example

`src/content/items/garnish-01-penny-post.json`, shortened:

```jsonc
{
  "id": "garnish-01",
  "module": "garnish",                   // The Garnish — quoting
  "activity": "taste-test",
  "title": "The dropped quote",
  "disciplines": ["humanities"],
  "difficulty": 1,
  "context": "Two history students are writing about the penny post…",
  "question": "Which version uses the quotation better?",
  "versions": [
    {
      "id": "a", "label": "Version A", "rating": "weak",
      // A dropped quote: no introduction, no comment. The citation comes after
      // the quotation, with the page — so it's {{q:…}} then {{cite:… | page:42}}.
      "text": "… {{q:For the first time, a servant in Manchester could write to her mother in Cornwall as often as a merchant could write to his agent}} {{cite:fairbairn2018|page:42}}. The number of letters sent increased greatly…"
    },
    {
      "id": "b", "label": "Version B", "rating": "proper",
      // A quote sandwich. The author is named in the sentence (integral), so the
      // page goes on the integral citation; APA and MLA will move it to after
      // the quotation automatically.
      "text": "… {{cite:fairbairn2018|integral|page:42}} {{v:locates|located}} its significance in how far down the social scale it reached: {{q:For the first time, …his agent}}. The comparison is telling, because …"
    }
  ],
  "best": "b",
  "picks": {
    "a": "A reasonable instinct — Version A's quotation is vivid… But it's 'dropped' into the paragraph…",
    "b": "Yes. Version B builds a quote sandwich…"
  },
  "reasonQuestion": "What makes the difference?",
  "reasons": [
    { "id": "sandwich", "text": "B introduces the quotation and then explains what it shows.", "verdict": "strong", "feedback": "Exactly — introduce, quote, comment…" },
    { "id": "speaks", "text": "A's quotation speaks for itself…", "verdict": "weak", "feedback": "A good quotation can feel as though it speaks for itself, but…" }
  ],
  "notes": [
    { "styles": ["apa", "mla"], "text": "When the author is named in your sentence, APA and MLA put the page number straight after the quotation…" }
  ],
  "chefsNote": "A quote without a comment is a garnish on an empty plate."
}
```

Version B renders as:

* **Harvard:** Fairbairn (2018, p. 42) locates its significance …: ‘For the first time, … agent’.
* **APA:** Fairbairn (2018) located its significance …: “For the first time, … agent” (p. 42).
* **MLA:** Eleanor Fairbairn locates its significance …: “For the first time, … agent” (42).
* **Chicago author-date:** Fairbairn (2018, 42) locates …: “For the first time, … agent.”
* **Chicago notes / OSCOLA:** Fairbairn locates … agent.”¹ / … agent’.¹ — with the full note below.
* **IEEE:** Fairbairn [1, p. 42] locates … agent.”
* **Vancouver:** Fairbairn (1, p. 42) locates … agent’.
