import { MODULES, moduleItems } from '../content';
import type { ModuleId } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { ItemShell } from '../components/ItemShell';

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
        <h1 className="serif">That dish isn’t on the menu.</h1>
        <a className="btn" href={href.menu}>
          Back to the menu
        </a>
      </main>
    );
  }
  const items = moduleItems(module.id as ModuleId, discipline);

  const nav = (
    <nav className="spread" aria-label={`${module.name} items`}>
      <a href={href.menu} className="faint">
        ← All Mother Sauces
      </a>
      <div className="row" style={{ gap: 10 }}>
        <span className="faint">
          {index < items.length ? `Item ${index + 1} of ${items.length}` : 'Module complete'}
        </span>
        <div className="progress-dots">
          {items.map((it, i) => (
            <a
              key={it.id}
              href={href.item(module.id, i)}
              aria-label={`Item ${i + 1}${isDone(it.id) ? ', done' : ''}${i === index ? ', current' : ''}`}
              aria-current={i === index ? 'step' : undefined}
              style={{ display: 'inline-flex', padding: 7, margin: -7 }}
            >
              <span className={i === index ? 'current' : isDone(it.id) ? 'done' : ''} />
            </a>
          ))}
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
            {module.name} is done.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)' }}>{module.blurb}</p>
          <div className="row">
            {nextModule && (
              <a className="btn btn-primary" href={href.item(nextModule.id, 0)}>
                On to {nextModule.name}
              </a>
            )}
            <a className="btn" href={href.menu}>
              Back to the menu
            </a>
          </div>
        </section>
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
