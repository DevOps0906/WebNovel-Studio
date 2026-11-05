import React, { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import type { WebNovelProject } from '../data/projectTemplates';
import { chapterGate, confirmChapter, reopenChapter } from '../data/lore';

interface Props {
  project: WebNovelProject;
  chapterId: string;
  onUpdateProject: (p: WebNovelProject) => void;
}

export const ChapterGatePanel: React.FC<Props> = ({ project, chapterId, onUpdateProject }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const chapter = project.chapters?.[chapterId];
  const gate = useMemo(() => chapterGate(project, chapterId), [project, chapterId]);
  if (!chapter) return null;

  const confirmed = chapter.status === '검토 완료';

  const handleConfirm = () => {
    const r = confirmChapter(project, chapterId);
    if (r.ok) {
      onUpdateProject(r.project);
      setMessage({ ok: true, text: `${chapterId} 을(를) 확정했습니다.` });
    } else {
      setMessage({ ok: false, text: r.error });
    }
  };

  const handleReopen = () => {
    onUpdateProject(reopenChapter(project, chapterId));
    setMessage({ ok: true, text: `${chapterId} 확정을 취소하고 진행 중으로 되돌렸습니다.` });
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-xs space-y-2 ${confirmed ? 'border-emerald-200 bg-emerald-50/60' : gate.ok ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          {confirmed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-slate-500" />}
          <span>
            챕터 확정 {confirmed ? '(확정됨)' : gate.ok ? '(조건 충족)' : `(막힌 항목 ${gate.blockers.length}건)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen((v) => !v)} className="underline text-slate-600">
            {open ? '점검표 닫기' : '점검표 보기'}
          </button>
          {confirmed ? (
            <button type="button" onClick={handleReopen} className="px-3 py-1 rounded bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">
              확정 취소
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!gate.ok}
              title={gate.ok ? '이 챕터를 확정합니다' : '막힌 항목을 먼저 처리해야 합니다'}
              className="px-3 py-1 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              챕터 확정
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="space-y-1.5">
          {gate.blockers.length === 0 ? (
            <div className="text-emerald-700">막힌 항목이 없습니다.</div>
          ) : (
            gate.blockers.map((b, i) => (
              <div key={i} className="text-rose-800">
                ✕ {b}
              </div>
            ))
          )}
          {gate.warnings.map((w, i) => (
            <div key={i} className="text-amber-800">
              ! {w}
            </div>
          ))}
        </div>
      )}

      {message && (
        <div role="status" className={message.ok ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
          {message.text}
        </div>
      )}
    </div>
  );
};
