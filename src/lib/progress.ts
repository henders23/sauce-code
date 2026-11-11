import { useCallback, useState } from 'react';
import { load, save } from './storage';

/** Item ids were renamed with the modules. Progress saved under the old ids still counts. */
const OLD_PREFIXES: [RegExp, string][] = [
  [/^reduction-/, 'summarising-'],
  [/^remix-/, 'paraphrasing-'],
  [/^garnish-/, 'quoting-'],
  [/^blend-/, 'synthesising-'],
  [/^seasoning-/, 'stance-'],
];

function migrate(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id): id is string => typeof id === 'string').map((id) => OLD_PREFIXES.reduce((s, [from, to]) => s.replace(from, to), id));
}

/** Item ids the student has finished. Stored on this device only. */
export function useProgress() {
  const [done, setDone] = useState<string[]>(() => migrate(load<unknown>('done', [])));
  const markDone = useCallback((id: string) => {
    setDone((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      save('done', next);
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    save('done', []);
    setDone([]);
  }, []);
  return { done, isDone: (id: string) => done.includes(id), markDone, reset };
}
