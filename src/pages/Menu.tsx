import { MODULES, moduleItems } from '../content';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { DisciplineSelect } from '../components/TopBar';

export function Menu({ isDone, onReset }: { isDone: (id: string) => boolean; onReset: () => void }) {
  const { discipline } = useSettings();
  const modules = MODULES.map((m) => {
    const items = moduleItems(m.id, discipline);
    return { ...m, items, done: items.filter((i) => isDone(i.id)).length };
  });
  // Highlight the first module that isn't finished.
  const upNext = modules.find((m) => m.done < m.items.length)?.id;
  return (
    <main id="main" className="wrap stack" style={{ gap: 28, padding: '40px 16px 56px', maxWidth: 872 }}>
      <header className="stack" style={{ gap: 10 }}>
        <p className="eyebrow">Modules</p>
        <h1 className="serif screen-title">Choose a module</h1>
        <p className="muted" style={{ fontSize: 17 }}>
          Five core skills for using sources. Start with the first, or pick any.
        </p>
      </header>

      <ol className="module-list">
        {modules.map((m, mi) => {
          const next = m.items.findIndex((i) => !isDone(i.id));
          const complete = m.done === m.items.length;
          const label = m.done === 0 ? 'Start' : complete ? 'Revisit' : 'Continue';
          const current = m.id === upNext;
          return (
            <li key={m.id} className={current ? 'module-row current' : 'module-row'}>
              <span className="step-num" aria-hidden="true">
                {mi + 1}
              </span>
              <div className="stack" style={{ gap: 2, flex: '1 1 260px', minWidth: 0 }}>
                <h2 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>
                  {m.name}
                </h2>
                <p className="muted" style={{ fontSize: 14 }}>
                  {m.blurb}
                </p>
              </div>
              <span className="faint" style={{ whiteSpace: 'nowrap' }}>
                {m.done} of {m.items.length} done
              </span>
              <a className={current ? 'btn btn-primary' : 'btn'} href={href.item(m.id, next < 0 ? 0 : next)}>
                {label}
                <span className="visually-hidden"> {m.name}</span>
              </a>
            </li>
          );
        })}
      </ol>

      <div className="spread divided">
        <DisciplineSelect id="menu-discipline" />
        <button type="button" className="btn btn-small btn-ghost" onClick={() => window.confirm('Clear your progress on this device?') && onReset()}>
          Reset progress
        </button>
      </div>
      <p className="faint">Progress is saved in this browser only. Nothing is sent anywhere.</p>
    </main>
  );
}
