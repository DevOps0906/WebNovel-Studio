import React, { useState } from 'react';
import { X, Check, Edit3, Layers, BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ArcItem, EpisodeItem } from '../data/storyData';

// 1. Arc Edit Modal
interface ArcEditModalProps {
  arc: ArcItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedArc: ArcItem) => void;
}

export const ArcEditModal: React.FC<ArcEditModalProps> = ({
  arc,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !arc) return null;

  const [title, setTitle] = useState(arc.title);
  const [chapters, setChapters] = useState(arc.chapters);
  const [done, setDone] = useState(arc.done);
  const [total, setTotal] = useState(arc.total);
  const [act, setAct] = useState(arc.act);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...arc,
      title,
      chapters,
      done: Number(done),
      total: Number(total),
      act,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>{arc.id} 아크 정보 편집</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {act}
                </span>
              </h3>
              <p className="text-xs text-slate-500">아크 제목, 배정 챕터 범위 및 검토 진척도를 수정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">아크 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-slate-900"
              placeholder="예: 동생의 이름으로"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">배정 챕터 범위</label>
              <input
                type="text"
                value={chapters}
                onChange={(e) => setChapters(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-slate-900"
                placeholder="ch01~04"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">소속 막(Act)</label>
              <input
                type="text"
                value={act}
                onChange={(e) => setAct(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900"
                placeholder="1막 (arc01)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">검토 완료 챕터 수</label>
              <input
                type="number"
                min={0}
                max={total}
                value={done}
                onChange={(e) => setDone(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">아크 총 챕터 수</label>
              <input
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-blue-900 text-[11px] leading-relaxed">
            💡 <strong>11단계 공학적 규칙:</strong> 아크의 마지막 챕터까지 10단계 씬 집필/문체 검토를 마치면 11단계 아크 검토를 완료 상태로 전환합니다.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>변경사항 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Word Count & Episodes Edit Modal
interface WordCountEditModalProps {
  episodes: EpisodeItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEpisodes: EpisodeItem[]) => void;
}

export const WordCountEditModal: React.FC<WordCountEditModalProps> = ({
  episodes,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [list, setList] = useState<EpisodeItem[]>(episodes);

  const handleWordChange = (idx: number, words: number) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], words };
    setList(updated);
  };

  const handleTitleChange = (idx: number, title: string) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], title };
    setList(updated);
  };

  const handleHookChange = (idx: number, hook: string) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], hook };
    setList(updated);
  };

  const avgWords = Math.round(list.reduce((acc, ep) => acc + (ep.words || 0), 0) / (list.length || 1));
  const minWords = Math.min(...list.map(ep => ep.words || 0));
  const maxWords = Math.max(...list.map(ep => ep.words || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 z-10 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">연재본 화별 분량 및 클리프행어 편집</h3>
              <p className="text-xs text-slate-500">1~12화의 회차별 분량(글자수), 소제목 및 엔딩 훅을 수정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time word count metric chips */}
        <div className="grid grid-cols-3 gap-2.5 my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs shrink-0">
          <div className="text-center">
            <div className="text-[10px] text-slate-400">최소 글자수</div>
            <div className="font-bold text-slate-700 font-mono">{minWords.toLocaleString()}자</div>
          </div>
          <div className="text-center border-x border-slate-200">
            <div className="text-[10px] text-slate-400">평균 글자수 (권장 6~8천자)</div>
            <div className="font-extrabold text-blue-700 font-mono text-sm">{avgWords.toLocaleString()}자</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400">최고 글자수</div>
            <div className="font-bold text-slate-700 font-mono">{maxWords.toLocaleString()}자</div>
          </div>
        </div>

        {/* Scrollable Episode List */}
        <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 py-1">
          {list.map((ep, idx) => (
            <div key={ep.episode} className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {ep.episode}화
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-500">분량(글자수):</label>
                  <input
                    type="number"
                    value={ep.words}
                    onChange={(e) => handleWordChange(idx, Number(e.target.value))}
                    step={100}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded focus:border-blue-500 text-right"
                  />
                  <span className="text-xs text-slate-400 font-mono">자</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">화 제목 / 주요 사건</label>
                  <input
                    type="text"
                    value={ep.title}
                    onChange={(e) => handleTitleChange(idx, e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded focus:border-blue-500"
                    placeholder="소제목"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">엔딩 훅 (클리프행어)</label>
                  <input
                    type="text"
                    value={ep.hook}
                    onChange={(e) => handleHookChange(idx, e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded focus:border-blue-500"
                    placeholder="클리프행어 내용"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>분량 설정 저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Design Stage Edit Modal
export interface DesignStageItem {
  step: string;
  name: string;
  date: string;
  notes?: string;
}

interface DesignStageEditModalProps {
  stage: DesignStageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStage: DesignStageItem) => void;
}

export const DesignStageEditModal: React.FC<DesignStageEditModalProps> = ({
  stage,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !stage) return null;

  const [name, setName] = useState(stage.name);
  const [date, setDate] = useState(stage.date);
  const [notes, setNotes] = useState(stage.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...stage,
      name,
      date,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>{stage.step}단계 설계 상태 편집</span>
              </h3>
              <p className="text-xs text-slate-500">11단계 공학적 설계 단계 완료 일정 및 내용을 수정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">설계 단계명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-slate-900"
              placeholder="예: 발상 및 컨셉화"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">진행 현황 및 완료일자</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-emerald-700 font-bold"
              placeholder="예: 10-05 완료, 10-07 초안 -> 10-09 확정"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">설계 메모 및 핵심 산출물</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 leading-relaxed text-slate-800"
              placeholder="이 단계에서 확립된 핵심 규칙, 세계관 설정 또는 시놉시스 메모"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>단계 설정 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
