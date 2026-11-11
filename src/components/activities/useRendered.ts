import { useMemo, type ReactNode } from 'react';
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
  style: StyleId;
  /**
   * Null while the activity is running. Once the student continues past it, the
   * steps that follow (follow-up, notes, key point): the activity shows them in
   * its panel, so its texts stay in view.
   */
  outro: ReactNode | null;
  /** Called when the student has seen the feedback and presses Continue. */
  onContinue: () => void;
}
