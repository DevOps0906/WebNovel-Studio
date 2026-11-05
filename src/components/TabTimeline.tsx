import React, { useState, useEffect } from 'react';
import { ARCS_DATA, EPISODES_DATA, DESIGN_STAGES, ArcItem, EpisodeItem } from '../data/storyData';
import { WebNovelProject } from '../data/projectTemplates';
import {
  ArcEditModal,
  WordCountEditModal,
  DesignStageEditModal,
  DesignStageItem
} from './TimelineCardEditModal';
import { Edit3, CheckCircle2, Sliders } from 'lucide-react';

interface TabTimelineProps {
  activeProject?: WebNovelProject;
  onSelectChapter: (chId: string) => void;
  onUpdateProject?: (updated: WebNovelProject) => void;
}

export const TabTimeline: React.FC<TabTimelineProps> = ({
  activeProject,
  onSelectChapter,
  onUpdateProject,
}) => {
  const [hoveredEpisode, setHoveredEpisode] = useState<number | null>(null);
  const [hoveredChapter, setHoveredChapter] = useState<number | null>(null);

  // Edit Modals State
  const [editingArc, setEditingArc] = useState<ArcItem | null>(null);
  const [isEditingWordCounts, setIsEditingWordCounts] = useState<boolean>(false);
  const [editingStage, setEditingStage] = useState<DesignStageItem | null>(null);

  // Local state for interactive editing
  const [arcs, setArcs] = useState<ArcItem[]>(() =>
    activeProject?.arcs && activeProject.arcs.length > 0 ? activeProject.arcs : ARCS_DATA
  );
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(() =>
    activeProject?.episodes && activeProject.episodes.length > 0 ? activeProject.episodes : EPISODES_DATA
  );
  const [stages, setStages] = useState<DesignStageItem[]>(() => DESIGN_STAGES);

  // Sync when activeProject changes
  useEffect(() => {
    if (activeProject?.arcs && activeProject.arcs.length > 0) {
      setArcs(activeProject.arcs);
    } else {
      setArcs(ARCS_DATA);
    }
    if (activeProject?.episodes && activeProject.episodes.length > 0) {
      setEpisodes(activeProject.episodes);
    } else {
      setEpisodes(EPISODES_DATA);
    }
  }, [activeProject?.id]);

  const handleSaveArc = (updatedArc: ArcItem) => {
    const updated = arcs.map((a) => (a.id === updatedArc.id ? updatedArc : a));
    setArcs(updated);
    if (activeProject && onUpdateProject) {
      onUpdateProject({
        ...activeProject,
        arcs: updated,
      });
    }
  };

  const handleSaveEpisodes = (updatedEpisodes: EpisodeItem[]) => {
    setEpisodes(updatedEpisodes);
    if (activeProject && onUpdateProject) {
      const totalWords = updatedEpisodes.reduce((acc, ep) => acc + (ep.words || 0), 0);
      onUpdateProject({
        ...activeProject,
        episodes: updatedEpisodes,
        currentProgress: {
          ...activeProject.currentProgress,
          totalWordCount: totalWords,
        }
      });
    }
  };

  const handleSaveStage = (updatedStage: DesignStageItem) => {
    const updated = stages.map((s) => (s.step === updatedStage.step ? updatedStage : s));
    setStages(updated);
  };

  // Project-specific milestones
  const getMilestones = () => {
    if (activeProject?.id === 'hunter-sovereign') {
      return [
        { ep: '1화', text: '심연에 버려진 F급 짐꾼', hook: '◆' },
        { ep: '17화', text: '"영원의 침묵" 1차 신탁', hook: '◆' },
        { ep: '33화', text: '그림자 길드 창립 선언', hook: '◆' },
        { ep: '50화', text: '블랙드래곤 랭커 격파', hook: '◆' },
        { ep: '67화', text: '성좌들의 성전 위기', hook: '◆' },
        { ep: '83화', text: '최도현 길드장 범죄 폭로', hook: '◆' },
        { ep: '95화', text: '세계 1위 랭커 결투 단죄', hook: '◆' },
        { ep: 'ch03 #1', text: '게이트 붕괴와 신탁', hook: '⦿' }
      ];
    } else if (activeProject?.id === 'villainess-escape') {
      return [
        { ep: '1화', text: '악녀 로젤리아 빙의', hook: '◆' },
        { ep: '17화', text: '황태자 파혼장 투척', hook: '◆' },
        { ep: '33화', text: '에르하르트 마도상단 창립', hook: '◆' },
        { ep: '50화', text: '황실 국채 30억 플로린 압류', hook: '◆' },
        { ep: '67화', text: '독약 자작극 전모 폭로', hook: '◆' },
        { ep: '83화', text: '황태자 무릎 꿇고 애원', hook: '◆' },
        { ep: '95화', text: '제국 은행 총재 취임식', hook: '◆' },
        { ep: 'ch02 #1', text: '은빛 마도 회중시계', hook: '⦿' }
      ];
    } else {
      return [
        { ep: '1화', text: '동생의 장례식', hook: '◆' },
        { ep: '17화', text: '"네 말이 맞다" 인정', hook: '◆' },
        { ep: '33화', text: '후계 참여 공식 선언', hook: '◆' },
        { ep: '50화', text: '중간점 · 어긋난 서랍', hook: '◆' },
        { ep: '67화', text: '위장 붕괴 위기', hook: '◆' },
        { ep: '83화', text: '차남 살인교사 폭로·결심', hook: '◆' },
        { ep: '95화', text: '클라이맥스 가면 탈피', hook: '◆' },
        { ep: 'ch02 #1', text: '오늘 언니를 찾았다', hook: '⦿' }
      ];
    }
  };

  // Generate 24 chapters info dynamically linked to activeProject
  const chapters = Array.from({ length: 24 }, (_, i) => {
    const num = i + 1;
    const id = `ch${num.toString().padStart(2, '0')}`;
    let status: 'done' | 'current' | 'pending' = 'pending';
    let episodesText = '';
    let description = '';

    const customCh = activeProject?.chapters?.[id];
    const currentChId = activeProject?.currentProgress?.currentChapter || 'ch04';

    if (customCh) {
      episodesText = customCh.episodes;
      description = customCh.title;
      status = id === currentChId ? 'current' : customCh.status === '검토 완료' ? 'done' : 'pending';
    } else if (activeProject?.id === 'hunter-sovereign') {
      if (num <= 2) {
        status = 'done';
        if (num === 1) { episodesText = '1~4화'; description = '심연에 버려진 짐꾼'; }
        if (num === 2) { episodesText = '5~7화'; description = '영원의 침묵과 계약'; }
      } else if (num === 3) {
        status = 'current';
        episodesText = '8~10화 (집필 중)';
        description = '성좌의 첫 번째 신탁';
      } else {
        status = 'pending';
        episodesText = `${(num - 1) * 4 + 1}~${num * 4}화 (잠정)`;
        if (num === 4) description = '랭커들의 경악 (F급 짐꾼의 귀환)';
        else if (num === 8) description = '33화 그림자 길드 설립 선언';
        else if (num === 12) description = '50화 랭커 사냥 중간점';
        else if (num === 16) description = '67화 성좌들의 성전 위기';
        else if (num === 20) description = '83화 블랙드래곤 길드 몰락';
        else if (num === 23) description = '95화 세계 1위 랭커 결투 단죄';
        else if (num === 24) description = '100화 심연의 군주 등극';
        else description = `챕터 ${num} 기획 대기 중`;
      }
    } else if (activeProject?.id === 'villainess-escape') {
      if (num === 1) {
        status = 'done';
        episodesText = '1~3화';
        description = '단두대 처형 90일 전';
      } else if (num === 2) {
        status = 'current';
        episodesText = '4~6화 (집필 중)';
        description = '파혼장과 국채 매입';
      } else {
        status = 'pending';
        episodesText = `${(num - 1) * 4 + 1}~${num * 4}화 (잠정)`;
        if (num === 3) description = '마탑주의 은밀한 거래';
        else if (num === 4) description = '황실 채권 30억 플로린';
        else if (num === 8) description = '33화 에르하르트 마도상단 창립';
        else if (num === 12) description = '50화 황실 30억 채권 압류';
        else if (num === 16) description = '67화 독약 자작극 전모 폭로';
        else if (num === 20) description = '83화 황태자 무릎 꿇고 애원';
        else if (num === 23) description = '95화 제국 은행 총재 취임식';
        else if (num === 24) description = '100화 금융 제국의 완성';
        else description = `챕터 ${num} 기획 대기 중`;
      }
    } else {
      if (num <= 3) {
        status = 'done';
        if (num === 1) { episodesText = '1~4화'; description = '동생 사망 의혹 · 가짜 손녀 위장'; }
        if (num === 2) { episodesText = '5~9화'; description = '유전자 검사 시차 · 로펌 진명 접선'; }
        if (num === 3) { episodesText = '10~12화'; description = '가짜의 증명 · 1막 클리프행어'; }
      } else if (num === 4) {
        status = 'current';
        episodesText = '13~17화 (집필 중)';
        description = '식탁의 서열 · 17화 "네 말이 맞다" 1차 전환점';
      } else {
        status = 'pending';
        episodesText = `${(num - 1) * 4 + 2}~${num * 4 + 1}화 (잠정)`;
        if (num === 8) description = '33화 후계 구도 공식 선언 (아크 2 완결)';
        else if (num === 12) description = '50화 2막 미드포인트 (차남 알리바이 분쇄)';
        else if (num === 16) description = '67화 정체 발각 위기';
        else if (num === 20) description = '83화 차남 비자금/살인교사 녹취록 폭로';
        else if (num === 23) description = '95화 주총 클라이맥스 "저는 서이현이 아닙니다"';
        else if (num === 24) description = '100화 완결 본래의 이름 회복';
        else description = `챕터 ${num} 기획 대기 중`;
      }
    }

    return { num, id, status, episodesText, description };
  });

  const milestones = getMilestones();

  return (
    <div className="space-y-6">
      {/* 24-Chapter Master Timeline Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {activeProject?.title || '작품'} 마스터 타임라인
              </span>
              <span className="text-xs text-slate-400 font-mono">
                현재 작업: {activeProject?.currentProgress?.currentChapter || 'ch04'}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              100화 · 4막 · 6아크 · 24챕터
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              화 범위는 편성이 끝난 챕터만 확정이고 나머지는 잠정이에요. 점선은 무료 끝(30화)과 오픈 비축 목표(40화). 구조 클리프행어 화 번호는 스토리구조 그대로, 블록에 올리면 전환점과 화 범위 상태가 보여요.
            </p>
          </div>
        </div>

        {/* 4 Acts Bar */}
        <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-700 text-center bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="col-span-2 border-r border-slate-200 py-0.5">
            1막 1~17화
          </div>
          <div className="col-span-4 border-r border-slate-200 py-0.5">
            2막 18~50화
          </div>
          <div className="col-span-4 border-r border-slate-200 py-0.5">
            3막 51~83화
          </div>
          <div className="col-span-2 py-0.5">
            4막 84~100화
          </div>
        </div>

        {/* 6 Arcs Bar (Clickable to edit) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 text-[11px] text-slate-600 text-center">
          {arcs.slice(0, 6).map((arc, idx) => (
            <div
              key={arc.id || idx}
              onClick={() => setEditingArc(arc)}
              className="bg-slate-100 hover:bg-blue-100 hover:text-blue-900 py-1.5 rounded font-medium truncate px-1 cursor-pointer transition-colors border border-slate-200/60 hover:border-blue-300 group"
              title={`${arc.title} (클릭하여 아크 편집)`}
            >
              <span>아크 {idx + 1}: {arc.title}</span>
              <Edit3 className="w-2.5 h-2.5 inline-block ml-1 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
            </div>
          ))}
        </div>

        {/* 24-Chapter Timeline Blocks with Overlay Guide Lines */}
        <div className="relative pt-6 pb-4">
          {/* Guide Line 1: 30 Free Episodes Line (at 30% of 100 episodes) */}
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-amber-400 z-10 pointer-events-none flex flex-col justify-start"
            style={{ left: '30%' }}
          >
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded -translate-x-1/2 -translate-y-5 whitespace-nowrap shadow-2xs border border-amber-300">
              무료 끝 30화
            </span>
          </div>

          {/* Guide Line 2: 40 Backlog Episodes Line (at 40% of 100 episodes) */}
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-400 z-10 pointer-events-none flex flex-col justify-start"
            style={{ left: '40%' }}
          >
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded -translate-x-1/2 -translate-y-5 whitespace-nowrap shadow-2xs border border-blue-300">
              비축 40화
            </span>
          </div>

          {/* 24 Block Grid */}
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1">
            {chapters.map((ch) => {
              const isHovered = hoveredChapter === ch.num;
              return (
                <div
                  key={ch.id}
                  onClick={() => onSelectChapter(ch.id)}
                  onMouseEnter={() => setHoveredChapter(ch.num)}
                  onMouseLeave={() => setHoveredChapter(null)}
                  className={`relative py-2.5 rounded text-center text-xs font-bold transition-all cursor-pointer select-none ${
                    ch.status === 'done'
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-2xs'
                      : ch.status === 'current'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm scale-105 z-5'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title={`${ch.id} (${ch.episodesText}): ${ch.description}`}
                >
                  {ch.num.toString().padStart(2, '0')}

                  {ch.status === 'current' && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-blue-700 font-extrabold whitespace-nowrap">
                      ▲ 지금
                    </div>
                  )}

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30 pointer-events-none text-left">
                      <div className="font-bold text-amber-300">{ch.id} ({ch.episodesText})</div>
                      <div className="text-slate-200 text-[10px] mt-0.5">{ch.description}</div>
                      <div className="text-slate-400 text-[9px] mt-1">클릭하여 챕터 씬 보드로 이동</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestone Event Markers & Diary Markers */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-5 px-1 font-mono">
            {milestones.map((m, idx) => (
              <span
                key={idx}
                className={`flex items-center gap-1 font-semibold ${
                  m.hook === '⦿' ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                <span className="text-[10px]">{m.hook}</span> {m.ep}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> 검토 완료
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> 진행 중
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> 대기
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="text-[11px]">◆</span> 구조 클리프행어(화)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <span className="text-[11px]">⦿</span> 일기/단서 배치
            </span>
          </div>
        </div>

        {/* Milestone Plot Points Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
          {milestones.map((m, idx) => (
            <div key={idx}>
              <span className={`font-bold ${m.hook === '⦿' ? 'text-amber-700' : 'text-slate-800'}`}>
                {m.ep}
              </span>{' '}
              {m.text}
            </div>
          ))}
        </div>
      </div>

      {/* 3 Bottom Summary Cards (Now interactive with edit modals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Arc Progress Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>아크 진행</span>
                <span className="text-[10px] text-blue-600 font-normal">(항목 클릭 시 편집)</span>
              </h3>
              <p className="text-[11px] text-slate-400">아크의 마지막 챕터까지 10단계를 마치면 11단계 아크·막 검토를 해요.</p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                <th className="text-left pb-1.5 font-medium">아크</th>
                <th className="text-left pb-1.5 font-medium">제목</th>
                <th className="text-center pb-1.5 font-medium">챕터</th>
                <th className="text-center pb-1.5 font-medium">검토 끝</th>
                <th className="text-right pb-1.5 font-medium">막</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arcs.map((arc) => (
                <tr
                  key={arc.id}
                  onClick={() => setEditingArc(arc)}
                  className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                  title={`${arc.title} 클릭하여 아크 편집`}
                >
                  <td className={`py-2 font-mono font-bold flex items-center gap-1 ${arc.done > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <span>{arc.id}</span>
                    <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                  </td>
                  <td className="py-2 text-slate-700 font-medium truncate max-w-[120px] group-hover:text-blue-700">{arc.title}</td>
                  <td className="text-center py-2 text-slate-500 font-mono text-[11px]">{arc.chapters}</td>
                  <td className="text-center py-2 font-bold tabular-nums">
                    <span className={arc.done > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                      {arc.done} / {arc.total}
                    </span>
                  </td>
                  <td className="text-right py-2 text-[10px] text-slate-500">{arc.act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. Episode Word Counts Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>연재본 화별 분량</span>
                <span className="text-[10px] text-blue-600 font-normal">(클릭 시 편집)</span>
              </h3>
              <p className="text-[11px] text-slate-400">진한 띠 = 목표 6,000~8,000자, 점선 = 최소 5,000자.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingWordCounts(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-2 py-0.5 rounded border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="화별 분량 및 소제목 편집"
            >
              <Edit3 className="w-3 h-3" />
              <span>분량 편집</span>
            </button>
          </div>

          {/* Interactive Bar Chart */}
          <div
            onClick={() => setIsEditingWordCounts(true)}
            className="h-40 flex items-end justify-between gap-1 pt-6 px-1 border-b border-slate-200 relative cursor-pointer group"
            title="차트 클릭 시 분량 편집 모달이 열립니다"
          >
            {/* Target 6k~8k background highlight zone */}
            <div
              className="absolute left-0 right-0 bg-blue-50/50 pointer-events-none border-y border-blue-200/60"
              style={{ bottom: '50%', top: '20%' }}
              title="권장 분량 대역 (6,000 ~ 8,000자)"
            />
            {/* Min 5,000 line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-rose-300 pointer-events-none"
              style={{ bottom: '50%' }}
            />

            {episodes.map((ep) => {
              const heightPercent = Math.min(100, Math.max(10, (ep.words / 10000) * 100));
              const isHovered = hoveredEpisode === ep.episode;

              return (
                <div
                  key={ep.episode}
                  className="w-full flex flex-col items-center gap-1 group relative cursor-pointer"
                  onMouseEnter={() => setHoveredEpisode(ep.episode)}
                  onMouseLeave={() => setHoveredEpisode(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none">
                      <div className="font-bold text-amber-300">{ep.episode}화: {ep.title}</div>
                      <div>글자수: {ep.words.toLocaleString()}자</div>
                      <div className="text-slate-300 text-[9px]">{ep.hook}</div>
                      <div className="text-blue-300 text-[8px] mt-0.5">클릭하여 분량 편집</div>
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t transition-all duration-200 ${
                      ep.words >= 8000
                        ? 'bg-blue-700 group-hover:bg-blue-800'
                        : ep.words >= 6000
                        ? 'bg-blue-500 group-hover:bg-blue-600'
                        : 'bg-blue-400 group-hover:bg-blue-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className={`text-[9px] font-mono ${isHovered ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                    {ep.episode}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>최소 {Math.min(...episodes.map(e => e.words)).toLocaleString()}자</span>
            <span className="font-bold text-blue-700">
              평균 {Math.round(episodes.reduce((a, b) => a + b.words, 0) / (episodes.length || 1)).toLocaleString()}자
            </span>
            <span>최고 {Math.max(...episodes.map(e => e.words)).toLocaleString()}자</span>
          </div>
        </div>

        {/* 3. Design Stages Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>설계 단계</span>
              <span className="text-[10px] text-emerald-600 font-normal">(항목 클릭 시 편집)</span>
            </h3>
            <p className="text-[11px] text-slate-400">1~5단계와 7단계는 한 번만 진행해요.</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                <th className="text-left pb-1.5 font-medium">단계</th>
                <th className="text-left pb-1.5 font-medium">내용</th>
                <th className="text-right pb-1.5 font-medium">완료</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stages.map((s) => (
                <tr
                  key={s.step}
                  onClick={() => setEditingStage(s)}
                  className="hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                  title={`${s.step}단계 클릭하여 편집`}
                >
                  <td className="py-2 text-slate-400 font-mono font-bold group-hover:text-emerald-700">
                    <span className="flex items-center gap-1">
                      <span>{s.step}</span>
                      <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                    </span>
                  </td>
                  <td className="py-2 text-slate-700 font-medium group-hover:text-slate-900">{s.name}</td>
                  <td className="text-right py-2 text-emerald-600 font-semibold font-mono text-[11px]">
                    {s.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Arc Edit Modal */}
      <ArcEditModal
        arc={editingArc}
        isOpen={Boolean(editingArc)}
        onClose={() => setEditingArc(null)}
        onSave={handleSaveArc}
      />

      {/* 2. Word Count & Episodes Edit Modal */}
      <WordCountEditModal
        episodes={episodes}
        isOpen={isEditingWordCounts}
        onClose={() => setIsEditingWordCounts(false)}
        onSave={handleSaveEpisodes}
      />

      {/* 3. Design Stage Edit Modal */}
      <DesignStageEditModal
        stage={editingStage}
        isOpen={Boolean(editingStage)}
        onClose={() => setEditingStage(null)}
        onSave={handleSaveStage}
      />
    </div>
  );
};
