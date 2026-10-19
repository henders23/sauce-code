import type { ActivityType, DisciplineId, Item, ModuleId } from './types';

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  /** Plain-English subtitle — every pun label gets one. */
  plain: string;
  blurb: string;
}

export const MODULES: ModuleMeta[] = [
  { id: 'reduction', name: 'The Reduction', plain: 'summarising', blurb: 'Boil a source down to what your argument needs — and know when a summary beats a quotation.' },
  { id: 'remix', name: 'The Remix', plain: 'paraphrasing', blurb: 'Real paraphrase versus patchwriting: keep the meaning, change the structure.' },
  { id: 'garnish', name: 'The Garnish', plain: 'quoting', blurb: 'When a quotation earns its place, and how to introduce it and comment on it.' },
  { id: 'blend', name: 'The Blend', plain: 'synthesising', blurb: 'Combine sources around your point instead of listing them one per sentence.' },
  { id: 'seasoning', name: 'The Seasoning', plain: 'stance and voice', blurb: 'Reporting verbs, and where your own voice comes through.' },
];

export const ACTIVITY_LABEL: Record<ActivityType, { name: string; plain: string }> = {
  'taste-test': { name: 'Taste Test', plain: 'compare versions' },
  'find-seam': { name: 'Find the Seam', plain: 'where the source ends' },
  'highlight-voices': { name: 'Highlight the Voices', plain: 'who is speaking?' },
  'pick-verb': { name: 'Pick the Verb', plain: 'reporting verbs' },
  'fix-sauce': { name: 'Fix the Sauce', plain: 'diagnose the problem' },
  'spot-patchwriting': { name: 'Spot the Patchwriting', plain: 'copied phrases' },
  'build-blend': { name: 'Build the Blend', plain: 'combining sources' },
};

export const DISCIPLINES: { id: DisciplineId; label: string }[] = [
  { id: 'humanities', label: 'Arts & Humanities' },
  { id: 'social-sciences', label: 'Social Sciences' },
  { id: 'life-sciences', label: 'Life Sciences' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'law', label: 'Law' },
  { id: 'health', label: 'Health' },
];

export const disciplineLabel = (id: DisciplineId) => DISCIPLINES.find((d) => d.id === id)?.label ?? id;

const files = import.meta.glob<Item>('./items/*.json', { eager: true, import: 'default' });

export const ITEMS: Item[] = Object.keys(files)
  .sort()
  .map((k) => files[k]);

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

/**
 * Items in a module. If the student has chosen a discipline, items tagged with
 * it come first; the rest keep their file order.
 */
export function moduleItems(module: ModuleId, discipline?: DisciplineId | null): Item[] {
  const items = ITEMS.filter((i) => i.module === module);
  if (!discipline) return items;
  return [...items].sort(
    (a, b) => Number(b.disciplines.includes(discipline)) - Number(a.disciplines.includes(discipline)),
  );
}
