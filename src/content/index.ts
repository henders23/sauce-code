import type { ActivityType, DisciplineId, Item, ModuleId } from './types';

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  blurb: string;
}

export const MODULES: ModuleMeta[] = [
  { id: 'summarising', name: 'Summarising', blurb: 'Keep only what your argument needs.' },
  { id: 'paraphrasing', name: 'Paraphrasing', blurb: 'Keep the meaning. Change the wording and the structure.' },
  { id: 'quoting', name: 'Quoting', blurb: 'Introduce each quotation, then comment on it.' },
  { id: 'synthesising', name: 'Synthesising', blurb: 'Combine sources around your own point.' },
  { id: 'stance', name: 'Stance and voice', blurb: 'Show what you think of each source.' },
];

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  'compare-versions': 'Compare versions',
  'find-seam': 'Find where the source ends',
  'highlight-voices': 'Who is speaking?',
  'pick-verb': 'Choose a reporting verb',
  'find-problem': 'Find the main problem',
  'spot-patchwriting': 'Spot copied phrases',
  'combine-sources': 'Combine sources',
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
