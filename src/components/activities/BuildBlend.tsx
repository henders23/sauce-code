import { useState } from 'react';
import type { BlendRole, BuildBlendItem } from '../../content/types';
import { lookupSource } from '../../content/sources';
import { sourceLabel } from '../sourceLabel';
import { Feedback } from '../Feedback';
import { Annotated } from './Annotated';
import { useRendered, type ActivityProps } from './useRendered';

const ROLES: { id: BlendRole; label: string }[] = [
  { id: 'supports', label: 'Supports the claim' },
  { id: 'complicates', label: 'Complicates it' },
  { id: 'irrelevant', label: 'Not for this claim' },
];

export function BuildBlend({ item, style, onAnswered }: ActivityProps<BuildBlendItem>) {
  const synthesis = useRendered(item.synthesis, style);
  const [roles, setRoles] = useState<Record<string, BlendRole>>({});
  const [checked, setChecked] = useState(false);
  const all = item.summaries.every((s) => roles[s.id]);
  const score = item.summaries.filter((s) => roles[s.id] === s.role).length;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="panel">
        <p className="eyebrow" style={{ marginBottom: 6 }}>
          The claim
        </p>
        <p className="serif" style={{ fontSize: 22, lineHeight: 1.4 }}>
          {item.claim}
        </p>
      </div>

      <div className="grid-2">
        {item.summaries.map((s, i) => {
          const src = lookupSource(s.source)!;
          const mine = roles[s.id];
          return (
            <article key={s.id} className="card stack" aria-labelledby={`${item.id}-${s.id}`}>
              <div className="stack" style={{ gap: 4 }}>
                <span className="para-label" id={`${item.id}-${s.id}`}>
                  Source {String.fromCharCode(65 + i)}
                </span>
                <span className="faint">{sourceLabel(src)}</span>
              </div>
              <p className="serif" style={{ fontSize: 18, lineHeight: 1.55 }}>
                {s.text}
              </p>
              <div className="row" role="radiogroup" aria-label={`What does source ${String.fromCharCode(65 + i)} do?`}>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={mine === r.id}
                    className="chip"
                    style={{ minHeight: 44, flex: '1 1 140px' }}
                    disabled={checked}
                    onClick={() => setRoles((x) => ({ ...x, [s.id]: r.id }))}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {checked && mine && (
                <Feedback tone={mine === s.role ? 'good' : 'partial'} tag={mine === s.role ? 'Correct' : 'Look again'}>
                  {s.feedback[mine]}
                </Feedback>
              )}
            </article>
          );
        })}
      </div>

      {!checked && (
        <div className="spread panel">
          <span className="muted">
            {Object.keys(roles).length} of {item.summaries.length} sources decided.
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!all}
            onClick={() => {
              setChecked(true);
              onAnswered();
            }}
          >
            Check, and show the blend
          </button>
        </div>
      )}

      {checked && (
        <article className="card stack fade-in">
          <div className="spread">
            <span className="para-label">The blend</span>
            <span className="pill">{score} of {item.summaries.length} match</span>
          </div>
          <p className="muted">Here is one way to build a synthesised paragraph from these sources.</p>
          <Annotated rendered={synthesis} annotations={item.annotations} idPrefix={`${item.id}-synthesis`} />
        </article>
      )}
    </div>
  );
}
