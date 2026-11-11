import type { StyleId } from '../citation/types';

export type ModuleId = 'summarising' | 'paraphrasing' | 'quoting' | 'synthesising' | 'stance';

export type DisciplineId = 'humanities' | 'social-sciences' | 'life-sciences' | 'engineering' | 'law' | 'health';

export type ActivityType =
  | 'compare-versions'
  | 'find-seam'
  | 'highlight-voices'
  | 'pick-verb'
  | 'find-problem'
  | 'spot-patchwriting'
  | 'combine-sources';

/** Ratings describe paragraphs, never students. */
export type Rating = 'weak' | 'developing' | 'strong' | 'excellent';

export interface FollowUpOption {
  id: string;
  text: string;
  feedback: string;
  /** Marks the strongest answer. Several options may be good. */
  good?: boolean;
}

export interface FollowUp {
  question: string;
  options: FollowUpOption[];
}

/** Shown after the student has answered. */
export interface ItemNote {
  /** Only show for these conventions. */
  styles?: StyleId[];
  /** Only show when the student has chosen one of these disciplines (or no discipline). */
  disciplines?: DisciplineId[];
  text: string;
}

export interface SourcePassage {
  source: string;
  /** Where the passage comes from, e.g. "from the abstract". */
  where: string;
  text: string;
}

interface ItemBase {
  id: string;
  module: ModuleId;
  activity: ActivityType;
  title: string;
  disciplines: DisciplineId[];
  difficulty: 1 | 2 | 3;
  /** Conventions this item is especially useful for (shown as a tag). */
  conventions?: StyleId[];
  /** A sentence of context shown above the paragraph. */
  context?: string;
  question: string;
  followUp?: FollowUp;
  notes?: ItemNote[];
  keyPoint: string;
}

export interface CompareVersionsItem extends ItemBase {
  activity: 'compare-versions';
  sourcePassage?: SourcePassage;
  versions: { id: string; label: string; rating: Rating; text: string }[];
  best: string;
  /** Feedback on the pick, keyed by version id. */
  picks: Record<string, string>;
  reasonQuestion: string;
  reasons: { id: string; text: string; verdict: 'strong' | 'partial' | 'weak'; feedback: string }[];
}

export interface FindSeamItem extends ItemBase {
  activity: 'find-seam';
  /** Paragraph whose selectable phrases are [[spans]]. */
  text: string;
  /** Id of the span where the writer's own point begins. */
  answer: string;
  feedback: { correct: string; early: string; late: string };
}

export type Voice = 'source' | 'writer' | 'both';

export interface HighlightVoicesItem extends ItemBase {
  activity: 'highlight-voices';
  /** Every part to be classified is a [[span]]. */
  text: string;
  key: Record<string, { voice: Voice; note: string }>;
}

export interface PickVerbItem extends ItemBase {
  activity: 'pick-verb';
  /** Paragraph containing exactly one {{gap}}. */
  text: string;
  options: {
    present: string;
    past: string;
    verdict: 'good' | 'possible' | 'clash';
    /** What this verb signals about the writer's stance. */
    signal: string;
    feedback: string;
  }[];
}

export interface FindProblemItem extends ItemBase {
  activity: 'find-problem';
  /** Optional original passage, when the problem is how faithfully the source is reported. */
  sourcePassage?: SourcePassage;
  /** The flawed paragraph. */
  text: string;
  problems: { id: string; text: string; correct: boolean; feedback: string }[];
  /** The app's own repaired version, with [[spans]] matching `annotations`. */
  repaired: string;
  annotations: Record<string, string>;
}

export interface SpotPatchwritingItem extends ItemBase {
  activity: 'spot-patchwriting';
  sourcePassage: SourcePassage;
  /** The "paraphrase", divided into selectable [[spans]]. */
  text: string;
  /** The spans that are lifted from the source, with a comment on each. */
  lifted: Record<string, string>;
  feedback: { all: string; some: string; none: string; falsePositives: string };
}

export type SourceRole = 'supports' | 'complicates' | 'irrelevant';

export interface CombineSourcesItem extends ItemBase {
  activity: 'combine-sources';
  claim: string;
  summaries: { id: string; source: string; text: string; role: SourceRole; feedback: Record<SourceRole, string> }[];
  synthesis: string;
  annotations: Record<string, string>;
}

export type Item =
  | CompareVersionsItem
  | FindSeamItem
  | HighlightVoicesItem
  | PickVerbItem
  | FindProblemItem
  | SpotPatchwritingItem
  | CombineSourcesItem;
