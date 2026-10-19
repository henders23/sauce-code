import { useCallback, useState } from 'react';
import { load, save } from './storage';

/** Item ids the student has finished. Stored on this device only. */
export function useProgress() {
  const [done, setDone] = useState<string[]>(() => load<string[]>('done', []));
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
