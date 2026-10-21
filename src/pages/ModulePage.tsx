import { MODULES, moduleItems } from '../content';
import type { ModuleId } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { ItemShell } from '../components/ItemShell';

/** Problems that turn up in every module — shown when a module is finished. */
const HAZARDS = [
  ['Source boundary blur', 'the reader can’t tell whose idea is whose'],
  ['Citation stacking', 'a pile of references with no comment'],
  ['One-source paragraphs', 'a single source doing all the work'],
  ['The writer disappears', 'the paragraph is all source, with no point of the writer’s own'],
  ['Citing the wrong things', 'citing common knowledge, but not the claims that need support'],
];

export function ModulePage({
  moduleId,
  index,
  isDone,
  markDone,
}: {
  moduleId: string;
  index: number;
  isDone: (id: string) => boolean;
  markDone: (id: string) => void;
}) {
  const { discipline } = useSettings();
  const module = MODULES.find((m) => m.id === moduleId);
  if (!module) {
    return (
      <main id="main" className="wrap stack" style={{ padding: '40px 16px' }}>
        <h1 className="serif">There’s no module here.</h1>
        <a className="btn" href={href.menu}>
          Back to the modules
        </a>
      </main>
    );
  }
  const items = moduleItems(module.id as ModuleId, discipline);
  // Items unlock one at a time: everything done so far, plus the next one.
  const frontier = items.findIndex((it) => !isDone(it.id));
  const unlocked = (i: number) => frontier === -1 || i <= frontier || isDone(items[i].id);
  // A locked item (e.g. typed into the address bar) shows the next unlocked one instead.
  if (index < items.length ? !unlocked(index) : frontier !== -1) index = frontier;

  const nav = (
    <nav className="spread" aria-label={`${module.name} items`}>
      <a href={href.menu} className="faint">
        ← All modules
      </a>
      <div className="row" style={{ gap: 10 }}>
        <span className="faint">
          {index < items.length ? `Item ${index + 1} of ${items.length}` : 'Module complete'}
        </span>
        <div className="progress-dots">
          {items.map((it, i) =>
            unlocked(i) ? (
              <a
                key={it.id}
                href={href.item(module.id, i)}
                aria-label={`Item ${i + 1}${isDone(it.id) ? ', done' : ''}${i === index ? ', current' : ''}`}
                aria-current={i === index ? 'step' : undefined}
                style={{ display: 'inline-flex', padding: 7, margin: -7 }}
              >
                <span className={`dot${i === index ? ' current' : isDone(it.id) ? ' done' : ''}`} />
              </a>
            ) : (
              <span key={it.id} role="img" aria-label={`Item ${i + 1}, unlocks when you finish the one before`} style={{ display: 'inline-flex', padding: 7, margin: -7 }}>
                <span className="dot locked" />
              </span>
            ),
          )}
        </div>
      </div>
    </nav>
  );

  if (index >= items.length) {
    const nextModule = MODULES[MODULES.findIndex((m) => m.id === module.id) + 1];
    return (
      <main id="main" className="wrap stack" style={{ gap: 24, padding: '28px 16px 56px' }}>
        {nav}
        <section className="card stack" style={{ gap: 14 }}>
          <p className="eyebrow">Module complete</p>
          <h1 className="serif" style={{ fontSize: 40, fontWeight: 400 }}>
            You’ve finished {module.name}.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)' }}>{module.blurb}</p>
          <div className="row">
            {nextModule && (
              <a className="btn btn-primary" href={href.item(nextModule.id, 0)}>
                Next: {nextModule.name}
              </a>
            )}
            <a className="btn" href={href.menu}>
              Back to the modules
            </a>
          </div>
        </section>
        <aside className="card stack" style={{ gap: 12 }} aria-labelledby="hazards">
          <h2 id="hazards" className="serif" style={{ fontSize: 26, fontWeight: 400 }}>
            Common problems to watch for
          </h2>
          <p className="muted">These turn up in every module.</p>
          <ul className="hazards">
            {HAZARDS.map(([name, plain]) => (
              <li key={name}>
                <strong style={{ fontWeight: 600 }}>{name}</strong> <span className="muted">— {plain}</span>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    );
  }

  const item = items[index];
  const next =
    index + 1 < items.length
      ? { href: href.item(module.id, index + 1), label: 'Next item' }
      : { href: href.item(module.id, items.length), label: `Finish ${module.name}` };

  return (
    <main id="main" className="wrap stack" style={{ gap: 24, padding: '28px 16px 56px' }}>
      {nav}
      <ItemShell key={item.id} item={item} next={next} onFinished={() => markDone(item.id)} />
    </main>
  );
}
