import type { Item } from './types';

/** Every paragraph in an item that is rendered through the citation engine. */
export function itemTexts(item: Item): { label: string; text: string }[] {
  switch (item.activity) {
    case 'taste-test':
      return item.versions.map((v) => ({ label: `version ${v.id}`, text: v.text }));
    case 'fix-sauce':
      return [
        { label: 'flawed', text: item.text },
        { label: 'repaired', text: item.repaired },
      ];
    case 'build-blend':
      return [{ label: 'synthesis', text: item.synthesis }];
    default:
      return [{ label: 'text', text: item.text }];
  }
}
