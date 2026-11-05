import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldAlert,
  BookOpen,
  Settings,
  ArrowLeft,
  Copy,
  Layers,
  FileText,
  Sliders,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { SceneItem } from '../data/storyData';
import { getActiveAiCredentials, AiSettingsConfig } from '../data/aiSettings';
import { AiCoachGuideModal } from './AiCoachGuideModal';
import { WebNovelProject } from '../data/projectTemplates';

interface AiCoachPageProps {
  activeProject: WebNovelProject;
  activeChapterId?: string;
  activeScene?: SceneItem | null;
  onApplySceneText?: (text: string) => void;
  onOpenSettingsModal?: () => void;
  onBack?: () => void;
  aiSettings?: AiSettingsConfig;
}

export const AiCoachPage: React.FC<AiCoachPageProps> = ({
  activeProject,
  activeChapterId = 'ch03',
  activeScene,
  onApplySceneText,
  onOpenSettingsModal,
  onBack,
  aiSettings,
}) => {
  const [command, setCommand] = useState<string>('/studio:08-scene');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedSceneNum, setSelectedSceneNum] = useState<string>(activeScene?.sceneNumber || '01');
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [reviewReport, setReviewReport] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [modelUsedNotice, setModelUsedNotice] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeResultTab, setActiveResultTab] = useState<'draft' | 'review'>('draft');

  const credentials = getActiveAiCredentials();
  const providerLabel = (aiSettings?.activeProvider || credentials.provider).toUpperCase();
  const activeModel = aiSettings ? aiSettings[aiSettings.activeProvider].model : credentials.model;

  const PIPELINE_COMMANDS = [
    {
      cmd: '/studio:08-scene',
      title: '8단계 씬 본문 집필',
      desc: '3중 보이스(내면·대화·지문)와 5단계 문체가이드를 적용한 씬 초안 작성',
      badge: '핵심'
    },
    {
      cmd: '/studio:10-review',
      title: '10단계 품질 진단 리포트',
      desc: '문체 준수율, 대화 비중(35~45%), 복선 회수 및 전개 템포 정밀 감사',
      badge: '품질'
    },
    {
      cmd: '/studio:06-chapter',
      title: '6단계 기승전결 구조화',
      desc: '해당 챕터의 4단계 씬 배치 및 갈등 격화선 구성',
      badge: '구조'
    },
    {
      cmd: '/studio:cliffhanger',
      title: '엔딩 훅(Hook) 극대화',
      desc: '다음 화 유료 결제를 유도하는 결정적 반전 및 대사 클리프행어 설계',
      badge: '전환율'
    }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setResultText('');
    setReviewReport('');
    setModelUsedNotice('');
    try {
      if (command === '/studio:10-review' || command === '/aiwc:10-review') {
        const response = await fetch('/api/aiwc/review-chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneText: resultText || activeScene?.content || customPrompt || '식탁 서열과 팽팽한 심리전',
            chapterData: `${activeChapterId} (${activeProject.title})`,
            provider: credentials.provider,
            apiKey: credentials.apiKey,
            model: activeModel,
          })
        });
        const data = await response.json();
        if (data.success) {
          setReviewReport(data.review);
          setModelUsedNotice(activeModel);
          setActiveResultTab('review');
        } else {
          setReviewReport(`[검토 실패] ${data.error || 'AI 검토 보고서를 가져오지 못했습니다. AI 설정 탭에서 API 키를 확인해주세요.'}`);
          setActiveResultTab('review');
        }
      } else {
        const response = await fetch('/api/aiwc/generate-scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterTitle: `${activeChapterId} (${activeProject.title})`,
            sceneNumber: selectedSceneNum,
            sceneTitle: activeScene?.title || `씬 ${selectedSceneNum}`,
            pacingType: activeScene?.pacing || '전진',
            isEndingHook: activeScene?.isEndingHook || false,
            synopsis: activeScene?.synopsis || customPrompt || activeProject.coreConcept.logline,
            customPrompt: customPrompt,
            provider: credentials.provider,
            apiKey: credentials.apiKey,
            model: activeModel,
          })
        });
        const data = await response.json();
        if (data.success) {
          setResultText(data.text);
          setModelUsedNotice(data.modelUsed || activeModel);
          setActiveResultTab('draft');
        } else {
          setResultText(`[생성 실패] ${data.error || '씬 원문을 생성하지 못했습니다. AI 설정 탭에서 API 키를 확인해주세요.'}`);
          setActiveResultTab('draft');
        }
      }
    } catch (err) {
      console.error(err);
      setResultText('생성 중 오류가 발생했습니다. AI 설정 탭에서 API 키 등록 여부를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (resultText && onApplySceneText) {
      onApplySceneText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Toolbar Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="작품보기로 돌아가기"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>돌아가기</span>
                </button>
              )}
              <span className="text-xs font-mono font-bold bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                WebNovel-Studio AI Studio WebPage
              </span>
              <span className="text-xs text-slate-400 font-mono">
                작업 소설: 《{activeProject.title}》
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              <span>AI 페어 라이팅 코치 관제 센터</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              11단계 공학적 집필 파이프라인과 05-문체 가이드(작성자 페르소나)를 결합하여 씬 본문 초안을 집필하고, 문체 및 복선 회수 품질을 정밀 감사하는 전문 스튜디오 웹페이지입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Guide Page Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>가이드 페이지 열기</span>
            </button>

            {/* AI Model Settings Button */}
            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="AI 모델 및 API 키 설정"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>AI 모델 설정</span>
              </button>
            )}
          </div>
        </div>

        {/* Model & Credentials Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">활성 엔진:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
              {providerLabel} · {activeModel}
            </span>
            <span className="text-slate-400 ml-2">대상 챕터:</span>
            <span className="text-emerald-400 font-bold">{activeChapterId}</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            {credentials.apiKey ? '● API 키 연동 완료' : '○ 기본 AI 엔드포인트 활성'}
          </div>
        </div>
      </div>

      {/* 2. Studio 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Command & Prompt Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Pipeline Commands Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>파이프라인 커맨드 선택</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">11단계 공학적 규칙</span>
            </div>

            <div className="space-y-2">
              {PIPELINE_COMMANDS.map((item) => {
                const isSelected = command === item.cmd;
                return (
                  <button
                    key={item.cmd}
                    type="button"
                    onClick={() => setCommand(item.cmd)}
                    className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                          {item.cmd}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scene Target & Prompt Direction Input */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>집필 대상 및 방향 지시</span>
              </label>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">씬 번호:</span>
                <select
                  value={selectedSceneNum}
                  onChange={(e) => setSelectedSceneNum(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-blue-700 bg-white"
                >
                  <option value="01">01번 씬</option>
                  <option value="02">02번 씬</option>
                  <option value="03">03번 씬</option>
                  <option value="04">04번 씬</option>
                </select>
              </div>
            </div>

            {/* Synopsis Preview */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">현재 선택된 씬 컨텍스트:</div>
              <div className="font-semibold text-slate-900">
                {activeChapterId} · {selectedSceneNum}번 씬 「{activeScene?.title || '가족의 시선'}」
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {activeScene?.synopsis || '만찬장 식탁 서열과 주인공의 치밀한 심리적 방어전'}
              </p>
            </div>

            {/* Custom Prompt Directions */}
            <div>
              <label className="font-bold text-xs text-slate-800 block mb-1">
                구체적 연출 지시 (추가 요구사항)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="예: 회장의 질문에 침착하게 숫자를 들어 방어하되, 상대의 미세한 동공 흔들림과 손가락 경련을 포착하는 3중 보이스 서술을 넣어줘."
                rows={4}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 leading-relaxed text-slate-900"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>WebNovel-Studio 엔진 집필 중 ({providerLabel})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>실행하기 ({command})</span>
                </>
              )}
            </button>

            {modelUsedNotice && (
              <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex justify-between items-center">
                <span>실행 모델: {modelUsedNotice}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  실행 완료
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output & Quality Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col min-h-[580px]">
            
            {/* Output Tabs Header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveResultTab('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeResultTab === 'draft'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>집필 본문 완성본</span>
                  {resultText && (
                    <span className="text-[10px] bg-blue-700 text-blue-100 px-1.5 py-0.2 rounded font-mono">
                      {resultText.length}자
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveResultTab('review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeResultTab === 'review'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>10단계 품질 진단 리포트</span>
                </button>
              </div>

              {/* Apply / Copy Button */}
              {resultText && activeResultTab === 'draft' && (
                <button
                  onClick={handleApply}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{copied ? '반영 완료!' : '씬 본문에 즉시 반영'}</span>
                </button>
              )}
            </div>

            {/* Output Tab Body */}
            <div className="p-5 flex-1 flex flex-col">
              {activeResultTab === 'draft' && (
                <div className="flex-1 flex flex-col space-y-3">
                  {resultText ? (
                    <textarea
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                      className="w-full flex-1 min-h-[460px] p-4 bg-slate-50/70 border border-slate-200 rounded-xl font-serif text-slate-900 text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex-1 min-h-[460px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-700 text-sm">
                        좌측에서 커맨드와 지시사항을 선택하고 실행해주세요.
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        8단계 씬 본문 집필 커맨드를 실행하면 5단계 문체가이드와 3중 보이스 원칙에 맞춰 실시간으로 본문이 생성됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeResultTab === 'review' && (
                <div className="flex-1 flex flex-col space-y-3">
                  {reviewReport ? (
                    <div className="w-full flex-1 min-h-[460px] p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl font-mono text-slate-900 text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto">
                      {reviewReport}
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[460px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-700 text-sm">
                        10단계 품질 진단 리포트 대기 중
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        `/studio:10-review` 커맨드를 실행하면 대화 비중(35~45%), 복선 회수 현황, 클리프행어 강도를 자동 진단합니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guide Page Modal */}
      <AiCoachGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
