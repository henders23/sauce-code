import { useEffect, useState } from 'react';

export type Route =
  | { page: 'intro' }
  | { page: 'setup' }
  | { page: 'first' }
  | { page: 'modules' }
  | { page: 'module'; module: string; index: number };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'modules') return { page: 'modules' };
  if (parts[0] === 'start') return { page: 'setup' };
  if (parts[0] === 'first') return { page: 'first' };
  if (parts[0] === 'm' && parts[1]) {
    const index = Number(parts[2] ?? 0);
    return { page: 'module', module: parts[1], index: Number.isFinite(index) && index >= 0 ? index : 0 };
  }
  return { page: 'intro' };
}

export const href = {
  intro: '#/',
  setup: '#/start',
  first: '#/first',
  modules: '#/modules',
  item: (module: string, index: number) => `#/m/${module}/${index}`,
};

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => {
      const hash = window.location.hash;
      // In-page anchors (footnotes, the skip link) are not routes.
      if (hash && !hash.startsWith('#/')) return;
      setRoute(parseHash(hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
