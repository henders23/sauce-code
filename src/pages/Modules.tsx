import { MODULES, moduleItems } from '../content';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { DisciplineSelect } from '../components/TopBar';

export function Modules({ isDone, onReset }: { isDone: (id: string) => boolean; onReset: () => void }) {
  const { discipline } = useSettings();
  const modules = MODULES.map((m) => {
    const items = moduleItems(m.id, discipline);
    return { ...m, items, done: items.filter((i) => isDone(i.id)).length };
  });
  // Only the first unfinished module gets the primary button: that is where to go next.
  const upNext = modules.find((m) => m.done < m.items.length)?.id;
  return (
    <main id="main" className="wrap narrow stack" style={{ gap: 28, padding: '48px 16px 56px' }}>
      <header className="stack" style={{ gap: 10 }}>
        <h1 className="screen-title">Modules</h1>
        <p className="muted">Five skills, a few short exercises each. Work in order, or choose any.</p>
      </header>

      <ol className="module-list">
        {modules.map((m, mi) => {
          const next = m.items.findIndex((i) => !isDone(i.id));
          const complete = m.done === m.items.length;
          const label = m.done === 0 ? 'Start' : complete ? 'Review' : 'Continue';
          return (
            <li key={m.id} className="module-row">
              <span className="num" aria-hidden="true">
                {mi + 1}
              </span>
              <div className="stack" style={{ gap: 2, flex: '1 1 240px', minWidth: 0 }}>
                <h2>{m.name}</h2>
                <p className="muted" style={{ fontSize: 15 }}>
                  {m.blurb}
                </p>
              </div>
              <span className="count">
                {m.done}/{m.items.length} done
              </span>
              <a className={m.id === upNext ? 'btn btn-primary' : 'btn'} href={href.item(m.id, next < 0 ? 0 : next)}>
                {label}
                <span className="visually-hidden"> {m.name}</span>
              </a>
            </li>
          );
        })}
      </ol>

      <div className="spread">
        <DisciplineSelect id="modules-discipline" />
        <button type="button" className="btn btn-small btn-ghost" onClick={() => window.confirm('Clear your progress on this device?') && onReset()}>
          Reset progress
        </button>
      </div>
      <p className="faint">Progress is saved in this browser only.</p>
    </main>
  );
}
