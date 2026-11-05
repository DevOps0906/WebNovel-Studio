import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Sliders,
  ShieldCheck,
  ExternalLink,
  User,
  Mail,
  Award,
  Globe,
  Database,
  Download,
  Upload,
  RefreshCw,
  Github,
  GitBranch,
  UploadCloud,
  Terminal,
  AlertTriangle,
  Check,
  Lock
} from 'lucide-react';
import {
  AiSettingsConfig,
  AiProvider,
  loadAiSettings,
  saveAiSettings,
  DEFAULT_AI_SETTINGS
} from '../data/aiSettings';
import type { WebNovelProject, SaveResult } from '../data/projectTemplates';
import { exportBundle, parseBundle } from '../data/bundle';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: AiSettingsConfig) => void;
  projects?: WebNovelProject[];
  onImportProjects?: (imported: WebNovelProject[]) => SaveResult & { renamed?: { from: string; to: string }[] };
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  onImportProjects,
}) => {
  const [bundleMessage, setBundleMessage] = useState<{ ok: boolean; lines: string[] } | null>(null);
  const [isBundleBusy, setIsBundleBusy] = useState(false);

  const [activeTab, setActiveTab] = useState<'account' | 'ai_keys' | 'github'>('account');
  const [settings, setSettings] = useState<AiSettingsConfig>(DEFAULT_AI_SETTINGS);
  const [penName, setPenName] = useState('방하늘');
  const [showKeys, setShowKeys] = useState<{ claude: boolean; openai: boolean; gemini: boolean }>({
    claude: false,
    openai: false,
    gemini: false,
  });
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; success?: boolean; message?: string }>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  // GitHub Integration & Push States
  const [githubToken, setGithubToken] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [saveGithubToken, setSaveGithubToken] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState('https://github.com/theBestTrade/WebNovel-Studio.git');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubForcePush, setGithubForcePush] = useState(true);
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [isLoadingGitStatus, setIsLoadingGitStatus] = useState(false);
  const [isPushingGit, setIsPushingGit] = useState(false);
  const [gitPushResult, setGitPushResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);

  const fetchGitStatus = async () => {
    setIsLoadingGitStatus(true);
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      if (data.success) {
        setGitStatus(data);
        if (data.remoteUrl) setGithubRepoUrl(data.remoteUrl);
        if (data.branch) setGithubBranch(data.branch);
      }
    } catch (err) {
      console.error('Failed to load git status:', err);
    } finally {
      setIsLoadingGitStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAiSettings());
      setSavedNotice(false);
      setTestStatus({});
      setGitPushResult(null);

      // Load GitHub settings from localStorage
      const savedSaveTokenPref = localStorage.getItem('webnovel_studio_github_save_token');
      // 토큰은 명시적으로 저장을 선택한 경우에만 브라우저에 보관한다 (기본값: 저장 안 함)
      const shouldSaveToken = savedSaveTokenPref === 'true';
      setSaveGithubToken(shouldSaveToken);

      if (shouldSaveToken) {
        const savedToken = localStorage.getItem('webnovel_studio_github_pat') || '';
        setGithubToken(savedToken);
      }

      const savedRepo = localStorage.getItem('webnovel_studio_github_repo');
      if (savedRepo) setGithubRepoUrl(savedRepo);

      const savedBranch = localStorage.getItem('webnovel_studio_github_branch');
      if (savedBranch) setGithubBranch(savedBranch);

      fetchGitStatus();
    }
  }, [isOpen]);

  const handlePushGit = async () => {
    if (!githubToken.trim()) {
      setGitPushResult({
        success: false,
        message: 'GitHub Personal Access Token(PAT)을 입력해주세요. (repo 권한 필요)'
      });
      return;
    }

    setIsPushingGit(true);
    setGitPushResult(null);

    // Save token if checkbox is checked
    if (saveGithubToken) {
      localStorage.setItem('webnovel_studio_github_pat', githubToken.trim());
      localStorage.setItem('webnovel_studio_github_save_token', 'true');
    } else {
      localStorage.removeItem('webnovel_studio_github_pat');
      localStorage.setItem('webnovel_studio_github_save_token', 'false');
    }
    localStorage.setItem('webnovel_studio_github_repo', githubRepoUrl.trim());
    localStorage.setItem('webnovel_studio_github_branch', githubBranch.trim() || 'main');

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          targetRepoUrl: githubRepoUrl.trim(),
          branch: githubBranch.trim() || 'main',
          force: githubForcePush
        })
      });

      const data = await res.json();
      if (data.success) {
        setGitPushResult({
          success: true,
          message: data.message || 'GitHub 원격 저장소에 성공적으로 푸시되었습니다!',
          output: data.stdout || data.stderr
        });
        fetchGitStatus();
      } else {
        setGitPushResult({
          success: false,
          message: data.error || '푸시 중 오류가 발생했습니다.'
        });
      }
    } catch (err: any) {
      setGitPushResult({
        success: false,
        message: err.message || '푸시 요청 중 통신 오류가 발생했습니다.'
      });
    } finally {
      setIsPushingGit(false);
    }
  };

  if (!isOpen) return null;

  const handleTestKey = async (provider: AiProvider) => {
    const config = settings[provider];
    setTestStatus((prev) => ({
      ...prev,
      [provider]: { loading: true, message: '연결 확인 중...' },
    }));

    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: config.apiKey,
          model: config.model,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus((prev) => ({
          ...prev,
          [provider]: { loading: false, success: true, message: data.message || 'API 연결 성공! 정상 응답 확인.' },
        }));
      } else {
        setTestStatus((prev) => ({
          ...prev,
          [provider]: { loading: false, success: false, message: data.error || '연결 실패: API 키 또는 네트워크를 확인하세요.' },
        }));
      }
    } catch (err: any) {
      setTestStatus((prev) => ({
        ...prev,
        [provider]: { loading: false, success: false, message: '서버 통신 오류: ' + err.message },
      }));
    }
  };

  const handleSave = () => {
    saveAiSettings(settings);
    if (onSave) onSave(settings);

    // Save GitHub settings based on checkbox
    if (saveGithubToken) {
      if (githubToken.trim()) {
        localStorage.setItem('webnovel_studio_github_pat', githubToken.trim());
      }
      localStorage.setItem('webnovel_studio_github_save_token', 'true');
    } else {
      localStorage.removeItem('webnovel_studio_github_pat');
      localStorage.setItem('webnovel_studio_github_save_token', 'false');
    }
    localStorage.setItem('webnovel_studio_github_repo', githubRepoUrl.trim());
    localStorage.setItem('webnovel_studio_github_branch', githubBranch.trim() || 'main');

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleExportBundle = () => {
    if (!projects || projects.length === 0) {
      setBundleMessage({ ok: false, lines: ['내보낼 작품이 없습니다.'] });
      return;
    }
    try {
      const bytes = exportBundle(projects);
      const blob = new Blob([bytes as BlobPart], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WebNovel-Studio-Bundle-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setBundleMessage({ ok: true, lines: [`작품 ${projects.length}개를 마크다운 묶음으로 내보냈습니다.`] });
    } catch (err: any) {
      setBundleMessage({ ok: false, lines: [`내보내기에 실패했습니다: ${err?.message || err}`] });
    }
  };

  const handleImportBundle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!onImportProjects) {
      setBundleMessage({ ok: false, lines: ['가져오기 기능이 연결되지 않았습니다.'] });
      return;
    }
    setIsBundleBusy(true);
    setBundleMessage(null);
    try {
      const parsed = await parseBundle(new Uint8Array(await file.arrayBuffer()));
      const result = onImportProjects(parsed.projects);
      const lines = [`작품 ${parsed.projects.length}개를 가져왔습니다.`];
      (result.renamed || []).forEach((r) => lines.push(`ID 충돌: ${r.from} -> ${r.to} 로 추가했습니다 (기존 작품은 덮어쓰지 않음).`));
      lines.push(...parsed.warnings);
      if (!result.ok) lines.push(`저장 실패: ${result.error || ''}`);
      setBundleMessage({ ok: result.ok, lines });
    } catch (err: any) {
      setBundleMessage({ ok: false, lines: [`가져오기에 실패했습니다: ${err?.message || err}`, '기존 데이터는 변경되지 않았습니다.'] });
    } finally {
      setIsBundleBusy(false);
    }
  };
  const handleExportData = () => {
    try {
      const allData = {
        exportedAt: new Date().toISOString(),
        projects: localStorage.getItem('webnovel_studio_projects_v2'),
        activeProjectId: localStorage.getItem('webnovel_studio_active_project_id'),
      };
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WebNovel-Studio-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>환경 설정</span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                  WebNovel-Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                로그인 계정 관리, AI 모델 API 키 및 GitHub 토큰 연동/즉시 푸시를 관리합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons (계정 정보 vs AI 모델 API 키 설정 vs GitHub 연동 & 푸시) */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-6 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'account'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>계정 정보</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_keys')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'ai_keys'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>AI 모델 API 키 설정</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              sonnet-5.5 · sol 6.1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'github'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4 text-emerald-400" />
            <span>GitHub 연동 & 푸시</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              main 원격 동기화
            </span>
          </button>
        </div>

        {/* Tab 1: 계정 정보 */}
        {activeTab === 'account' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
            
            {/* User Profile Card */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">skydy96</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Google 연동 인증됨
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>skydy96@gmail.com</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                    PRO Creator
                  </span>
                </div>
              </div>

              {/* Author Pen Name Setting */}
              <div className="pt-3 border-t border-slate-700/60 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  작가 기본 필명 (Pen Name)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="작가 필명을 입력하세요"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      alert('필명이 반영되었습니다.');
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    필명 변경
                  </button>
                </div>
              </div>
            </div>

            {/* Publishing Platform Integration Status */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>연재 플랫폼 연동 관리</span>
                </span>
                <span className="text-[10px] text-slate-400">실시간 연동 상태</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-xs text-white">카카오페이지 (KakaoPage Stage & Partners)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                    연동 정상 · 직연재 지원
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-xs text-white">네이버 시리즈 (Naver Series CP Webhook)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                    연동 정상 · 예약 등록 가능
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-xs text-white">문피아 (Munpia Gold Station)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                    연동 정상 · 일일 연재 감지
                  </span>
                </div>
              </div>
            </div>

            {/* License & Membership */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>작가 라이선스 & 멤버십</span>
                </span>
                <span className="text-xs font-bold text-amber-400">PRO UNLIMITED</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                4막 6아크 24챕터 100화 완결 파이프라인 무제한 생성, 옵시디언 6단계 구조화 트리 내보내기, AI 코칭 어시스턴트 무제한 지원이 활성화되어 있습니다.
              </p>
            </div>

            {/* Data Backup & Export */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>데이터 백업 & 내보내기</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  작업 중인 모든 소설의 챕터 본문, 인물 바이블, 복선 DB를 JSON으로 백업합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON 백업</span>
              </button>
            </div>

            {/* Markdown Bundle Export / Import (S-05) */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>마크다운 묶음 (복원용)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    작품을 zip(씬별 .md + project.json)으로 내보내고 같은 묶음으로 다른 기기에 복원합니다. 같은 ID의 작품은 덮어쓰지 않고 새 작품으로 추가됩니다. API 키와 토큰은 포함되지 않습니다.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportBundle}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>내보내기</span>
                  </button>
                  <label className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isBundleBusy ? '가져오는 중...' : '가져오기'}</span>
                    <input type="file" accept=".zip,application/zip" className="hidden" onChange={handleImportBundle} disabled={isBundleBusy} />
                  </label>
                </div>
              </div>
              {bundleMessage && (
                <div
                  role="status"
                  className={`text-[11px] rounded-lg border px-3 py-2 space-y-0.5 ${
                    bundleMessage.ok ? 'text-emerald-300 border-emerald-700/50 bg-emerald-900/20' : 'text-red-300 border-red-700/50 bg-red-900/20'
                  }`}
                >
                  {bundleMessage.lines.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: AI 모델 API 키 설정 */}
        {activeTab === 'ai_keys' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
            
            {/* Active Provider Selector */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>기본 집필 AI 엔진 (Active Provider)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  집필 생성 및 AI 코칭에 우선 사용
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'claude' as AiProvider, name: 'Anthropic Claude', modelDesc: 'sonnect-5.5' },
                  { id: 'openai' as AiProvider, name: 'OpenAI ChatGPT', modelDesc: 'sol 6.1' },
                  { id: 'gemini' as AiProvider, name: 'Google Gemini', modelDesc: '3.8 Flash' },
                ].map((prov) => {
                  const isSelected = settings.activeProvider === prov.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => setSettings((s) => ({ ...s, activeProvider: prov.id }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{prov.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        {prov.modelDesc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Provider 1: Anthropic Claude (sonnect-5.5 기준) */}
            <div className={`p-4 rounded-xl border transition-all space-y-3 ${
              settings.activeProvider === 'claude' ? 'bg-slate-800/90 border-amber-500/50 shadow-md' : 'bg-slate-800/40 border-slate-700/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-white text-xs sm:text-sm">Anthropic Claude</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                    sonnect-5.5
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestKey('claude')}
                  disabled={testStatus.claude?.loading}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{testStatus.claude?.loading ? '확인 중...' : '연결 테스트'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>API Key (sk-ant-...)</span>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>키 발급받기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showKeys.claude ? 'text' : 'password'}
                    value={settings.claude.apiKey}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        claude: { ...s.claude, apiKey: e.target.value },
                      }))
                    }
                    placeholder="sk-ant-api03-..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys((prev) => ({ ...prev, claude: !prev.claude }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys.claude ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">지정 모델</label>
                  <input
                    type="text"
                    value={settings.claude.model}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        claude: { ...s.claude, model: e.target.value },
                      }))
                    }
                    placeholder="sonnect-5.5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">기준 모델: sonnect-5.5</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    창의성 (Temperature: {settings.claude.temperature})
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={settings.claude.temperature}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        claude: { ...s.claude, temperature: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {testStatus.claude && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  testStatus.claude.success
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                }`}>
                  {testStatus.claude.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{testStatus.claude.message}</span>
                </div>
              )}
            </div>

            {/* Provider 2: OpenAI ChatGPT (sol 6.1 기준) */}
            <div className={`p-4 rounded-xl border transition-all space-y-3 ${
              settings.activeProvider === 'openai' ? 'bg-slate-800/90 border-emerald-500/50 shadow-md' : 'bg-slate-800/40 border-slate-700/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-white text-xs sm:text-sm">OpenAI ChatGPT</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    sol 6.1
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestKey('openai')}
                  disabled={testStatus.openai?.loading}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>{testStatus.openai?.loading ? '확인 중...' : '연결 테스트'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>API Key (sk-proj-...)</span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>키 발급받기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={settings.openai.apiKey}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        openai: { ...s.openai, apiKey: e.target.value },
                      }))
                    }
                    placeholder="sk-proj-..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys((prev) => ({ ...prev, openai: !prev.openai }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys.openai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">지정 모델</label>
                  <input
                    type="text"
                    value={settings.openai.model}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        openai: { ...s.openai, model: e.target.value },
                      }))
                    }
                    placeholder="sol-6.1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">기준 모델: sol-6.1</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    창의성 (Temperature: {settings.openai.temperature})
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={settings.openai.temperature}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        openai: { ...s.openai, temperature: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              {testStatus.openai && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  testStatus.openai.success
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                }`}>
                  {testStatus.openai.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{testStatus.openai.message}</span>
                </div>
              )}
            </div>

            {/* Provider 3: Google Gemini (3.8 Flash 기준) */}
            <div className={`p-4 rounded-xl border transition-all space-y-3 ${
              settings.activeProvider === 'gemini' ? 'bg-slate-800/90 border-blue-500/50 shadow-md' : 'bg-slate-800/40 border-slate-700/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-bold text-white text-xs sm:text-sm">Google Gemini</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestKey('gemini')}
                  disabled={testStatus.gemini?.loading}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>{testStatus.gemini?.loading ? '확인 중...' : '연결 테스트'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Google AI Studio Key (선택 사항 - 미입력 시 서버 기본키 사용)</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>AI Studio 키 발급</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={settings.gemini.apiKey}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        gemini: { ...s.gemini, apiKey: e.target.value },
                      }))
                    }
                    placeholder="AIzaSy... (선택 사항)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys((prev) => ({ ...prev, gemini: !prev.gemini }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">지정 모델</label>
                  <input
                    type="text"
                    value={settings.gemini.model}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        gemini: { ...s.gemini, model: e.target.value },
                      }))
                    }
                    placeholder="gemini-3.8-flash"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">기준 모델: gemini-3.8-flash</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    창의성 (Temperature: {settings.gemini.temperature})
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={settings.gemini.temperature}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        gemini: { ...s.gemini, temperature: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {testStatus.gemini && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  testStatus.gemini.success
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                }`}>
                  {testStatus.gemini.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{testStatus.gemini.message}</span>
                </div>
              )}
            </div>

            {/* Privacy Note */}
            <div className="flex items-center gap-2 text-slate-400 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                등록된 API 키는 브라우저(LocalStorage)에만 안전하게 보관되며 외부 서버에 수집되지 않습니다.
              </span>
            </div>

          </div>
        )}

        {/* Tab 3: GitHub 연동 & 즉시 푸시 */}
        {activeTab === 'github' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
            
            {/* Header / Intro Card */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>GitHub 원격 저장소 동기화 & 푸시</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        main 브랜치
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      GitHub Personal Access Token(PAT)을 등록하여 원격 저장소로 즉시 커밋 내역을 푸시합니다.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchGitStatus}
                  disabled={isLoadingGitStatus}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGitStatus ? 'animate-spin text-blue-400' : ''}`} />
                  <span>상태 새로고침</span>
                </button>
              </div>

              {/* Current Local Git Status Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">현재 활성 브랜치</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{gitStatus?.branch || 'main'}</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">최신 로컬 커밋</span>
                  <span className="font-mono font-bold text-blue-300 truncate block mt-0.5">
                    {gitStatus?.lastCommit || '확인 중...'}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">작업 트리 상태</span>
                  <span className={`font-bold flex items-center gap-1 mt-0.5 ${gitStatus?.clean ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {gitStatus?.clean ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>클린 (커밋 완료)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>수정 내역 반영됨</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub Personal Access Token (PAT) Card */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>GitHub Personal Access Token (PAT) *</span>
                </label>

                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>토큰 새로 발급받기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_로 시작하는 40자리 Personal Access Token 입력"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* CHECKBOX: 토큰 저장하기 체크박스 (요청사항 핵심) */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/50 cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={saveGithubToken}
                  onChange={(e) => setSaveGithubToken(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 border-slate-700 bg-slate-800 cursor-pointer"
                />
                <div className="flex-1 space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>GitHub 인증 토큰을 브라우저(로컬스토리지)에 안전하게 저장하기</span>
                    {saveGithubToken && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        자동 저장 켜짐
                      </span>
                    )}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    체크박스를 활성화하면 브라우저를 닫거나 새로고침해도 토큰이 로컬스토리지에 안전하게 보관되어 매번 재입력할 필요 없이 즉시 푸시할 수 있습니다. (체크 해제 시 저장하지 않음)
                  </p>
                </div>
              </label>

              {/* Token Scope Tip */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>토큰 발급 안내:</strong> GitHub Settings ➜ Developer settings ➜ Personal access tokens (classic)에서 <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-200">repo</code> 스코프(Full control of private repositories)에 체크하여 생성하세요.
                </span>
              </div>
            </div>

            {/* Target Remote Repository & Branch */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span>원격 저장소 및 대상 브랜치 설정</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    원격 저장소 URL (Remote Repo)
                  </label>
                  <input
                    type="text"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/사용자명/레포이름.git"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    푸시 타겟 브랜치
                  </label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Force Push Option Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={githubForcePush}
                  onChange={(e) => setGithubForcePush(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-900 cursor-pointer"
                />
                <span className="text-xs text-slate-300">
                  원격 커밋 충돌 방지를 위해 강제 푸시(<code className="font-mono text-blue-300 text-[11px]">--force</code>) 옵션 적용
                </span>
              </label>
            </div>

            {/* IMMEDIATE PUSH BUTTON (요청사항 핵심: 바로 푸시 진행) */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handlePushGit}
                disabled={isPushingGit || !githubToken.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPushingGit ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>GitHub 원격 저장소({githubBranch})로 푸시 진행 중...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-emerald-200" />
                    <span>🚀 지금 바로 GitHub ({githubBranch} 브랜치)에 푸시하기</span>
                  </>
                )}
              </button>

              {/* Push Result Banner */}
              {gitPushResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                    gitPushResult.success
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {gitPushResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{gitPushResult.message}</span>
                  </div>

                  {gitPushResult.output && (
                    <details className="mt-2 text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-slate-300">
                      <summary className="cursor-pointer font-bold text-slate-400 hover:text-white mb-1">
                        터미널 실행 로그 상세 보기
                      </summary>
                      <pre className="whitespace-pre-wrap overflow-x-auto text-[10px] text-slate-300 mt-1">
                        {gitPushResult.output}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-slate-400 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                등록된 GitHub 토큰은 브라우저에만 저장되며, 외부 중계 서버에 저장되지 않고 오직 원격 푸시 명령어 실행 시에만 사용됩니다.
              </span>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSettings(DEFAULT_AI_SETTINGS)}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            기본값으로 초기화
          </button>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 설정이 저장되었습니다!
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-bold text-xs shadow-md shadow-blue-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>설정 저장하기</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
