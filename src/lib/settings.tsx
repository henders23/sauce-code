import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { StyleId } from '../citation/types';
import type { DisciplineId } from '../content/types';
import { STYLE_ORDER } from '../citation/styles';
import { load, save } from './storage';

interface Settings {
  /** null until the student has picked one. */
  style: StyleId | null;
  discipline: DisciplineId | null;
}

interface SettingsApi extends Settings {
  /** The convention to render with — Harvard until the student chooses. */
  effectiveStyle: StyleId;
  setStyle(s: StyleId): void;
  setDiscipline(d: DisciplineId | null): void;
}

const Ctx = createContext<SettingsApi | null>(null);

function initial(): Settings {
  const s = load<Partial<Settings>>('settings', {});
  return {
    style: s.style && STYLE_ORDER.includes(s.style) ? s.style : null,
    discipline: s.discipline ?? null,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initial);
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      save('settings', next);
      return next;
    });
  }, []);
  const api = useMemo<SettingsApi>(
    () => ({
      ...settings,
      effectiveStyle: settings.style ?? 'harvard',
      setStyle: (style) => update({ style }),
      setDiscipline: (discipline) => update({ discipline }),
    }),
    [settings, update],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings outside SettingsProvider');
  return v;
}
