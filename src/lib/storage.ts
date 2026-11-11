// localStorage can be unavailable (private browsing, blocked site data) or
// throw on access. Every read and write goes through these helpers, and the app
// works without them — it just forgets between visits.

const PREFIX = 'source-code:';
/** The prefix used before the app was renamed. Read once, so nobody loses progress. */
const OLD_PREFIX = 'sauce-code:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key) ?? window.localStorage.getItem(OLD_PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable: keep going in memory.
  }
}
