import React, { useMemo, useState } from 'react';
import { Search, Plus, X, AlertTriangle } from 'lucide-react';
import type { WebNovelProject } from '../data/projectTemplates';
import type { ForeshadowingItem } from '../data/storyData';
import {
  FORESHADOW_FLOW,
  ForeshadowStatus,
  TransitionResult,
  addPartialPayoff,
  addPlanting,
  changePayoffChapter,
  chapterId,
  foreshadowWarnings,
  payoffChapterOf,
  transitionForeshadow,
} from '../data/lore';

interface Props {
  project: WebNovelProject;
  onUpdateProject: (p: WebNovelProject) => void;
}

const FILTERS = ['전체', '심을 예정', '심음', '회수 예정', '회수됨', '회수 취소'] as const;

const statusClass = (s: ForeshadowStatus) =>
  s === '회수됨'
    ? 'bg-emerald-100 text-emerald-800'
    : s === '심음'
      ? 'bg-blue-100 text-blue-800'
      : s === '회수 예정'
        ? 'bg-indigo-100 text-indigo-800'
        : s === '회수 취소'
          ? 'bg-slate-200 text-slate-500 line-through'
          : 'bg-slate-100 text-slate-600';

export const ForeshadowPanel: React.FC<Props> = ({ project, onUpdateProject }) => {
  const list = project.foreshadowing || [];
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('전체');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ location: '', title: '', payoff: '', payoffChapter: '' });
  const [formError, setFormError] = useState('');

  const warnings = useMemo(() => foreshadowWarnings(project), [project]);
  const warnById = useMemo(() => new Map(warnings.map((w) => [w.targetId, w])), [warnings]);

  const filtered = list.filter((f) => {
    const okFilter = filter === '전체' || f.status === filter;
    const q = search.toLowerCase();
    const okSearch = !q || f.title.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.payoff.toLowerCase().includes(q);
    return okFilter && okSearch;
  });

  const replaceItem = (item: ForeshadowingItem) =>
    onUpdateProject({ ...project, foreshadowing: list.map((f) => (f.id === item.id ? item : f)) });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.payoffChapter.trim() && !/^ch\s*\d{1,2}$/i.test(form.payoffChapter.trim())) {
      setFormError('회수 예정 챕터는 ch12 형식으로 입력하세요.');
      return;
    }
    const item: ForeshadowingItem = {
      id: `fs-${Date.now()}`,
      location: form.location.trim() || project.currentProgress.currentChapter,
      title: form.title.trim(),
      description: '새로 등록된 복선',
      payoff: form.payoff.trim() || '회수 지점 미정',
      status: '심을 예정',
      arc: '',
      payoffChapter: form.payoffChapter.trim() ? form.payoffChapter.trim().toLowerCase().replace(/\s+/g, '') : undefined,
    };
    onUpdateProject({ ...project, foreshadowing: [item, ...list] });
    setForm({ location: '', title: '', payoff: '', payoffChapter: '' });
    setFormError('');
    setIsAdding(false);
  };

  const selected = list.find((f) => f.id === selectedId) || null;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">복선 목록 (작품 전체)</h3>
          <p className="text-[11px] text-slate-400">심을 예정 → 심음 → 회수 예정 → 회수됨 / 회수 취소. 행을 누르면 상세와 이력이 열립니다.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>새 복선</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] flex-wrap">
          {FILTERS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${filter === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab} {tab === '전체' ? list.length : list.filter((f) => f.status === tab).length || ''}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-40">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="복선 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white shadow-2xs">
            <tr className="text-slate-400 text-[11px] border-b border-slate-100">
              <th className="text-left pb-1.5 font-medium">챕터/씬</th>
              <th className="text-left pb-1.5 font-medium">복선 내용</th>
              <th className="text-left pb-1.5 font-medium">회수 예정</th>
              <th className="text-right pb-1.5 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((f) => {
              const w = warnById.get(f.id);
              const due = payoffChapterOf(f);
              return (
                <tr
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`cursor-pointer transition-colors ${w?.level === 'error' ? 'bg-rose-50 hover:bg-rose-100' : w?.level === 'warn' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-2.5 font-mono text-slate-500 font-semibold">{f.location}</td>
                  <td className="py-2.5 font-medium text-slate-800">
                    {w && w.level !== 'info' && (
                      <AlertTriangle className={`inline w-3 h-3 mr-1 ${w.level === 'error' ? 'text-rose-600' : 'text-amber-600'}`} aria-label={w.message} />
                    )}
                    {f.title}
                    {w && w.level !== 'info' && <div className={`text-[10px] ${w.level === 'error' ? 'text-rose-700' : 'text-amber-700'}`}>{w.message}</div>}
                  </td>
                  <td className="py-2.5 text-slate-500 text-[11px]">
                    {due !== null ? <span className="font-mono font-bold">{chapterId(due)}</span> : <span className="text-slate-400">미정</span>}
                    <div className="text-slate-400 truncate max-w-[180px]">{f.payoff}</div>
                  </td>
                  <td className="text-right py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass(f.status)}`}>{f.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <ForeshadowDetail
          item={selected}
          onClose={() => setSelectedId(null)}
          onChange={replaceItem}
        />
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 복선 등록</h3>
              <button type="button" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">심을 위치 (예: ch04 s01)</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="ch04 s01" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="font-semibold block mb-1">복선 내용</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 차남의 만년필 각인" className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="font-semibold block mb-1">회수 예정 챕터</label>
                  <input type="text" value={form.payoffChapter} onChange={(e) => setForm({ ...form, payoffChapter: e.target.value })} placeholder="ch18" className="w-full p-2 border rounded font-mono" />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold block mb-1">회수 방법 메모</label>
                  <input type="text" value={form.payoff} onChange={(e) => setForm({ ...form, payoff: e.target.value })} placeholder="예: 고모와의 대면에서 증거로 제시" className="w-full p-2 border rounded" />
                </div>
              </div>
              {formError && <div role="alert" className="text-red-700">{formError}</div>}
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

const ForeshadowDetail: React.FC<{
  item: ForeshadowingItem;
  onClose: () => void;
  onChange: (item: ForeshadowingItem) => void;
}> = ({ item, onClose, onChange }) => {
  const [chapter, setChapter] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const apply = (r: TransitionResult) => {
    if (r.ok) {
      onChange(r.item);
      setError('');
      setNote('');
    } else {
      setError(r.error);
    }
  };

  const nexts = FORESHADOW_FLOW[item.status];
  const events = item.events || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-3 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto text-xs">
        <div className="flex justify-between items-start border-b pb-2">
          <div>
            <div className="text-[11px] font-mono text-slate-500">{item.location} → {item.payoffChapter || '회수 예정 미지정'}</div>
            <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
            <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span>
          </div>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-semibold block mb-1">챕터 (예: ch05)</label>
            <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="ch05" className="w-full p-2 border rounded font-mono" />
          </div>
          <div>
            <label className="font-semibold block mb-1">메모</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {nexts.map((to) => (
            <button
              key={to}
              type="button"
              onClick={() => apply(transitionForeshadow(item, to, { chapter: chapter.trim() || undefined, note: note.trim() || undefined }))}
              className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
            >
              {to}(으)로
            </button>
          ))}
          <button type="button" onClick={() => apply(addPlanting(item, chapter.trim(), note.trim() || undefined))} className="px-2.5 py-1 rounded bg-slate-100 font-semibold hover:bg-slate-200">
            추가로 심기
          </button>
          <button type="button" onClick={() => apply(addPartialPayoff(item, chapter.trim(), note.trim() || undefined))} className="px-2.5 py-1 rounded bg-slate-100 font-semibold hover:bg-slate-200">
            부분 회수
          </button>
          <button type="button" onClick={() => apply(changePayoffChapter(item, chapter.trim()))} className="px-2.5 py-1 rounded bg-slate-100 font-semibold hover:bg-slate-200">
            회수 예정 챕터 변경
          </button>
        </div>
        {error && <div role="alert" className="text-red-700">{error}</div>}

        <div>
          <div className="font-semibold mb-1">이력</div>
          {events.length === 0 ? (
            <div className="text-slate-400">기록된 이력이 없습니다.</div>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {events.map((e, i) => (
                <li key={i} className="font-mono text-[11px] text-slate-600">
                  {new Date(e.at).toLocaleString()} · {e.kind}
                  {e.from && e.to ? ` (${e.from} → ${e.to})` : ''}
                  {e.chapter ? ` · ${e.chapter}` : ''}
                  {e.note ? ` · ${e.note}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
