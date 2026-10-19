import { describe, expect, it } from 'vitest';
import { renderText, type Rendered } from './render';
import { richToMarked } from './names';
import { lookupSource } from '../content/sources';
import type { StyleId } from './types';

const r = (text: string, style: StyleId) => renderText(text, style, lookupSource);
/** Paragraph text with footnote markers shown as [^n]. */
const body = (x: Rendered) => x.segs.map((s) => (s.k === 'fn' ? `[^${s.n}]` : s.t)).join('');
const notes = (x: Rendered) => x.notes.map((n) => richToMarked(n.text));
const refs = (x: Rendered) => x.references.map((ref) => (ref.prefix ? `${ref.prefix} ` : '') + richToMarked(ref.text));

describe('single-author article, cited without a page', () => {
  const t = 'Poor sleep is common {{cite:okafor2021}}.';
  it.each<[StyleId, string]>([
    ['harvard', 'Poor sleep is common (Okafor, 2021).'],
    ['apa', 'Poor sleep is common (Okafor, 2021).'],
    ['mla', 'Poor sleep is common (Okafor).'],
    ['chicago-ad', 'Poor sleep is common (Okafor 2021).'],
    ['chicago-nb', 'Poor sleep is common.[^1]'],
    ['ieee', 'Poor sleep is common [1].'],
    ['vancouver', 'Poor sleep is common (1).'],
    ['oscola', 'Poor sleep is common.[^1]'],
  ])('%s in text', (style, expected) => expect(body(r(t, style))).toBe(expected));

  it.each<[StyleId, string]>([
    ['harvard', 'Okafor, A. (2021) ‘Sleep and stress in nursing students on placement’, *Fernhill Journal of Nursing Education*, 12(3), pp. 40–55.'],
    ['apa', 'Okafor, A. (2021). Sleep and stress in nursing students on placement. *Fernhill Journal of Nursing Education*, *12*(3), 40–55.'],
    ['mla', 'Okafor, Ada. “Sleep and Stress in Nursing Students on Placement.” *Fernhill Journal of Nursing Education*, vol. 12, no. 3, 2021, pp. 40–55.'],
    ['chicago-ad', 'Okafor, Ada. 2021. “Sleep and Stress in Nursing Students on Placement.” *Fernhill Journal of Nursing Education* 12, no. 3: 40–55.'],
    ['chicago-nb', 'Okafor, Ada. “Sleep and Stress in Nursing Students on Placement.” *Fernhill Journal of Nursing Education* 12, no. 3 (2021): 40–55.'],
    ['ieee', '[1] A. Okafor, “Sleep and stress in nursing students on placement,” *Fernhill Journal of Nursing Education*, vol. 12, no. 3, pp. 40–55, 2021.'],
    ['vancouver', '1. Okafor A. Sleep and stress in nursing students on placement. Fernhill Journal of Nursing Education. 2021;12(3):40-55.'],
    ['oscola', 'Okafor A, ‘Sleep and Stress in Nursing Students on Placement’ (2021) 12 Fernhill Journal of Nursing Education 40'],
  ])('%s reference entry', (style, expected) => expect(refs(r(t, style))).toEqual([expected]));

  it('Chicago notes give the full first note', () =>
    expect(notes(r(t, 'chicago-nb'))).toEqual([
      'Ada Okafor, “Sleep and Stress in Nursing Students on Placement,” *Fernhill Journal of Nursing Education* 12, no. 3 (2021): 40–55.',
    ]));
  it('OSCOLA gives the first page and no pinpoint', () =>
    expect(notes(r(t, 'oscola'))).toEqual([
      'Ada Okafor, ‘Sleep and Stress in Nursing Students on Placement’ (2021) 12 Fernhill Journal of Nursing Education 40.',
    ]));
});

describe('narrative citation of a quotation, with a page', () => {
  const t =
    '{{cite:holloway2019|integral|page:57}} {{v:goes|went}} further, arguing that {{q:the absence of a general duty has not prevented the courts from reaching fair outcomes}}.';
  const Q = 'the absence of a general duty has not prevented the courts from reaching fair outcomes';
  it.each<[StyleId, string]>([
    ['harvard', `Holloway (2019, p. 57) goes further, arguing that ‘${Q}’.`],
    ['apa', `Holloway (2019) went further, arguing that “${Q}” (p. 57).`],
    ['mla', `Grace Holloway goes further, arguing that “${Q}” (57).`],
    ['chicago-ad', `Holloway (2019, 57) goes further, arguing that “${Q}.”`],
    ['chicago-nb', `Holloway goes further, arguing that “${Q}.”[^1]`],
    ['ieee', `Holloway [1, p. 57] goes further, arguing that “${Q}.”`],
    ['vancouver', `Holloway (1, p. 57) goes further, arguing that ‘${Q}’.`],
    ['oscola', `Holloway goes further, arguing that ‘${Q}’.[^1]`],
  ])('%s', (style, expected) => expect(body(r(t, style))).toBe(expected));

  it('note styles carry the page as a pinpoint', () => {
    expect(notes(r(t, 'chicago-nb'))).toEqual([
      'Grace Holloway, “Fairness and the Commercial Bargain,” *Kingsmere Law Review* 31, no. 2 (2019): 57.',
    ]);
    expect(notes(r(t, 'oscola'))).toEqual([
      'Grace Holloway, ‘Fairness and the Commercial Bargain’ (2019) 31 Kingsmere Law Review 50, 57.',
    ]);
  });
});

describe('parenthetical citation of a quotation', () => {
  const t = 'One study found that {{q:rest was rarely protected}} {{cite:varga2023|page:21}}.';
  it.each<[StyleId, string]>([
    ['harvard', 'One study found that ‘rest was rarely protected’ (Varga and Reyes, 2023, p. 21).'],
    ['apa', 'One study found that “rest was rarely protected” (Varga & Reyes, 2023, p. 21).'],
    ['mla', 'One study found that “rest was rarely protected” (Varga and Reyes 21).'],
    ['chicago-ad', 'One study found that “rest was rarely protected” (Varga and Reyes 2023, 21).'],
    ['chicago-nb', 'One study found that “rest was rarely protected.”[^1]'],
    ['ieee', 'One study found that “rest was rarely protected” [1, p. 21].'],
    ['vancouver', 'One study found that ‘rest was rarely protected’ (1, p. 21).'],
    ['oscola', 'One study found that ‘rest was rarely protected’.[^1]'],
  ])('%s', (style, expected) => expect(body(r(t, style))).toBe(expected));
});

describe('two authors', () => {
  const t = 'Compliance fell at night {{cite:mensah2020}}. {{cite:mensah2020|integral}} {{v:link|linked}} this to fatigue.';
  it.each<[StyleId, string]>([
    ['harvard', 'Compliance fell at night (Mensah and Whitfield, 2020). Mensah and Whitfield (2020) link this to fatigue.'],
    ['apa', 'Compliance fell at night (Mensah & Whitfield, 2020). Mensah and Whitfield (2020) linked this to fatigue.'],
    ['mla', 'Compliance fell at night (Mensah and Whitfield). Kofi Mensah and Ruth Whitfield link this to fatigue.'],
    ['chicago-ad', 'Compliance fell at night (Mensah and Whitfield 2020). Mensah and Whitfield (2020) link this to fatigue.'],
    ['ieee', 'Compliance fell at night [1]. Mensah and Whitfield [1] link this to fatigue.'],
    ['vancouver', 'Compliance fell at night (1). Mensah and Whitfield (1) link this to fatigue.'],
    ['chicago-nb', 'Compliance fell at night.[^1] Mensah and Whitfield link this to fatigue.[^2]'],
    ['oscola', 'Compliance fell at night.[^1] Mensah and Whitfield link this to fatigue.[^2]'],
  ])('%s', (style, expected) => expect(body(r(t, style))).toBe(expected));

  it('MLA uses surnames only after the first mention', () =>
    expect(body(r('{{cite:okafor2021|integral}} found this. {{cite:okafor2021|integral}} also found that.', 'mla'))).toBe(
      'Ada Okafor found this. Okafor also found that.',
    ));

  it.each<[StyleId, string]>([
    ['harvard', 'Mensah, K. and Whitfield, R. (2020) ‘Hand hygiene on night shifts in three regional hospitals’, *Northgate Journal of Clinical Practice*, 8(2), pp. 61–74.'],
    ['apa', 'Mensah, K., & Whitfield, R. (2020). Hand hygiene on night shifts in three regional hospitals. *Northgate Journal of Clinical Practice*, *8*(2), 61–74.'],
    ['mla', 'Mensah, Kofi, and Ruth Whitfield. “Hand Hygiene on Night Shifts in Three Regional Hospitals.” *Northgate Journal of Clinical Practice*, vol. 8, no. 2, 2020, pp. 61–74.'],
    ['chicago-ad', 'Mensah, Kofi, and Ruth Whitfield. 2020. “Hand Hygiene on Night Shifts in Three Regional Hospitals.” *Northgate Journal of Clinical Practice* 8, no. 2: 61–74.'],
    ['chicago-nb', 'Mensah, Kofi, and Ruth Whitfield. “Hand Hygiene on Night Shifts in Three Regional Hospitals.” *Northgate Journal of Clinical Practice* 8, no. 2 (2020): 61–74.'],
    ['ieee', '[1] K. Mensah and R. Whitfield, “Hand hygiene on night shifts in three regional hospitals,” *Northgate Journal of Clinical Practice*, vol. 8, no. 2, pp. 61–74, 2020.'],
    ['vancouver', '1. Mensah K, Whitfield R. Hand hygiene on night shifts in three regional hospitals. Northgate Journal of Clinical Practice. 2020;8(2):61-74.'],
    ['oscola', 'Mensah K and Whitfield R, ‘Hand Hygiene on Night Shifts in Three Regional Hospitals’ (2020) 8 Northgate Journal of Clinical Practice 61'],
  ])('%s reference entry', (style, expected) => expect(refs(r(t, style))).toEqual([expected]));

  it('note styles name both authors', () => {
    expect(notes(r(t, 'chicago-nb'))).toEqual([
      'Kofi Mensah and Ruth Whitfield, “Hand Hygiene on Night Shifts in Three Regional Hospitals,” *Northgate Journal of Clinical Practice* 8, no. 2 (2020): 61–74.',
      'Mensah and Whitfield, “Hand Hygiene.”',
    ]);
    expect(notes(r(t, 'oscola'))[0]).toBe(
      'Kofi Mensah and Ruth Whitfield, ‘Hand Hygiene on Night Shifts in Three Regional Hospitals’ (2020) 8 Northgate Journal of Clinical Practice 61.',
    );
  });
});

describe('book with an edition', () => {
  const t = 'Good faith matters {{cite:adeyemi2017}}.';
  it.each<[StyleId, string]>([
    ['harvard', 'Adeyemi, T. (2017) *Good faith in English contract law*. 2nd edn. Leeds: Fernhill Academic.'],
    ['apa', 'Adeyemi, T. (2017). *Good faith in English contract law* (2nd ed.). Fernhill Academic.'],
    ['mla', 'Adeyemi, Tunde. *Good Faith in English Contract Law*. 2nd ed., Fernhill Academic, 2017.'],
    ['chicago-ad', 'Adeyemi, Tunde. 2017. *Good Faith in English Contract Law*. 2nd ed. Fernhill Academic.'],
    ['chicago-nb', 'Adeyemi, Tunde. *Good Faith in English Contract Law*. 2nd ed. Fernhill Academic, 2017.'],
    ['ieee', '[1] T. Adeyemi, *Good Faith in English Contract Law*, 2nd ed. Leeds, U.K.: Fernhill Academic, 2017.'],
    ['vancouver', '1. Adeyemi T. Good faith in English contract law. 2nd ed. Leeds: Fernhill Academic; 2017.'],
    ['oscola', 'Adeyemi T, *Good Faith in English Contract Law* (2nd edn, Fernhill Academic 2017)'],
  ])('%s', (style, expected) => expect(refs(r(t, style))).toEqual([expected]));

  it('first-edition books have no edition statement', () => {
    const x = r('Remote work can isolate {{cite:brennan2022}}.', 'harvard');
    expect(refs(x)).toEqual(['Brennan, S. (2022) *Remote work and the lonely office*. Leeds: Fernhill Academic.']);
    expect(refs(r('x {{cite:brennan2022}}.', 'ieee'))).toEqual([
      '[1] S. Brennan, *Remote Work and the Lonely Office*. Leeds, U.K.: Fernhill Academic, 2022.',
    ]);
  });
});

describe('chapter in an edited book', () => {
  const t = 'Shift work cuts sleep {{cite:lin2018}}.';
  it.each<[StyleId, string]>([
    ['harvard', 'Lin, W. (2018) ‘Shift patterns and student sleep’, in Varga, M. (ed.) *Wellbeing in clinical education*. Leeds: Fernhill Academic, pp. 12–30.'],
    ['apa', 'Lin, W. (2018). Shift patterns and student sleep. In M. Varga (Ed.), *Wellbeing in clinical education* (pp. 12–30). Fernhill Academic.'],
    ['mla', 'Lin, Wei. “Shift Patterns and Student Sleep.” *Wellbeing in Clinical Education*, edited by Maria Varga, Fernhill Academic, 2018, pp. 12–30.'],
    ['chicago-ad', 'Lin, Wei. 2018. “Shift Patterns and Student Sleep.” In *Wellbeing in Clinical Education*, edited by Maria Varga, 12–30. Fernhill Academic.'],
    ['chicago-nb', 'Lin, Wei. “Shift Patterns and Student Sleep.” In *Wellbeing in Clinical Education*, edited by Maria Varga, 12–30. Fernhill Academic, 2018.'],
    ['ieee', '[1] W. Lin, “Shift patterns and student sleep,” in *Wellbeing in Clinical Education*, M. Varga, Ed. Leeds, U.K.: Fernhill Academic, 2018, pp. 12–30.'],
    ['vancouver', '1. Lin W. Shift patterns and student sleep. In: Varga M, editor. Wellbeing in clinical education. Leeds: Fernhill Academic; 2018. p. 12-30.'],
    ['oscola', 'Lin W, ‘Shift Patterns and Student Sleep’ in Maria Varga (ed), *Wellbeing in Clinical Education* (Fernhill Academic 2018)'],
  ])('%s', (style, expected) => expect(refs(r(t, style))).toEqual([expected]));

  it('note styles', () => {
    expect(notes(r(t, 'chicago-nb'))).toEqual([
      'Wei Lin, “Shift Patterns and Student Sleep,” in *Wellbeing in Clinical Education*, ed. Maria Varga (Fernhill Academic, 2018), 12–30.',
    ]);
    expect(notes(r(t, 'oscola'))).toEqual([
      'Wei Lin, ‘Shift Patterns and Student Sleep’ in Maria Varga (ed), *Wellbeing in Clinical Education* (Fernhill Academic 2018).',
    ]);
  });
});

describe('several sources at one point', () => {
  it.each<[StyleId, string]>([
    ['harvard', 'Sleep loss is common (Lin, 2018; Okafor, 2021).'],
    ['apa', 'Sleep loss is common (Lin, 2018; Okafor, 2021).'],
    ['mla', 'Sleep loss is common (Lin; Okafor).'],
    ['chicago-ad', 'Sleep loss is common (Lin 2018; Okafor 2021).'],
    ['ieee', 'Sleep loss is common [1], [2].'],
    ['vancouver', 'Sleep loss is common (1,2).'],
    ['chicago-nb', 'Sleep loss is common.[^1]'],
    ['oscola', 'Sleep loss is common.[^1]'],
  ])('%s', (style, expected) => expect(body(r('Sleep loss is common {{cite:lin2018,okafor2021}}.', style))).toBe(expected));

  it('APA sorts alphabetically; other styles keep the writer’s order', () => {
    const t = 'x {{cite:okafor2021,lin2018}}.';
    expect(body(r(t, 'apa'))).toBe('x (Lin, 2018; Okafor, 2021).');
    expect(body(r(t, 'harvard'))).toBe('x (Okafor, 2021; Lin, 2018).');
  });

  it('numeric runs of three are written as ranges', () => {
    const t = 'x {{cite:lin2018,okafor2021,varga2023}}.';
    expect(body(r(t, 'ieee'))).toBe('x [1]–[3].');
    expect(body(r(t, 'vancouver'))).toBe('x (1-3).');
  });

  it('one note holds both citations, separated by a semicolon', () => {
    expect(notes(r('x {{cite:lin2018,okafor2021}}.', 'oscola'))).toEqual([
      'Wei Lin, ‘Shift Patterns and Student Sleep’ in Maria Varga (ed), *Wellbeing in Clinical Education* (Fernhill Academic 2018); Ada Okafor, ‘Sleep and Stress in Nursing Students on Placement’ (2021) 12 Fernhill Journal of Nursing Education 40.',
    ]);
  });

  it('numeric styles number by first appearance and list references in that order', () => {
    const x = r('A {{cite:quigley2022}}. B {{cite:abara2017}}. C {{cite:quigley2022}}.', 'ieee');
    expect(body(x)).toBe('A [1]. B [2]. C [1].');
    expect(x.references.map((ref) => ref.id)).toEqual(['quigley2022', 'abara2017']);
    expect(r('A {{cite:quigley2022}}. B {{cite:abara2017}}.', 'apa').references.map((ref) => ref.id)).toEqual([
      'abara2017',
      'quigley2022',
    ]);
  });
});

describe('subsequent footnotes', () => {
  const t =
    '{{cite:adeyemi2017|integral|page:15}} {{v:states|stated}} that {{q:English law has never accepted a general principle}}. He also {{v:says|said}} that {{q:the courts prefer piecemeal solutions}} {{cite:adeyemi2017|page:16}}. Later work agrees {{cite:holloway2019}}. Adeyemi returns to it {{cite:adeyemi2017}}.';

  it('OSCOLA uses ibid for the immediately preceding note, then (n 1)', () => {
    const x = r(t, 'oscola');
    expect(body(x)).toBe(
      'Adeyemi states that ‘English law has never accepted a general principle’.[^1] He also says that ‘the courts prefer piecemeal solutions’.[^2] Later work agrees.[^3] Adeyemi returns to it.[^4]',
    );
    expect(notes(x)).toEqual([
      'Tunde Adeyemi, *Good Faith in English Contract Law* (2nd edn, Fernhill Academic 2017) 15.',
      'ibid 16.',
      'Grace Holloway, ‘Fairness and the Commercial Bargain’ (2019) 31 Kingsmere Law Review 50.',
      'Adeyemi (n 1).',
    ]);
    expect(x.flags.ibid).toBe(true);
  });

  it('Chicago uses shortened notes, not ibid.', () => {
    const x = r(t, 'chicago-nb');
    expect(body(x)).toBe(
      'Adeyemi states that “English law has never accepted a general principle.”[^1] He also says that “the courts prefer piecemeal solutions.”[^2] Later work agrees.[^3] Adeyemi returns to it.[^4]',
    );
    expect(notes(x)).toEqual([
      'Tunde Adeyemi, *Good Faith in English Contract Law*, 2nd ed. (Fernhill Academic, 2017), 15.',
      'Adeyemi, *Good Faith*, 16.',
      'Grace Holloway, “Fairness and the Commercial Bargain,” *Kingsmere Law Review* 31, no. 2 (2019): 50–69.',
      'Adeyemi, *Good Faith*.',
    ]);
  });

  it('APA puts the page after each quotation', () =>
    expect(body(r(t, 'apa'))).toBe(
      'Adeyemi (2017) stated that “English law has never accepted a general principle” (p. 15). He also said that “the courts prefer piecemeal solutions” (Adeyemi, 2017, p. 16). Later work agrees (Holloway, 2019). Adeyemi returns to it (Adeyemi, 2017).',
    ));

  it('two markers in one sentence stay in order', () =>
    expect(body(r('First {{cite:lin2018}} and second {{cite:okafor2021}} agree.', 'oscola'))).toBe(
      'First and second agree.[^1][^2]',
    ));
});

describe('page ranges and safety checks', () => {
  it('page ranges', () => {
    const t = 'She said {{q:it was rare}} {{cite:okafor2021|pages:42-43}}.';
    expect(body(r(t, 'harvard'))).toBe('She said ‘it was rare’ (Okafor, 2021, pp. 42–43).');
    expect(body(r(t, 'mla'))).toBe('She said “it was rare” (Okafor 42–43).');
    expect(body(r(t, 'chicago-ad'))).toBe('She said “it was rare” (Okafor 2021, 42–43).');
    expect(body(r(t, 'ieee'))).toBe('She said “it was rare” [1, pp. 42–43].');
  });
  it('rejects a page outside the article', () =>
    expect(() => r('x {{q:y}} {{cite:okafor2021|page:99}}.', 'apa')).toThrow(/outside/));
  it('rejects a narrative page with no quotation to attach it to', () =>
    expect(() => r('{{cite:okafor2021|integral|page:42}} says so.', 'apa')).toThrow(/no quotation/));
  it('rejects unknown sources', () => expect(() => r('{{cite:nobody2000}}', 'apa')).toThrow(/Unknown source/));
  it('does not treat a decimal point as a sentence end', () =>
    expect(body(r('Students slept 1.4 hours less {{cite:lin2018}}.', 'oscola'))).toBe(
      'Students slept 1.4 hours less.[^1]',
    ));
});
