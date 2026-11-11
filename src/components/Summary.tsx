import type { RenderFlags } from '../citation/render';
import { STYLES } from '../citation/styles';
import type { StyleId } from '../citation/types';
import type { DisciplineId, Item } from '../content/types';
import { disciplineLabel } from '../content';
import { Arrow, Continue, Step } from './Stage';

/** One line on what is distinctive about each convention. */
export const STYLE_BASICS: Record<StyleId, string> = {
  harvard:
    'Harvard gives author and year in the text — (Okafor, 2021). Add a page number for a quotation or a paraphrase of a specific passage — (Okafor, 2021, p. 42) — but not when you summarise a work’s overall argument. Harvard varies between institutions: this app follows Cite Them Right, so check your own guide for small differences.',
  apa: 'APA gives author and year in the text — (Okafor, 2021). Page numbers are required for quotations; for paraphrases they are optional.',
  mla: 'MLA gives author and page, with no year — (Okafor 42). The first time you name an author in your own sentence, give their full name; after that, the surname.',
  'chicago-ad':
    'Chicago author-date puts no comma between author and year — (Okafor 2021) — and gives a page after a comma, without “p.” — (Okafor 2021, 42).',
  'chicago-nb':
    'Chicago notes-bibliography gives a full note the first time you cite a source and a shortened note after that. The note number goes after the punctuation at the end of the sentence.',
  ieee: 'IEEE numbers sources in the order you first cite them, in square brackets — [1]. A bare number doesn’t say who is speaking, so name the author when it matters.',
  vancouver:
    'Vancouver numbers sources in the order you first cite them. This app uses round brackets — (1) — as the ICMJE recommends; some institutions use superscript numbers instead.',
  oscola:
    'OSCOLA puts citations in footnotes, with the marker after the punctuation at the end of the sentence. A source cited again uses “ibid” if it was in the previous footnote, or a short form with a cross-reference such as Adeyemi (n 1).',
};

function contextual(style: StyleId, flags: RenderFlags): string[] {
  const out: string[] = [];
  if (style === 'vancouver' && flags.locator)
    out.push('Vancouver guides differ on how to show a page number in the text. This app writes (1, p. 42); check your institution’s guide.');
  if (style === 'ieee' && flags.locator) out.push('IEEE puts a page number inside the bracket, after the reference number: [1, p. 42].');
  if (style === 'mla' && flags.mlaFullName)
    out.push('Notice the full name at the first mention in the text, and the surname after that: that is MLA’s rule for naming authors in your own sentences.');
  return out;
}

/** The discipline to name in a note's heading: the student's, else the item's, else the note's first. */
function noteDiscipline(noteDisc: DisciplineId[], chosen: DisciplineId | null, itemDisc: DisciplineId[]): DisciplineId {
  if (chosen && noteDisc.includes(chosen)) return chosen;
  return noteDisc.find((d) => itemDisc.includes(d)) ?? noteDisc[0];
}

export interface Note {
  heading: string;
  text: string;
}

/** The notes that apply to this item for this student: general, discipline, then convention. */
export function itemNotes(item: Item, style: StyleId, discipline: DisciplineId | null, flags: RenderFlags): Note[] {
  const notes = item.notes ?? [];
  const label = STYLES[style].label;
  const general = notes.filter((n) => !n.styles && !n.disciplines);
  const disc = notes.filter((n) => n.disciplines && (!n.styles || n.styles.includes(style)) && (!discipline || n.disciplines.includes(discipline)));
  const styleNotes = notes.filter((n) => n.styles?.includes(style) && !n.disciplines);
  return [
    ...general.map((n) => ({ heading: 'Good to know', text: n.text })),
    ...disc.map((n) => ({ heading: `In ${disciplineLabel(noteDiscipline(n.disciplines!, discipline, item.disciplines))}`, text: n.text })),
    ...[...styleNotes.map((n) => n.text), ...contextual(style, flags)].map((text) => ({ heading: `In ${label}`, text })),
  ];
}

function Basics({ style }: { style: StyleId }) {
  return (
    <details className="more">
      <summary>How {STYLES[style].label} cites</summary>
      <p>{STYLE_BASICS[style]}</p>
    </details>
  );
}

/** Notes on the item, on their own step so they are read before the key point. */
export function NotesStep({ notes, style, onContinue }: { notes: Note[]; style: StyleId; onContinue: () => void }) {
  return (
    <Step label="Notes" actions={<Continue onClick={onContinue} />}>
      <ul className="note-list">
        {notes.map((n, i) => (
          <li key={i}>
            <strong>{n.heading}</strong>
            {n.text}
          </li>
        ))}
      </ul>
      <Basics style={style} />
    </Step>
  );
}

/** The last step of every item: one sentence to remember, and the way on. */
export function KeyPointStep({ text, next, style, showBasics }: { text: string; next: { href: string; label: string }; style: StyleId; showBasics: boolean }) {
  return (
    <Step
      label="Key point"
      actions={
        <a className="btn btn-primary" href={next.href}>
          {next.label}
          <Arrow />
        </a>
      }
    >
      <p className="key-point">{text}</p>
      {showBasics && <Basics style={style} />}
    </Step>
  );
}
