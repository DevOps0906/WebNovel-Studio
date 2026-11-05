import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  FileText,
  Download,
  Flame,
  Crown,
  Sword,
  Bot,
  Settings,
  FolderTree,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { AiSettingsConfig } from '../data/aiSettings';

interface TabDashboardProps {
  projects: WebNovelProject[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPdfModal: () => void;
  onOpenWorkspaceModal: () => void;
  onSelectTab: (tab: any) => void;
  aiSettings: AiSettingsConfig;
}

export const TabDashboard: React.FC<TabDashboardProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettingsModal,
  onOpenPdfModal,
  onOpenWorkspaceModal,
  onSelectTab,
  aiSettings,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const totalWords = projects.reduce((acc, p) => acc + (p.currentProgress.totalWordCount || 0), 0);
  const totalReservedEpisodes = projects.reduce((acc, p) => acc + (p.currentProgress.episodesOrganized || 0), 0);
  const activeProvider = aiSettings.activeProvider;
  const activeModelName = aiSettings[activeProvider].model;

  const getTemplateBadge = (type: string) => {
    switch (type) {
      case 'chaebol':
        return { label: '재벌 복수극 템플릿', icon: Crown, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'hunter':
        return { label: '현대 헌터/성좌 템플릿', icon: Sword, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'romfantasy':
        return { label: '로맨스 판타지 템플릿', icon: Sparkles, color: 'text-rose-600 bg-rose-50 border-rose-200' };
      case 'wuxia':
        return { label: '정통 무협 템플릿', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-200' };
      default:
        return { label: '자유 설계 템플릿', icon: Layers, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Dashboard Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                WebNovel-Studio 관제 센터
              </span>
              <span className="text-xs text-slate-400">
                11단계 공학적 웹소설 집필 시스템
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              웹소설 창작 프로젝트 대시보드
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              장르별 공학적 템플릿으로 신규 웹소설을 손쉽게 착수하고, 4막 6아크 24챕터 100화 완결 파이프라인으로 체계적인 집필을 이어가세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewProjectModal}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새로운 웹소설 작성하기</span>
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-blue-400" />
              <span>AI API 설정</span>
            </button>
          </div>
        </div>

        {/* 4 Key Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>총 관리 소설</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {projects.length} <span className="text-xs font-normal text-slate-400">편</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>누적 비축 화수</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {totalReservedEpisodes} <span className="text-xs font-normal text-slate-400">화</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>총 집필 글자수</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {totalWords.toLocaleString()} <span className="text-xs font-normal text-slate-400">자</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>활성 AI 엔진</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-indigo-300 font-mono mt-1 truncate">
              {activeProvider.toUpperCase()} · {activeModelName.split('-')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Novel Focus Banner */}
      {activeProject && (
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 uppercase font-mono">현재 작업 중인 웹소설 (Active Workspace)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {activeProject.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('overview')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <span>작품 개요 보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectTab('timeline')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <span>100화 타임라인</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{activeProject.title}</span>
                <span className="text-xs text-slate-500 font-normal">({activeProject.subtitle})</span>
              </h2>
              <p className="text-xs text-slate-600 line-clamp-1 max-w-3xl">
                {activeProject.coreConcept.logline}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-mono">
                <span>필명: <strong>{activeProject.penName}</strong></span>
                <span>·</span>
                <span>장르: <strong>{activeProject.genre}</strong></span>
                <span>·</span>
                <span>규모: <strong>{activeProject.scale}</strong></span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0 w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">비축 진행도</span>
                <span className="font-bold text-blue-600 font-mono">
                  {activeProject.currentProgress.episodesOrganized} / {activeProject.currentProgress.episodesTarget}화
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (activeProject.currentProgress.episodesOrganized / activeProject.currentProgress.episodesTarget) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                <span>진행 챕터: {activeProject.currentProgress.currentChapter}</span>
                <span>미결 이슈: {activeProject.currentProgress.openIssues}건</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. My Web Novels Project List (Cards Grid) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>내 웹소설 프로젝트 목록 ({projects.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              클릭하여 작업할 웹소설을 선택하면 하단의 모든 챕터 보드와 타임라인이 해당 소설에 맞춰 전환됩니다.
            </p>
          </div>

          <button
            onClick={onOpenNewProjectModal}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>새 소설 추가</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const badge = getTemplateBadge(proj.templateType);
            const BadgeIcon = badge.icon;
            const progressPct = Math.round(
              (proj.currentProgress.episodesOrganized / proj.currentProgress.episodesTarget) * 100
            );

            return (
              <div
                key={proj.id}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all bg-white shadow-2xs relative ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2.5 right-4 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    ACTIVE WORKSPACE
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {proj.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1" title={proj.title}>
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {proj.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {proj.coreConcept.logline}
                  </p>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>비축 분량</span>
                      <span className="font-bold text-slate-800">
                        {proj.currentProgress.episodesOrganized} / {proj.currentProgress.episodesTarget}화 ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <span>{isActive ? '현재 작업 중' : '이 소설로 작업 전환'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Dotted New Project Card */}
          <button
            onClick={onOpenNewProjectModal}
            className="rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 p-6 flex flex-col items-center justify-center text-center gap-2.5 transition-all group min-h-[260px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-700 group-hover:text-blue-600 block">
                새로운 웹소설 프로젝트 작성
              </span>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                재벌 복수극, 헌터물, 로판, 무협 템플릿으로 4막 6아크 플롯 자동 생성
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. WebNovel-Studio 11-Step Engineering Pipeline Guide */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              WebNovel-Studio 11단계 공학적 집필 파이프라인
            </h3>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              STANDARD WORKFLOW
            </span>
          </div>
          <button
            onClick={onOpenWorkspaceModal}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>옵시디언 폴더 트리 탐색</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono">01</span>
              <span>기획 문서 (1단계)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              01-계획서부터 05-문체가이드까지 정립. 감정 명명 금지 및 3중 보이스 원칙 확립.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono">02</span>
              <span>챕터 및 씬 설계 (6~7단계)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              24개 챕터별 기승전결 씬 분할. 씬별 분량(1,200~1,800자) 및 페이싱 전진/후퇴 설정.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">03</span>
              <span>AI 페어 집필 (8단계)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Claude, ChatGPT, Gemini를 통한 씬 초안 집필 및 엔딩 클리프행어(Hook) 강화.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center text-[10px] font-mono">04</span>
              <span>10단계 퇴고 & 병합 (9~11단계)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              씬 진단, 복선 회수 검증, 화당 6,000~8,000자 병합 후 연재본 완성.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
