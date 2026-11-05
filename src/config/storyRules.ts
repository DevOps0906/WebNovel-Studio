// 단일 기준 파일. 분량·구조 수치는 이 파일에서만 정의하고 다른 곳은 참조한다.
// 값은 webnovel_studio_integrated_plan.md 9장 '열린 결정'의 잠정안이다.
// D-1~D-4 가 확정되면 이 파일만 고친다.

export const STORY_RULES = {
  /** D-4: 4막 6아크 24챕터 100화 */
  structure: {
    totalEpisodes: 100,
    acts: 4,
    arcs: 6,
    chapters: 24,
  },
  /** D-1: 1막 종료 화 (잠정). 기존 샘플 데이터의 arc01 은 1~17화로 되어 있어 점검 항목에서 불일치로 보고한다. */
  act1EndEpisode: 15,
  /** D-3: 화 분량 기준(자). 최소 미만은 '미달', 상한 초과는 '과분량' */
  episodeWords: {
    min: 5000,
    targetMin: 6000,
    targetMax: 8000,
    max: 9000,
  },
  /** D-7: 씬당 비트 권장 범위 */
  beatsPerScene: { min: 4, max: 7 },
} as const;

export type EpisodeWordClass = 'none' | 'short' | 'below-target' | 'target' | 'above-target' | 'long';

export const EPISODE_WORD_CLASS_LABEL: Record<EpisodeWordClass, string> = {
  none: '미집필',
  short: '미달',
  'below-target': '권장 미만',
  target: '권장',
  'above-target': '권장 초과',
  long: '과분량',
};

export const classifyEpisodeWords = (words: number): EpisodeWordClass => {
  const r = STORY_RULES.episodeWords;
  if (!words || words <= 0) return 'none';
  if (words < r.min) return 'short';
  if (words < r.targetMin) return 'below-target';
  if (words <= r.targetMax) return 'target';
  if (words <= r.max) return 'above-target';
  return 'long';
};

/** 경고가 필요한 분류인지 (미달, 과분량) */
export const isEpisodeWordWarning = (c: EpisodeWordClass) => c === 'short' || c === 'long';
