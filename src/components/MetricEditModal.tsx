import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, TrendingUp, BookOpen, Layers, Edit3, HelpCircle } from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';

interface MetricEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WebNovelProject;
  initialMetricKey?: string;
  onSave: (updatedProgress: WebNovelProject['currentProgress']) => void;
}

export const MetricEditModal: React.FC<MetricEditModalProps> = ({
  isOpen,
  onClose,
  project,
  initialMetricKey,
  onSave,
}) => {
  const p = project.currentProgress;

  const [form, setForm] = useState({
    episodesOrganized: p.episodesOrganized || 0,
    episodesTarget: p.episodesTarget || 30,
    totalWordCount: p.totalWordCount || 0,
    completedChapters: p.completedChapters || 0,
    totalChapters: p.totalChapters || 24,
    currentChapter: p.currentChapter || 'ch01',
    currentChapterTitle: p.currentChapterTitle || '',
    currentChapterScenesDone: p.currentChapterScenesDone || 0,
    currentChapterScenesTotal: p.currentChapterScenesTotal || 3,
    chapterForeshadowingResolved: p.chapterForeshadowingResolved || 0,
    chapterForeshadowingTotal: p.chapterForeshadowingTotal || 1,
    openIssues: p.openIssues || 0,
    nextStep: p.nextStep || '',
  });

  const [activeTab, setActiveTab] = useState<'episodes' | 'words' | 'chapters' | 'plot' | 'all'>('all');

  useEffect(() => {
    setForm({
      episodesOrganized: p.episodesOrganized || 0,
      episodesTarget: p.episodesTarget || 30,
      totalWordCount: p.totalWordCount || 0,
      completedChapters: p.completedChapters || 0,
      totalChapters: p.totalChapters || 24,
      currentChapter: p.currentChapter || 'ch01',
      currentChapterTitle: p.currentChapterTitle || '',
      currentChapterScenesDone: p.currentChapterScenesDone || 0,
      currentChapterScenesTotal: p.currentChapterScenesTotal || 3,
      chapterForeshadowingResolved: p.chapterForeshadowingResolved || 0,
      chapterForeshadowingTotal: p.chapterForeshadowingTotal || 1,
      openIssues: p.openIssues || 0,
      nextStep: p.nextStep || '',
    });

    if (initialMetricKey === 'episodesOrganized' || initialMetricKey === 'episodesTarget') {
      setActiveTab('episodes');
    } else if (initialMetricKey === 'totalWordCount') {
      setActiveTab('words');
    } else if (initialMetricKey === 'completedChapters' || initialMetricKey === 'currentChapter') {
      setActiveTab('chapters');
    } else if (initialMetricKey === 'chapterForeshadowingResolved' || initialMetricKey === 'openIssues') {
      setActiveTab('plot');
    } else {
      setActiveTab('all');
    }
  }, [project.id, initialMetricKey, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...p,
      // 계산값(화수, 분량, 완료 챕터, 현재 챕터 씬 수)은 입력을 받지 않고 현재 계산값을 유지한다.
      episodesOrganized: p.episodesOrganized,
      episodesTarget: Number(form.episodesTarget),
      totalWordCount: p.totalWordCount,
      completedChapters: p.completedChapters,
      totalChapters: Number(form.totalChapters),
      currentChapter: form.currentChapter,
      currentChapterTitle: form.currentChapterTitle,
      currentChapterScenesDone: p.currentChapterScenesDone,
      currentChapterScenesTotal: p.currentChapterScenesTotal,
      chapterForeshadowingResolved: Number(form.chapterForeshadowingResolved),
      chapterForeshadowingTotal: Number(form.chapterForeshadowingTotal),
      openIssues: Number(form.openIssues),
      nextStep: form.nextStep,
      commitDate: new Date().toLocaleDateString('ko-KR'),
    });
    onClose();
  };

  const progressPct = Math.min(100, Math.round((form.episodesOrganized / Math.max(1, form.episodesTarget)) * 100));
  const avgWordsPerEpisode = form.episodesOrganized > 0 ? Math.round(form.totalWordCount / form.episodesOrganized) : 5500;
  const chapterPct = Math.min(100, Math.round((form.completedChapters / Math.max(1, form.totalChapters)) * 100));
  const foreshadowingPct = Math.min(100, Math.round((form.chapterForeshadowingResolved / Math.max(1, form.chapterForeshadowingTotal)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  대시보드 카드뷰 수치 편집 & 상태 확인
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {project.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                《{project.title}》의 편성된 화수, 총 글자수, 완료 챕터 및 복선 현황을 실시간 수정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-slate-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            전체 지표 편집
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('episodes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'episodes'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            편성된 화 & 비축 목표
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('words')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'words'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            연재본 글자수
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chapters'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            진행 챕터 & 씬
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'plot'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            복선 회수 & 미결
          </button>
        </div>

        {/* Live Preview Summary Bar */}
        <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">실시간 반영 미리보기:</span>
            <span className="font-bold text-blue-700 font-mono">
              비축 {form.episodesOrganized}/{form.episodesTarget}화 ({progressPct}%)
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-800 font-mono">
              {Number(form.totalWordCount).toLocaleString()}자 (화당 약 {avgWordsPerEpisode.toLocaleString()}자)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>챕터: {form.completedChapters}/{form.totalChapters}</span>
            <span>·</span>
            <span>복선: {form.chapterForeshadowingResolved}/{form.chapterForeshadowingTotal} ({foreshadowingPct}%)</span>
          </div>
        </div>

        {/* Form Body */}
        <form id="metric-edit-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Episodes (편성된 화 & 오픈 비축 목표) */}
          {(activeTab === 'all' || activeTab === 'episodes') && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">1. 편성된 화 & 오픈 비축 목표 (화수)</h3>
                </div>
                <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  주 5일 연재 기준
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    현재 편성된 완성 화수 (Episodes Organized)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={form.episodesOrganized}
                      readOnly
                      disabled
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">화</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">씬·화 기록에서 자동 계산됩니다. 직접 입력할 수 없습니다.</p>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    오픈 목표 비축 화수 (Target Episodes)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={form.episodesTarget}
                      onChange={(e) => setForm({ ...form, episodesTarget: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">화</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">일반적으로 무료 공개 25~30화 + 유료 10화 = 30~40화 권장</p>
                </div>
              </div>

            </div>
          )}

          {/* Section 2: Total Word Count (연재본 글자수) */}
          {(activeTab === 'all' || activeTab === 'words') && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900">2. 연재본 분량 (총 누적 글자수)</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">공백 포함 기준</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    총 누적 집필 글자수 (Word Count)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={form.totalWordCount}
                      readOnly
                      disabled
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">자</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">씬 본문 합계(씬이 없는 화는 기록값)로 자동 계산됩니다.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">웹소설 화당 환산 계산기</span>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    약 {avgWordsPerEpisode.toLocaleString()}자 / 화
                  </div>
                  <p className="text-[10px] text-slate-400">카카오/문피아 기준 화당 5,000~5,500자가 권장 표준입니다.</p>
                </div>
              </div>

            </div>
          )}

          {/* Section 3: Chapters & Scenes (완료 챕터 및 현재 진행 씬) */}
          {(activeTab === 'all' || activeTab === 'chapters') && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900">3. 챕터 진행도 & 현재 집필 씬</h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  24챕터 100화 구조
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    검토 끝난 챕터 수 (Completed Chapters)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      value={form.completedChapters}
                      readOnly
                      disabled
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">/ {form.totalChapters}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    현재 작업 중인 챕터 ID & 챕터명
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={form.currentChapter}
                      onChange={(e) => setForm({ ...form, currentChapter: e.target.value })}
                      placeholder="ch03"
                      className="col-span-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={form.currentChapterTitle}
                      onChange={(e) => setForm({ ...form, currentChapterTitle: e.target.value })}
                      placeholder="사라진 지분과 비밀 금고"
                      className="col-span-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    현재 챕터 완료 씬 수
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={form.currentChapterScenesTotal}
                      value={form.currentChapterScenesDone}
                      readOnly
                      disabled
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">/ {form.currentChapterScenesTotal}씬</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    다음 작업 단계 안내 문구
                  </label>
                  <input
                    type="text"
                    value={form.nextStep}
                    onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
                    placeholder="씬 02 「게이트 붕괴」 집필 중"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Plot Foreshadowing & Open Issues (복선 회수 & 미결 과제) */}
          {(activeTab === 'all' || activeTab === 'plot') && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900">4. 복선 회수 현황 & 열린 미결 과제</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  플롯 무결성
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    이번 챕터 복선 회수 수 / 총 복선
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={form.chapterForeshadowingTotal}
                      value={form.chapterForeshadowingResolved}
                      onChange={(e) => setForm({ ...form, chapterForeshadowingResolved: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">
                      / {form.chapterForeshadowingTotal}개
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">대시보드 '이번 챕터 복선 회수' 카드에 반영</p>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    열린 미결 과제 건수 (Open Issues)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={form.openIssues}
                      onChange={(e) => setForm({ ...form, openIssues: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-rose-700 focus:bg-white focus:border-rose-500"
                    />
                    <span className="text-slate-500 font-mono font-bold shrink-0">건</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">대시보드 '열린 미결' 카드에 표기됩니다.</p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>수정 사항은 브라우저 로컬 저장소에 즉시 동기화 저장됩니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              form="metric-edit-form"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>대시보드 수치 저장하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
