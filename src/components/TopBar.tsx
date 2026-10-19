import { STYLES, STYLE_ORDER, FAMILY_LABEL } from '../citation/styles';
import type { StyleId } from '../citation/types';
import { DISCIPLINES } from '../content';
import type { DisciplineId } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" />
      <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  );
}

export function ConventionSelect({ id }: { id: string }) {
  const { style, effectiveStyle, setStyle } = useSettings();
  return (
    <label className="field" htmlFor={id}>
      Convention
      <select id={id} className="select" value={style ?? effectiveStyle} onChange={(e) => setStyle(e.target.value as StyleId)}>
        {STYLE_ORDER.map((s) => (
          <option key={s} value={s}>
            {STYLES[s].label} ({FAMILY_LABEL[STYLES[s].family]})
          </option>
        ))}
      </select>
    </label>
  );
}

export function DisciplineSelect({ id }: { id: string }) {
  const { discipline, setDiscipline } = useSettings();
  return (
    <label className="field" htmlFor={id}>
      Discipline
      <select
        id={id}
        className="select"
        value={discipline ?? ''}
        onChange={(e) => setDiscipline((e.target.value || null) as DisciplineId | null)}
      >
        <option value="">Any / not sure</option>
        {DISCIPLINES.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TopBar() {
  return (
    <header className="topbar">
      <div className="wrap spread">
        <a className="brand" href={href.landing} aria-label="Sauce Code — home">
          <Logo />
          <span>
            Sauce <em>Code</em>
          </span>
        </a>
        <nav className="row" aria-label="Settings and navigation">
          <ConventionSelect id="topbar-convention" />
          <DisciplineSelect id="topbar-discipline" />
          <a className="btn btn-small btn-ghost" href={href.menu}>
            Menu
          </a>
        </nav>
      </div>
    </header>
  );
}
