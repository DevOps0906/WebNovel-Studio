import { KeyValueStore, browserStore } from './storage';

// A-09: 작품 단위 AI 호출 기록. 단가 정보가 없으므로 추정 비용은 계산하지 않는다.

export const USAGE_STORAGE_KEY = 'webnovel_studio_ai_usage_v1';
export const MAX_USAGE_ENTRIES = 500;

export interface UsageEntry {
  at: string; // ISO
  projectId: string;
  route: string;
  provider: string;
  model: string;
  ok: boolean;
  latencyMs: number;
  code?: string;
}

export const readUsage = (store: KeyValueStore = browserStore): UsageEntry[] => {
  try {
    const raw = store.getItem(USAGE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const recordUsage = (entry: UsageEntry, store: KeyValueStore = browserStore): void => {
  try {
    const next = [entry, ...readUsage(store)].slice(0, MAX_USAGE_ENTRIES);
    store.setItem(USAGE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 사용량 기록 실패가 AI 기능을 막으면 안 된다
  }
};

export interface UsageSummary {
  calls: number;
  failed: number;
  avgLatencyMs: number;
  byProvider: Record<string, number>;
}

export const summarizeUsage = (entries: UsageEntry[], projectId: string): UsageSummary => {
  const mine = entries.filter((e) => e.projectId === projectId);
  const byProvider: Record<string, number> = {};
  for (const e of mine) byProvider[e.provider] = (byProvider[e.provider] || 0) + 1;
  const ok = mine.filter((e) => e.ok);
  return {
    calls: mine.length,
    failed: mine.length - ok.length,
    avgLatencyMs: ok.length ? Math.round(ok.reduce((a, e) => a + e.latencyMs, 0) / ok.length) : 0,
    byProvider,
  };
};
