import type { WebNovelProject } from './projectTemplates';
import { STORY_RULES, classifyEpisodeWords, EpisodeWordClass } from '../config/storyRules';
import { chapterNum, payoffChapterOf } from './lore';

// U-02: 화·챕터·작품 분량은 씬 합계로 계산한다. 수동 입력값은 씬 본문이 없는 기록 화에만 남는다.

export type EpisodeWordSource = 'scenes' | 'recorded';

export interface EpisodeRow {
  episode: number;
  title: string;
  hook: string;
  chapter: string;
  words: number;
  source: EpisodeWordSource;
  wordClass: EpisodeWordClass;
}

/** 본문이 있는 씬만 분량에 센다. '대기' 상태의 계획용 씬은 제외한다. */
const countsAsWritten = (s: { status: string; wordCount: number }) => s.status !== '대기' && s.wordCount > 0;

export const buildEpisodeTable = (project: WebNovelProject): EpisodeRow[] => {
  const recorded = new Map<number, WebNovelProject['episodes'][number]>();
  for (const e of project.episodes || []) recorded.set(e.episode, e);

  const sceneWords = new Map<number, number>();
  const sceneChapter = new Map<number, string>();
  for (const [chapterId, ch] of Object.entries(project.chapters || {})) {
    for (const s of ch.scenes || []) {
      if (!countsAsWritten(s)) continue;
      sceneWords.set(s.episode, (sceneWords.get(s.episode) || 0) + s.wordCount);
      if (!sceneChapter.has(s.episode)) sceneChapter.set(s.episode, chapterId);
    }
  }

  const numbers = Array.from(new Set([...recorded.keys(), ...sceneWords.keys()])).sort((a, b) => a - b);
  return numbers.map((n) => {
    const rec = recorded.get(n);
    const fromScenes = sceneWords.get(n) || 0;
    const useScenes = fromScenes > 0;
    const words = useScenes ? fromScenes : rec?.words || 0;
    return {
      episode: n,
      title: rec?.title ?? `${n}화`,
      hook: rec?.hook ?? '',
      chapter: rec?.chapter ?? sceneChapter.get(n) ?? '',
      words,
      source: useScenes ? 'scenes' : 'recorded',
      wordClass: classifyEpisodeWords(words),
    };
  });
};

/**
 * 계산 가능한 파생 값을 다시 계산한 새 프로젝트를 반환한다. 입력은 변경하지 않는다.
 * 저장·불러오기·가져오기 경로에서 항상 호출해 화면 간 숫자를 일치시킨다.
 */
export const recomputeDerived = (project: WebNovelProject): WebNovelProject => {
  const table = buildEpisodeTable(project);
  const wordsByEpisode = new Map(table.map((r) => [r.episode, r]));

  const chapters: WebNovelProject['chapters'] = {};
  for (const [id, ch] of Object.entries(project.chapters || {})) {
    const scenes = ch.scenes || [];
    // 챕터 분량은 소속 화의 분량 합이다 (화 분량은 씬 합계 또는 기록값).
    const totalWords = table.filter((r) => r.chapter === id).reduce((a, r) => a + r.words, 0);
    let completed = ch.completedScenesCount;
    let planned = ch.plannedScenesCount;
    if (scenes.length > 0) {
      completed = scenes.filter((s) => s.status === '본문 완료').length;
      planned = scenes.length;
    }
    chapters[id] = { ...ch, totalWords, completedScenesCount: completed, plannedScenesCount: planned };
  }

  const episodesOrganized = table.filter((r) => r.words > 0).length;
  const totalWordCount = table.reduce((a, r) => a + r.words, 0);
  const completedChapters = Object.values(chapters).filter((c) => c.status === '검토 완료').length;

  const cur = project.currentProgress;
  const curCh = chapters[cur?.currentChapter];
  const next = {
    ...cur,
    episodesOrganized,
    totalWordCount,
    completedChapters,
    currentChapterScenesDone: curCh && curCh.scenes.length > 0 ? curCh.completedScenesCount : cur?.currentChapterScenesDone ?? 0,
    currentChapterScenesTotal: curCh && curCh.scenes.length > 0 ? curCh.plannedScenesCount : cur?.currentChapterScenesTotal ?? 0,
    openIssues: (project.unresolvedIssues || []).filter((i) => i.status === '미결').length,
    resolvedIssues: (project.unresolvedIssues || []).filter((i) => i.status === '해결').length,
    ...currentChapterForeshadowCounts(project, cur?.currentChapter),
  };

  return { ...project, chapters, currentProgress: next };
};

/** 현재 챕터가 회수 예정인 복선 수와 그중 회수된 수 */
const currentChapterForeshadowCounts = (project: WebNovelProject, currentChapterId: string | undefined) => {
  const cur = chapterNum(currentChapterId);
  const due = (project.foreshadowing || []).filter((f) => cur !== null && payoffChapterOf(f) === cur && f.status !== '회수 취소');
  return {
    chapterForeshadowingTotal: due.length,
    chapterForeshadowingResolved: due.filter((f) => f.status === '회수됨').length,
  };
};

// ---- 데이터 점검 ----

export interface DataIssue {
  level: 'error' | 'warn' | 'info';
  code: string;
  message: string;
}

const parseRange = (text: string | undefined): [number, number] | null => {
  const m = (text || '').match(/(\d+)\s*~\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/** 구조·분량 규칙 위반을 찾아 목록으로 돌려준다. 수정은 하지 않는다. */
export const validateProject = (project: WebNovelProject): DataIssue[] => {
  const issues: DataIssue[] = [];
  const table = buildEpisodeTable(project);

  const dupEpisodes = new Set<number>();
  const seen = new Set<number>();
  for (const e of project.episodes || []) {
    if (seen.has(e.episode)) dupEpisodes.add(e.episode);
    seen.add(e.episode);
  }
  dupEpisodes.forEach((n) =>
    issues.push({ level: 'error', code: 'episode-duplicate', message: `${n}화가 기록에 중복되어 있습니다.` })
  );

  // 같은 씬 ID 가 여러 챕터에 있으면 편집 대상이 모호해진다
  const sceneOwners = new Map<string, string[]>();
  for (const [cid, ch] of Object.entries(project.chapters || {})) {
    for (const s of ch.scenes || []) sceneOwners.set(s.id, [...(sceneOwners.get(s.id) || []), cid]);
  }
  sceneOwners.forEach((owners, sid) => {
    if (owners.length > 1) {
      issues.push({ level: 'warn', code: 'scene-id-duplicate', message: `씬 ID ${sid} 가 ${owners.join(', ')} 에 중복됩니다.` });
    }
  });

  for (const r of table) {
    if (r.wordClass === 'short') {
      issues.push({ level: 'warn', code: 'episode-short', message: `${r.episode}화 ${r.words.toLocaleString()}자: 최소 ${STORY_RULES.episodeWords.min.toLocaleString()}자 미달` });
    } else if (r.wordClass === 'long') {
      issues.push({ level: 'warn', code: 'episode-long', message: `${r.episode}화 ${r.words.toLocaleString()}자: ${STORY_RULES.episodeWords.max.toLocaleString()}자 초과(과분량)` });
    }
  }

  const lastEpisode = table.length ? table[table.length - 1].episode : 0;
  if (lastEpisode > STORY_RULES.structure.totalEpisodes) {
    issues.push({ level: 'error', code: 'episode-over', message: `${lastEpisode}화가 목표 ${STORY_RULES.structure.totalEpisodes}화를 넘었습니다.` });
  }

  // 챕터 화 범위가 겹치는지
  const ranges = Object.values(project.chapters || {})
    .map((c) => ({ id: c.id, r: parseRange(c.episodes) }))
    .filter((x): x is { id: string; r: [number, number] } => x.r !== null)
    .sort((a, b) => a.r[0] - b.r[0]);
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].r[0] <= ranges[i - 1].r[1]) {
      issues.push({ level: 'warn', code: 'chapter-range-overlap', message: `${ranges[i - 1].id} 와 ${ranges[i].id} 의 화 범위가 겹칩니다.` });
    }
  }

  // D-1: 1막 종료 화와 첫 아크 범위
  const arc1 = parseRange(project.arcs?.[0]?.episodes);
  if (arc1 && arc1[1] !== STORY_RULES.act1EndEpisode) {
    issues.push({
      level: 'info',
      code: 'act1-end-mismatch',
      message: `첫 아크가 ${arc1[0]}~${arc1[1]}화인데 기준(D-1 잠정)의 1막 종료는 ${STORY_RULES.act1EndEpisode}화입니다. 결정 후 한쪽을 맞추세요.`,
    });
  }

  if ((project.arcs?.length ?? 0) !== STORY_RULES.structure.arcs) {
    issues.push({ level: 'info', code: 'arc-count', message: `아크 수가 ${project.arcs?.length ?? 0}개입니다 (기준 ${STORY_RULES.structure.arcs}개).` });
  }

  return issues;
};
