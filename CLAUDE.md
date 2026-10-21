# Working on Sauce Code

## Owner's design preferences

- **Minimal screens.** One main idea or question per screen, with as little text
  as the screen needs. Split crowded screens into steps rather than adding more.
- **Context first.** Before asking the user to do anything, tell them briefly what
  the app (or the screen) is for and what they are about to do. A screen should
  never open on a task with no explanation.
- **Activities: instruction first.** Show the instruction, then reveal the text
  with a button — don't open on a wall of text.
- **Purpose before text.** A student never reads a text without knowing why.
  Keep the task or question on screen whenever a text is shown.
- **Texts in view when deciding.** When a student judges texts (which is better,
  what's wrong, where the source ends), every text being judged is on screen.
  Reveal texts one at a time first, then show them together for the decision.
- **Reveal gradually.** Unlock content step by step rather than showing it all
  at once (items unlock one at a time within a module).
- **Select phrases, not words.** Never make students select text word by word.
- Dark mode. Tone: plain throughout. The app's name is the only pun — no
  cooking puns in buttons, headings, module names or ratings.

## Accuracy

Citation formats must be exactly right for each convention. Read
`docs/DECISIONS.md` and `CONTENT_GUIDE.md` before changing the citation engine
or content, and run `npm test` — it checks every item in all eight conventions.
