import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { Logo } from '../components/TopBar';
import { Arrow } from '../components/Stage';

export function Intro() {
  const { style } = useSettings();
  const returning = style !== null;
  return (
    <main id="main" className="wrap screen">
      <div className="screen-inner stack">
        <Logo size={40} />
        <div className="stack" style={{ gap: 14 }}>
          <h1 className="wordmark">Source Code</h1>
          <p className="lede" style={{ fontSize: 21 }}>
            Practise using sources in academic writing.
          </p>
          <p className="muted">Read a short paragraph, answer one question about it, and see why.</p>
        </div>
        <div className="row" style={{ gap: 16 }}>
          <a className="btn btn-primary btn-large" href={returning ? href.modules : href.setup}>
            {returning ? 'Continue' : 'Start'}
            <Arrow />
          </a>
          {returning && <a href={href.setup}>Change referencing style</a>}
        </div>
        <p className="faint">No sign-up. About three minutes per exercise.</p>
      </div>
    </main>
  );
}
