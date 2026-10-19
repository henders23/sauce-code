import { MODULES, moduleItems } from '../content';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';

const HAZARDS = [
  ['Source boundary blur', 'the reader can’t tell whose idea is whose'],
  ['Citation stacking', 'a pile of references with no comment'],
  ['One-source paragraphs', 'a single source doing all the work'],
  ['All sauce, no dish', 'the writer disappears entirely'],
  ['Citing the wrong things', 'citing common knowledge, but not the claims that need support'],
];

export function Menu({ isDone, onReset }: { isDone: (id: string) => boolean; onReset: () => void }) {
  const { discipline } = useSettings();
  return (
    <main id="main" className="wrap stack" style={{ gap: 32, padding: '40px 16px 56px' }}>
      <header className="stack" style={{ gap: 10 }}>
        <p className="eyebrow">The menu</p>
        <h1 className="serif" style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 400 }}>
          The five Mother Sauces
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 720 }}>
          Five core moves for using sources. Each one is a short set of activities on real-feeling paragraphs: you make a judgement first, and the explanation comes after.
        </p>
      </header>

      <div className="grid-2">
        {MODULES.map((m, mi) => {
          const items = moduleItems(m.id, discipline);
          const done = items.filter((i) => isDone(i.id)).length;
          const next = items.findIndex((i) => !isDone(i.id));
          const label = done === 0 ? 'Start' : done === items.length ? 'Revisit' : 'Continue';
          return (
            <article key={m.id} className="card stack" style={{ gap: 14 }}>
              <div className="spread">
                <span className="faint">Mother Sauce {mi + 1}</span>
                <span className="faint">
                  {done} of {items.length} done
                </span>
              </div>
              <h2 className="serif" style={{ fontSize: 30, fontWeight: 400 }}>
                {m.name} <span className="muted" style={{ fontFamily: 'var(--sans)', fontSize: 17 }}>— {m.plain}</span>
              </h2>
              <p className="muted">{m.blurb}</p>
              <div className="bar" role="progressbar" aria-label={`${m.name} progress`} aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done}>
                <div style={{ width: `${(done / items.length) * 100}%` }} />
              </div>
              <div>
                <a className={done === items.length ? 'btn' : 'btn btn-primary'} href={href.item(m.id, next < 0 ? 0 : next)}>
                  {label}
                  <span className="visually-hidden"> {m.name}</span>
                </a>
              </div>
            </article>
          );
        })}

        <aside className="card stack" style={{ gap: 12, background: 'var(--surface-2)' }} aria-labelledby="hazards">
          <h2 id="hazards" className="serif" style={{ fontSize: 26, fontWeight: 400 }}>
            Kitchen hazards
          </h2>
          <p className="muted">Problems that turn up across all five sauces. Watch for them as you go.</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {HAZARDS.map(([name, plain]) => (
              <li key={name}>
                <strong style={{ fontWeight: 600 }}>{name}</strong> <span className="muted">— {plain}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="spread">
        <p className="faint">Progress is saved in this browser only. Nothing is sent anywhere.</p>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => window.confirm('Clear your progress on this device?') && onReset()}>
          Reset progress
        </button>
      </div>
    </main>
  );
}
