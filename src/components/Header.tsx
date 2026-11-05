import {
  FileText,
  Download,
  Bot,
  Settings,
  PlusCircle,
  Menu,
  ChevronRight,
  Sparkles,
  BookOpen,
  Layers,
  ListChecks,
  Edit3,
  Github
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { AiSettingsConfig } from '../data/aiSettings';
import { exportToWordDoc } from '../utils/exportWord';

interface HeaderProps {
  activeTabTitle: string;
  activeProject: WebNovelProject;
  projects?: WebNovelProject[];
  aiSettings?: AiSettingsConfig;
  isDashboard?: boolean;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  onOpenPdfModal: () => void;
  onToggleAiCoach: () => void;
  isAiCoachOpen: boolean;
  onOpenWorkspaceModal: () => void;
  onOpenNewProjectModal?: () => void;
  onOpenSettingsModal?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenMetricEditModal?: (metricKey?: string, project?: WebNovelProject) => void;
  onOpenGitModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTabTitle,
  activeProject,
  projects = [],
  aiSettings,
  isDashboard = false,
  activeTab = 'timeline',
  onSelectTab,
  onOpenPdfModal,
  onToggleAiCoach,
  isAiCoachOpen,
  onOpenWorkspaceModal,
  onOpenNewProjectModal,
  onOpenSettingsModal,
  onToggleMobileMenu,
  onOpenMetricEditModal,
  onOpenGitModal,
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
    currentChapterScenesDone: 0,
    currentChapterScenesTotal: 10,
    chapterForeshadowingResolved: 0,
    chapterForeshadowingTotal: 2,
    openIssues: 0,
  };
  const p = { ...defaultProgress, ...(activeProject?.currentProgress || {}) };

  // Aggregated global stats for overall dashboard header
  const totalProjectsCount = projects.length || 1;
  const totalReservedEpisodes = projects.reduce((acc, proj) => acc + (proj.currentProgress?.episodesOrganized ?? 0), 0);
  const totalWords = projects.reduce((acc, proj) => acc + (proj.currentProgress?.totalWordCount ?? 0), 0);
  const totalCompletedChapters = projects.reduce((acc, proj) => acc + (proj.currentProgress?.completedChapters ?? 0), 0);
  const totalChaptersTarget = projects.reduce((acc, proj) => acc + (proj.currentProgress?.totalChapters ?? 24), 0);
  const totalOpenIssues = projects.reduce((acc, proj) => acc + (proj.currentProgress?.openIssues ?? 0), 0);
  const totalForeshadowingResolved = projects.reduce((acc, proj) => acc + (proj.currentProgress?.chapterForeshadowingResolved ?? 0), 0);
  const totalForeshadowingTotal = projects.reduce((acc, proj) => acc + (proj.currentProgress?.chapterForeshadowingTotal ?? 1), 0);
  const avgRecovery = Math.round((totalForeshadowingResolved / Math.max(1, totalForeshadowingTotal)) * 100);

  if (isDashboard) {
    return (
      <header className="space-y-4 pb-4 border-b border-slate-200">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="md:hidden p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                title="사이드바 열기"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-mono">
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                [전체 관제소]
              </span>
              <span>WebNovel-Studio</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold font-sans">전체 웹소설 종합 대시보드</span>
            </div>

            <span className="bg-blue-50 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-200 ml-1">
              종합 관제 모드 — 멀티 작품 실시간 연동
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenNewProjectModal && (
              <button
                onClick={onOpenNewProjectModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition-colors cursor-pointer"
                title="새로운 웹소설 프로젝트 작성"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>새 소설 기획 추가</span>
              </button>
            )}

            <button
              onClick={onOpenPdfModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
              title="A4 규격 공식 기획서 PDF 출력"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>기획서 PDF</span>
            </button>

            <button
              onClick={() => exportToWordDoc(activeProject)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
              title="마이크로소프트 워드(.doc) 규격 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>워드(.doc)</span>
            </button>

            {onOpenGitModal && (
              <button
                onClick={onOpenGitModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
                title="GitHub 레포지토리 푸시 & 소스코드 ZIP 다운로드"
              >
                <Github className="w-3.5 h-3.5 text-slate-700" />
                <span>GitHub</span>
              </button>
            )}

            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
                title="AI 모델 & API 키 설정 (클로드, 챗GPT, 제미나이)"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>설정</span>
              </button>
            )}

            <button
              onClick={() => (onSelectTab ? onSelectTab('ai-coach') : onToggleAiCoach())}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer ${
                activeTab === 'ai-coach' || isAiCoachOpen
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-blue-300 ring-2 ring-blue-400/40'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
              title="AI 페어 라이팅 코치 웹페이지"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI 코치</span>
            </button>
          </div>
        </div>

        {/* Subtitle Breadcrumb Note */}
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          현재 등록된 총 <strong className="text-slate-900 font-bold">{totalProjectsCount}편</strong>의 웹소설 프로젝트를 통합 관리 중입니다. 누적 비축 <strong className="text-slate-900 font-bold">{totalReservedEpisodes}화</strong>, 총 집필 <strong className="text-slate-900 font-bold">{totalWords.toLocaleString()}자</strong>가 작성되었습니다. 활성 워크스페이스: <span className="text-blue-600 font-bold font-mono">《{activeProject.title}》</span>
        </p>

        {/* 6 Key Global Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div
            onClick={() => onOpenMetricEditModal?.('episodesOrganized', activeProject)}
            className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
            title="클릭하여 전체 소설 관리 및 수치 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
              <span>총 관리 소설</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-base font-extrabold text-slate-900 my-0.5 tabular-nums">
              {totalProjectsCount} <span className="text-xs font-normal text-slate-400">편</span>
            </div>
            <div className="text-[10px] text-blue-600 font-medium group-hover:underline">클릭하여 확인/편집</div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('episodesOrganized', activeProject)}
            className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
            title="클릭하여 누적 비축 분량 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
              <span>누적 비축 분량</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-base font-extrabold text-slate-900 my-0.5 tabular-nums">
              {totalReservedEpisodes} <span className="text-xs font-normal text-slate-400">화</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium group-hover:underline">클릭하여 확인/편집</div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('totalWordCount', activeProject)}
            className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
            title="클릭하여 총 집필 글자수 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
              <span>총 집필 글자수</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-base font-extrabold text-slate-900 my-0.5 tabular-nums">
              {totalWords.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('completedChapters', activeProject)}
            className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
            title="클릭하여 완결 검토 챕터 수치 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
              <span>완결 검토 챕터</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-base font-extrabold text-indigo-600 my-0.5 tabular-nums">
              {totalCompletedChapters} <span className="text-xs font-normal text-slate-400">/ {totalChaptersTarget}</span>
            </div>
            <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('chapterForeshadowingResolved', activeProject)}
            className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
            title="클릭하여 복선 회수율 확인 및 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
              <span>평균 복선 회수율</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-base font-extrabold text-amber-600 my-0.5 tabular-nums">
              {avgRecovery}%
            </div>
            <div className="text-[10px] text-amber-600 font-medium group-hover:underline">클릭하여 확인/편집</div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('openIssues', activeProject)}
            className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
            title="클릭하여 열린 미결 과제 수치 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
              <span>전체 열린 미결</span>
              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-base font-extrabold text-rose-600 my-0.5 tabular-nums">
              {totalOpenIssues} <span className="text-xs font-normal text-slate-400">건</span>
            </div>
            <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="space-y-4 pb-4 border-b border-slate-200">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Responsive Breadcrumbs */}
        <div className="flex items-start gap-2.5 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden mt-0.5 p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
              title="사이드바 열기"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-col gap-1 min-w-0">
            {/* 1st Line: Project ID & Project Title */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-mono flex-wrap">
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                [{activeProject.id}]
              </span>
              <span className="text-slate-700 font-semibold truncate max-w-[280px] sm:max-w-md">
                {activeProject.title}
              </span>
            </div>

            {/* 2nd Line (한칸 아래): 1번째 svg (Chevron) & 3번째 span (Tab Title) */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-900 font-extrabold font-sans">
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{activeTabTitle}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenNewProjectModal && (
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-md bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 shadow-2xs transition-colors"
              title="새로운 웹소설 프로젝트 작성"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>새 소설</span>
            </button>
          )}

          <button
            onClick={onOpenPdfModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
            title="A4 규격 공식 기획서 PDF 출력"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>기획서 PDF</span>
          </button>

          <button
            onClick={() => exportToWordDoc(activeProject)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
            title="마이크로소프트 워드(.doc) 규격 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>워드(.doc)</span>
          </button>

          {onOpenGitModal && (
            <button
              onClick={onOpenGitModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
              title="GitHub 레포지토리 푸시 & 소스코드 ZIP 다운로드"
            >
              <Github className="w-3.5 h-3.5 text-slate-700" />
              <span>GitHub</span>
            </button>
          )}

          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
              title="AI 모델 & API 키 설정 (클로드, 챗GPT, 제미나이)"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>설정</span>
            </button>
          )}

          <button
            onClick={() => (onSelectTab ? onSelectTab('ai-coach') : onToggleAiCoach())}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer ${
              activeTab === 'ai-coach' || isAiCoachOpen
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-blue-300 ring-2 ring-blue-400/40'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title="AI 페어 라이팅 코치 웹페이지"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI 코치</span>
          </button>
        </div>
      </div>

      {/* Subtitle Breadcrumb Note */}
      <p className="text-xs text-slate-600 font-medium leading-relaxed">
        <strong className="text-slate-900 font-bold">{p.currentChapter} 「{p.currentChapterTitle}」</strong> 씬 집필 중 — 다음은 {p.nextStep}, 앞 챕터 복선 {p.chapterForeshadowingTotal}개 중 {p.chapterForeshadowingResolved}개를 회수했어요. 오픈 비축 {p.episodesTarget}화까지 {Math.max(0, p.episodesTarget - p.episodesOrganized)}화 남았어요.
      </p>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div
          onClick={() => onOpenMetricEditModal?.('episodesOrganized', activeProject)}
          className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
          title="클릭하여 편성된 화수 및 비축 목표 편집"
        >
          <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <span>편성된 화</span>
            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-base font-extrabold text-slate-900 my-0.5 tabular-nums">
            {p.episodesOrganized} <span className="text-xs font-normal text-slate-400">/ {p.episodesTarget}화</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium group-hover:underline">클릭하여 확인/편집</div>
        </div>

        <div
          onClick={() => onOpenMetricEditModal?.('totalWordCount', activeProject)}
          className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
          title="클릭하여 연재본 분량(글자수) 편집"
        >
          <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <span>연재본 분량</span>
            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-base font-extrabold text-slate-900 my-0.5 tabular-nums">
            {p.totalWordCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
        </div>

        <div
          onClick={() => onOpenMetricEditModal?.('completedChapters', activeProject)}
          className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
          title="클릭하여 완결 검토 챕터 수 편집"
        >
          <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <span>검토 끝난 챕터</span>
            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-base font-extrabold text-emerald-600 my-0.5 tabular-nums">
            {p.completedChapters} <span className="text-xs font-normal text-slate-400">/ {p.totalChapters}</span>
          </div>
          <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
        </div>

        <div
          onClick={() => onOpenMetricEditModal?.('currentChapter', activeProject)}
          className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
          title="클릭하여 지금 챕터 씬 집필 현황 편집"
        >
          <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <span>지금 챕터 씬 ({p.currentChapter})</span>
            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-base font-extrabold text-blue-600 my-0.5 tabular-nums">
            {p.currentChapterScenesDone} <span className="text-xs font-normal text-slate-400">/ {p.currentChapterScenesTotal}</span>
          </div>
          <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
        </div>

        <div
          onClick={() => onOpenMetricEditModal?.('chapterForeshadowingResolved', activeProject)}
          className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
          title="클릭하여 복선 회수 현황 편집"
        >
          <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <span>이번 챕터 복선 회수</span>
            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-base font-extrabold text-slate-900 my-0.5 tabular-nums">
            {p.chapterForeshadowingResolved} <span className="text-xs font-normal text-slate-400">/ {p.chapterForeshadowingTotal}</span>
          </div>
          <div className="text-[10px] text-amber-600 font-medium group-hover:underline">클릭하여 확인/편집</div>
        </div>

        <div
          onClick={() => onOpenMetricEditModal?.('openIssues', activeProject)}
          className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center flex flex-col justify-between cursor-pointer group relative"
          title="클릭하여 열린 미결 과제 건수 편집"
        >
          <div className="text-[11px] text-slate-400 group-hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors">
            <span>열린 미결</span>
            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-base font-extrabold text-rose-600 my-0.5 tabular-nums">
            {p.openIssues}
          </div>
          <div className="text-[10px] text-slate-400 group-hover:text-blue-600 group-hover:underline">클릭하여 확인/편집</div>
        </div>
      </div>

      {/* 4 Sub-Tabs Matching Image 1 (/public/assets/aistudio/image_141f4eb0.png) */}
      {onSelectTab && (
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 border-t border-slate-200">
          <button
            onClick={() => onSelectTab('timeline')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>100화 마스터 타임라인 (4막 · 6아크)</span>
          </button>

          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>작품 개요 & 100화 템플릿 구조</span>
          </button>

          <button
            onClick={() => onSelectTab('chapter')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'chapter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>챕터 보드 & 씬 집필/AI 코칭 ({p.currentChapter})</span>
          </button>

          <button
            onClick={() => onSelectTab('lists')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'lists'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>복선 DB & 미결 과제 체크리스트</span>
          </button>
        </div>
      )}
    </header>
  );
};
