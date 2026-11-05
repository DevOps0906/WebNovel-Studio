// 저장 계층: 브라우저 localStorage 를 인터페이스 뒤로 숨긴다. 테스트에서는 MemoryStore 를 쓴다.

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

export const browserStore: KeyValueStore = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
  keys: () => {
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) out.push(k);
    }
    return out;
  },
};

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  /** 테스트용: 지정 횟수만큼 setItem 을 실패시킨다. */
  failWrites = false;

  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) {
      const err: any = new Error('quota');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  keys() {
    return Array.from(this.data.keys());
  }
}

// ---- S-06: 손상 데이터 격리 ----

export const QUARANTINE_PREFIX = 'webnovel_studio_quarantine__';

export interface QuarantineRecord {
  originalKey: string;
  reason: string;
  quarantinedAt: string;
  raw: string;
}

export interface QuarantineSummary {
  key: string;
  originalKey: string;
  reason: string;
  quarantinedAt: string;
  size: number;
}

/**
 * 해석할 수 없는 원본 문자열을 삭제하지 않고 격리 키로 옮긴다.
 * 격리에 실패하면 null 을 반환하며, 호출자는 원본을 덮어쓰면 안 된다.
 */
export const quarantineRaw = (
  store: KeyValueStore,
  originalKey: string,
  raw: string,
  reason: string,
  now: Date = new Date()
): string | null => {
  const key = `${QUARANTINE_PREFIX}${originalKey}__${now.getTime()}`;
  const record: QuarantineRecord = {
    originalKey,
    reason,
    quarantinedAt: now.toISOString(),
    raw,
  };
  try {
    store.setItem(key, JSON.stringify(record));
    return key;
  } catch {
    return null;
  }
};

export const listQuarantine = (store: KeyValueStore): QuarantineSummary[] => {
  const out: QuarantineSummary[] = [];
  for (const key of store.keys()) {
    if (!key.startsWith(QUARANTINE_PREFIX)) continue;
    try {
      const rec = JSON.parse(store.getItem(key) || '') as QuarantineRecord;
      out.push({
        key,
        originalKey: rec.originalKey,
        reason: rec.reason,
        quarantinedAt: rec.quarantinedAt,
        size: rec.raw?.length ?? 0,
      });
    } catch {
      out.push({ key, originalKey: '?', reason: '격리 레코드 해석 실패', quarantinedAt: '', size: 0 });
    }
  }
  return out.sort((a, b) => b.quarantinedAt.localeCompare(a.quarantinedAt));
};

export const readQuarantinedRaw = (store: KeyValueStore, key: string): string | null => {
  try {
    const rec = JSON.parse(store.getItem(key) || '') as QuarantineRecord;
    return typeof rec.raw === 'string' ? rec.raw : null;
  } catch {
    return null;
  }
};
