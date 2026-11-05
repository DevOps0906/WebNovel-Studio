import React, { useState } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { TopGnb } from './components/TopGnb';
import { ProjectDashboardCards } from './components/ProjectDashboardCards';
import { Header } from './components/Header';
import { TabTimeline } from './components/TabTimeline';
import { TabOverview } from './components/TabOverview';
import { TabChapter } from './components/TabChapter';
import { TabLists } from './components/TabLists';
import { AiCoachDrawer } from './components/AiCoachDrawer';
import { AiCoachPage } from './components/AiCoachPage';
import { PdfExportModal } from './components/PdfExportModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { NewProjectModal } from './components/NewProjectModal';
import { NewProjectPage } from './components/NewProjectPage';
import { AiSettingsModal } from './components/AiSettingsModal';
import { MetricEditModal } from './components/MetricEditModal';
import { GitSyncModal } from './components/GitSyncModal';
import {
  WebNovelProject,
  loadAllProjects,
  saveAllProjects,
  loadActiveProjectId,
  saveActiveProjectId,
  INITIAL_PROJECTS
} from './data/projectTemplates';
import { loadAiSettings, saveAiSettings, AiSettingsConfig } from './data/aiSettings';
import { SceneItem } from './data/storyData';
import { X, BookOpen, Layers, FileText, ListChecks } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeChapterId, setActiveChapterId] = useState<string>('ch03');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<WebNovelProject[]>(() => loadAllProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => loadActiveProjectId());

  // AI Settings State (Claude, ChatGPT, Gemini)
  const [aiSettings, setAiSettings] = useState<AiSettingsConfig>(() => loadAiSettings());

  // Modals and Drawers
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [metricModalProject, setMetricModalProject] = useState<WebNovelProject | null>(null);
  const [activeMetricKey, setActiveMetricKey] = useState<string | undefined>(undefined);

  // Active scene for AI Coach
  const [activeSceneForAi, setActiveSceneForAi] = useState<SceneItem | null>(null);

  // Find currently active project or fallback to first
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  React.useEffect(() => {
    if (activeProject?.currentProgress?.currentChapter) {
      setActiveChapterId(activeProject.currentProgress.currentChapter);
    }
  }, [activeProject.id]);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    saveActiveProjectId(projectId);
  };

  const handleCreateNewProject = (newProject: WebNovelProject) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveAllProjects(updated);
    setActiveProjectId(newProject.id);
    saveActiveProjectId(newProject.id);
    setActiveTab('timeline');
  };

  const handleUpdateProject = (updatedProject: WebNovelProject) => {
    const updated = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p));
    setProjects(updated);
    saveAllProjects(updated);
  };

  const handleOpenMetricModal = (metricKey?: string, project?: WebNovelProject) => {
    setMetricModalProject(project || activeProject);
    setActiveMetricKey(metricKey);
    setIsMetricModalOpen(true);
  };

  const handleSaveAiSettings = (newSettings: AiSettingsConfig) => {
    setAiSettings(newSettings);
    saveAiSettings(newSettings);
  };

  const handleSelectChapterFromTimeline = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setActiveTab('chapter');
  };

  const handleOpenAiForScene = (scene: SceneItem, chapterTitle: string) => {
    setActiveSceneForAi(scene);
    setActiveTab('ai-coach');
  };

  const handleApplyAiTextToScene = (newText: string) => {
    if (activeSceneForAi) {
      activeSceneForAi.content = newText;
      activeSceneForAi.wordCount = newText.length;
      activeSceneForAi.status = '본문 완료';
    }
  };

  const tabTitles: Record<TabType, string> = {
    dashboard: '웹소설 창작 프로젝트 대시보드',
    timeline: '작품 전체 100화 마스터 타임라인 (4막 · 6아크)',
    overview: '작품 개요 & 100화 템플릿 구조 (Story Bible)',
    chapter: `챕터 보드 & 씬 집필 (${activeChapterId})`,
    lists: '복선 DB & 미결 과제 체크리스트',
    'new-project': '새로운 웹소설 기획 및 작성',
    'ai-coach': 'WebNovel-Studio AI 페어 라이팅 코치 관제 센터'
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800">
      
      {/* 1. Desktop Left GNB (Sidebar) */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeProject={activeProject}
          projects={projects}
          onSelectProject={handleSelectProject}
          onOpenNewProjectModal={() => setActiveTab('new-project')}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenPdfModal={() => setIsPdfModalOpen(true)}
          onToggleAiCoach={() => setActiveTab('ai-coach')}
          isAiCoachOpen={activeTab === 'ai-coach'}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          activeChapterId={activeChapterId}
          aiSettings={aiSettings}
        />
      </div>

      {/* 2. Mobile Left GNB Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full flex flex-col bg-slate-900 shadow-2xl">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              activeProject={activeProject}
              projects={projects}
              onSelectProject={(id) => {
                handleSelectProject(id);
                setIsMobileMenuOpen(false);
              }}
              onOpenNewProjectModal={() => {
                setActiveTab('new-project');
                setIsMobileMenuOpen(false);
              }}
              onOpenSettingsModal={() => {
                setIsSettingsModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              onOpenPdfModal={() => {
                setIsPdfModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              onToggleAiCoach={() => {
                setActiveTab('ai-coach');
                setIsMobileMenuOpen(false);
              }}
              isAiCoachOpen={activeTab === 'ai-coach'}
              onOpenWorkspaceModal={() => {
                setIsWorkspaceModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              activeChapterId={activeChapterId}
              aiSettings={aiSettings}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto bg-slate-100">
        
        {/* 상단 GNB 메뉴바: 로그인 계정, 설정아이콘, 관련 툴 기능 포함 */}
        <TopGnb
          userEmail="skydy96@gmail.com"
          activeProject={activeProject}
          projects={projects}
          onSelectProject={handleSelectProject}
          aiSettings={aiSettings}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenNewProjectModal={() => setActiveTab('new-project')}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenPdfModal={() => setIsPdfModalOpen(true)}
          onToggleAiCoach={() => setActiveTab('ai-coach')}
          isAiCoachOpen={activeTab === 'ai-coach'}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenGitModal={() => setIsGitModalOpen(true)}
        />

        {/* Main Content Viewport */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
          
          {/* VIEW A: 대시보드 뷰 (Image 2 - activeTab === 'dashboard') */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <ProjectDashboardCards
                projects={projects}
                activeProjectId={activeProject.id}
                onSelectProject={(id) => {
                  handleSelectProject(id);
                  setActiveTab('timeline');
                }}
                onOpenNewProjectModal={() => setActiveTab('new-project')}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                aiSettings={aiSettings}
                onOpenMetricEditModal={handleOpenMetricModal}
              />
            </div>
          )}

          {/* VIEW C: 새 소설 작성 웹페이지 (activeTab === 'new-project') - 모달창이 아닌 오른쪽 웹페이지 형식 */}
          {activeTab === 'new-project' && (
            <NewProjectPage
              onCreateProject={handleCreateNewProject}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {/* VIEW D: AI 페어 라이팅 코치 웹페이지 (activeTab === 'ai-coach') - 모달창이 아닌 오른쪽 웹페이지(컨텐츠창) 형식 */}
          {activeTab === 'ai-coach' && (
            <AiCoachPage
              activeProject={activeProject}
              activeChapterId={activeChapterId}
              activeScene={activeSceneForAi}
              onApplySceneText={handleApplyAiTextToScene}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onBack={() => setActiveTab('timeline')}
              aiSettings={aiSettings}
            />
          )}

          {/* VIEW B: 작품보기 뷰 (Image 1 - activeTab !== 'dashboard' && activeTab !== 'new-project' && activeTab !== 'ai-coach') */}
          {activeTab !== 'dashboard' && activeTab !== 'new-project' && activeTab !== 'ai-coach' && (
            <div className="space-y-6">
              {/* Header with Breadcrumb, Badges, Context, 6 Metric Boxes & 4 Sub-Tabs */}
              <Header
                isDashboard={false}
                activeTabTitle={tabTitles[activeTab]}
                activeProject={activeProject}
                projects={projects}
                aiSettings={aiSettings}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenPdfModal={() => setIsPdfModalOpen(true)}
                onToggleAiCoach={() => setActiveTab('ai-coach')}
                isAiCoachOpen={false}
                onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
                onOpenNewProjectModal={() => setActiveTab('new-project')}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
                onOpenMetricEditModal={handleOpenMetricModal}
                onOpenGitModal={() => setIsGitModalOpen(true)}
              />

              {/* Main Sub-Tab Content Area */}
              <main className="space-y-6">
                {activeTab === 'timeline' && (
                  <TabTimeline
                    activeProject={activeProject}
                    onSelectChapter={handleSelectChapterFromTimeline}
                    onUpdateProject={handleUpdateProject}
                  />
                )}

                {activeTab === 'overview' && (
                  <TabOverview
                    activeProject={activeProject}
                    onUpdateProject={handleUpdateProject}
                  />
                )}

                {activeTab === 'chapter' && (
                  <TabChapter
                    activeProject={activeProject}
                    activeChapterId={activeChapterId}
                    onSelectChapter={setActiveChapterId}
                    onOpenAiSceneDraft={handleOpenAiForScene}
                  />
                )}

                {activeTab === 'lists' && (
                  <TabLists activeProject={activeProject} />
                )}
              </main>
            </div>
          )}

          {/* Footer Timestamp & Sync Status */}
          <footer className="text-center text-xs text-slate-400 pt-4 pb-8 border-t border-slate-200 leading-relaxed font-mono">
            WebNovel-Studio v1.0.0-PROD · 현재 작업 소설: [{activeProject.id}] 《{activeProject.title}》 · 활성 AI: {aiSettings.activeProvider.toUpperCase()} ({aiSettings[aiSettings.activeProvider].model})
          </footer>
        </div>
      </div>

      {/* AI Coach Drawer */}
      <AiCoachDrawer
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        activeScene={activeSceneForAi}
        activeChapterTitle={activeChapterId}
        onApplySceneText={handleApplyAiTextToScene}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Official A4 Planning Specification PDF Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        activeProject={activeProject}
      />

      {/* Obsidian Workspace File Tree Explorer */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        activeProject={activeProject}
      />

      {/* New Web Novel Creation Modal with Templates */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateNewProject}
      />

      {/* AI Settings Modal for Claude, ChatGPT, Gemini API Keys */}
      <AiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveAiSettings}
      />

      {/* GitHub Repository Sync & Source Export Modal */}
      <GitSyncModal
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
      />

      {/* Dashboard & Novel Card View Metric Edit Modal */}
      {metricModalProject && (
        <MetricEditModal
          isOpen={isMetricModalOpen}
          onClose={() => setIsMetricModalOpen(false)}
          project={metricModalProject}
          initialMetricKey={activeMetricKey}
          onSave={(updatedProgress) => {
            handleUpdateProject({
              ...metricModalProject,
              currentProgress: updatedProgress,
            });
          }}
        />
      )}
    </div>
  );
}
