import type { Unit } from './words';

export function UnitPieces({ unit, idPrefix }: { unit: Unit; idPrefix: string }) {
  return (
    <>
      {unit.pieces.map((p, i) =>
        p.k === 'cite' ? (
          <span key={i} className="cite">
            {p.t}
          </span>
        ) : p.k === 'fn' ? (
          <sup key={i}>
            <a href={`#${idPrefix}-fn-${p.n}`} aria-label={`Footnote ${p.n}`} tabIndex={-1}>
              {p.t}
            </a>
          </sup>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </>
  );
}
