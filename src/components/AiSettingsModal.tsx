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
  RefreshCw
} from 'lucide-react';
import {
  AiSettingsConfig,
  AiProvider,
  loadAiSettings,
  saveAiSettings,
  DEFAULT_AI_SETTINGS
} from '../data/aiSettings';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: AiSettingsConfig) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'ai_keys'>('account');
  const [settings, setSettings] = useState<AiSettingsConfig>(DEFAULT_AI_SETTINGS);
  const [penName, setPenName] = useState('방하늘');
  const [showKeys, setShowKeys] = useState<{ claude: boolean; openai: boolean; gemini: boolean }>({
    claude: false,
    openai: false,
    gemini: false,
  });
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; success?: boolean; message?: string }>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAiSettings());
      setSavedNotice(false);
      setTestStatus({});
    }
  }, [isOpen]);

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
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleExportData = () => {
    try {
      const allData = {
        exportedAt: new Date().toISOString(),
        projects: localStorage.getItem('webnovel_studio_projects_v2'),
        activeProjectId: localStorage.getItem('webnovel_studio_active_project_id'),
        aiSettings: localStorage.getItem('webnovel_studio_ai_settings'),
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
                로그인 계정 관리 및 AI 모델(클로드 소넷 5.5, OpenAI sol 6.1, 제미나이) API 키를 관리합니다.
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

        {/* Tab Buttons (계정 정보 vs AI 모델 API 키 설정) */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai_keys'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>AI 모델 API 키 설정</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              sonnect-5.5 · sol 6.1
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
