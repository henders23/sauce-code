import type { Rich } from '../citation/types';

export function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((p, i) => (typeof p === 'string' ? <span key={i}>{p}</span> : <i key={i}>{p.i}</i>))}
    </>
  );
}
