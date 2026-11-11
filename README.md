# Source Code

Practise using sources in academic writing: read a short paragraph, answer one
question about it, and see why.

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

* **A short start**: an intro, two setup questions (referencing style, then
  optional discipline), a three-line explanation of how exercises work, and a
  first exercise.
* **Five modules**: Summarising, Paraphrasing, Quoting, Synthesising, and
  Stance and voice.
* **Seven activity types**: Compare versions, Find where the source ends, Who
  is speaking?, Choose a reporting verb, Find the main problem, Spot copied
  phrases, Combine sources.
* **One layout for every exercise**: the task on one line at the top, the texts
  on the left, and a single panel on the right that shows one step at a time
  (read, answer, feedback, notes, key point). Buttons only appear in the panel.
* **One accent colour, one meaning**: it marks where to look or act now — the
  primary button, or the text to work in.
* **21 seed items** (four or five per module) across six disciplines, all using **fictional sources**.
* **Gradual reveal**: texts appear one at a time, and within each module the
  next exercise unlocks when the student finishes the one before.
* **Style switcher** always in the top bar; switching re-renders the
  current paragraph straight away, without losing your answers.
* **Optional discipline**: puts matching items first and adds discipline notes.
  Change it from the modules page.
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
| `src/components/Stage.tsx` | The shared exercise layout: texts, step panel, text cards |
| `src/components/ItemShell.tsx` | The step sequence for one exercise |
| `src/components/activities/` | The seven activity components |
