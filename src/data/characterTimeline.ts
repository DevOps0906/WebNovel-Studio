import type { WebNovelProject } from './projectTemplates';
import type { LoreWarning } from './lore';

// C-07: 인물 시간선. 인물이 어떤 사실을 어느 씬에서 알게 되었는지 기록하고,
// 같은 인물과 주제에 서로 다른 값이 기록되면 모순 후보로 표시한다.
// 자동 검사(본문 분석)는 MVP 이후 범위이므로 여기서는 기록 기반 후보만 낸다.

export interface KnowledgeEntry {
  id: string;
  characterId: string;
  /** 주제 (예: '유전자 검사 결과', '차남의 약') */
  topic: string;
  /** 인물이 알게 된 내용 */
  value: string;
  /** 알게 된 씬: chapterId/sceneId */
  sceneRef: string;
}

/** 씬 참조 -> 본문 순서 번호. 챕터 ID 순, 씬 배열 순 */
export const sceneOrderMap = (project: WebNovelProject): Map<string, number> => {
  const map = new Map<string, number>();
  let n = 0;
  for (const cid of Object.keys(project.chapters || {}).sort()) {
    for (const s of project.chapters[cid].scenes || []) map.set(`${cid}/${s.id}`, n++);
  }
  return map;
};

export type KnowledgeResult = { ok: true; list: KnowledgeEntry[] } | { ok: false; error: string };

export const addKnowledge = (
  project: WebNovelProject,
  input: { characterId: string; topic: string; value: string; sceneRef: string }
): KnowledgeResult => {
  const topic = input.topic.trim();
  const value = input.value.trim();
  if (!project.characters.some((c) => c.id === input.characterId)) return { ok: false, error: '인물을 선택하세요.' };
  if (!topic || !value) return { ok: false, error: '주제와 알게 된 내용을 입력하세요.' };
  if (!sceneOrderMap(project).has(input.sceneRef)) return { ok: false, error: '알게 된 씬을 선택하세요.' };
  const entry: KnowledgeEntry = {
    id: `kn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    characterId: input.characterId,
    topic,
    value,
    sceneRef: input.sceneRef,
  };
  return { ok: true, list: [...(project.knowledge || []), entry] };
};

/** 같은 인물·주제에 값이 둘 이상이면 모순 후보. 씬 참조가 없으면 정보로 보고한다. */
export const knowledgeWarnings = (project: WebNovelProject): LoreWarning[] => {
  const out: LoreWarning[] = [];
  const order = sceneOrderMap(project);
  const groups = new Map<string, KnowledgeEntry[]>();
  for (const k of project.knowledge || []) {
    if (!order.has(k.sceneRef)) {
      out.push({ level: 'info', code: 'knowledge-scene-missing', targetId: k.id, message: `${k.topic}: 기록된 씬(${k.sceneRef})을 찾을 수 없습니다.` });
      continue;
    }
    const key = `${k.characterId}\u0000${k.topic}`;
    groups.set(key, [...(groups.get(key) || []), k]);
  }
  groups.forEach((list) => {
    const values = new Set(list.map((k) => k.value));
    if (values.size < 2) return;
    const who = project.characters.find((c) => c.id === list[0].characterId)?.name ?? list[0].characterId;
    const sorted = [...list].sort((a, b) => (order.get(a.sceneRef) ?? 0) - (order.get(b.sceneRef) ?? 0));
    out.push({
      level: 'warn',
      code: 'knowledge-conflict',
      targetId: sorted[0].id,
      message: `${who} · ${list[0].topic}: 값이 서로 다릅니다 (${sorted.map((k) => `${k.sceneRef}: ${k.value}`).join(' / ')}). 모순인지 작가가 확인하세요.`,
    });
  });
  return out;
};
