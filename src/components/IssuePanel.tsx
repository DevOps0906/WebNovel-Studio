import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { WebNovelProject } from '../data/projectTemplates';
import type { IssueItem } from '../data/storyData';
import { issueWarnings } from '../data/lore';

interface Props {
  project: WebNovelProject;
  onUpdateProject: (p: WebNovelProject) => void;
}

export const IssuePanel: React.FC<Props> = ({ project, onUpdateProject }) => {
  const list = project.unresolvedIssues || [];
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueItem['category']>('고증');
  const [dueChapter, setDueChapter] = useState('');
  const [error, setError] = useState('');

  const warnById = useMemo(() => new Map(issueWarnings(project).map((w) => [w.targetId, w])), [project]);
  const open = list.filter((i) => i.status === '미결').length;
  const resolved = list.length - open;

  const update = (next: IssueItem[]) => onUpdateProject({ ...project, unresolvedIssues: next });

  const toggle = (id: string) =>
    update(
      list.map((i) =>
        i.id === id
          ? i.status === '미결'
            ? { ...i, status: '해결', resolvedAt: new Date().toISOString().slice(0, 10), deferred: false }
            : { ...i, status: '미결', resolvedAt: undefined }
          : i
      )
    );

  const toggleDefer = (id: string) => update(list.map((i) => (i.id === id ? { ...i, deferred: !i.deferred } : i)));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (dueChapter.trim() && !/^ch\s*\d{1,2}$/i.test(dueChapter.trim())) {
      setError('결정 예정 챕터는 ch12 형식으로 입력하세요.');
      return;
    }
    update([
      {
        id: `iss-${Date.now()}`,
        title: title.trim(),
        description: '작가 검토 대기 과제',
        status: '미결',
        category,
        dueChapter: dueChapter.trim() ? dueChapter.trim().toLowerCase().replace(/\s+/g, '') : undefined,
      },
      ...list,
    ]);
    setTitle('');
    setDueChapter('');
    setError('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">미결 과제 (열림 {open} · 해결 {resolved})</h3>
          <p className="text-[11px] text-slate-400">결정 예정 챕터를 지나면 빨간색으로 표시됩니다. 보류는 명시적으로 표시한 항목만 제외됩니다.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>새 과제</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {list.map((issue) => {
          const w = warnById.get(issue.id);
          return (
            <div
              key={issue.id}
              className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                issue.status === '해결'
                  ? 'bg-slate-50/60 border-slate-200 opacity-70'
                  : w?.level === 'error'
                    ? 'bg-rose-100/60 border-rose-300'
                    : w?.level === 'warn'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">{issue.category}</span>
                  {issue.dueChapter && <span className="text-[10px] font-mono text-slate-500">결정 예정 {issue.dueChapter}</span>}
                  {issue.deferred && <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 rounded">보류</span>}
                  <span className={`text-xs font-bold ${issue.status === '해결' ? 'line-through text-slate-500' : 'text-slate-800'}`}>{issue.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{issue.description}</p>
                {w && <p className={`text-[11px] font-semibold ${w.level === 'error' ? 'text-rose-700' : 'text-amber-700'}`}>{w.message}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggle(issue.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    issue.status === '미결' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                  title="누르면 상태가 바뀝니다"
                >
                  {issue.status}
                </button>
                {issue.status === '미결' && (
                  <button type="button" onClick={() => toggleDefer(issue.id)} className="text-[10px] text-slate-500 underline">
                    {issue.deferred ? '보류 해제' : '보류'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 미결 과제 등록</h3>
              <button type="button" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">분류</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as IssueItem['category'])} className="w-full p-2 border rounded">
                  {(['고증', '구조', '인물', '타임라인', '설정'] as const).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">과제 제목 및 내용</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 6화 회장 독대 시 차 브랜드 고증" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">결정 예정 챕터 (선택, 예: ch08)</label>
                <input type="text" value={dueChapter} onChange={(e) => setDueChapter(e.target.value)} placeholder="ch08" className="w-full p-2 border rounded font-mono" />
              </div>
              {error && <div role="alert" className="text-red-700">{error}</div>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 rounded bg-slate-100 text-xs font-semibold">취소</button>
              <button type="submit" className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold">등록</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
