import type { WebNovelProject } from './projectTemplates';
import { recordUsage } from './usage';
import { browserStore } from './storage';


export interface AiModelMeta {
  provider?: string;
  requestedModel?: string;
  actualModel?: string;
  aliased?: boolean;
  latencyMs?: number;
}

export type AiResult<T> =
  | { ok: true; data: T & AiModelMeta & { isDemo?: boolean } }
  | { ok: false; error: string; code?: string };

/**
 * 서버 AI 라우트 호출. 네트워크 오류, HTTP 오류, success:false 를 모두 ok:false 로 정규화한다.
 */
export const requestAi = async <T = Record<string, any>>(
  url: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
  meta?: { projectId?: string }
): Promise<AiResult<T>> => {
  const started = Date.now();
  // A-09: 작품 단위 사용량 기록 (실패해도 기능에는 영향 없음)
  const log = (ok: boolean, data?: any, code?: string) => {
    if (!meta?.projectId) return;
    recordUsage(
      {
        at: new Date().toISOString(),
        projectId: meta.projectId,
        route: url,
        provider: String(body.provider ?? ''),
        model: String(data?.actualModel ?? body.model ?? ''),
        ok,
        latencyMs: Date.now() - started,
        code,
      },
      browserStore
    );
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.success !== true) {
      log(false, data, data?.code);
      return {
        ok: false,
        error: data?.error || `요청에 실패했습니다 (HTTP ${res.status}).`,
        code: data?.code,
      };
    }
    log(true, data);
    return { ok: true, data };
  } catch (err: any) {
    const cancelled = err?.name === 'AbortError';
    log(false, undefined, cancelled ? 'cancelled' : 'network');
    if (cancelled) return { ok: false, error: '요청이 취소되었습니다.', code: 'cancelled' };
    return { ok: false, error: `서버와 통신하지 못했습니다: ${err?.message || err}` };
  }
};

export const describeModel = (meta: AiModelMeta, fallbackModel = ''): string => {
  const requested = meta.requestedModel || fallbackModel;
  if (!requested) return '';
  if (meta.actualModel && meta.actualModel !== requested) {
    return `${requested} (실제 실행: ${meta.actualModel})`;
  }
  return requested;
};

/** 작품 설정에서 문체·세계관 지침을 구성한다. 고정 프롬프트 대신 작품별로 전달한다. */
export const buildStyleGuide = (project: WebNovelProject): string => {
  const lines: string[] = [];
  if (project.pov) lines.push(`시점: ${project.pov}`);
  if (project.genre) lines.push(`장르: ${project.genre}`);
  if (project.background) lines.push(`배경: ${project.background}`);
  if (project.coreConcept?.logline) lines.push(`로그라인: ${project.coreConcept.logline}`);
  if (project.coreConcept?.theme) lines.push(`주제: ${project.coreConcept.theme}`);
  const people = (project.characters || [])
    .slice(0, 10)
    .map((c) => `- ${c.name}${c.role ? ` (${c.role})` : ''}${c.habits ? `: ${c.habits}` : ''}`);
  if (people.length) lines.push(`주요 인물:\n${people.join('\n')}`);
  return lines.join('\n');
};

export interface ApplyTarget {
  projectId: string;
  sceneId?: string;
}

export interface ApplyResult {
  ok: boolean;
  error?: string;
  /** 저장은 성공했지만 부가 작업(버전 이력 등)이 실패한 경우의 안내 */
  warning?: string;
  scene?: import('./storyData').SceneItem;
}
