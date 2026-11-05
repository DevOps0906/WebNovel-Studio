import type { WebNovelProject } from './projectTemplates';
import { STORY_RULES } from '../config/storyRules';
import { buildEpisodeTable } from './metrics';
import { chapterNum, payoffChapterOf } from './lore';

// D-01 지표 카드: 모든 값은 프로젝트 데이터에서 직접 계산한다 (저장된 요약값을 읽지 않는다).
// D-02 출처 표시: 각 카드는 숫자를 만든 근거 항목 목록을 함께 돌려준다.
// D-03 작가 전용 표시: 공유용 사본에서 미공개 항목을 가린다.

export type MetricTab = 'timeline' | 'chapter' | 'lists' | 'overview';

export interface EvidenceItem {
  label: string;
  value?: string;
}

export interface MetricCard {
  id: 'episodes' | 'words' | 'reviewedChapters' | 'currentChapterScenes' | 'foreshadow' | 'openIssues';
  label: string;
  /** 화면에 표시할 값 */
  display: string;
  /** 비교·테스트용 숫자 값 */
  value: number;
  /** 분모가 있는 지표의 분모 */
  total?: number;
  unit: string;
  /** 숫자를 계산한 규칙 설명 */
  rule: string;
  /** 근거 데이터가 있는 위치 (화면 탭) */
  sourceTab: MetricTab;
  sourcePath: string;
  evidence: EvidenceItem[];
}

const fmt = (n: number) => n.toLocaleString('ko-KR');

export const buildDashboardMetrics = (project: WebNovelProject): MetricCard[] => {
  const table = buildEpisodeTable(project);
  const written = table.filter((r) => r.words > 0);
  const totalWords = written.reduce((a, r) => a + r.words, 0);

  const chapters = Object.values(project.chapters || {});
  const reviewed = chapters.filter((c) => c.status === '검토 완료');

  const curId = project.currentProgress?.currentChapter;
  const curChapter = curId ? project.chapters?.[curId] : undefined;
  const curScenes = curChapter?.scenes ?? [];
  const curDone = curScenes.filter((s) => s.status === '본문 완료');

  const curNum = chapterNum(curId);
  const due = (project.foreshadowing || []).filter((f) => f.status !== '회수 취소');
  const resolved = due.filter((f) => f.status === '회수됨');

  const open = (project.unresolvedIssues || []).filter((i) => i.status === '미결');

  const target = project.currentProgress?.episodesTarget || STORY_RULES.structure.totalEpisodes;
  const chapterTotal = project.currentProgress?.totalChapters ?? chapters.length;

  // 챕터별 분량은 소속 화 분량의 합이다 (metrics.recomputeDerived 와 같은 규칙).
  const chapterWords = chapters
    .map((c) => ({ c, words: table.filter((r) => r.chapter === c.id).reduce((a, r) => a + r.words, 0) }))
    .filter((x) => x.words > 0);

  return [
    {
      id: 'episodes',
      label: '편성 화 수',
      display: `${written.length} / ${target}`,
      value: written.length,
      total: target,
      unit: '화',
      rule: '본문 분량이 1자 이상인 화의 수. 분량은 씬 합계, 씬이 없으면 기록값.',
      sourceTab: 'timeline',
      sourcePath: 'project.episodes · chapters[*].scenes',
      evidence: written.map((r) => ({
        label: `${r.episode}화 ${r.title}`,
        value: `${fmt(r.words)}자 (${r.source === 'scenes' ? '씬 합계' : '기록값'})`,
      })),
    },
    {
      id: 'words',
      label: '연재본 분량',
      display: fmt(totalWords),
      value: totalWords,
      unit: '자',
      rule: '모든 화 분량의 합.',
      sourceTab: 'chapter',
      sourcePath: 'chapters[*].scenes[*].wordCount',
      evidence: chapterWords.map(({ c, words }) => ({ label: `${c.id} ${c.title}`, value: `${fmt(words)}자` })),
    },
    {
      id: 'reviewedChapters',
      label: '검토 완료 챕터',
      display: `${reviewed.length} / ${chapterTotal}`,
      value: reviewed.length,
      total: chapterTotal,
      unit: '챕터',
      rule: "상태가 '검토 완료'인 챕터. 확정은 챕터 게이트를 통과해야 한다.",
      sourceTab: 'chapter',
      sourcePath: 'chapters[*].status',
      evidence: reviewed.map((c) => ({ label: `${c.id} ${c.title}`, value: c.status })),
    },
    {
      id: 'currentChapterScenes',
      label: '현재 챕터 씬 완료',
      display: `${curDone.length} / ${curScenes.length}`,
      value: curDone.length,
      total: curScenes.length,
      unit: '씬',
      rule: "현재 챕터에서 상태가 '본문 완료'인 씬 / 전체 씬.",
      sourceTab: 'chapter',
      sourcePath: `chapters.${curId ?? '-'}.scenes`,
      evidence: curScenes.map((s) => ({ label: `${s.sceneNumber} ${s.title}`, value: s.status })),
    },
    {
      id: 'foreshadow',
      label: '복선 회수',
      display: `${resolved.length} / ${due.length}`,
      value: resolved.length,
      total: due.length,
      unit: '건',
      rule: `'회수됨' 복선 / '회수 취소'를 뺀 전체 복선.${
        curNum !== null ? ` 현재 챕터는 ch${String(curNum).padStart(2, '0')}.` : ''
      }`,
      sourceTab: 'lists',
      sourcePath: 'project.foreshadowing',
      evidence: due.map((f) => {
        const p = payoffChapterOf(f);
        return {
          label: `${f.id} ${f.title}`,
          value: `${f.status}${p !== null ? ` · 회수 예정 ch${String(p).padStart(2, '0')}` : ''}`,
        };
      }),
    },
    {
      id: 'openIssues',
      label: '열린 미결',
      display: String(open.length),
      value: open.length,
      unit: '건',
      rule: "상태가 '미결'인 항목. 보류 표시는 건수에 포함한다.",
      sourceTab: 'lists',
      sourcePath: 'project.unresolvedIssues',
      evidence: open.map((i) => ({
        label: `${i.id} ${i.title}`,
        value: `${i.category}${i.deferred ? ' · 보류' : ''}${i.dueChapter ? ` · 결정 예정 ${i.dueChapter}` : ''}`,
      })),
    },
  ];
};

// ---- D-03 ----

export const REDACTED = '[작가 전용]';

export interface RedactionSummary {
  diaries: number;
  foreshadowing: number;
  scenes: number;
  ending: boolean;
}

/**
 * 공유용 사본을 만든다. 입력은 변경하지 않는다.
 * 가리는 대상: 잠긴 일기, 회수 전 복선의 회수 방법, 본문 미완료 씬의 본문, 결말.
 */
export const redactForShare = (
  project: WebNovelProject
): { project: WebNovelProject; summary: RedactionSummary } => {
  const summary: RedactionSummary = { diaries: 0, foreshadowing: 0, scenes: 0, ending: false };

  const diaries = (project.diaries || []).map((d) => {
    if (d.unlocked) return d;
    summary.diaries++;
    return { ...d, previewText: REDACTED, fullText: undefined };
  });

  const foreshadowing = (project.foreshadowing || []).map((f) => {
    if (f.status === '회수됨') return f;
    summary.foreshadowing++;
    return { ...f, payoff: REDACTED, description: REDACTED };
  });

  const chapters: WebNovelProject['chapters'] = {};
  for (const [id, ch] of Object.entries(project.chapters || {})) {
    chapters[id] = {
      ...ch,
      scenes: (ch.scenes || []).map((s) => {
        if (s.status === '본문 완료') return s;
        summary.scenes++;
        return { ...s, content: REDACTED, synopsis: REDACTED };
      }),
    };
  }

  const coreConcept = project.coreConcept;
  summary.ending = !!coreConcept?.climaxEnding;

  return {
    project: {
      ...project,
      diaries,
      foreshadowing,
      chapters,
      coreConcept: summary.ending ? { ...coreConcept, climaxEnding: REDACTED } : coreConcept,
    },
    summary,
  };
};
