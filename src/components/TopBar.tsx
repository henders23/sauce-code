import { STYLES, STYLE_ORDER, FAMILY_LABEL } from '../citation/styles';
import type { StyleId } from '../citation/types';
import { DISCIPLINES } from '../content';
import type { DisciplineId } from '../content/types';
import { useSettings } from '../lib/settings';
import { href } from '../lib/router';

/** Square brackets round a mark: a citation, and a nod to the name. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 4H4v16h4M16 4h4v16h-4" />
      <path d="M12 9v6" stroke="var(--accent)" strokeWidth="2.6" />
    </svg>
  );
}

export function ConventionSelect({ id }: { id: string }) {
  const { style, effectiveStyle, setStyle } = useSettings();
  return (
    <label className="field" htmlFor={id}>
      Referencing style
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
      Examples from
      <select
        id={id}
        className="select"
        value={discipline ?? ''}
        onChange={(e) => setDiscipline((e.target.value || null) as DisciplineId | null)}
      >
        <option value="">Any subject</option>
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
        <a className="brand" href={href.intro} aria-label="Source Code — home">
          <Logo />
          Source Code
        </a>
        <nav className="row" aria-label="Settings and navigation">
          <ConventionSelect id="topbar-convention" />
          <a className="btn btn-small btn-ghost" href={href.modules}>
            Modules
          </a>
        </nav>
      </div>
    </header>
  );
}
