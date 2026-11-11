import { useState } from 'react';
import { itemById } from '../content';
import { href } from '../lib/router';
import { ItemShell } from '../components/ItemShell';
import { Arrow } from '../components/Stage';

const DEMO = itemById('quoting-01')!;

const HOW = [
  ['Read', 'A task, then one or two short paragraphs.'],
  ['Answer', 'One question at a time, with the text in view.'],
  ['See why', 'Feedback on your answer, then one key point.'],
];

/** How every exercise works, then a first one to try before choosing a module. */
export function FirstExercise({ markDone }: { markDone: (id: string) => void }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <main id="main" className="wrap screen screen-short">
        <div className="screen-inner stack">
          <div className="stack" style={{ gap: 12 }}>
            <p className="label">How it works</p>
            <h1 className="screen-title">Every exercise has three steps</h1>
          </div>
          <ol className="plain-steps">
            {HOW.map(([title, text], i) => (
              <li key={title}>
                <span className="num">{i + 1}</span>
                <strong>{title}</strong>
                <span className="muted">{text}</span>
              </li>
            ))}
          </ol>
          <div className="row" style={{ gap: 16 }}>
            <button type="button" className="btn btn-primary btn-large" onClick={() => setStarted(true)}>
              Try one
              <Arrow />
            </button>
            <a href={href.modules}>Skip to the modules</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="item-page">
      <nav className="crumb" aria-label="Where you are">
        First exercise
      </nav>
      <ItemShell item={DEMO} next={{ href: href.modules, label: 'Choose a module' }} onFinished={() => markDone(DEMO.id)} />
    </main>
  );
}
