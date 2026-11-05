import React, { useState, useEffect } from 'react';
import {
  CHAPTER_03_DATA,
  CHAPTER_04_DATA,
  ChapterData,
  SceneItem
} from '../data/storyData';
import { WebNovelProject } from '../data/projectTemplates';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, X, Edit3, Send, History } from 'lucide-react';
import type { ApplyResult } from '../data/aiClient';
import { ChapterGatePanel } from './ChapterGatePanel';
import { ScenePolishPanel } from './ScenePolishPanel';
import { browserStore } from '../data/storage';
import { historyKey, listVersions, REASON_LABEL, SceneVersion } from '../data/sceneHistory';

interface TabChapterProps {
  activeProject?: WebNovelProject;
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onOpenAiSceneDraft: (scene: SceneItem, chapterTitle: string) => void;
  projectId?: string;
  onUpdateProject?: (p: WebNovelProject) => void;
  onSaveSceneContent?: (chapterId: string, sceneId: string, text: string) => ApplyResult;
  onRestoreSceneContent?: (chapterId: string, sceneId: string, text: string) => ApplyResult;
}

export const TabChapter: React.FC<TabChapterProps> = ({
  activeProject,
  activeChapterId,
  onSelectChapter,
  onOpenAiSceneDraft,
  projectId,
  onUpdateProject,
  onSaveSceneContent,
  onRestoreSceneContent
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneItem | null>(null);
  const [isEditingScene, setIsEditingScene] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [sceneMessage, setSceneMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPolish, setShowPolish] = useState(false);
  const [versions, setVersions] = useState<SceneVersion[]>([]);

  // Extract chapters from activeProject or fallback
  const projectChapters: ChapterData[] = activeProject?.chapters
    ? Object.values(activeProject.chapters)
    : [CHAPTER_03_DATA, CHAPTER_04_DATA];

  // Resolve current active chapter
  const currentChapter: ChapterData =
    activeProject?.chapters?.[activeChapterId] ||
    projectChapters.find(ch => ch.id === activeChapterId) ||
    projectChapters[0] ||
    CHAPTER_03_DATA;

  // Local state for chapter tasks toggle
  const [chapterTasks, setChapterTasks] = useState(currentChapter.tasks || []);

  useEffect(() => {
    setChapterTasks(currentChapter.tasks || []);
  }, [currentChapter.id]);

  const toggleTask = (taskId: string) => {
    setChapterTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: t.status === '미결' ? '해결' : '미결' } : t))
    );
  };

  const refreshVersions = (scene: SceneItem | null) => {
    if (!scene || !projectId) {
      setVersions([]);
      return;
    }
    setVersions(listVersions(browserStore, historyKey(projectId, currentChapter.id, scene.id)));
  };

  const handleOpenScene = (scene: SceneItem) => {
    setSelectedScene(scene);
    setEditedText(scene.content);
    setIsEditingScene(false);
    setSceneMessage(null);
    setShowHistory(false);
    setShowPolish(false);
    refreshVersions(scene);
  };

  const reportResult = (result: ApplyResult, okText: string) => {
    if (result.scene) {
      setSelectedScene(result.scene);
      setEditedText(result.scene.content);
    }
    if (result.ok) {
      setSceneMessage({ ok: true, text: result.warning ? `${okText} (주의: ${result.warning})` : okText });
    } else {
      setSceneMessage({ ok: false, text: result.error || '저장하지 못했습니다.' });
    }
    refreshVersions(result.scene || selectedScene);
  };

  const handleSaveScene = () => {
    if (!selectedScene) return;
    if (!onSaveSceneContent) {
      setSceneMessage({ ok: false, text: '저장 기능이 연결되지 않았습니다.' });
      return;
    }
    const result = onSaveSceneContent(currentChapter.id, selectedScene.id, editedText);
    reportResult(result, '저장했습니다.');
    if (result.ok) setIsEditingScene(false);
  };

  const handleRestoreVersion = (version: SceneVersion) => {
    if (!selectedScene || !onRestoreSceneContent) return;
    const result = onRestoreSceneContent(currentChapter.id, selectedScene.id, version.content);
    reportResult(result, '선택한 버전으로 복원했습니다. 복원 직전 본문도 이력에 남았습니다.');
  };
  // Split scenes by stage
  const giScenes = currentChapter.scenes.filter(s => s.stage === '기');
  const seungScenes = currentChapter.scenes.filter(s => s.stage === '승');
  const jeonScenes = currentChapter.scenes.filter(s => s.stage === '전');
  const gyeolScenes = currentChapter.scenes.filter(s => s.stage === '결');

  return (
    <div className="space-y-6">
      {/* Chapter Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projectChapters.map((ch) => {
          const isSelected = ch.id === currentChapter.id;
          const isCurrentWriting = ch.status === '진행 중';
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : isCurrentWriting
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {isCurrentWriting && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              )}
              <span>{ch.id} {ch.title}</span>
            </button>
          );
        })}
      </div>

      {activeProject && onUpdateProject && (
        <ChapterGatePanel project={activeProject} chapterId={currentChapter.id} onUpdateProject={onUpdateProject} />
      )}

      {/* Chapter Details & Step Progress */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {currentChapter.arcId} {currentChapter.arcTitle}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentChapter.act}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">
              {currentChapter.id} 「{currentChapter.title}」 · {currentChapter.episodes}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              총 {currentChapter.plannedScenesCount}개 씬 구성 · 완성된 씬 {currentChapter.completedScenesCount}개 ({currentChapter.totalWords.toLocaleString()}자)
            </p>
          </div>

          {/* 4 Pipeline Steps */}
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <span className={`px-2 py-1 rounded text-[11px] font-semibold border ${
              currentChapter.steps.step6 === '완료' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              6 구성 {currentChapter.steps.step6}
            </span>
            <span className={`px-2 py-1 rounded text-[11px] font-semibold border ${
              currentChapter.steps.step8 === '완료' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : currentChapter.steps.step8 === '진행 중' ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-300' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              8 씬 집필 {currentChapter.steps.step8}
            </span>
            <span className={`px-2 py-1 rounded text-[11px] font-semibold border ${
              currentChapter.steps.step9 === '완료' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              9 화 편성 {currentChapter.steps.step9}
            </span>
            <span className={`px-2 py-1 rounded text-[11px] font-semibold border ${
              currentChapter.steps.step10 === '완료' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              10 검토 {currentChapter.steps.step10}
            </span>
          </div>
        </div>

        {/* Tasks in Chapter (이 챕터에서 정할 것) */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>이 챕터에서 정할 것 (미결 / 해결 토글)</span>
            <span className="text-[11px] text-slate-400 font-normal">클릭하여 상태 전환</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {chapterTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                  t.status === '미결'
                    ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60'
                    : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.status === '미결' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className={t.status === '해결' ? 'line-through text-slate-500' : 'text-slate-800 font-medium'}>
                    {t.text}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  t.status === '미결' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Stage Scene Board (기·승·전·결) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900">씬 보드</h3>
            <p className="text-[11px] text-slate-400">카드를 누르면 본문 읽기 및 AI 코치 집필이 열려요.</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            총 {currentChapter.scenes.length}개 씬
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1: 기 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
              <span>기 (起)</span>
              <span className="text-[11px] text-slate-400 font-mono">{giScenes.length}개</span>
            </div>
            <div className="space-y-2">
              {giScenes.map((s) => (
                <SceneCard key={s.id} scene={s} onClick={() => handleOpenScene(s)} />
              ))}
            </div>
          </div>

          {/* Stage 2: 승 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
              <span>승 (承)</span>
              <span className="text-[11px] text-slate-400 font-mono">{seungScenes.length}개</span>
            </div>
            <div className="space-y-2">
              {seungScenes.map((s) => (
                <SceneCard key={s.id} scene={s} onClick={() => handleOpenScene(s)} />
              ))}
            </div>
          </div>

          {/* Stage 3: 전 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
              <span>전 (轉)</span>
              <span className="text-[11px] text-slate-400 font-mono">{jeonScenes.length}개</span>
            </div>
            <div className="space-y-2">
              {jeonScenes.map((s) => (
                <SceneCard key={s.id} scene={s} onClick={() => handleOpenScene(s)} />
              ))}
            </div>
          </div>

          {/* Stage 4: 결 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
              <span>결 (結)</span>
              <span className="text-[11px] text-slate-400 font-mono">{gyeolScenes.length}개</span>
            </div>
            <div className="space-y-2">
              {gyeolScenes.map((s) => (
                <SceneCard key={s.id} scene={s} onClick={() => handleOpenScene(s)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Episode Grouping & Foreshadowing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Episode Grouping Bar Visualization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900">화 편성 (씬 결합 및 분량)</h3>
            <p className="text-[11px] text-slate-400">화당 목표 6,000~8,000자</p>
          </div>

          {activeChapterId === 'ch03' ? (
            <div className="space-y-4 text-xs">
              {/* 10화 */}
              <div>
                <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
                  <span>10화 「서류의 진실」 (씬 1~5)</span>
                  <span className="text-blue-600 font-mono">6,403자</span>
                </div>
                <div className="w-full bg-slate-100 h-5 rounded overflow-hidden flex border border-slate-200">
                  <div className="bg-blue-300 h-full w-[18%]" title="씬01: 1,152자"></div>
                  <div className="bg-blue-400 h-full w-[14%]" title="씬02: 901자"></div>
                  <div className="bg-blue-500 h-full w-[20%]" title="씬03: 1,296자"></div>
                  <div className="bg-blue-600 h-full w-[27%]" title="씬04: 1,733자"></div>
                  <div className="bg-indigo-600 h-full w-[21%]" title="씬05: 1,304자 (★엔딩)"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>씬 01~05</span>
                  <span>엔딩 훅: 반전형 (인식 뒤집힘)</span>
                </div>
              </div>

              {/* 11화 */}
              <div>
                <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
                  <span>11화 「차남의 손길」 (씬 6~10)</span>
                  <span className="text-blue-600 font-mono">7,041자</span>
                </div>
                <div className="w-full bg-slate-100 h-5 rounded overflow-hidden flex border border-slate-200">
                  <div className="bg-blue-400 h-full w-[15%]" title="씬06: 1,054자"></div>
                  <div className="bg-blue-300 h-full w-[11%]" title="씬06b: 736자"></div>
                  <div className="bg-blue-400 h-full w-[11%]" title="씬07: 743자"></div>
                  <div className="bg-blue-600 h-full w-[31%]" title="씬08: 2,143자"></div>
                  <div className="bg-blue-500 h-full w-[21%]" title="씬09: 1,504자"></div>
                  <div className="bg-indigo-600 h-full w-[11%]" title="씬10: 882자 (★엔딩)"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>씬 06~10</span>
                  <span>엔딩 훅: 반전형 (이름 호명)</span>
                </div>
              </div>

              {/* 12화 */}
              <div>
                <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
                  <span>12화 「식탁의 서열」 (씬 11~14)</span>
                  <span className="text-blue-600 font-mono">7,210자</span>
                </div>
                <div className="w-full bg-slate-100 h-5 rounded overflow-hidden flex border border-slate-200">
                  <div className="bg-blue-400 h-full w-[22%]" title="씬11: 1,599자"></div>
                  <div className="bg-blue-600 h-full w-[30%]" title="씬12: 2,156자"></div>
                  <div className="bg-blue-500 h-full w-[20%]" title="씬13: 1,449자"></div>
                  <div className="bg-emerald-600 h-full w-[28%]" title="씬14: 2,310자 (★1막 클리프행어)"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>씬 11~14</span>
                  <span>엔딩 훅: 위기형 (1막 완결 클리프행어)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-2">
              <div className="font-bold text-slate-800">ch04 9단계 화 편성 대기 중</div>
              <p>씬 1~11 본문 집필(8단계)이 완료되면 6,000~8,000자 기준으로 13~17화에 자동 편성됩니다.</p>
              <div className="flex gap-2 text-[11px] text-blue-600">
                <span>· 13화: 씬 01~03 (가족의 시선)</span>
                <span>· 14화: 씬 04~05 (첫 반격)</span>
                <span>· 17화: 씬 10~11 ("네 말이 맞다")</span>
              </div>
            </div>
          )}
        </div>

        {/* Chapter Foreshadowing Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900">이 챕터 복선 현황</h3>
            <p className="text-[11px] text-slate-400">앞 챕터에서 심은 것 회수 및 신규 복선 투입</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Resolved in this chapter */}
            <div>
              <span className="font-bold text-slate-800 block mb-1.5">
                이 챕터에서 회수한 복선 ({currentChapter.foreshadowingResolved.length}건)
              </span>
              {currentChapter.foreshadowingResolved.length > 0 ? (
                <div className="space-y-1.5">
                  {currentChapter.foreshadowingResolved.map((f) => (
                    <div key={f.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center gap-2">
                      <div>
                        <span className="font-mono text-slate-500 font-bold mr-1">[{f.source}]</span>
                        <span className="font-medium text-slate-800">{f.text}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">회수: {f.resolvedAt}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        회수됨
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded text-slate-400 text-center">
                  이 챕터에서 회수 예정인 복선 1건 대기 중
                </div>
              )}
            </div>

            {/* Planted in this chapter */}
            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 block mb-1.5">
                이 챕터에서 심은 복선 ({currentChapter.foreshadowingPlanted.length}건)
              </span>
              <div className="space-y-1.5">
                {currentChapter.foreshadowingPlanted.map((f) => (
                  <div key={f.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center gap-2">
                    <div>
                      <span className="font-mono text-slate-500 font-bold mr-1">[{f.source}]</span>
                      <span className="font-medium text-slate-800">{f.text}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">회수 목표: {f.target}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Detail & Editor Modal */}
      {selectedScene && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    씬 {selectedScene.sceneNumber} · {selectedScene.stage}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 font-mono">
                    {selectedScene.pacing} · {selectedScene.episode}화 · {selectedScene.wordCount.toLocaleString()}자
                  </span>
                  {selectedScene.isEndingHook && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedScene.hookType || '★ 엔딩 훅'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  「{selectedScene.title}」
                </h3>
              </div>
              <button
                onClick={() => setSelectedScene(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 overflow-y-auto pr-1 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">줄거리 개요</span>
                <p className="text-slate-600 leading-relaxed">{selectedScene.synopsis}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  등장인물: {selectedScene.characters.join(', ')}
                </div>
              </div>

              {/* Prose Content Area */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>원문 본문 ({editedText.length.toLocaleString()}자)</span>
                  </span>
                  {!isEditingScene ? (
                    <button
                      onClick={() => setIsEditingScene(true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>수정 모드</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveScene}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>저장</span>
                    </button>
                  )}
                </div>

                {isEditingScene ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={12}
                    className="w-full p-3 font-mono text-xs text-slate-800 border border-blue-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                ) : (
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 whitespace-pre-wrap font-sans text-xs leading-loose max-h-72 overflow-y-auto">
                    {selectedScene.content || '본문이 아직 작성되지 않았습니다. AI 코치를 통해 초안을 작성해보세요.'}
                  </div>
                )}
              </div>
            </div>

            {sceneMessage && (
              <div
                role="status"
                className={`text-[11px] font-semibold px-3 py-1.5 rounded border shrink-0 ${
                  sceneMessage.ok ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-800 bg-red-50 border-red-200'
                }`}
              >
                {sceneMessage.text}
              </div>
            )}

            {showPolish && activeProject && selectedScene && (
              <div className="shrink-0 max-h-[46vh] overflow-y-auto">
                <ScenePolishPanel
                  project={activeProject}
                  chapterId={currentChapter.id}
                  scene={selectedScene}
                  onSaveSceneContent={onSaveSceneContent}
                  onUpdateProject={onUpdateProject}
                />
              </div>
            )}

            {showHistory && (
              <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto shrink-0 text-xs divide-y divide-slate-100">
                {versions.length === 0 ? (
                  <div className="p-3 text-slate-400">저장된 이전 버전이 없습니다.</div>
                ) : (
                  versions.map((v) => (
                    <div key={v.id} className="p-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] text-slate-500">
                          {new Date(v.savedAt).toLocaleString()} · {REASON_LABEL[v.reason]} · {v.wordCount.toLocaleString()}자
                        </div>
                        <div className="text-slate-700 truncate">{v.content.slice(0, 80)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(v)}
                        className="shrink-0 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                      >
                        복원
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  onOpenAiSceneDraft(selectedScene, currentChapter.title);
                  setSelectedScene(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI 코치로 씬 집필/다듬기</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPolish((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
              >
                <span>윤문·점검</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  refreshVersions(selectedScene);
                  setShowHistory((v) => !v);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>버전 이력 ({versions.length})</span>
              </button>

              <button
                onClick={() => setSelectedScene(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Scene Card
const SceneCard: React.FC<{ scene: SceneItem; onClick: () => void }> = ({ scene, onClick }) => {
  const isHook = scene.isEndingHook;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all cursor-pointer select-none space-y-1.5 ${
        isHook
          ? 'bg-blue-50/40 border-blue-400 hover:bg-blue-50 shadow-2xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex justify-between items-center text-xs">
        <span className={`font-bold ${isHook ? 'text-blue-800' : 'text-slate-800'}`}>
          {scene.sceneNumber} {scene.title}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
          scene.status === '본문 완료'
            ? 'bg-emerald-100 text-emerald-800'
            : scene.status === '집필 중'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {scene.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>{scene.pacing} · {scene.episode}화</span>
        <span>{scene.wordCount.toLocaleString()}자</span>
      </div>

      {isHook && (
        <div className="text-[10px] font-bold text-blue-600">
          {scene.hookType || '★ 엔딩 훅'}
        </div>
      )}
    </div>
  );
};
