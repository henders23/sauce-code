import { useMemo } from 'react';
import { renderText, type RenderOptions } from '../../citation/render';
import type { StyleId } from '../../citation/types';
import { lookupSource } from '../../content/sources';

export function useRendered(text: string, style: StyleId, opts?: RenderOptions) {
  const gapKey = opts?.gap ? `${opts.gap.present}|${opts.gap.past}` : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => renderText(text, style, lookupSource, opts), [text, style, gapKey]);
}

export interface ActivityProps<T> {
  item: T;
  style: import('../../citation/types').StyleId;
  /** Called once, when the student has responded and seen the main feedback. */
  onAnswered: () => void;
}
