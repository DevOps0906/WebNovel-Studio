import React from 'react';
import {
  Menu,
  Settings,
  Sparkles,
  Bot,
  FileText,
  Download,
  FolderTree,
  PlusCircle,
  User,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  Github
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { AiSettingsConfig } from '../data/aiSettings';
import { exportToWordDoc } from '../utils/exportWord';

interface TopGnbProps {
  userEmail?: string;
  activeProject: WebNovelProject;
  projects: WebNovelProject[];
  aiSettings: AiSettingsConfig;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPdfModal: () => void;
  onToggleAiCoach: () => void;
  isAiCoachOpen: boolean;
  onOpenWorkspaceModal: () => void;
  onToggleMobileMenu?: () => void;
  onOpenGitModal?: () => void;
}

export const TopGnb: React.FC<TopGnbProps> = ({
  userEmail = 'skydy96@gmail.com',
  activeProject,
  projects,
  aiSettings,
  activeTab,
  onSelectTab,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettingsModal,
  onOpenPdfModal,
  onToggleAiCoach,
  isAiCoachOpen,
  onOpenWorkspaceModal,
  onToggleMobileMenu,
  onOpenGitModal,
}) => {
  const activeProvider = aiSettings.activeProvider;
  const activeModelName = aiSettings[activeProvider].model;

  const getProviderBadge = () => {
    switch (activeProvider) {
      case 'claude':
        return { label: 'Claude sonnect-5.5', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'openai':
        return { label: 'OpenAI sol 6.1', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'gemini':
      default:
        return { label: 'Gemini 3.8 Flash', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
    }
  };

  const badge = getProviderBadge();

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto h-14 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Toggle & Studio Title & Active Project Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="사이드바 메뉴"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Direct Active Novel Title & Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-blue-300 hover:text-blue-200 font-bold border border-slate-700 transition-colors text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="max-w-[220px] sm:max-w-md truncate">《{activeProject.title}》</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            
            {/* Dropdown for quick project switch */}
            <div className="absolute left-0 top-full mt-1 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                작업 소설 전환
              </div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    p.id === activeProject.id ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{p.title}</span>
                  {p.id === activeProject.id && <span className="text-[10px] text-blue-400">선택됨</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right: Functional Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* New Novel Button */}
          <button
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="새로운 웹소설 템플릿 프로젝트 생성"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새 소설 작성</span>
          </button>

          {/* Planning PDF */}
          <button
            onClick={onOpenPdfModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
            title="A4 공식 기획서 PDF 뷰어"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>기획서 PDF</span>
          </button>

          {/* Word Export */}
          <button
            onClick={() => exportToWordDoc(activeProject)}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
            title="마이크로소프트 워드(.doc) 규격 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>워드(.doc)</span>
          </button>

          {/* Workspace File Tree */}
          <button
            onClick={onOpenWorkspaceModal}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
            title="옵시디언 6대 표준 파일트리"
          >
            <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
            <span>파일트리</span>
          </button>

          {/* AI Pair Writer Coach */}
          <button
            onClick={() => (onSelectTab ? onSelectTab('ai-coach') : onToggleAiCoach())}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai-coach' || isAiCoachOpen
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-blue-500/20 ring-1 ring-blue-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="AI 페어 라이팅 코치 웹페이지"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI 코치</span>
          </button>

          {/* Active AI Model Badge */}
          <div
            onClick={onOpenSettingsModal}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border cursor-pointer hover:brightness-110 transition-all ${badge.color}`}
            title="AI 설정 열기"
          >
            <Sparkles className="w-3 h-3" />
            <span>{badge.label}</span>
          </div>

          {/* GitHub Sync & Export Button */}
          {onOpenGitModal && (
            <button
              onClick={onOpenGitModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="GitHub 레포지토리 푸시 & 전체 소스 ZIP 다운로드"
            >
              <Github className="w-3.5 h-3.5 text-slate-200" />
              <span className="hidden sm:inline text-xs font-semibold">GitHub</span>
            </button>
          )}

          {/* Settings Icon */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
            title="AI 모델 & API 설정 (클로드, 챗GPT, 제미나이)"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline text-xs">설정</span>
          </button>

          {/* Logged-In User Profile */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-xs ring-1 ring-white/20">
              S
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {userEmail.split('@')[0]}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 leading-tight font-mono">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Google 로그인 연동
              </span>
            </div>
          </div>

        </div>

      </div>
    </nav>
  );
};
