import React, { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { WebNovelProject } from '../data/projectTemplates';
import { buildEpisodeTable } from '../data/metrics';
import { HOOK_TYPES, HookType, RECOMMENDED_HOOKS, episodeEndLine, hookWarnings, recordHook } from '../data/hooks';
import { addKnowledge, knowledgeWarnings, sceneOrderMap } from '../data/characterTimeline';

interface Props {
  project: WebNovelProject;
  onUpdateProject: (p: WebNovelProject) => void;
}

/** U-04 엔딩 훅 기록 + C-07 인물 시간선 입력 */
export const NarrativePanel: React.FC<Props> = ({ project, onUpdateProject }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <HookSection project={project} onUpdateProject={onUpdateProject} />
      <KnowledgeSection project={project} onUpdateProject={onUpdateProject} />
    </div>
  );
};

const HookSection: React.FC<Props> = ({ project, onUpdateProject }) => {
  const rows = useMemo(() => buildEpisodeTable(project).filter((r) => r.words > 0), [project]);
  const warnById = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of hookWarnings(project)) if (!m.has(w.targetId)) m.set(w.targetId, w.message);
    return m;
  }, [project]);
  const recommended = RECOMMENDED_HOOKS[project.templateType] || HOOK_TYPES;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold text-slate-900">화별 엔딩 훅 기록</h3>
        <p className="text-[11px] text-slate-400">
          끝 문장은 씬 본문에서 자동으로 읽습니다. 훅 유형과 메모만 기록하세요. 이 장르 권장: {recommended.join(', ')}
        </p>
      </div>
      {rows.length === 0 && <div className="text-slate-400 py-6 text-center">본문이 있는 화가 없습니다.</div>}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 text-xs">
        {rows.map((r) => {
          const hook = project.episodeHooks?.[r.episode] || {};
          const endLine = episodeEndLine(project, r.episode);
          const warn = warnById.get(String(r.episode));
          return (
            <div key={r.episode} className="p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-700">{r.episode}화 · {r.title}</span>
                <select
                  value={hook.type || ''}
                  onChange={(e) => onUpdateProject(recordHook(project, r.episode, { type: (e.target.value || undefined) as HookType | undefined }))}
                  className="border rounded px-1.5 py-0.5"
                >
                  <option value="">훅 유형 미기록</option>
                  {HOOK_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="text-slate-600 italic truncate" title={endLine}>끝 문장: {endLine || '(없음)'}</div>
              <input
                key={`${r.episode}-${hook.note || ''}`}
                defaultValue={hook.note || ''}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== (hook.note || '')) onUpdateProject(recordHook(project, r.episode, { note: v || undefined }));
                }}
                placeholder="메모 (예: 차남 등장으로 마무리)"
                className="w-full border rounded px-2 py-1"
              />
              {warn && <div className="text-amber-700 text-[11px]">{warn}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const KnowledgeSection: React.FC<Props> = ({ project, onUpdateProject }) => {
  const order = useMemo(() => sceneOrderMap(project), [project]);
  const sceneRefs = Array.from(order.keys());
  const [characterId, setCharacterId] = useState(project.characters[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [value, setValue] = useState('');
  const [sceneRef, setSceneRef] = useState(sceneRefs[0] || '');
  const [error, setError] = useState('');
  const warnings = useMemo(() => knowledgeWarnings(project), [project]);
  const nameOf = (id: string) => project.characters.find((c) => c.id === id)?.name ?? id;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const r = addKnowledge(project, { characterId, topic, value, sceneRef });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onUpdateProject({ ...project, knowledge: r.list });
    setTopic('');
    setValue('');
    setError('');
  };

  const remove = (id: string) =>
    onUpdateProject({ ...project, knowledge: (project.knowledge || []).filter((k) => k.id !== id) });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold text-slate-900">인물 시간선 (알게 된 사실)</h3>
        <p className="text-[11px] text-slate-400">같은 인물과 주제에 다른 값이 기록되면 모순 후보로 표시합니다. 자동 본문 검사는 아직 없습니다.</p>
      </div>

      <form onSubmit={add} className="grid grid-cols-2 gap-2 text-xs">
        <select value={characterId} onChange={(e) => setCharacterId(e.target.value)} className="border rounded px-2 py-1">
          {project.characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={sceneRef} onChange={(e) => setSceneRef(e.target.value)} className="border rounded px-2 py-1 font-mono">
          {sceneRefs.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="주제 (예: 검사 결과)" className="border rounded px-2 py-1" />
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="알게 된 내용" className="border rounded px-2 py-1" />
        <div className="col-span-2 flex items-center justify-between">
          {error ? <span role="alert" className="text-red-700">{error}</span> : <span />}
          <button type="submit" className="px-3 py-1 rounded bg-slate-900 text-white font-semibold">기록 추가</button>
        </div>
      </form>

      {warnings.length > 0 && (
        <div className="space-y-1 text-[11px]">
          {warnings.map((w, i) => (
            <div key={i} className={w.level === 'warn' ? 'text-amber-700' : 'text-slate-500'}>· {w.message}</div>
          ))}
        </div>
      )}

      <ul className="space-y-1 max-h-48 overflow-y-auto text-xs">
        {(project.knowledge || []).map((k) => (
          <li key={k.id} className="flex items-center justify-between gap-2 border-b border-slate-100 py-1">
            <span>
              <span className="font-semibold">{nameOf(k.characterId)}</span> · {k.topic}: {k.value}
              <span className="font-mono text-slate-400 ml-1">{k.sceneRef}</span>
            </span>
            <button type="button" onClick={() => remove(k.id)} className="text-slate-400 hover:text-red-600" aria-label="삭제">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
        {(project.knowledge || []).length === 0 && <li className="text-slate-400 py-3 text-center">기록된 사실이 없습니다.</li>}
      </ul>
    </div>
  );
};
