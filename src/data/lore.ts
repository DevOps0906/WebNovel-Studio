import type { WebNovelProject } from './projectTemplates';
import type { ForeshadowingItem, IssueItem } from './storyData';

// 설정결정(C-01/C-02), 고증(C-03), 복선(C-04/C-05), 미결(C-06) 규칙과 순수 함수.
// 작가가 확정하고, 앱은 영향 목록과 경고만 낸다. 설정을 자동으로 바꾸지 않는다.

export type ForeshadowStatus = ForeshadowingItem['status'];

export interface ForeshadowEvent {
  at: string; // ISO
  kind: '상태 변경' | '추가 심기' | '부분 회수' | '회수 예정 변경';
  from?: ForeshadowStatus;
  to?: ForeshadowStatus;
  chapter?: string;
  note?: string;
}

export interface DecisionItem {
  id: string;
  no: number;
  title: string;
  status: '확정' | '대체됨' | '보류';
  decidedAt: string; // YYYY-MM-DD
  supersedes?: string; // 대체한 결정 id
  discardSummary?: string; // 폐기된 안 요약
  /** 영향 범위 자동 검색에 쓰는 낱말 */
  keywords: string[];
  /** 작가가 직접 지정한 영향 문서 */
  manualImpacts?: string[];
}

export interface ResearchItem {
  id: string;
  question: string;
  nature: '현실' | '각색' | '허구';
  verification: '미확인' | '확인중' | '확인됨';
  applied: boolean; // 원고 반영 여부
  revealChapter?: string; // 공개 시점 (챕터 ID)
  note?: string;
}

export interface LoreWarning {
  level: 'error' | 'warn' | 'info';
  code: string;
  targetId: string;
  message: string;
}

/** 'ch04', 'ch04 s01', 'ch04 일기 #3' 같은 문자열에서 챕터 번호 목록을 뽑는다. */
export const chapterNumbers = (text: string | undefined): number[] => {
  const out: number[] = [];
  const re = /ch\s*0*(\d{1,2})(?!\d)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text || ''))) out.push(Number(m[1]));
  return out;
};

export const chapterNum = (text: string | undefined): number | null => {
  const n = chapterNumbers(text);
  return n.length ? n[0] : null;
};

export const chapterId = (n: number) => `ch${String(n).padStart(2, '0')}`;

/** 회수 예정 챕터: 명시 필드가 있으면 그것, 없으면 회수 지점 문구에 적힌 마지막 챕터 */
export const payoffChapterOf = (f: ForeshadowingItem): number | null => {
  if (f.payoffChapter) return chapterNum(f.payoffChapter);
  const all = chapterNumbers(f.payoff);
  return all.length ? Math.max(...all) : null;
};

export const plantedChapterOf = (f: ForeshadowingItem): number | null => chapterNum(f.plantedChapter || f.location);

export const currentChapterNum = (project: WebNovelProject): number | null =>
  chapterNum(project.currentProgress?.currentChapter);

const isOpenForeshadow = (s: ForeshadowStatus) => s === '심음' || s === '회수 예정';

// ---- C-04: 복선 상태 흐름 ----

export const FORESHADOW_FLOW: Record<ForeshadowStatus, ForeshadowStatus[]> = {
  '심을 예정': ['심음', '회수 취소'],
  심음: ['회수 예정', '회수됨', '회수 취소'],
  '회수 예정': ['회수됨', '심음', '회수 취소'],
  회수됨: [],
  '회수 취소': ['심을 예정'],
};

export const canTransition = (from: ForeshadowStatus, to: ForeshadowStatus) => FORESHADOW_FLOW[from]?.includes(to) ?? false;

export type TransitionResult = { ok: true; item: ForeshadowingItem } | { ok: false; error: string };

export const transitionForeshadow = (
  item: ForeshadowingItem,
  to: ForeshadowStatus,
  opts: { chapter?: string; note?: string; now?: Date } = {}
): TransitionResult => {
  if (!canTransition(item.status, to)) {
    return { ok: false, error: `'${item.status}' 에서 '${to}' 로 바꿀 수 없습니다.` };
  }
  if (to === '회수됨' && !opts.chapter && !chapterNum(opts.note)) {
    return { ok: false, error: '회수된 위치(챕터)를 입력해야 합니다.' };
  }
  const now = (opts.now ?? new Date()).toISOString();
  const event: ForeshadowEvent = { at: now, kind: '상태 변경', from: item.status, to, chapter: opts.chapter, note: opts.note };
  const next: ForeshadowingItem = { ...item, status: to, events: [event, ...(item.events || [])] };
  if (to === '심음' && opts.chapter && !item.plantedChapter) next.plantedChapter = opts.chapter;
  if (to === '회수됨') next.resolvedChapter = opts.chapter;
  return { ok: true, item: next };
};

/** 여러 번 심기: 상태는 그대로, 이력만 남긴다 */
export const addPlanting = (item: ForeshadowingItem, chapter: string, note?: string, now: Date = new Date()): TransitionResult => {
  if (!isOpenForeshadow(item.status) && item.status !== '심을 예정') {
    return { ok: false, error: '회수되었거나 취소된 복선에는 추가로 심을 수 없습니다.' };
  }
  if (chapterNum(chapter) === null) return { ok: false, error: '챕터 위치(예: ch05)를 입력하세요.' };
  const ev: ForeshadowEvent = { at: now.toISOString(), kind: '추가 심기', chapter, note };
  return { ok: true, item: { ...item, events: [ev, ...(item.events || [])] } };
};

/** 부분 회수: 상태는 그대로 두고 이력만 남긴다 */
export const addPartialPayoff = (item: ForeshadowingItem, chapter: string, note?: string, now: Date = new Date()): TransitionResult => {
  if (!isOpenForeshadow(item.status)) return { ok: false, error: '심은 상태의 복선만 부분 회수를 기록할 수 있습니다.' };
  if (chapterNum(chapter) === null) return { ok: false, error: '챕터 위치(예: ch05)를 입력하세요.' };
  const ev: ForeshadowEvent = { at: now.toISOString(), kind: '부분 회수', chapter, note };
  return { ok: true, item: { ...item, events: [ev, ...(item.events || [])] } };
};

export const changePayoffChapter = (item: ForeshadowingItem, chapter: string, now: Date = new Date()): TransitionResult => {
  if (chapterNum(chapter) === null) return { ok: false, error: '챕터 위치(예: ch12)를 입력하세요.' };
  if (item.status === '회수됨' || item.status === '회수 취소') return { ok: false, error: '종료된 복선의 회수 예정은 바꿀 수 없습니다.' };
  const ev: ForeshadowEvent = { at: now.toISOString(), kind: '회수 예정 변경', chapter, note: item.payoffChapter ? `${item.payoffChapter} -> ${chapter}` : undefined };
  return { ok: true, item: { ...item, payoffChapter: chapter, events: [ev, ...(item.events || [])] } };
};

// ---- C-05: 복선 경고 (D-6: 회수 예정 챕터를 지났는데 미회수) ----

export const foreshadowWarnings = (project: WebNovelProject): LoreWarning[] => {
  const cur = currentChapterNum(project);
  const out: LoreWarning[] = [];
  for (const f of project.foreshadowing || []) {
    if (isOpenForeshadow(f.status)) {
      const due = payoffChapterOf(f);
      if (due === null) {
        out.push({ level: 'info', code: 'fs-no-payoff', targetId: f.id, message: `복선 "${f.title}": 회수 예정 챕터가 없습니다.` });
      } else if (cur !== null && due < cur) {
        out.push({ level: 'error', code: 'fs-overdue', targetId: f.id, message: `복선 "${f.title}": 회수 예정 ${chapterId(due)} 를 지났는데 아직 회수되지 않았습니다.` });
      } else if (cur !== null && due === cur) {
        out.push({ level: 'warn', code: 'fs-due-now', targetId: f.id, message: `복선 "${f.title}": 이번 챕터(${chapterId(due)})에 회수 예정입니다.` });
      }
    } else if (f.status === '심을 예정') {
      const planted = plantedChapterOf(f);
      if (planted !== null && cur !== null && planted < cur) {
        out.push({ level: 'warn', code: 'fs-plant-late', targetId: f.id, message: `복선 "${f.title}": ${chapterId(planted)} 에 심기로 했는데 아직 심지 않았습니다.` });
      }
    }
  }
  return out;
};

// ---- C-06: 미결 ----

export const isOpenIssue = (i: IssueItem) => i.status === '미결';

export const issueWarnings = (project: WebNovelProject): LoreWarning[] => {
  const cur = currentChapterNum(project);
  const out: LoreWarning[] = [];
  for (const i of project.unresolvedIssues || []) {
    if (!isOpenIssue(i) || i.deferred) continue;
    const due = chapterNum(i.dueChapter);
    if (due !== null && cur !== null && due < cur) {
      out.push({ level: 'error', code: 'issue-overdue', targetId: i.id, message: `미결 "${i.title}": 결정 예정 ${chapterId(due)} 를 지났습니다.` });
    } else if (due !== null && cur !== null && due === cur) {
      out.push({ level: 'warn', code: 'issue-due-now', targetId: i.id, message: `미결 "${i.title}": 이번 챕터에 결정해야 합니다.` });
    }
  }
  return out;
};

// ---- C-03: 고증 ----

export const researchWarnings = (project: WebNovelProject): LoreWarning[] => {
  const cur = currentChapterNum(project);
  const out: LoreWarning[] = [];
  for (const r of project.research || []) {
    if (r.verification === '확인됨') continue;
    const reveal = chapterNum(r.revealChapter);
    if (reveal === null) continue;
    if (cur !== null && reveal <= cur + 1) {
      out.push({
        level: reveal <= cur ? 'error' : 'warn',
        code: 'research-unverified',
        targetId: r.id,
        message: `고증 "${r.question}": ${r.verification} 상태인데 ${chapterId(reveal)} 에서 공개됩니다.`,
      });
    }
  }
  return out;
};

export const collectLoreWarnings = (project: WebNovelProject): LoreWarning[] => [
  ...foreshadowWarnings(project),
  ...issueWarnings(project),
  ...researchWarnings(project),
];

// ---- C-02: 설정결정 영향 범위 ----

export interface ImpactHit {
  type: '씬' | '복선' | '미결' | '인물' | '고증' | '챕터' | '직접 지정';
  ref: string;
  label: string;
  snippet: string;
}

const snippetAround = (text: string, term: string, radius = 24) => {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return '';
  const start = Math.max(0, i - radius);
  const end = Math.min(text.length, i + term.length + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ')}${end < text.length ? '…' : ''}`;
};

/** 결정의 키워드가 등장하는 씬, 복선, 미결, 인물, 고증, 챕터를 찾는다. 결과는 목록일 뿐 자동 수정은 없다. */
export const findImpact = (project: WebNovelProject, decision: Pick<DecisionItem, 'keywords' | 'manualImpacts'>): ImpactHit[] => {
  const terms = (decision.keywords || []).map((k) => k.trim()).filter((k) => k.length >= 2);
  const hits: ImpactHit[] = [];
  const seen = new Set<string>();
  const push = (h: ImpactHit) => {
    const key = `${h.type}:${h.ref}`;
    if (!seen.has(key)) {
      seen.add(key);
      hits.push(h);
    }
  };
  const scan = (text: string | undefined) => {
    for (const t of terms) {
      if (text && text.toLowerCase().includes(t.toLowerCase())) return { term: t, snippet: snippetAround(text, t) };
    }
    return null;
  };

  for (const [cid, ch] of Object.entries(project.chapters || {})) {
    const chHit = scan(`${ch.title}`);
    if (chHit) push({ type: '챕터', ref: cid, label: `${cid} ${ch.title}`, snippet: chHit.snippet });
    for (const s of ch.scenes || []) {
      const h = scan(s.content) || scan(s.synopsis) || scan(s.title);
      if (h) push({ type: '씬', ref: `${cid}/${s.id}`, label: `${cid} 씬 ${s.sceneNumber} 「${s.title}」`, snippet: h.snippet });
    }
  }
  for (const f of project.foreshadowing || []) {
    const h = scan(`${f.title} ${f.description} ${f.payoff}`);
    if (h) push({ type: '복선', ref: f.id, label: f.title, snippet: h.snippet });
  }
  for (const i of project.unresolvedIssues || []) {
    const h = scan(`${i.title} ${i.description}`);
    if (h) push({ type: '미결', ref: i.id, label: i.title, snippet: h.snippet });
  }
  for (const c of project.characters || []) {
    const h = scan(`${c.name} ${c.description} ${c.habits} ${c.secret} ${c.arcTrajectory}`);
    if (h) push({ type: '인물', ref: c.id, label: c.name, snippet: h.snippet });
  }
  for (const r of project.research || []) {
    const h = scan(`${r.question} ${r.note || ''}`);
    if (h) push({ type: '고증', ref: r.id, label: r.question, snippet: h.snippet });
  }
  for (const m of decision.manualImpacts || []) {
    if (m.trim()) push({ type: '직접 지정', ref: m.trim(), label: m.trim(), snippet: '' });
  }
  return hits;
};

// ---- 설정결정 편집 규칙 ----

export type DecisionResult = { ok: true; decisions: DecisionItem[] } | { ok: false; error: string };

export const nextDecisionNo = (list: DecisionItem[]) => (list.length ? Math.max(...list.map((d) => d.no)) + 1 : 1);

/**
 * 새 결정이 기존 결정을 대체하면 기존 결정은 '대체됨'으로 바뀌고 폐기 요약이 남는다.
 * 이 함수는 목록만 계산한다. 영향 범위는 findImpact 로 따로 조회한다.
 */
export const addDecision = (
  list: DecisionItem[],
  input: { title: string; keywords: string[]; supersedes?: string; discardSummary?: string; status?: DecisionItem['status']; manualImpacts?: string[] },
  now: Date = new Date()
): DecisionResult => {
  const title = input.title.trim();
  if (!title) return { ok: false, error: '결정 사안을 입력하세요.' };
  if (input.supersedes) {
    const target = list.find((d) => d.id === input.supersedes);
    if (!target) return { ok: false, error: '대체할 결정을 찾을 수 없습니다.' };
    if (target.status === '대체됨') return { ok: false, error: '이미 대체된 결정입니다.' };
  }
  const item: DecisionItem = {
    id: `dec-${now.getTime().toString(36)}-${list.length + 1}`,
    no: nextDecisionNo(list),
    title,
    status: input.status ?? '확정',
    decidedAt: now.toISOString().slice(0, 10),
    supersedes: input.supersedes,
    discardSummary: input.discardSummary?.trim() || undefined,
    keywords: input.keywords.map((k) => k.trim()).filter(Boolean),
    manualImpacts: input.manualImpacts?.filter((m) => m.trim()),
  };
  const updated = list.map((d) =>
    d.id === input.supersedes
      ? { ...d, status: '대체됨' as const, discardSummary: d.discardSummary || input.discardSummary?.trim() || `결정 #${item.no} 로 대체` }
      : d
  );
  return { ok: true, decisions: [item, ...updated] };
};

// ---- 6-1 단계 게이트: 챕터 확정 ----

export interface ChapterGateResult {
  ok: boolean;
  blockers: string[];
  warnings: string[];
}

/**
 * 챕터 확정 조건: 해당 챕터가 회수 예정인 복선이 모두 회수 또는 취소되었고, 심기로 한 복선이 심어졌고,
 * 결정 예정인 미결이 해결 또는 명시적 보류 상태이며, 씬이 모두 본문 완료여야 한다.
 */
export const chapterGate = (project: WebNovelProject, chapterIdText: string): ChapterGateResult => {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const ch = project.chapters?.[chapterIdText];
  const n = chapterNum(chapterIdText);
  if (!ch || n === null) return { ok: false, blockers: ['챕터를 찾을 수 없습니다.'], warnings };

  for (const f of project.foreshadowing || []) {
    if (isOpenForeshadow(f.status) && payoffChapterOf(f) === n) {
      blockers.push(`복선 "${f.title}" 이(가) 이 챕터에서 회수 예정인데 '${f.status}' 상태입니다. 회수하거나 회수 예정을 바꾸거나 취소하세요.`);
    }
    if (f.status === '심을 예정' && plantedChapterOf(f) === n) {
      blockers.push(`복선 "${f.title}" 을(를) 이 챕터에 심기로 했는데 아직 심지 않았습니다.`);
    }
  }
  for (const i of project.unresolvedIssues || []) {
    if (!isOpenIssue(i) || i.deferred) continue;
    const due = chapterNum(i.dueChapter);
    if (due !== null && due <= n) blockers.push(`미결 "${i.title}" 이(가) 열려 있습니다. 해결하거나 명시적으로 보류하세요.`);
  }
  const unfinished = (ch.scenes || []).filter((s) => s.status !== '본문 완료');
  if (unfinished.length > 0) {
    blockers.push(`본문 완료가 아닌 씬이 ${unfinished.length}개 있습니다 (${unfinished.slice(0, 3).map((s) => s.sceneNumber).join(', ')}${unfinished.length > 3 ? ' …' : ''}).`);
  }

  for (const r of project.research || []) {
    if (r.verification !== '확인됨' && chapterNum(r.revealChapter) === n) {
      warnings.push(`고증 "${r.question}" 이(가) ${r.verification} 상태로 이 챕터에서 공개됩니다.`);
    }
  }
  for (const f of project.foreshadowing || []) {
    if (isOpenForeshadow(f.status) && payoffChapterOf(f) === null && plantedChapterOf(f) !== null && plantedChapterOf(f)! <= n) {
      warnings.push(`복선 "${f.title}" 의 회수 예정 챕터가 정해지지 않았습니다.`);
    }
  }

  return { ok: blockers.length === 0, blockers, warnings };
};

export type ConfirmResult = { ok: true; project: WebNovelProject } | { ok: false; error: string; blockers: string[] };

export const confirmChapter = (project: WebNovelProject, chapterIdText: string): ConfirmResult => {
  const gate = chapterGate(project, chapterIdText);
  if (!gate.ok) return { ok: false, error: '확정 조건을 충족하지 못했습니다.', blockers: gate.blockers };
  const ch = project.chapters[chapterIdText];
  return {
    ok: true,
    project: { ...project, chapters: { ...project.chapters, [chapterIdText]: { ...ch, status: '검토 완료' } } },
  };
};

export const reopenChapter = (project: WebNovelProject, chapterIdText: string): WebNovelProject => {
  const ch = project.chapters?.[chapterIdText];
  if (!ch || ch.status !== '검토 완료') return project;
  return { ...project, chapters: { ...project.chapters, [chapterIdText]: { ...ch, status: '진행 중' } } };
};
