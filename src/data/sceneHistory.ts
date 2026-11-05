import { KeyValueStore, browserStore } from './storage';

// S-04: 씬 단위 버전 이력. 본문이 바뀌기 직전의 내용을 스냅샷으로 남긴다.

export const HISTORY_STORAGE_KEY = 'webnovel_studio_scene_history_v1';
export const MAX_VERSIONS_PER_SCENE = 20;

export type VersionReason = 'ai-apply' | 'manual-edit' | 'restore';

export interface SceneVersion {
  id: string;
  savedAt: string; // ISO
  reason: VersionReason;
  content: string;
  wordCount: number;
}

type HistoryMap = Record<string, SceneVersion[]>;

export const historyKey = (projectId: string, chapterId: string, sceneId: string) =>
  `${projectId}/${chapterId}/${sceneId}`;

const readAll = (store: KeyValueStore): HistoryMap => {
  try {
    const raw = store.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const listVersions = (store: KeyValueStore = browserStore, key: string): SceneVersion[] => {
  const list = readAll(store)[key];
  return Array.isArray(list) ? list : [];
};

export interface RecordResult {
  ok: boolean;
  error?: string;
}

/** 최신순으로 저장한다. 직전 버전과 내용이 같으면 기록하지 않는다. */
export const recordVersion = (
  store: KeyValueStore = browserStore,
  key: string,
  entry: { reason: VersionReason; content: string },
  now: Date = new Date()
): RecordResult => {
  if (!entry.content || !entry.content.trim()) return { ok: true };
  const all = readAll(store);
  const list = Array.isArray(all[key]) ? all[key] : [];
  if (list[0] && list[0].content === entry.content) return { ok: true };

  const version: SceneVersion = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: now.toISOString(),
    reason: entry.reason,
    content: entry.content,
    wordCount: entry.content.length,
  };
  all[key] = [version, ...list].slice(0, MAX_VERSIONS_PER_SCENE);
  try {
    store.setItem(HISTORY_STORAGE_KEY, JSON.stringify(all));
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: `버전 이력을 저장하지 못했습니다: ${err?.message || err}` };
  }
};

export const REASON_LABEL: Record<VersionReason, string> = {
  'ai-apply': 'AI 적용 직전',
  'manual-edit': '직접 수정 직전',
  restore: '복원 직전',
};
