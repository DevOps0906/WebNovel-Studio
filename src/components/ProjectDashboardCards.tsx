import React from 'react';
import {
  PlusCircle,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  Flame,
  Crown,
  Sword,
  Bot,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { AiSettingsConfig } from '../data/aiSettings';

interface ProjectDashboardCardsProps {
  projects: WebNovelProject[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettingsModal?: () => void;
  aiSettings?: AiSettingsConfig;
  onOpenMetricEditModal?: (metricKey?: string, project?: WebNovelProject) => void;
}

export const ProjectDashboardCards: React.FC<ProjectDashboardCardsProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettingsModal,
  aiSettings,
  onOpenMetricEditModal,
}) => {
  const [selectedCardId, setSelectedCardId] = React.useState<string>(activeProjectId);

  React.useEffect(() => {
    if (activeProjectId) {
      setSelectedCardId(activeProjectId);
    }
  }, [activeProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedCardId) || projects.find((p) => p.id === activeProjectId) || projects[0];

  const getTemplateBadge = (type: string) => {
    switch (type) {
      case 'chaebol':
        return {
          label: '재벌 복수극 템플릿',
          icon: Crown,
          style: 'text-amber-800 bg-amber-50/90 border-amber-300',
        };
      case 'hunter':
        return {
          label: '현대 헌터/성좌 템플릿',
          icon: Sword,
          style: 'text-blue-700 bg-blue-50/90 border-blue-300',
        };
      case 'romfantasy':
        return {
          label: '로맨스 판타지 템플릿',
          icon: Sparkles,
          style: 'text-rose-700 bg-rose-50/90 border-rose-300',
        };
      case 'wuxia':
        return {
          label: '정통 무협 템플릿',
          icon: Flame,
          style: 'text-orange-700 bg-orange-50/90 border-orange-300',
        };
      default:
        return {
          label: '자유 설계 템플릿',
          icon: Layers,
          style: 'text-emerald-700 bg-emerald-50/90 border-emerald-300',
        };
    }
  };

  const totalWords = projects.reduce((acc, p) => acc + (p.currentProgress?.totalWordCount ?? 0), 0);
  const totalReservedEpisodes = projects.reduce((acc, p) => acc + (p.currentProgress?.episodesOrganized ?? 0), 0);
  
  const activeProvider = aiSettings?.activeProvider || 'gemini';
  const getProviderDisplay = () => {
    switch (activeProvider) {
      case 'claude':
        return 'CLAUDE · sonnect-5.5';
      case 'openai':
        return 'OPENAI · sol 6.1';
      case 'gemini':
      default:
        return 'GEMINI · 3.8 Flash';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Dark Gradient Hero Banner (User requested to restore previous beautiful color design) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                WebNovel-Studio 관제 센터
              </span>
              <span className="text-xs text-slate-400">
                11단계 공학적 웹소설 집필 시스템
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              웹소설 창작 프로젝트 대시보드
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              장르별 공학적 템플릿으로 신규 웹소설을 손쉽게 착수하고, 4막 6아크 24챕터 100화 완결 파이프라인으로 체계적인 집필을 이어가세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewProjectModal}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새로운 웹소설 작성하기</span>
            </button>

            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue-400" />
                <span>AI API 설정</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Key Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800/80">
          <div
            onClick={() => onOpenMetricEditModal?.('episodesOrganized', selectedProject)}
            className="bg-slate-900/70 hover:bg-slate-800/90 p-3 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
            title="클릭하여 전체 웹소설 현황 확인 및 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-300 flex items-center justify-between transition-colors">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>총 관리 소설</span>
              </span>
              <span className="text-[10px] text-blue-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">편집</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {projects.length} <span className="text-xs font-normal text-slate-400">편</span>
            </div>
            <div className="text-[10px] text-slate-400 group-hover:text-blue-300 transition-colors mt-0.5">
              클릭하여 지표 확인/편집
            </div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('episodesOrganized', selectedProject)}
            className="bg-slate-900/70 hover:bg-slate-800/90 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
            title="클릭하여 누적 비축 화수 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-emerald-300 flex items-center justify-between transition-colors">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>누적 비축 화수</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">편집</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {totalReservedEpisodes} <span className="text-xs font-normal text-slate-400">화</span>
            </div>
            <div className="text-[10px] text-emerald-400/80 group-hover:text-emerald-300 transition-colors mt-0.5">
              클릭하여 화수 수치 편집
            </div>
          </div>

          <div
            onClick={() => onOpenMetricEditModal?.('totalWordCount', selectedProject)}
            className="bg-slate-900/70 hover:bg-slate-800/90 p-3 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
            title="클릭하여 총 집필 글자수 편집"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-amber-300 flex items-center justify-between transition-colors">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>총 집필 글자수</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">편집</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
              {totalWords.toLocaleString()} <span className="text-xs font-normal text-slate-400">자</span>
            </div>
            <div className="text-[10px] text-amber-400/80 group-hover:text-amber-300 transition-colors mt-0.5">
              클릭하여 글자수 수치 편집
            </div>
          </div>

          <div
            onClick={onOpenSettingsModal}
            className="bg-slate-900/70 hover:bg-slate-800/90 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
            title="클릭하여 AI API 모델 설정 변경"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-indigo-300 flex items-center justify-between transition-colors">
              <span className="flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>활성 AI 엔진</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">설정</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-indigo-300 font-mono mt-1 truncate">
              {getProviderDisplay()}
            </div>
            <div className="text-[10px] text-slate-400 group-hover:text-indigo-300 transition-colors mt-1">
              클릭하여 모델 및 API 변경
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Row: Project Cards Grid (Exact Style from /public/assets/aistudio/image_f7295ae6.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const isSelected = project.id === selectedCardId;
          const isWorkspaceActive = project.id === activeProjectId;
          const badge = getTemplateBadge(project.templateType);
          const BadgeIcon = badge.icon;
          const prog = project.currentProgress || { episodesOrganized: 0, episodesTarget: 100, currentChapter: 'ch01' };
          const targetEp = Math.max(1, prog.episodesTarget || 100);
          const pct = Math.min(100, Math.round(((prog.episodesOrganized || 0) / targetEp) * 100));

          return (
            <div
              key={project.id}
              onClick={() => setSelectedCardId(project.id)}
              className={`rounded-2xl p-5 transition-all cursor-pointer border flex flex-col justify-between shadow-2xs relative ${
                isSelected
                  ? 'bg-white border-2 border-blue-600 ring-4 ring-blue-500/20 shadow-md scale-[1.01]'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Top Row Badges (Matching Screenshot) */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.style}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isWorkspaceActive && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs font-sans">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>작업 중</span>
                      </span>
                    )}
                    {isSelected && !isWorkspaceActive && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                        <span>활성화됨</span>
                      </span>
                    )}
                    {!isSelected && !isWorkspaceActive && (
                      <span className="text-xs text-slate-400 font-mono">
                        [{project.id}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {project.subtitle}
                  </p>
                </div>

                {/* Synopsis Snippet Box (Light rounded box with text snippet) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[52px]">
                  {project.coreConcept.logline}
                </div>

                {/* Progress Bar & Counter (Clickable to Edit) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMetricEditModal?.('episodesOrganized', project);
                  }}
                  className="space-y-1.5 pt-1 p-2 rounded-xl hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-300 transition-all cursor-pointer group/progress"
                  title="클릭하여 비축 화수 및 목표 편집하기"
                >
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1 group-hover/progress:text-blue-600 transition-colors">
                      <span>오픈 비축 진행도</span>
                      <Edit3 className="w-2.5 h-2.5 text-blue-500 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover/progress:opacity-100 transition-opacity underline">
                        수치 편집
                      </span>
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {prog.episodesOrganized}/{prog.episodesTarget}화 ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSelected ? 'bg-blue-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Info & '선택하기' Action Button */}
              <div className="pt-3.5 mt-3.5 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    필명: <strong className="text-slate-800 font-semibold">{project.penName}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isSelected ? (
                      <span className="text-blue-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        카드 활성화 상태
                      </span>
                    ) : (
                      '클릭하여 카드 활성화'
                    )}
                  </span>
                </div>

                {/* Dedicated '선택하기' button: Only clicking this navigates to 작품보기 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(project.id);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300'
                  }`}
                  title={`《${project.title}》 선택하여 작품보기 메뉴로 이동`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>선택하기</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                    isSelected ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    작품보기로 이동
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 활성화된 카드 선택 확인 및 바로가기 액션 바 */}
      {selectedProject && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  현재 활성화된 소설
                </span>
                <span className="text-[11px] font-mono text-slate-500">[{selectedProject.id}]</span>
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5">
                《{selectedProject.title}》
                <span className="text-xs font-normal text-slate-500 ml-2 font-mono">
                  (필명: {selectedProject.penName} · {selectedProject.genre})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectProject(selectedProject.id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>선택하기 (작품보기 메뉴로 이동)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Bottom Row: Dotted "+ 새로운 웹소설 기획 추가" Card (Underneath project cards as in image_f7295ae6.png) */}
      <div className="pt-1">
        <div
          onClick={onOpenNewProjectModal}
          className="w-full sm:w-80 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-11 h-11 rounded-full border border-slate-300 group-hover:border-blue-600 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors mb-2.5 bg-slate-50 group-hover:bg-blue-50">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
            새로운 웹소설 기획 추가
          </span>
          <span className="text-xs text-slate-400 mt-1">
            100화 4막·6아크 공학적 템플릿 자동 생성
          </span>
        </div>
      </div>

      {/* 4. 하단 상세 정보: 현재 집필 중인 작품 종합 인텔리전스 & 연재 관제 분석 */}
      <div className="pt-6 border-t border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>현재 집필 중인 작품 상세 관제 & 연재 인텔리전스</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              11단계 공학적 집필 파이프라인 진척도, 비축 화수 방어율, 차기 챕터 클리프행어 및 복선 회수 계획을 실시간으로 추적합니다.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            실시간 연재 방어율 분석
          </span>
        </div>

        {/* 3-Column Detailed Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Card 1: 작품별 11단계 집필 파이프라인 진행 상태 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>11단계 파이프라인 진척도</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">01발상 ~ 11아크검토</span>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProjectId;
                const stagesDone = proj.id === 'hunter-sovereign' ? 8 : proj.id === 'bj-sister' ? 9 : 7;
                const pct = Math.round((stagesDone / 11) * 100);
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (onOpenMetricEditModal) {
                        onOpenMetricEditModal('completedChapters', proj);
                      } else {
                        onSelectProject(proj.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`클릭하여 《${proj.title}》 11단계 파이프라인 편집하기`}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-300'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-blue-50/40 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <span className={`font-extrabold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                          {proj.title}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
                            현재
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 font-semibold shrink-0">
                        <span>{stagesDone}/11단계 ({pct}%)</span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSelected ? 'bg-blue-600' : 'bg-slate-500 group-hover:bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>현재: {proj.currentProgress?.currentChapter || 'ch01'} 씬 집필</span>
                      <span className="text-blue-600 font-bold group-hover:underline">클릭하여 편집하기 ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: 주간 연재 세이프티 마진 & 비축 화수 방어율 (CSS selector 1) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>비축 화수 & 주간 연재 세이프티</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                주 5일 연재 기준
              </span>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProjectId;
                const reserved = proj.currentProgress?.episodesOrganized ?? 0;
                // Weekly safety margin (episodes / 5 episodes per week)
                const weeks = (reserved / 5).toFixed(1);
                const safetyPercent = Math.min(100, Math.round((reserved / 15) * 100));
                const statusColor = reserved >= 10 ? 'text-emerald-600' : reserved >= 6 ? 'text-blue-600' : 'text-amber-600';
                const statusLabel = reserved >= 10 ? '매우 안전 (2주+ 여유)' : reserved >= 6 ? '안전 (1주+ 여유)' : '주의 (비축 확보 요망)';

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (onOpenMetricEditModal) {
                        onOpenMetricEditModal('episodesOrganized', proj);
                      } else {
                        onSelectProject(proj.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`클릭하여 《${proj.title}》 비축 화수 집필 및 타임라인 편집하기`}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-slate-50 border-slate-100 hover:bg-emerald-50/30 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <span className={`font-bold truncate ${isSelected ? 'text-emerald-800' : 'text-slate-800 group-hover:text-emerald-700'}`}>
                          {proj.title}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
                            작업 중
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${statusColor}`}>{statusLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>비축: <strong className="text-slate-800">{reserved}화</strong></span>
                      <span>연재 유지: <strong className="text-slate-800">{weeks}주</strong></span>
                      <span>방어율: <strong className={statusColor}>{safetyPercent}%</strong></span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-200/60 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">목표: 40화 (오픈 세이프티)</span>
                      <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                        즉시 집필/수치 편집
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: 차기 챕터 핵심 클리프행어 및 복선 회수 계획 (CSS selector 3) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>차기 챕터 클리프행어 & 복선</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">플롯 긴장도 최고점</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Hunter Sovereign */}
              <div
                onClick={() => {
                  const proj = projects.find((p) => p.id === 'hunter-sovereign') || selectedProject;
                  if (onOpenMetricEditModal) {
                    onOpenMetricEditModal('currentChapter', proj);
                  } else {
                    onSelectProject('hunter-sovereign');
                  }
                }}
                role="button"
                tabIndex={0}
                title="클릭하여 《F급 성좌는 랭커들을 조련한다》 클리프행어 씬 편집하기"
                className={`p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                  activeProjectId === 'hunter-sovereign'
                    ? 'border-blue-400 bg-blue-50/60 shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-blue-50/30 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-blue-900 mb-1">
                  <span className="group-hover:text-blue-700 truncate max-w-[200px]">F급 성좌는 랭커들을 조련한다</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-blue-200/80 text-blue-800 px-1.5 py-0.2 rounded font-bold">ch03</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>클리프행어:</strong> 씬 02 「게이트 붕괴」 — 성좌와의 신탁 계약 후 첫 던전 파괴
                </p>
                <div className="flex justify-between items-center text-[10px] text-blue-700 font-mono mt-1.5 pt-1.5 border-t border-blue-200/60">
                  <span>복선 회수: 1/2개 회수 완료 · 미결 19건 관리 중</span>
                  <span className="font-bold underline">클리프행어 편집 ➔</span>
                </div>
              </div>

              {/* BJ Sister */}
              <div
                onClick={() => {
                  const proj = projects.find((p) => p.id === 'bj-sister') || selectedProject;
                  if (onOpenMetricEditModal) {
                    onOpenMetricEditModal('currentChapter', proj);
                  } else {
                    onSelectProject('bj-sister');
                  }
                }}
                role="button"
                tabIndex={0}
                title="클릭하여 《가짜 막내손녀는 재벌가를 집어삼킨다》 클리프행어 씬 편집하기"
                className={`p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                  activeProjectId === 'bj-sister'
                    ? 'border-blue-400 bg-blue-50/60 shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-blue-50/30 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span className="group-hover:text-blue-700 truncate max-w-[200px]">가짜 막내손녀는 재벌가를 집어삼킨다</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">ch04</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>클리프행어:</strong> 17화 "네 말이 맞다" 인정받고 태성물산 주총 참여권 획득
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1.5 pt-1.5 border-t border-slate-200/60">
                  <span>복선 회수: 4/4개 완벽 회수 · 1막 결말부 도달</span>
                  <span className="text-blue-600 font-bold underline">클리프행어 편집 ➔</span>
                </div>
              </div>

              {/* Villainess Escape */}
              <div
                onClick={() => {
                  const proj = projects.find((p) => p.id === 'villainess-escape') || selectedProject;
                  if (onOpenMetricEditModal) {
                    onOpenMetricEditModal('currentChapter', proj);
                  } else {
                    onSelectProject('villainess-escape');
                  }
                }}
                role="button"
                tabIndex={0}
                title="클릭하여 《시한부 악녀는 황태자의 청혼을 거절합니다》 클리프행어 씬 편집하기"
                className={`p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                  activeProjectId === 'villainess-escape'
                    ? 'border-blue-400 bg-blue-50/60 shadow-xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-blue-50/30 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span className="group-hover:text-rose-700 truncate max-w-[200px]">시한부 악녀는 황태자의 청혼을 거절합니다</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">ch02</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>클리프행어:</strong> 황태자 앞에서 공식 파혼 서약서 낭독 및 황실 국채 30억 플로린 매입 선언
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1.5 pt-1.5 border-t border-slate-200/60">
                  <span>복선 회수: 2/3개 회수 진행 중 · 마탑 지분 계약</span>
                  <span className="text-rose-600 font-bold underline">클리프행어 편집 ➔</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

