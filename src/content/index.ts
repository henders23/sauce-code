import type { ActivityType, DisciplineId, Item, ModuleId } from './types';

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  blurb: string;
}

export const MODULES: ModuleMeta[] = [
  { id: 'reduction', name: 'Summarising', blurb: 'Keep only what your argument needs from a source — and know when a summary beats a quotation.' },
  { id: 'remix', name: 'Paraphrasing', blurb: 'Real paraphrase versus patchwriting: keep the meaning, change the structure.' },
  { id: 'garnish', name: 'Quoting', blurb: 'When a quotation earns its place, and how to introduce it and comment on it.' },
  { id: 'blend', name: 'Synthesising', blurb: 'Combine sources around your point instead of listing them one per sentence.' },
  { id: 'seasoning', name: 'Stance and voice', blurb: 'Reporting verbs, and where your own voice comes through.' },
];

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  'taste-test': 'Compare versions',
  'find-seam': 'Find where the source ends',
  'highlight-voices': 'Who is speaking?',
  'pick-verb': 'Choose a reporting verb',
  'fix-sauce': 'Find the main problem',
  'spot-patchwriting': 'Spot copied phrases',
  'build-blend': 'Combine sources',
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
