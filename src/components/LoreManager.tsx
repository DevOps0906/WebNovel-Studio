import React, { useMemo, useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import type { WebNovelProject } from '../data/projectTemplates';
import { DecisionItem, ImpactHit, ResearchItem, addDecision, findImpact, researchWarnings } from '../data/lore';

interface Props {
  project: WebNovelProject;
  onUpdateProject: (p: WebNovelProject) => void;
}

const splitList = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const DECISION_BADGE: Record<DecisionItem['status'], string> = {
  확정: 'bg-emerald-100 text-emerald-800',
  대체됨: 'bg-slate-200 text-slate-500',
  보류: 'bg-amber-100 text-amber-800',
};

export const LoreManager: React.FC<Props> = ({ project, onUpdateProject }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <DecisionPanel project={project} onUpdateProject={onUpdateProject} />
      <ResearchPanel project={project} onUpdateProject={onUpdateProject} />
    </div>
  );
};

const ImpactList: React.FC<{ hits: ImpactHit[]; title: string }> = ({ hits, title }) => (
  <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 space-y-1.5">
    <div className="font-bold text-indigo-900">{title} ({hits.length}건)</div>
    {hits.length === 0 ? (
      <div className="text-slate-500">키워드와 겹치는 문서·씬·복선이 없습니다.</div>
    ) : (
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {hits.map((h) => (
          <li key={`${h.type}:${h.ref}`} className="text-[11px] text-slate-700">
            <span className="font-bold text-indigo-700">[{h.type}]</span> {h.label}
            {h.snippet && <div className="text-slate-400 truncate">{h.snippet}</div>}
          </li>
        ))}
      </ul>
    )}
    <div className="text-[10px] text-slate-400">이 목록은 검색 결과입니다. 어떤 문서를 고칠지는 작가가 정합니다.</div>
  </div>
);

const DecisionPanel: React.FC<Props> = ({ project, onUpdateProject }) => {
  const decisions = project.decisions || [];
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [supersedes, setSupersedes] = useState('');
  const [discard, setDiscard] = useState('');
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const [impactFor, setImpactFor] = useState<{ title: string; hits: ImpactHit[] } | null>(null);

  const replaceable = decisions.filter((d) => d.status !== '대체됨');

  const reset = () => {
    setTitle('');
    setKeywords('');
    setSupersedes('');
    setDiscard('');
    setManual('');
    setError('');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const r = addDecision(decisions, {
      title,
      keywords: splitList(keywords),
      supersedes: supersedes || undefined,
      discardSummary: discard,
      manualImpacts: splitList(manual),
    });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onUpdateProject({ ...project, decisions: r.decisions });

    // 대체한 경우 폐기된 안과 새 안의 키워드를 함께 검색해 영향 목록을 바로 보여 준다
    const old = decisions.find((d) => d.id === supersedes);
    const hits = findImpact(project, {
      keywords: [...(old?.keywords || []), ...splitList(keywords)],
      manualImpacts: [...(old?.manualImpacts || []), ...splitList(manual)],
    });
    setImpactFor({ title: `결정 #${r.decisions[0].no} 의 영향 범위`, hits });
    reset();
    setIsAdding(false);
  };

  const toggleHold = (id: string) =>
    onUpdateProject({
      ...project,
      decisions: decisions.map((d) => (d.id === id && d.status !== '대체됨' ? { ...d, status: d.status === '확정' ? '보류' : '확정' } : d)),
    });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">설정결정 목록 ({decisions.length})</h3>
          <p className="text-[11px] text-slate-400">결정은 작가만 확정합니다. 앱은 영향받는 곳을 찾아 보여 줍니다.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors">
          <Plus className="w-3 h-3" />
          <span>새 결정</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 text-xs">
        {decisions.length === 0 && <div className="text-slate-400 py-6 text-center">등록된 설정결정이 없습니다.</div>}
        {decisions.map((d) => {
          const target = d.supersedes ? decisions.find((x) => x.id === d.supersedes) : undefined;
          return (
            <div key={d.id} className={`p-3 rounded-lg border ${d.status === '대체됨' ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-slate-800">
                  <span className="font-mono text-slate-400 mr-1.5">#{d.no}</span>
                  <span className={d.status === '대체됨' ? 'line-through' : ''}>{d.title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${DECISION_BADGE[d.status]}`}>{d.status}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                결정일 {d.decidedAt}
                {target ? ` · #${target.no} 대체` : ''}
                {d.keywords.length ? ` · 키워드: ${d.keywords.join(', ')}` : ''}
              </div>
              {d.discardSummary && <div className="text-[11px] text-slate-500">폐기 요약: {d.discardSummary}</div>}
              <div className="flex gap-3 mt-1.5 text-[11px]">
                <button type="button" className="text-indigo-700 underline" onClick={() => setImpactFor({ title: `결정 #${d.no} 의 영향 범위`, hits: findImpact(project, d) })}>
                  영향 범위 조회
                </button>
                {d.status !== '대체됨' && (
                  <button type="button" className="text-slate-500 underline" onClick={() => toggleHold(d.id)}>
                    {d.status === '확정' ? '보류로 변경' : '확정으로 변경'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {impactFor && (
        <div className="text-xs space-y-1">
          <ImpactList hits={impactFor.hits} title={impactFor.title} />
          <button type="button" className="text-[11px] text-slate-500 underline" onClick={() => setImpactFor(null)}>
            닫기
          </button>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-xl max-w-md w-full p-6 space-y-3 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 설정결정</h3>
              <button type="button" onClick={() => { setIsAdding(false); reset(); }}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">결정 사안</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 유전자 검사는 3화에서 조작된다" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="font-semibold block mb-1">영향 검색 키워드 (쉼표로 구분, 2자 이상)</label>
              <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="유전자 검사, 봉투" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="font-semibold block mb-1">대체할 기존 결정 (선택)</label>
              <select value={supersedes} onChange={(e) => setSupersedes(e.target.value)} className="w-full p-2 border rounded">
                <option value="">대체하지 않음</option>
                {replaceable.map((d) => (
                  <option key={d.id} value={d.id}>#{d.no} {d.title}</option>
                ))}
              </select>
            </div>
            {supersedes && (
              <div>
                <label className="font-semibold block mb-1">폐기된 안 요약</label>
                <input value={discard} onChange={(e) => setDiscard(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            )}
            <div>
              <label className="font-semibold block mb-1">직접 지정할 영향 문서 (선택, 쉼표로 구분)</label>
              <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="05-문체가이드.md" className="w-full p-2 border rounded" />
            </div>
            {error && <div role="alert" className="text-red-700">{error}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="px-3 py-1.5 rounded bg-slate-100 font-semibold">취소</button>
              <button type="submit" className="px-3 py-1.5 rounded bg-slate-900 text-white font-semibold">등록</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const ResearchPanel: React.FC<Props> = ({ project, onUpdateProject }) => {
  const list = project.research || [];
  const warnById = useMemo(() => new Map(researchWarnings(project).map((w) => [w.targetId, w])), [project]);
  const [isAdding, setIsAdding] = useState(false);
  const [question, setQuestion] = useState('');
  const [nature, setNature] = useState<ResearchItem['nature']>('현실');
  const [reveal, setReveal] = useState('');
  const [error, setError] = useState('');

  const update = (id: string, patch: Partial<ResearchItem>) =>
    onUpdateProject({ ...project, research: list.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (reveal.trim() && !/^ch\s*\d{1,2}$/i.test(reveal.trim())) {
      setError('공개 시점은 ch12 형식으로 입력하세요.');
      return;
    }
    onUpdateProject({
      ...project,
      research: [
        {
          id: `rs-${Date.now()}`,
          question: question.trim(),
          nature,
          verification: '미확인',
          applied: false,
          revealChapter: reveal.trim() ? reveal.trim().toLowerCase().replace(/\s+/g, '') : undefined,
        },
        ...list,
      ],
    });
    setQuestion('');
    setReveal('');
    setError('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">고증 목록 ({list.length})</h3>
          <p className="text-[11px] text-slate-400">미확인 항목은 공개 시점이 임박하면 경고합니다.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors">
          <Plus className="w-3 h-3" />
          <span>새 고증</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 text-xs">
        {list.length === 0 && <div className="text-slate-400 py-6 text-center">등록된 고증 항목이 없습니다.</div>}
        {list.map((r) => {
          const w = warnById.get(r.id);
          return (
            <div key={r.id} className={`p-3 rounded-lg border space-y-1.5 ${w?.level === 'error' ? 'bg-rose-50 border-rose-300' : w ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                {w && <AlertTriangle className={`w-3 h-3 ${w.level === 'error' ? 'text-rose-600' : 'text-amber-600'}`} />}
                {r.question}
                <span className="text-[10px] font-mono px-1.5 rounded bg-slate-100 text-slate-600">{r.nature}</span>
              </div>
              {w && <div className={`text-[11px] font-semibold ${w.level === 'error' ? 'text-rose-700' : 'text-amber-700'}`}>{w.message}</div>}
              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <label className="flex items-center gap-1">
                  검증
                  <select value={r.verification} onChange={(e) => update(r.id, { verification: e.target.value as ResearchItem['verification'] })} className="border rounded px-1 py-0.5">
                    <option>미확인</option>
                    <option>확인중</option>
                    <option>확인됨</option>
                  </select>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={r.applied} onChange={(e) => update(r.id, { applied: e.target.checked })} />
                  원고 반영
                </label>
                <label className="flex items-center gap-1">
                  공개
                  <input
                    value={r.revealChapter || ''}
                    onChange={(e) => update(r.id, { revealChapter: e.target.value.trim() ? e.target.value.trim().toLowerCase() : undefined })}
                    placeholder="ch09"
                    className="w-16 border rounded px-1 py-0.5 font-mono"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-xl max-w-md w-full p-6 space-y-3 shadow-xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 고증 항목</h3>
              <button type="button" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="font-semibold block mb-1">고증 질문</label>
              <input required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="예: 유전자 검사 결과가 나오기까지 걸리는 시간" className="w-full p-2 border rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">성격</label>
                <select value={nature} onChange={(e) => setNature(e.target.value as ResearchItem['nature'])} className="w-full p-2 border rounded">
                  <option>현실</option>
                  <option>각색</option>
                  <option>허구</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">공개 시점 (선택)</label>
                <input value={reveal} onChange={(e) => setReveal(e.target.value)} placeholder="ch09" className="w-full p-2 border rounded font-mono" />
              </div>
            </div>
            {error && <div role="alert" className="text-red-700">{error}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 rounded bg-slate-100 font-semibold">취소</button>
              <button type="submit" className="px-3 py-1.5 rounded bg-slate-900 text-white font-semibold">등록</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
