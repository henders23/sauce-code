# Sauce Code

Learning to use sources well in academic writing — by tasting weak sauce and
proper sauce side by side.

Students look at short academic paragraphs, make a judgement, and get feedback
that responds to what they chose. Every paragraph re-renders in the student's
referencing convention (Harvard, APA 7th, MLA 9th, Chicago author-date, Chicago
notes-bibliography, IEEE, Vancouver, OSCOLA), so the same lesson shows how each
convention changes the picture.

This is phase 1 of the brief: the full app without AI.

## Running it

```
npm install
npm run dev        # http://localhost:5173
npm test           # citation engine + content checks
npm run build      # static site in dist/
```

## What's here

* **A short start**: a minimal intro, two setup questions (referencing style, then optional discipline), and a first exercise.
* **Five Mother Sauces** (modules): The Reduction (summarising), The Remix
  (paraphrasing), The Garnish (quoting), The Blend (synthesising), The
  Seasoning (stance and voice).
* **Seven activity types**: Taste Test, Find the Seam, Highlight the Voices,
  Pick the Verb, Fix the Sauce, Spot the Patchwriting, Build the Blend.
* **11 seed items** across six disciplines, all using **fictional sources**.
* **Convention switcher** always in the top bar; switching re-renders the
  current paragraph straight away, without losing your answers.
* **Optional discipline**: puts matching items first and adds discipline notes.
* **Progress** saved in `localStorage` only; the app works if storage is blocked.
* Keyboard-operable activities; source and writer voices are never marked by
  colour alone.

## Where things live

| Path | What |
|---|---|
| `src/citation/` | The citation engine: markup parser, eight style definitions, renderer, tests |
| `src/content/sources.json` | The fictional bibliography |
| `src/content/items/*.json` | One file per activity — editable without code |
| `CONTENT_GUIDE.md` | How to write and edit items |
| `docs/DECISIONS.md` | Why a custom renderer rather than citation-js, editions followed, defaults chosen |
| `src/components/activities/` | The seven activity components |
