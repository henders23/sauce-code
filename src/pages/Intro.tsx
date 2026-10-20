import { useSettings } from '../lib/settings';
import { href } from '../lib/router';
import { Logo } from '../components/TopBar';

export function Intro() {
  const { style } = useSettings();
  const returning = style !== null;
  return (
    <main id="main" className="wrap screen">
      <div className="screen-inner stack" style={{ gap: 36, alignItems: 'center', textAlign: 'center' }}>
        <div className="intro-mark" aria-hidden="true">
          <Logo size={44} />
        </div>
        <div className="stack" style={{ gap: 16, alignItems: 'center' }}>
          <h1 className="serif" style={{ fontSize: 'clamp(48px, 9vw, 84px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Sauce <em style={{ color: 'var(--accent)' }}>Code</em>
          </h1>
          <p style={{ fontSize: 21, color: 'var(--text-2)', maxWidth: 520 }}>
            Practise using sources in your academic writing.
          </p>
        </div>

        <div className="stack" style={{ gap: 12, alignItems: 'center' }}>
          {returning ? (
            <>
              <a className="btn btn-primary btn-large" href={href.menu}>
                Continue
              </a>
              <a className="faint" href={href.setup}>
                Change your referencing style
              </a>
            </>
          ) : (
            <a className="btn btn-primary btn-large" href={href.setup}>
              Start
            </a>
          )}
          <p className="faint">No sign-up. A few minutes per exercise.</p>
        </div>
      </div>
    </main>
  );
}
