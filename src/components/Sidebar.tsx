import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  ListChecks,
  Bot,
  FileText,
  Download,
  FolderTree,
  ChevronRight,
  Sparkles,
  Settings,
  PlusCircle,
  Home,
  Check
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { exportToWordDoc } from '../utils/exportWord';
import { AiSettingsConfig } from '../data/aiSettings';

export type TabType = 'dashboard' | 'timeline' | 'overview' | 'chapter' | 'lists' | 'new-project' | 'ai-coach';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeProject: WebNovelProject;
  projects: WebNovelProject[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPdfModal: () => void;
  onToggleAiCoach: () => void;
  isAiCoachOpen: boolean;
  onOpenWorkspaceModal: () => void;
  activeChapterId: string;
  aiSettings: AiSettingsConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeProject,
  projects,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettingsModal,
  onOpenPdfModal,
  onToggleAiCoach,
  isAiCoachOpen,
  onOpenWorkspaceModal,
  activeChapterId,
  aiSettings,
}) => {
  const defaultProgress = {
    currentChapter: 'ch01',
    currentChapterTitle: '서막의 시작',
    nextStep: '1단계 씬 집필 착수',
    episodesOrganized: 0,
    episodesTarget: 100,
    totalWordCount: 0,
    completedChapters: 0,
    totalChapters: 24,
  };
  const p = { ...defaultProgress, ...(activeProject?.currentProgress || {}) };
  const activeProvider = aiSettings.activeProvider;
  const activeModel = aiSettings[activeProvider].model;

  const navItems = [
    {
      id: 'timeline' as TabType,
      label: '작품보기',
      subLabel: '100화 4막 6아크 마스터 맵',
      icon: LayoutDashboard,
      badge: `${activeProject.arcs.length}아크`
    },
    {
      id: 'overview' as TabType,
      label: '작품 개요',
      subLabel: '기본 제원 · 인물 · 세계관 · 문체',
      icon: BookOpen,
      badge: '01~05'
    },
    {
      id: 'chapter' as TabType,
      label: '챕터 보드',
      subLabel: `${activeChapterId} 씬 보드 (기승전결)`,
      icon: Layers,
      badge: activeChapterId === 'ch04' ? '집필 중' : '검토 완료',
      badgeColor: activeChapterId === 'ch04' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'lists' as TabType,
      label: '목록 & DB',
      subLabel: `복선 ${activeProject.foreshadowing.length}건 · 미결 ${p.openIssues}건`,
      icon: ListChecks,
      badge: `${p.openIssues} 미결`,
      badgeColor: 'bg-rose-100 text-rose-700'
    }
  ];

  return (
    <aside className="w-64 lg:w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 select-none">
      
      {/* 1. Brand Logo */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>WebNovel-Studio</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                PROD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">웹소설 창작 & 제작 플랫폼</p>
          </div>
        </div>

        {/* 2. 대시보드 메뉴 (로고 바로 밑에 배치) */}
        <div className="mt-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Home className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-blue-400'}`} />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">대시보드</div>
                <div className={`text-[10px] truncate ${activeTab === 'dashboard' ? 'text-blue-100' : 'text-slate-400'}`}>
                  프로젝트 관제 및 신규 소설
                </div>
              </div>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ml-1.5 ${
              activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300'
            }`}>
              HOME
            </span>
          </button>
        </div>

        {/* 3. Workspace Card - 현재 작업 중인 웹소설 제목 반영 */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 relative group">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>WORKSPACE</span>
            </span>
            <span className="text-blue-400 font-bold font-mono">[{activeProject.id}]</span>
          </div>

          {/* Current Novel Title */}
          <div className="font-bold text-xs text-white mt-1 truncate" title={activeProject.title}>
            {activeProject.title}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {activeProject.genre}
          </div>

          {/* Project Switcher Select */}
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <select
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3.5 새로운 웹소설 작성하기 메뉴 (Workspace 카드뷰 바로 밑 & 작품 집필뷰어 사이) */}
        <div className="mt-3">
          <button
            onClick={() => onSelectTab('new-project')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group shadow-sm ${
              activeTab === 'new-project'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold ring-2 ring-blue-400/40 shadow-blue-900/40'
                : 'bg-gradient-to-r from-blue-950/70 via-slate-800/90 to-indigo-950/70 border border-blue-500/30 text-blue-100 hover:border-blue-400 hover:text-white hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-4 h-4 text-blue-300 group-hover:text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">새로운 웹소설 작성하기</div>
                <div className="text-[10px] text-blue-200/70 truncate">100화 공학적 템플릿 기획</div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/40 shrink-0">
              NEW
            </span>
          </button>
        </div>
      </div>

      {/* 4. Main GNB Navigation Menu */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider px-3 py-1.5 flex justify-between items-center">
          <span>작품 집필 뷰어</span>
          <span className="text-[9px] text-slate-500 font-normal">선택된 소설 연동</span>
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.subLabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ml-1.5 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.badgeColor || 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Tools Section */}
        <div className="pt-3 mt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider px-3 py-1.5">
            도구 및 내보내기
          </div>

          {/* New Web Novel Creation Quick Action */}
          <button
            onClick={onOpenNewProjectModal}
            className="w-full flex items-center justify-between p-2 rounded-lg text-left bg-blue-950/40 border border-blue-500/30 text-blue-200 hover:bg-blue-900/40 hover:text-white transition-all mb-1.5"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold">+ 새로운 웹소설 작성</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded">
              TEMPLATE
            </span>
          </button>

          <button
            onClick={() => onSelectTab('ai-coach')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
              activeTab === 'ai-coach'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-md shadow-indigo-900/40 ring-1 ring-indigo-400/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs">AI 페어 라이팅 코치</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {activeProvider.toUpperCase()} · {activeModel.split('-')[0]}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              AI
            </span>
          </button>

          <button
            onClick={onOpenPdfModal}
            className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-xs">기획서 PDF 뷰어</div>
                <div className="text-[10px] text-slate-400">A4 규격 공식 문서 출력</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => exportToWordDoc(activeProject)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs">워드(.doc) 다운로드</div>
                <div className="text-[10px] text-slate-400">Word 호환 파일 내보내기</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={onOpenWorkspaceModal}
            className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
          >
            <div className="flex items-center gap-2.5">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs">옵시디언 워크스페이스</div>
                <div className="text-[10px] text-slate-400">1~6 폴더 트리 탐색</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 5. GNB 하단 영역: 진행도 & [설정 메뉴] (AI 모델/API 등록) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        
        {/* Active novel progress bar */}
        <div className="text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>진행 중</span>
            </span>
            <span className="font-bold text-white font-mono text-[10px] truncate max-w-[120px]">
              {p.currentChapter} 「{p.currentChapterTitle}」
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (p.episodesOrganized / p.episodesTarget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{p.episodesOrganized} / {p.episodesTarget}화 비축</span>
            <span>{Math.round((p.episodesOrganized / p.episodesTarget) * 100)}%</span>
          </div>
        </div>

        {/* 6. 좌측 GNB 최하단 설정 메뉴 (클로드, 챗GPT, 제미나이 API 등록) */}
        <button
          onClick={onOpenSettingsModal}
          className="w-full py-2 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center justify-between text-xs font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">설정 (AI 모델 & API)</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            {activeProvider === 'claude' ? '소넷 5.5' : activeProvider === 'openai' ? 'sol 6.1' : '3.8 Flash'}
          </span>
        </button>

      </div>
    </aside>
  );
};
