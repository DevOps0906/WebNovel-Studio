import React, { useState } from 'react';
import { Bot, Sparkles, Send, CheckCircle2, RefreshCw, X, ShieldAlert, BookOpen, Settings } from 'lucide-react';
import { SceneItem } from '../data/storyData';
import { getActiveAiCredentials } from '../data/aiSettings';
import { AiCoachGuideModal } from './AiCoachGuideModal';
import { WebNovelProject } from '../data/projectTemplates';
import { requestAi, describeModel, buildStyleGuide, ApplyResult, ApplyTarget } from '../data/aiClient';

interface AiCoachDrawerProps {
  activeProject: WebNovelProject;
  isOpen: boolean;
  onClose: () => void;
  activeScene?: SceneItem | null;
  activeChapterTitle?: string;
  onApplySceneText?: (text: string, target: ApplyTarget) => ApplyResult;
  onOpenSettingsModal?: () => void;
}

export const AiCoachDrawer: React.FC<AiCoachDrawerProps> = ({
  activeProject,
  isOpen,
  onClose,
  activeScene,
  activeChapterTitle,
  onApplySceneText,
  onOpenSettingsModal,
}) => {
  const [command, setCommand] = useState<string>('/studio:08-scene');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [reviewReport, setReviewReport] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [modelUsedNotice, setModelUsedNotice] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [applyMessage, setApplyMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [generatedFor, setGeneratedFor] = useState<ApplyTarget | null>(null);

  if (!isOpen) return null;

  const credentials = getActiveAiCredentials();

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setResultText('');
    setReviewReport('');
    setModelUsedNotice('');
    setErrorMessage('');
    setApplyMessage(null);
    const styleGuide = buildStyleGuide(activeProject);
    const isReview = command === '/studio:10-review' || command === '/aiwc:10-review';

    if (isReview) {
      const result = await requestAi<{ review: string }>('/api/aiwc/review-chapter', {
        sceneText: (activeScene?.content || '').trim(),
        chapterData: activeChapterTitle,
        styleGuide,
        provider: credentials.provider,
        apiKey: credentials.apiKey,
        model: credentials.model,
      }, undefined, { projectId: activeProject.id });
      if (result.ok) {
        setReviewReport(result.data.review);
        setModelUsedNotice(describeModel(result.data, credentials.model));
      } else {
        setErrorMessage(result.error);
      }
    } else {
      const result = await requestAi<{ text: string }>('/api/aiwc/generate-scene', {
        projectTitle: activeProject.title,
        chapterTitle: activeChapterTitle,
        sceneNumber: activeScene?.sceneNumber || '01',
        sceneTitle: activeScene?.title || '',
        pacingType: activeScene?.pacing || '전진',
        isEndingHook: activeScene?.isEndingHook || false,
        synopsis: activeScene?.synopsis || customPrompt,
        characters: activeScene?.characters?.join(', '),
        customPrompt,
        styleGuide,
        provider: credentials.provider,
        apiKey: credentials.apiKey,
        model: credentials.model,
        temperature: credentials.temperature,
        maxTokens: credentials.maxTokens,
      }, undefined, { projectId: activeProject.id });
      if (result.ok) {
        setResultText(result.data.text);
        setGeneratedFor({ projectId: activeProject.id, sceneId: activeScene?.id });
        setModelUsedNotice(describeModel(result.data, credentials.model));
      } else {
        setErrorMessage(result.error);
      }
    }
    setLoading(false);
  };

  const handleApply = () => {
    if (!resultText || !onApplySceneText || !generatedFor) return;
    const result = onApplySceneText(resultText, generatedFor);
    if (result.ok) {
      setApplyMessage({ ok: true, text: '반영하고 저장했습니다.' });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setApplyMessage({ ok: false, text: result.error || '반영하지 못했습니다.' });
    }
  };
  const providerLabel = credentials.provider.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Container */}
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>WebNovel-Studio 페어 라이팅 코치</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded border border-blue-400/40 font-mono">
                  {providerLabel} · {credentials.model.split('-')[0]}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">11단계 공학적 파이프라인 & 05-문체가이드 자동 적용 (모달 모드)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              title="AI 페어 라이팅 코치 사용방법 (가이드 페이지)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>가이드 페이지</span>
            </button>

            {onOpenSettingsModal && (
              <button
                onClick={onOpenSettingsModal}
                title="AI 모델 & API 키 설정 변경"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Target Context Pill */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between">
        <div className="text-slate-600 truncate">
          <span className="font-semibold text-slate-800">대상: </span>
          {activeScene ? (
            <span>{activeScene.sceneNumber}번 씬 「{activeScene.title}」 ({activeScene.pacing})</span>
          ) : (
            <span>ch04 전체 챕터 컨텍스트</span>
          )}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
          3중 보이스 모드
        </span>
      </div>

      {/* Drawer Body */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* Pipeline Command Quick Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 block">WebNovel-Studio 파이프라인 커맨드</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { cmd: '/studio:08-scene', label: '8단계 씬 본문 집필' },
              { cmd: '/studio:10-review', label: '10단계 문체/복선 검토' },
              { cmd: '/studio:06-chapter', label: '6단계 기승전결 구조' },
              { cmd: '/studio:cliffhanger', label: '엔딩 훅(Hook) 강화' }
            ].map(item => (
              <button
                key={item.cmd}
                onClick={() => setCommand(item.cmd)}
                className={`p-2 rounded text-left font-mono font-medium border transition-colors ${
                  command === item.cmd
                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] text-slate-400">{item.cmd}</div>
                <div className="text-xs text-slate-800">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Textarea */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 block">집필 방향 및 추가 요구사항</label>
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="예: 회장의 질문에 침착하게 숫자를 들어 방어하되, 상대의 미세한 동공 흔들림과 손가락 경련을 포착하는 서술을 넣어줘."
            rows={3}
            className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>WebNovel-Studio 엔진 집필 및 검토 중 ({providerLabel})...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>실행하기 ({command})</span>
            </>
          )}
        </button>

        {errorMessage && (
          <div role="alert" className="text-[11px] text-red-800 bg-red-50 px-2.5 py-1.5 rounded border border-red-200">
            <span className="font-bold">AI 호출 실패:</span> {errorMessage}
          </div>
        )}
        {applyMessage && (
          <div
            role="status"
            className={`text-[11px] font-semibold ${applyMessage.ok ? 'text-emerald-700' : 'text-red-600'}`}
          >
            {applyMessage.text}
          </div>
        )}

        {modelUsedNotice && (
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 flex justify-between">
            <span>생성 모델: {modelUsedNotice}</span>
            <span className="text-emerald-600 font-bold">생성 완료</span>
          </div>
        )}

        {/* Output Section 1: Generated Scene */}
        {resultText && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>집필 완성본 ({resultText.length}자)</span>
              </span>
              <button
                onClick={handleApply}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition-colors"
              >
                {copied ? '반영 완료!' : '씬 본문에 즉시 반영'}
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-serif whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {resultText}
            </div>
          </div>
        )}

        {/* Output Section 2: Review Report */}
        {reviewReport && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>10단계 품질 진단 리포트</span>
            </span>
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-slate-800 font-mono whitespace-pre-wrap leading-relaxed text-[11px] max-h-60 overflow-y-auto">
              {reviewReport}
            </div>
          </div>
        )}
      </div>

      {/* Guide Page Modal */}
      <AiCoachGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      </div>
    </div>
  );
};
