import React, { useMemo, useState } from 'react';
import { ARCS_DATA, DESIGN_STAGES, DIARIES_DATA, ArcItem, EpisodeItem } from '../data/storyData';
import { WebNovelProject } from '../data/projectTemplates';
import { buildEpisodeTable } from '../data/metrics';
import { ArcEditModal, WordCountEditModal, DesignStageEditModal, DesignStageItem } from './TimelineCardEditModal';
import { Edit3 } from 'lucide-react';

// "작품 전체" 화면. 원본 디자인(webnovel-studio.ai.studio 작품 전체)의 레이아웃을 따른다.
// 모든 숫자는 작품 데이터에서 계산한다. 화 분량과 진행 수치는 직접 입력하지 않는다.

interface TabTimelineProps {
  activeProject?: WebNovelProject;
  onSelectChapter: (chId: string) => void;
  onUpdateProject?: (updated: WebNovelProject) => void;
}

const TOTAL_CHAPTERS = 24;
const TOTAL_EPISODES = 100;
// 원본 디자인의 막 구성: 1막 = 아크 1, 2막 = 아크 2~3, 3막 = 아크 4~5, 4막 = 아크 6
const ACT_GROUPS: { label: string; arcIndexes: number[] }[] = [
  { label: '1막', arcIndexes: [0] },
  { label: '2막', arcIndexes: [1, 2] },
  { label: '3막', arcIndexes: [3, 4] },
  { label: '4막', arcIndexes: [5] },
];

const chapterIdOf = (n: number) => `ch${String(n).padStart(2, '0')}`;

/** "ch01~04" 같은 범위를 챕터 ID 목록으로 */
const chaptersInRange = (text: string): string[] => {
  const m = text.match(/ch(\d+)\s*~\s*(\d+)/i);
  if (!m) return [];
  const out: string[] = [];
  for (let n = Number(m[1]); n <= Number(m[2]); n++) out.push(chapterIdOf(n));
  return out;
};

/** "01~17화" 같은 범위의 끝 화 번호 */
const episodeEndOf = (text: string | undefined): number | null => {
  const m = (text || '').match(/(\d+)\s*~\s*(\d+)/);
  return m ? Number(m[2]) : null;
};

/** "01~17화" 같은 범위의 시작 화 번호 */
const episodeStartOf = (text: string | undefined): number | null => {
  const m = (text || '').match(/(\d+)\s*~\s*(\d+)/);
  return m ? Number(m[1]) : null;
};

type ChapterState = 'done' | 'current' | 'writing' | 'pending';

export const TabTimeline: React.FC<TabTimelineProps> = ({ activeProject, onSelectChapter, onUpdateProject }) => {
  const [editingArc, setEditingArc] = useState<ArcItem | null>(null);
  const [isEditingWordCounts, setIsEditingWordCounts] = useState(false);
  const [editingStage, setEditingStage] = useState<DesignStageItem | null>(null);
  const [stages, setStages] = useState<DesignStageItem[]>(DESIGN_STAGES);
  const [hoveredEpisode, setHoveredEpisode] = useState<number | null>(null);

  const project = activeProject;
  const arcs: ArcItem[] = project?.arcs && project.arcs.length > 0 ? project.arcs : ARCS_DATA;
  const episodeRows = useMemo(() => (project ? buildEpisodeTable(project).filter((r) => r.words > 0) : []), [project]);
  const lockedEpisodes = useMemo(() => new Set(episodeRows.filter((r) => r.source === 'scenes').map((r) => r.episode)), [episodeRows]);
  const computedWords = useMemo(() => new Map(episodeRows.map((r) => [r.episode, r.words] as [number, number])), [episodeRows]);

  if (!project || !onUpdateProject) {
    return <div className="text-xs text-slate-400 p-6">작품을 선택하면 작품 전체 화면이 표시됩니다.</div>;
  }

  const currentId = project.currentProgress.currentChapter;

  const chapterState = (id: string): ChapterState => {
    if (id === currentId) return 'current';
    const ch = project.chapters[id];
    if (ch?.status === '검토 완료') return 'done';
    if (ch?.status === '진행 중') return 'writing';
    return 'pending';
  };

  const chapterBox: Record<ChapterState, string> = {
    done: 'bg-orange-500 text-white hover:bg-orange-600',
    current: 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md',
    writing: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    pending: 'bg-slate-200 text-slate-600 hover:bg-slate-300',
  };

  const arcEndMarkers = arcs
    .map((a) => ({ arc: a, end: episodeEndOf(a.episodes) }))
    .filter((x): x is { arc: ArcItem; end: number } => x.end !== null && x.end < TOTAL_EPISODES);

  const avg = episodeRows.length ? Math.round(episodeRows.reduce((a, r) => a + r.words, 0) / episodeRows.length) : 0;
  const minW = episodeRows.length ? Math.min(...episodeRows.map((r) => r.words)) : 0;
  const maxW = episodeRows.length ? Math.max(...episodeRows.map((r) => r.words)) : 0;
  const maxBar = Math.max(10000, maxW);

  const handleSaveArc = (updatedArc: ArcItem) => {
    const updated = arcs.map((a) => (a.id === updatedArc.id ? updatedArc : a));
    onUpdateProject({ ...project, arcs: updated });
  };

  const handleSaveEpisodes = (updatedEpisodes: EpisodeItem[]) => {
    onUpdateProject({ ...project, episodes: updatedEpisodes });
  };

  const handleSaveStage = (updatedStage: DesignStageItem) => {
    setStages((prev) => prev.map((s) => (s.step === updatedStage.step ? updatedStage : s)));
  };

  return (
    <div className="space-y-5">
      {/* 1. 100화 마스터 맵 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-extrabold text-slate-900">
          100화 · {ACT_GROUPS.length}막 · {arcs.length}아크 · {TOTAL_CHAPTERS}챕터
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          화 범위는 편성이 끝난 챕터만 확정이고 나머지는 잠정입니다. 막·아크 경계는 아래 표시대로 나뉩니다. 칸을 누르면 해당 챕터가 열립니다.
        </p>

        {/* 막 */}
        <div className="mt-4 grid grid-cols-4 border border-slate-200 rounded-lg overflow-hidden text-xs font-semibold text-slate-700">
          {ACT_GROUPS.map((g) => {
            const first = arcs[g.arcIndexes[0]];
            const last = arcs[g.arcIndexes[g.arcIndexes.length - 1]];
            const from = first ? episodeStartOf(first.episodes) : null;
            const to = last ? episodeEndOf(last.episodes) : null;
            return (
              <div key={g.label} className="px-3 py-2 text-center border-r last:border-r-0 border-slate-200 bg-slate-50">
                {g.label} {from !== null && to !== null ? `${from}~${to}화` : ''}
              </div>
            );
          })}
        </div>

        {/* 아크 */}
        <div className="mt-2 grid grid-cols-6 gap-2 text-[11px]">
          {arcs.slice(0, 6).map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setEditingArc(a)}
              className="px-2 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 truncate text-center"
              title={`${a.episodes || ''} · 클릭하여 편집`}
            >
              아크 {i + 1}: {a.title}
            </button>
          ))}
        </div>

        {/* 챕터 블록 */}
        <div className="relative mt-6">
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12 xl:grid-cols-[repeat(24,minmax(0,1fr))]">
            {Array.from({ length: TOTAL_CHAPTERS }, (_, i) => {
              const id = chapterIdOf(i + 1);
              const st = chapterState(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectChapter(id)}
                  className={`h-9 rounded text-xs font-bold font-mono transition-colors ${chapterBox[st]}`}
                  title={`${id} · ${project.chapters[id]?.title ?? ''}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>
          {currentId && (
            <div className="text-center text-[11px] font-bold text-blue-700 mt-1">▲ 지금 {currentId}</div>
          )}
        </div>

        {/* 화 마커 (아크 경계) */}
        <div className="relative mt-3 h-8 text-[11px] font-mono">
          {arcEndMarkers.map(({ arc, end }) => (
            <span
              key={arc.id}
              className="absolute -translate-x-1/2 text-emerald-700 font-bold whitespace-nowrap"
              style={{ left: `${(end / TOTAL_EPISODES) * 100}%` }}
              title={`${arc.title} 끝`}
            >
              ◆ {end}화
            </span>
          ))}
          {DIARIES_DATA.slice(0, 6).map((d, i) => (
            <span
              key={d.id}
              className="absolute top-4 -translate-x-1/2 text-amber-700 whitespace-nowrap"
              style={{ left: `${((i + 1) / 7) * 100}%` }}
              title={`일기 #${d.number} ${d.title}`}
            >
              ⦿ #{d.number}
            </span>
          ))}
        </div>

        {/* 기준선: 무료 끝 30화, 비축 목표 40화 */}
        <div className="mt-1 flex gap-3 text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">무료 끝 30화</span>
          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">비축 {project.currentProgress.episodesTarget}화</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 border-t border-slate-200 pt-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />검토 완료</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" />진행 중</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" />대기</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">◆ 아크 경계</span>
          <span className="flex items-center gap-1.5 text-amber-700 font-bold">⦿ 일기 배치</span>
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 rounded-lg border border-slate-200 p-3 text-xs text-slate-700">
          {DIARIES_DATA.slice(0, 6).map((d) => (
            <div key={d.id} className="truncate">
              <span className="font-bold">{d.chapter} #{d.number}</span> {d.title}
            </div>
          ))}
        </div>
      </div>

      {/* 2. 하단 세 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 아크 진행 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900">아크 진행</h3>
          <p className="text-[11px] text-slate-400 mb-3">아크의 마지막 챕터까지 10단계를 마치면 11단계 아크·막 검토를 해요.</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] border-b border-slate-200">
                <th className="text-left pb-1.5 font-medium">아크</th>
                <th className="text-left pb-1.5 font-medium">제목</th>
                <th className="text-left pb-1.5 font-medium">챕터</th>
                <th className="text-right pb-1.5 font-medium">검토 끝</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arcs.map((a) => {
                const ids = chaptersInRange(a.chapters);
                const done = ids.filter((id) => project.chapters[id]?.status === '검토 완료').length;
                return (
                  <tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setEditingArc(a)}>
                    <td className="py-2 font-mono text-slate-500">{a.id}</td>
                    <td className="py-2 font-semibold text-slate-800">{a.title}</td>
                    <td className="py-2 font-mono text-slate-500">{a.chapters}</td>
                    <td className="py-2 text-right font-bold text-emerald-700">{done} / {ids.length || a.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 화별 분량 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">연재본 화별 분량</h3>
              <p className="text-[11px] text-slate-400">권장 6,000~8,000자 · 최소 5,000자</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingWordCounts(true)}
              className="shrink-0 px-2.5 py-1 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              분량 편집
            </button>
          </div>
          <div className="relative h-40 flex items-end gap-1 border-b border-slate-200">
            {/* 권장 대역 6,000~8,000 */}
            <div
              className="absolute left-0 right-0 bg-blue-50 border-y border-blue-200/70 pointer-events-none"
              style={{ bottom: `${(6000 / maxBar) * 100}%`, height: `${((8000 - 6000) / maxBar) * 100}%` }}
            />
            {/* 최소 5,000 */}
            <div className="absolute left-0 right-0 border-b border-dashed border-rose-300 pointer-events-none" style={{ bottom: `${(5000 / maxBar) * 100}%` }} />
            {episodeRows.map((r) => {
              const h = Math.max(4, (r.words / maxBar) * 100);
              const warn = r.wordClass === 'short' || r.wordClass === 'long';
              return (
                <div
                  key={r.episode}
                  className="relative flex-1 min-w-[6px] h-full flex flex-col justify-end"
                  onMouseEnter={() => setHoveredEpisode(r.episode)}
                  onMouseLeave={() => setHoveredEpisode(null)}
                  title={`${r.episode}화 ${r.words.toLocaleString()}자`}
                >
                  <div
                    className={`w-full rounded-t ${warn ? 'bg-amber-500' : hoveredEpisode === r.episode ? 'bg-blue-700' : 'bg-blue-500'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            {episodeRows.map((r) => (
              <span key={r.episode} className="flex-1 text-center">{r.episode}</span>
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>최소 {minW.toLocaleString()}자</span>
            <span className="font-bold text-blue-700">평균 {avg.toLocaleString()}자</span>
            <span>최고 {maxW.toLocaleString()}자</span>
          </div>
          <p className="text-[10px] text-slate-400">막대 높이는 씬 합계(자동)입니다. 씬 본문이 없는 화는 기록값을 씁니다.</p>
        </div>

        {/* 설계 단계 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900">설계 단계</h3>
          <p className="text-[11px] text-slate-400 mb-3">1~5단계와 7단계는 한 번만 진행해요. 행을 누르면 편집합니다.</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] border-b border-slate-200">
                <th className="text-left pb-1.5 font-medium">단계</th>
                <th className="text-left pb-1.5 font-medium">내용</th>
                <th className="text-right pb-1.5 font-medium">완료</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stages.map((s) => (
                <tr key={s.step} onClick={() => setEditingStage(s)} className="hover:bg-emerald-50/60 cursor-pointer group">
                  <td className="py-2 font-mono text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      {s.step}
                      <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-600" />
                    </span>
                  </td>
                  <td className="py-2 text-slate-800">{s.name}</td>
                  <td className="py-2 text-right font-mono font-bold text-emerald-700">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-400 font-mono">
        {project.currentProgress.commitDate} (커밋 {project.currentProgress.commitHash}) 작품 폴더를 기준으로 계산한 스냅샷입니다.
      </div>

      {/* 편집 모달 */}
      <ArcEditModal arc={editingArc} isOpen={Boolean(editingArc)} onClose={() => setEditingArc(null)} onSave={handleSaveArc} />
      <WordCountEditModal
        episodes={project.episodes}
        lockedEpisodes={lockedEpisodes}
        computedWords={computedWords}
        isOpen={isEditingWordCounts}
        onClose={() => setIsEditingWordCounts(false)}
        onSave={handleSaveEpisodes}
      />
      <DesignStageEditModal stage={editingStage} isOpen={Boolean(editingStage)} onClose={() => setEditingStage(null)} onSave={handleSaveStage} />
    </div>
  );
};
