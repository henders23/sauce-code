import { MODULES, moduleItems } from '../content';
import type { ModuleId } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { ItemShell } from '../components/ItemShell';
import { Arrow } from '../components/Stage';

/** Problems that turn up in every module — shown when a module is finished. */
const HAZARDS = [
  ['Blurred boundaries', 'the reader can’t tell whose idea is whose'],
  ['Stacked citations', 'several references, no comment'],
  ['One source', 'a single source does all the work'],
  ['No writer', 'all source, no point of your own'],
  ['Wrong things cited', 'common knowledge cited, real claims not'],
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
      <main id="main" className="wrap narrow stack" style={{ padding: '48px 16px' }}>
        <h1 className="screen-title">There’s no module here.</h1>
        <a className="btn" href={href.modules}>
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
    <nav className="crumb spread" aria-label={`${module.name} exercises`}>
      <span>
        <a href={href.modules}>← Modules</a> / {module.name}
      </span>
      <div className="row" style={{ gap: 10 }}>
        <span>{index < items.length ? `Exercise ${index + 1} of ${items.length}` : 'Complete'}</span>
        <div className="progress-dots">
          {items.map((it, i) =>
            unlocked(i) ? (
              <a
                key={it.id}
                href={href.item(module.id, i)}
                aria-label={`Exercise ${i + 1}${isDone(it.id) ? ', done' : ''}${i === index ? ', current' : ''}`}
                aria-current={i === index ? 'step' : undefined}
                style={{ display: 'inline-flex', padding: 7, margin: -7 }}
              >
                <span className={`dot${i === index ? ' current' : isDone(it.id) ? ' done' : ''}`} />
              </a>
            ) : (
              <span key={it.id} role="img" aria-label={`Exercise ${i + 1}, locked until you finish the one before`} style={{ display: 'inline-flex', padding: 7, margin: -7 }}>
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
      <main id="main" className="item-page">
        {nav}
        <section className="item-intro stack">
          <p className="label">Module complete</p>
          <h1 className="screen-title">You’ve finished {module.name}.</h1>
          <div className="row">
            {nextModule && (
              <a className="btn btn-primary btn-large" href={href.item(nextModule.id, 0)}>
                Next: {nextModule.name}
                <Arrow />
              </a>
            )}
            <a className={nextModule ? 'btn' : 'btn btn-primary btn-large'} href={href.modules}>
              All modules
            </a>
          </div>
          <aside className="stack divided" style={{ gap: 10 }} aria-labelledby="hazards">
            <h2 id="hazards" style={{ fontSize: 17 }}>
              Five problems to watch for in any paragraph
            </h2>
            <ul className="hazards">
              {HAZARDS.map(([name, plain]) => (
                <li key={name}>
                  <strong style={{ fontWeight: 600 }}>{name}</strong> <span className="muted">— {plain}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    );
  }

  const item = items[index];
  const next =
    index + 1 < items.length
      ? { href: href.item(module.id, index + 1), label: 'Next exercise' }
      : { href: href.item(module.id, items.length), label: `Finish ${module.name}` };

  return (
    <main id="main" className="item-page">
      {nav}
      <ItemShell key={item.id} item={item} next={next} onFinished={() => markDone(item.id)} />
    </main>
  );
}
