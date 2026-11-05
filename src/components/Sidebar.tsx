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
  Github,
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { exportToWordDoc } from '../utils/exportWord';
import { AiSettingsConfig } from '../data/aiSettings';
import { summarizeUsage, readUsage } from '../data/usage';

// 원본 디자인(webnovel-studio.ai.studio)의 사이드바 구조를 따른다.
// 1) 브랜드, 2) 워크스페이스 카드, 3) 핵심 뷰 & 대시보드, 4) 도구 및 내보내기, 5) 진행 상태와 설정

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
  onOpenGitModal?: () => void;
  activeChapterId: string;
  aiSettings: AiSettingsConfig;
}

const SECTION_LABEL = 'text-[11px] font-bold text-slate-400 tracking-wide px-3 pt-4 pb-2';

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
  onOpenGitModal,
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
    openIssues: 0,
  };
  const p = { ...defaultProgress, ...(activeProject?.currentProgress || {}) };
  const activeProvider = aiSettings.activeProvider;
  const activeModel = aiSettings[activeProvider].model;
  // 작품 전체 페이지 수는 기획상 전체 챕터 수(24)다. 기록된 챕터 수가 아니다.
  const chapterCount = p.totalChapters || 24;
  const foreshadowCount = (activeProject?.foreshadowing || []).length;
  const diaryCount = (activeProject?.diaries || []).length;
  const reviewedCount = Object.values(activeProject?.chapters || {}).filter((c) => c.status === '검토 완료').length;
  const aiUsage = summarizeUsage(readUsage(), activeProject.id);
  const progressPct = Math.min(100, Math.round((p.episodesOrganized / Math.max(1, p.episodesTarget)) * 100));

  const coreItems = [
    {
      id: 'dashboard' as TabType,
      label: '프로젝트 대시보드',
      sub: '작품 카드와 신규 소설',
      icon: Home,
      badge: null as string | null,
      badgeClass: '',
    },
    {
      id: 'timeline' as TabType,
      label: '작품 전체',
      sub: '100화 4막 6아크 마스터 맵',
      icon: LayoutDashboard,
      badge: `${chapterCount}페이지`,
      badgeClass: '',
    },
    {
      id: 'overview' as TabType,
      label: '작품 개요',
      sub: '기본 제원 · 인물 · 세계관 · 문체',
      icon: BookOpen,
      badge: '01~05',
      badgeClass: '',
    },
    {
      id: 'chapter' as TabType,
      label: '챕터 보드',
      sub: `${activeChapterId} 씬 보드 (기승전결)`,
      icon: Layers,
      badge: reviewedCount > 0 ? '검토 완료' : '진행 중',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    },
    {
      id: 'lists' as TabType,
      label: '목록 & DB',
      sub: `복선 ${foreshadowCount}건 · 미결 ${p.openIssues}건 · 일기 ${diaryCount}편`,
      icon: ListChecks,
      badge: `${p.openIssues} 미결`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
    },
  ];

  const itemClass = (active: boolean) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
      active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
    }`;

  return (
    <aside className="w-64 lg:w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* 1. 브랜드 */}
      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>WebNovel-Studio</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">PROD</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">웹소설 창작 & 제작 플랫폼</p>
          </div>
        </div>

        {/* 2. 워크스페이스 카드 */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono tracking-wider">WORKSPACE</span>
            <span className="text-blue-400 font-bold font-mono">{activeProject.id}</span>
          </div>
          <div className="font-bold text-sm text-white mt-1.5 truncate" title={activeProject.title}>
            {activeProject.title}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={activeProject.genre}>
            {activeProject.genre}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <select
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              aria-label="작품 전환"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-blue-500"
            >
              {projects.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* 3. 핵심 뷰 & 대시보드 */}
        <div className={SECTION_LABEL}>핵심 뷰 &amp; 대시보드</div>
        <div className="space-y-1">
          {coreItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => onSelectTab(item.id)} className={itemClass(isActive)}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{item.sub}</div>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ml-2 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeClass || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. 도구 및 내보내기 */}
        <div className={SECTION_LABEL}>도구 및 내보내기</div>
        <div className="space-y-1">
          <button onClick={() => onSelectTab('ai-coach')} className={itemClass(activeTab === 'ai-coach')}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold">AI 페어 라이팅 코치</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {activeProvider.toUpperCase()} · {activeModel.split('-')[0]} · 호출 {aiUsage.calls}회
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">OPEN</span>
          </button>

          <button onClick={onOpenPdfModal} className={itemClass(false)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">기획서 PDF 뷰어</div>
                <div className="text-[10px] text-slate-400 truncate">A4 규격 공식 문서 출력</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button onClick={() => exportToWordDoc(activeProject)} className={itemClass(false)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Download className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">워드(.doc) 다운로드</div>
                <div className="text-[10px] text-slate-400 truncate">Word 호환 파일 내보내기</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button onClick={onOpenWorkspaceModal} className={itemClass(false)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderTree className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">옵시디언 워크스페이스</div>
                <div className="text-[10px] text-slate-400 truncate">1~6 폴더 트리 탐색</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {onOpenGitModal && (
            <button onClick={onOpenGitModal} className={itemClass(false)}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Github className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs">GitHub 연동 관리자</div>
                  <div className="text-[10px] text-emerald-400/80 font-mono truncate">소스 저장소 동기화</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">GIT</span>
            </button>
          )}

          <button onClick={onOpenNewProjectModal} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left bg-blue-950/40 border border-blue-500/30 text-blue-200 hover:bg-blue-900/40 hover:text-white transition-all">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold">새 웹소설 작성</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded">TEMPLATE</span>
          </button>
        </div>
      </div>

      {/* 5. 진행 상태와 설정 */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <div className="text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>진행 중</span>
            </span>
            <span className="font-bold text-white font-mono text-[10px] truncate max-w-[150px]">
              {p.currentChapter} 「{p.currentChapterTitle}」
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{p.episodesOrganized} / {p.episodesTarget}화 비축</span>
            <span>{progressPct}%</span>
          </div>
        </div>

        <button
          onClick={onOpenSettingsModal}
          className="w-full py-2 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center justify-between text-xs font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">설정 (AI 모델 &amp; API)</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            {activeProvider === 'claude' ? '소넷 5.5' : activeProvider === 'openai' ? 'sol 6.1' : '3.8 Flash'}
          </span>
        </button>
      </div>
    </aside>
  );
};
