import type { RenderFlags } from '../citation/render';
import { STYLES } from '../citation/styles';
import type { StyleId } from '../citation/types';
import type { DisciplineId, ItemNote } from '../content/types';
import { disciplineLabel } from '../content';

/** One line on what is distinctive about each convention, shown after every item. */
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

interface Props {
  style: StyleId;
  discipline: DisciplineId | null;
  itemDisciplines: DisciplineId[];
  notes?: ItemNote[];
  flags: RenderFlags;
}

export function ConventionNotes({ style, discipline, itemDisciplines, notes = [], flags }: Props) {
  const label = STYLES[style].label;
  const styleNotes = notes.filter((n) => n.styles?.includes(style) && !n.disciplines);
  const general = notes.filter((n) => !n.styles && !n.disciplines);
  const disc = notes.filter((n) => n.disciplines && (!n.styles || n.styles.includes(style)));
  const shownDisc = disc.filter((n) => !discipline || n.disciplines!.includes(discipline));
  return (
    <section className="stack fade-in" style={{ gap: 10 }} aria-label="Notes">
      {general.map((n, i) => (
        <p key={`g${i}`} className="convention-note">
          <strong>Good to know: </strong>
          {n.text}
        </p>
      ))}
      {shownDisc.map((n, i) => (
        <p key={`d${i}`} className="convention-note">
          <strong>In {disciplineLabel(noteDiscipline(n.disciplines!, discipline, itemDisciplines))}: </strong>
          {n.text}
        </p>
      ))}
      {[...styleNotes.map((n) => n.text), ...contextual(style, flags), STYLE_BASICS[style]].map((t, i) => (
        <p key={`s${i}`} className="convention-note">
          <strong>In {label}: </strong>
          {t}
        </p>
      ))}
    </section>
  );
}
