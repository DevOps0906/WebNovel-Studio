import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  GitBranch,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  FolderArchive,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface GitSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitStatusData {
  success: boolean;
  repoUrl: string;
  remoteUrl: string;
  branch: string;
  lastCommit: string;
  clean: boolean;
  modifiedFiles: string[];
}

export const GitSyncModal: React.FC<GitSyncModalProps> = ({ isOpen, onClose }) => {
  const [gitStatus, setGitStatus] = useState<GitStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  
  // Push state
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/theBestTrade/WebNovel-Studio.git');
  const [branch, setBranch] = useState('main');
  const [forcePush, setForcePush] = useState(true);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);

  // Copy state
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  // Load status
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      if (data.success) {
        setGitStatus(data);
        if (data.remoteUrl) setRepoUrl(data.remoteUrl);
        if (data.branch) setBranch(data.branch);
      }
    } catch (err) {
      console.error('Failed to load git status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setPushResult(null);
    }
  }, [isOpen]);

  const handlePush = async () => {
    if (!token.trim()) {
      setPushResult({
        success: false,
        message: 'GitHub Personal Access Token(PAT)을 입력해주세요. (repo 권한 필요)'
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          targetRepoUrl: repoUrl.trim(),
          branch: branch.trim() || 'main',
          force: forcePush
        })
      });

      const data = await res.json();
      if (data.success) {
        setPushResult({
          success: true,
          message: data.message || 'GitHub 원격 저장소에 성공적으로 푸시되었습니다!',
          output: data.stdout || data.stderr
        });
        fetchStatus();
      } else {
        setPushResult({
          success: false,
          message: data.error || '푸시 중 오류가 발생했습니다.'
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err.message || '푸시 요청 중 통신 오류가 발생했습니다.'
      });
    } finally {
      setIsPushing(false);
    }
  };

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(`git clone ${repoUrl}`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const copyCliGuide = () => {
    const text = `# 1. 저장소 클론 (푸시 완료 후)\ngit clone ${repoUrl}\ncd WebNovel-Studio\n\n# 2. 패키지 설치 및 실행\nnpm install\nnpm run dev`;
    navigator.clipboard.writeText(text);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-white border border-slate-700">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                GitHub 저장소 동기화 & 소스코드 내보내기
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  theBestTrade/WebNovel-Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                원격 레포지토리에 최신 소스코드를 푸시하거나 압축 파일로 다운로드합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Important Explanation Callout: Repository not found (404) Diagnosis */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>‘remote: Repository not found’ 오류가 발생하는 이유와 해결 방법</span>
            </div>
            <div className="text-xs text-rose-200/90 leading-relaxed space-y-1.5">
              <p>
                로컬 터미널에서 <code className="bg-slate-900 text-rose-300 px-1 py-0.5 rounded font-mono">Repository not found</code>가 뜨는 이유는 다음 2가지 중 하나입니다:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-300">
                <li>
                  <strong className="text-white">원인 1 (가장 흔함):</strong> 아직 GitHub 웹사이트에 <code className="text-blue-400 font-mono">WebNovel-Studio</code> 레포지토리가 생성되지 않은 상태입니다.{' '}
                  <a
                    href="https://github.com/new?name=WebNovel-Studio"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline font-bold hover:text-blue-300 ml-1 inline-flex items-center gap-0.5"
                  >
                    <span>[GitHub에서 새 레포지토리 만들기 바로가기]</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  <strong className="text-white">원인 2:</strong> 레포지토리를 <strong className="text-amber-300">비공개(Private)</strong>로 생성하신 경우, GitHub은 토큰 인증 없는 클론 요청에 대해 보안상 "저장소를 찾을 수 없음(404)"으로 응답합니다.
                </li>
              </ul>
              <div className="pt-1.5 flex flex-wrap gap-2">
                <a
                  href="/api/git/download-archive?format=zip"
                  download="WebNovel-Studio-source.zip"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>지금 바로 전체 소스코드 ZIP 다운로드받기</span>
                </a>
              </div>
            </div>
          </div>

          {/* Current Git Status */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                현재 프로젝트 Git 로컬 상태
              </span>
              <button
                onClick={fetchStatus}
                disabled={isLoadingStatus}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                title="상태 새로고침"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">브랜치</span>
                <span className="font-bold text-emerald-400">{gitStatus?.branch || 'main'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase">작업 상태</span>
                <span className="font-bold text-blue-400">
                  {gitStatus?.clean ? '✓ 로컬 커밋 완료 (워킹트리 깨끗함)' : '변경사항 감지됨'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 sm:col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase">최근 로컬 커밋</span>
                <span className="text-slate-300 truncate block">
                  {gitStatus?.lastCommit || 'bc32766 - feat: initial commit - WebNovel Studio full creation platform'}
                </span>
              </div>
            </div>
          </div>

          {/* Method 1: Push directly via PAT */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-blue-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h3 className="font-bold text-slate-100 text-sm">토큰(PAT)으로 즉시 GitHub에 푸시하기 (권장)</h3>
              </div>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=WebNovel-Studio-Deploy"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
              >
                <span>토큰 발급 바로가기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              GitHub 계정에서 <strong className="text-slate-200">Personal Access Token (classic)</strong>을 발급받아 붙여넣으시면,
              전체 41개 소스 파일이 원격 저장소의 <code className="text-blue-400 font-mono">main</code> 브랜치로 즉시 푸시됩니다.
              (체크 필요 권한: <strong className="text-emerald-400 font-mono">repo</strong>)
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  대상 GitHub 레포지토리 URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/theBestTrade/WebNovel-Studio.git"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="forcePushCheck"
                  checked={forcePush}
                  onChange={(e) => setForcePush(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="forcePushCheck" className="text-xs text-slate-300 cursor-pointer">
                  원격 레포지토리 초기 충돌 방지 강제 푸시 (--force)
                  <span className="text-slate-500 text-[11px] ml-1">(새로 만든 레포에 README가 있는 경우 필수)</span>
                </label>
              </div>

              <button
                onClick={handlePush}
                disabled={isPushing}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>GitHub으로 전송 및 푸시 진행 중...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>지금 GitHub 원격 저장소에 푸시하기</span>
                  </>
                )}
              </button>
            </div>

            {/* Push result feedback */}
            {pushResult && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  pushResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {pushResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{pushResult.message}</span>
                </div>
                {pushResult.success && (
                  <p className="text-[11px] text-emerald-300/90 pt-1">
                    이제 본인 컴퓨터 터미널에서 아래 <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">git clone {repoUrl}</code> 명령어를 실행하면 모든 소스코드가 정상적으로 다운로드됩니다!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Method 2: One-Click Source Code ZIP Download */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-100 text-sm">원클릭 전체 소스코드 ZIP 다운로드</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              GitHub 토큰 발급 없이, 지금 화면의 웹소설 스튜디오 전체 소스코드(프론트엔드, AI 엔진, 백엔드, 템플릿 일체)를 
              내 컴퓨터로 즉시 압축파일(.zip)로 다운로드받습니다.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="/api/git/download-archive?format=zip"
                download="WebNovel-Studio-source.zip"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <FolderArchive className="w-4 h-4" />
                <span>소스코드 ZIP 다운로드 (.zip)</span>
              </a>
              <a
                href="/api/git/download-archive?format=tar"
                download="WebNovel-Studio-source.tar.gz"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>tar.gz 형식으로 다운로드</span>
              </a>
            </div>
          </div>

          {/* Method 3: Terminal Clone / Push Guide */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <h3 className="font-bold text-slate-100 text-sm">로컬 컴퓨터 터미널에서 실행하기</h3>
              </div>
              <button
                onClick={copyCloneCmd}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                {copiedClone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedClone ? '복사됨!' : '클론 명령어 복사'}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto relative group">
              <div className="text-slate-500 select-none"># 푸시 완료 후 컴퓨터에서 실행:</div>
              <div className="text-emerald-400 select-all">git clone {repoUrl}</div>
              <div className="text-slate-300 select-all">cd WebNovel-Studio</div>
              <div className="text-slate-300 select-all">npm install</div>
              <div className="text-blue-400 select-all">npm run dev</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            보안: 토큰은 서버에 영구 저장되지 않고 1회성 푸시 인증에만 사용됩니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
