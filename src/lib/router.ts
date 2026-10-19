import { useEffect, useState } from 'react';

export type Route =
  | { page: 'landing' }
  | { page: 'menu' }
  | { page: 'module'; module: string; index: number };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'menu') return { page: 'menu' };
  if (parts[0] === 'm' && parts[1]) {
    const index = Number(parts[2] ?? 0);
    return { page: 'module', module: parts[1], index: Number.isFinite(index) && index >= 0 ? index : 0 };
  }
  return { page: 'landing' };
}

export const href = {
  landing: '#/',
  menu: '#/menu',
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
