import type { WebNovelProject } from './projectTemplates';
import { splitSentences, stripAnnotations } from './editing';
import type { LoreWarning } from './lore';
import { buildEpisodeTable } from './metrics';

// U-04: 엔딩 훅 기록. 화의 마지막 문장은 씬 본문에서 계산하고, 작가는 훅 유형과 메모만 기록한다.
// 장르별 권장 유형은 D-7(장르별 규칙) 잠정안이며, 작가가 예외를 둘 수 있다.

export const HOOK_TYPES = ['정보 공개', '배신·반전', '위기 도래', '상대의 침묵', '인물 등장', '선택 강요'] as const;
export type HookType = (typeof HOOK_TYPES)[number];

export const RECOMMENDED_HOOKS: Record<string, HookType[]> = {
  chaebol: ['정보 공개', '배신·반전', '상대의 침묵'],
  hunter: ['위기 도래', '인물 등장', '선택 강요'],
  romfantasy: ['배신·반전', '인물 등장', '정보 공개'],
  wuxia: ['위기 도래', '선택 강요', '인물 등장'],
  custom: [...HOOK_TYPES],
};

export interface EpisodeHook {
  type?: HookType;
  note?: string;
}

/** 씬을 챕터 순서, 씬 배열 순서로 나열한다 (화의 본문 순서) */
const orderedScenes = (project: WebNovelProject) =>
  Object.keys(project.chapters || {})
    .sort()
    .flatMap((cid) => (project.chapters[cid].scenes || []).map((s) => ({ chapterId: cid, scene: s })));

/** 화의 마지막 문장. 본문이 없으면 빈 문자열. */
export const episodeEndLine = (project: WebNovelProject, episode: number): string => {
  const scenes = orderedScenes(project).filter((x) => x.scene.episode === episode && x.scene.status !== '대기' && x.scene.content.trim());
  if (scenes.length === 0) return '';
  const last = scenes[scenes.length - 1].scene.content;
  const sentences = splitSentences(stripAnnotations(last));
  return sentences.length ? sentences[sentences.length - 1] : '';
};

export const recordHook = (project: WebNovelProject, episode: number, patch: EpisodeHook): WebNovelProject => {
  const prev = project.episodeHooks?.[episode] || {};
  return {
    ...project,
    episodeHooks: { ...(project.episodeHooks || {}), [episode]: { ...prev, ...patch } },
  };
};

export const isRecommendedHook = (project: WebNovelProject, type: HookType) => {
  const list = RECOMMENDED_HOOKS[project.templateType] || RECOMMENDED_HOOKS.custom;
  return list.includes(type);
};

/** 본문이 있는 화 중 훅 유형이 없는 화, 권장 밖 유형, 본문 끝 문장이 없는 화를 점검한다. 차단하지 않는다. */
export const hookWarnings = (project: WebNovelProject): LoreWarning[] => {
  const out: LoreWarning[] = [];
  for (const row of buildEpisodeTable(project)) {
    if (row.words <= 0) continue;
    const hook = project.episodeHooks?.[row.episode];
    if (!hook?.type) {
      out.push({ level: 'info', code: 'hook-missing', targetId: String(row.episode), message: `${row.episode}화: 엔딩 훅 유형이 기록되지 않았습니다.` });
    } else if (!isRecommendedHook(project, hook.type)) {
      out.push({ level: 'info', code: 'hook-not-recommended', targetId: String(row.episode), message: `${row.episode}화: '${hook.type}' 은(는) 이 장르의 권장 유형이 아닙니다. 의도한 예외라면 무시하세요.` });
    }
    if (!episodeEndLine(project, row.episode)) {
      out.push({ level: 'warn', code: 'hook-no-endline', targetId: String(row.episode), message: `${row.episode}화: 마지막 문장을 찾을 수 없습니다.` });
    }
  }
  return out;
};
