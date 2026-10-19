import data from './sources.json';
import type { Source } from '../citation/types';

export const SOURCES = data.sources as Source[];
const byId = new Map(SOURCES.map((s) => [s.id, s]));

export const lookupSource = (key: string): Source | undefined => byId.get(key);
