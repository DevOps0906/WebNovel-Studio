import React, { useMemo, useState } from 'react';
import type { WebNovelProject } from '../data/projectTemplates';
import type { SceneItem } from '../data/storyData';
import type { ApplyResult } from '../data/aiClient';
import { buildStyleGuide, describeModel, requestAi } from '../data/aiClient';
import { getActiveAiCredentials } from '../data/aiSettings';
import {
  DiffSegment,
  ReviewNote,
  StyleType,
  Verdict,
  applyVerdicts,
  computeTextStats,
  detectRepetition,
  detectStyleIssues,
  diffSentences,
  hasUnclosedAnnotation,
  parseAnnotations,
  stripAnnotations,
  verdictSummary,
} from '../data/editing';

interface Props {
  project: WebNovelProject;
  chapterId: string;
  scene: SceneItem;
  onSaveSceneContent?: (chapterId: string, sceneId: string, text: string) => ApplyResult;
  onUpdateProject?: (p: WebNovelProject) => void;
}

type Tab = 'style' | 'annotate' | 'compare' | 'stats';

const TYPE_COLOR: Record<StyleType, string> = {
  '설명 과잉': 'bg-orange-100 text-orange-800',
  꾸밈: 'bg-pink-100 text-pink-800',
  '돌려 말하기': 'bg-violet-100 text-violet-800',
  반복: 'bg-sky-100 text-sky-800',
  '쪼갠 문장': 'bg-lime-100 text-lime-800',
  빈자리: 'bg-slate-200 text-slate-700',
};

const VERDICTS: Verdict[] = ['채택', '기각', '보류'];

export const ScenePolishPanel: React.FC<Props> = ({ project, chapterId, scene, onSaveSceneContent, onUpdateProject }) => {
  const [tab, setTab] = useState<Tab>('style');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [revisedInput, setRevisedInput] = useState('');
  const [segments, setSegments] = useState<DiffSegment[]>([]);
  const [replies, setReplies] = useState<{ index: number; reply: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const sceneRef = `${chapterId}/${scene.id}`;
  const content = scene.content || '';
  const credentials = getActiveAiCredentials();

  const issues = useMemo(() => detectStyleIssues(content), [content]);
  const annotations = useMemo(() => parseAnnotations(content), [content]);
  const stats = useMemo(() => computeTextStats(stripAnnotations(content)), [content]);
  const episodeText = useMemo(
    () =>
      Object.values(project.chapters)
        .flatMap((c) => c.scenes)
        .filter((s) => s.episode === scene.episode && s.status !== '대기')
        .map((s) => s.content)
        .join('\n'),
    [project, scene.episode]
  );
  const repetition = useMemo(() => detectRepetition(episodeText), [episodeText]);
  const savedNotes = (project.reviewNotes || []).filter((n) => n.sceneRef === sceneRef);

  const keyOf = (i: { index: number; type: string }) => `${i.index}:${i.type}`;
  const visibleIssues = issues.filter((i) => !dismissed.has(keyOf(i)));

  const buildComparison = (revised: string) => {
    const base = stripAnnotations(content).trim();
    const segs = diffSentences(base, revised.trim());
    setSegments(segs);
    setTab('compare');
    const changed = segs.filter((s) => s.changed).length;
    setMessage({ ok: true, text: changed ? `변경 구간 ${changed}개를 찾았습니다. 구간마다 판정하세요.` : '원문과 달라진 부분이 없습니다.' });
  };

  const requestAiRevision = async () => {
    if (!content.trim()) {
      setMessage({ ok: false, text: '본문이 비어 있습니다.' });
      return;
    }
    if (hasUnclosedAnnotation(content)) {
      setMessage({ ok: false, text: '닫히지 않은 %% 주석이 있습니다. 본문을 수정한 뒤 다시 시도하세요.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await requestAi<{ revised: string; replies: { index: number; reply: string }[] }>('/api/aiwc/revise-scene', {
      sceneText: content,
      annotations,
      styleGuide: buildStyleGuide(project),
      provider: credentials.provider,
      apiKey: credentials.apiKey,
      model: credentials.model,
      maxTokens: credentials.maxTokens,
    }, undefined, { projectId: project.id });
    setBusy(false);
    if (!result.ok) {
      setMessage({ ok: false, text: `AI 윤문 실패: ${result.error}` });
      return;
    }
    setReplies(result.data.replies || []);
    setRevisedInput(result.data.revised);
    buildComparison(result.data.revised);
    setMessage({ ok: true, text: `AI 윤문본을 받았습니다 (${describeModel(result.data, credentials.model)}). 저장되지 않았고, 판정 후 반영됩니다.` });
  };

  const setSeg = (id: string, patch: Partial<DiffSegment>) =>
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const persistNote = (segs: DiffSegment[]) => {
    if (!onUpdateProject) return;
    const note: ReviewNote = { id: `rn-${Date.now()}`, sceneRef, createdAt: new Date().toISOString(), segments: segs };
    onUpdateProject({ ...project, reviewNotes: [note, ...(project.reviewNotes || [])].slice(0, 200) });
  };

  const saveNoteOnly = () => {
    persistNote(segments);
    setMessage({ ok: true, text: '비교노트를 저장했습니다.' });
  };

  const applyToScene = () => {
    if (!onSaveSceneContent) return;
    const sum = verdictSummary(segments);
    if (sum.pending > 0) {
      setMessage({ ok: false, text: `미판정 구간이 ${sum.pending}개 있습니다. 모두 판정한 뒤 반영하세요.` });
      return;
    }
    const finalText = applyVerdicts(segments);
    const r = onSaveSceneContent(chapterId, scene.id, finalText);
    if (r.ok) {
      persistNote(segments);
      setMessage({ ok: true, text: `판정을 반영해 저장했습니다 (채택 ${sum.adopted}, 기각 ${sum.rejected}, 보류 ${sum.held}). 이전 본문은 버전 이력에 남았습니다.` });
    } else {
      setMessage({ ok: false, text: r.error || '저장하지 못했습니다.' });
    }
  };

  const sum = verdictSummary(segments);

  return (
    <div className="border border-indigo-200 rounded-lg bg-indigo-50/30 p-3 space-y-2 text-xs">
      <div className="flex items-center gap-1 flex-wrap">
        {([['style', '문체 점검'], ['annotate', '%% 주석 편집'], ['compare', '비교노트'], ['stats', '반복·통계']] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-2.5 py-1 rounded font-semibold ${tab === k ? 'bg-indigo-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div role="status" className={`px-2.5 py-1.5 rounded border font-semibold ${message.ok ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-800 bg-red-50 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {tab === 'style' && (
        <div className="space-y-1.5">
          <div className="text-slate-500">규칙으로 찾은 후보입니다. 고칠지는 작가가 정합니다. ({visibleIssues.length}건)</div>
          {visibleIssues.length === 0 && <div className="text-slate-400 py-2">후보가 없습니다.</div>}
          <ul className="space-y-1 max-h-56 overflow-y-auto">
            {visibleIssues.map((i) => (
              <li key={keyOf(i)} className="bg-white border border-slate-200 rounded p-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className={`px-1.5 py-0.5 rounded font-bold mr-1.5 ${TYPE_COLOR[i.type]}`}>{i.type}</span>
                  <span className="text-slate-500">{i.reason}</span>
                  <div className="text-slate-800 mt-0.5">{i.sentence}</div>
                </div>
                <button type="button" className="text-slate-400 underline shrink-0" onClick={() => setDismissed(new Set([...dismissed, keyOf(i)]))}>
                  무시
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'annotate' && (
        <div className="space-y-2">
          <div className="text-slate-500">본문 수정 모드에서 <code>%% 의견 %%</code> 형식으로 주석을 달고 저장한 뒤 AI 윤문을 요청하세요. 결과는 비교노트에서 판정합니다.</div>
          {annotations.length === 0 ? (
            <div className="text-slate-400">저장된 본문에 %% 주석이 없습니다. 주석이 없으면 AI는 6유형 후보만 최소한으로 고칩니다.</div>
          ) : (
            <ul className="space-y-1">
              {annotations.map((a) => {
                const reply = replies.find((r) => r.index === a.index);
                return (
                  <li key={a.index} className="bg-white border border-slate-200 rounded p-2">
                    <div className="text-slate-400 truncate">앞 문장: {a.anchor || '(없음)'}</div>
                    <div className="font-semibold text-slate-800">의견: {a.comment}</div>
                    {reply && <div className="text-indigo-800 mt-0.5">AI 답변: {reply.reply}</div>}
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            onClick={requestAiRevision}
            disabled={busy}
            className="px-3 py-1.5 rounded bg-indigo-700 text-white font-bold hover:bg-indigo-600 disabled:bg-indigo-300"
          >
            {busy ? 'AI 윤문 중...' : `AI 윤문 요청 (${credentials.provider.toUpperCase()})`}
          </button>
        </div>
      )}

      {tab === 'compare' && (
        <div className="space-y-2">
          <div>
            <label className="font-semibold block mb-1">윤문본 붙여넣기 (직접 윤문한 본문 또는 외부 AI 결과)</label>
            <textarea value={revisedInput} onChange={(e) => setRevisedInput(e.target.value)} rows={4} className="w-full p-2 border rounded font-mono" />
            <button type="button" onClick={() => buildComparison(revisedInput)} disabled={!revisedInput.trim()} className="mt-1 px-3 py-1 rounded bg-slate-900 text-white font-semibold disabled:bg-slate-300">
              원문과 비교
            </button>
            {savedNotes.length > 0 && (
              <button type="button" onClick={() => { setSegments(savedNotes[0].segments); setMessage({ ok: true, text: '저장된 최근 비교노트를 불러왔습니다.' }); }} className="ml-2 underline text-slate-600">
                저장된 노트 불러오기 ({savedNotes.length})
              </button>
            )}
          </div>

          {segments.some((s) => s.changed) && (
            <>
              <div className="text-slate-500">
                변경 {sum.total} · 채택 {sum.adopted} · 기각 {sum.rejected} · 보류 {sum.held} · 미판정 {sum.pending}
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-slate-400 text-left">
                    <th className="p-1 font-medium w-[32%]">원래 문장</th>
                    <th className="p-1 font-medium w-[32%]">고친 문장</th>
                    <th className="p-1 font-medium">이유</th>
                    <th className="p-1 font-medium w-[88px]">작가 판정</th>
                  </tr>
                </thead>
                <tbody>
                  {segments
                    .filter((s) => s.changed)
                    .map((s) => (
                      <tr key={s.id} className="align-top border-t border-slate-200 bg-white">
                        <td className="p-1 text-slate-600">{s.original || <span className="text-slate-300">(없음)</span>}</td>
                        <td className="p-1 text-slate-900">{s.revised || <span className="text-slate-300">(삭제)</span>}</td>
                        <td className="p-1">
                          <input value={s.reason} onChange={(e) => setSeg(s.id, { reason: e.target.value })} placeholder="이유" className="w-full border rounded px-1 py-0.5" />
                        </td>
                        <td className="p-1">
                          <div className="flex flex-col gap-0.5">
                            {VERDICTS.map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setSeg(s.id, { verdict: v })}
                                className={`px-1.5 py-0.5 rounded font-semibold border ${s.verdict === v ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="flex gap-2">
                <button type="button" onClick={saveNoteOnly} className="px-3 py-1.5 rounded bg-white border border-slate-300 font-semibold">노트만 저장</button>
                <button type="button" onClick={applyToScene} className="px-3 py-1.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-600">판정 반영해 씬 저장</button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-slate-200 rounded p-2 text-center">
              <div className="text-slate-400">대사 비중</div>
              <div className="font-extrabold text-sm">{Math.round(stats.dialogueRatio * 100)}%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-2 text-center">
              <div className="text-slate-400">문장 평균/중앙값</div>
              <div className="font-extrabold text-sm">{stats.avgSentenceLength} / {stats.medianSentenceLength}자</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-2 text-center">
              <div className="text-slate-400">문장 수</div>
              <div className="font-extrabold text-sm">{stats.sentenceCount}</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap text-slate-600">
            {stats.lengthBuckets.map((b) => (
              <span key={b.label} className="px-2 py-0.5 bg-white border border-slate-200 rounded">{b.label} {b.count}</span>
            ))}
          </div>
          {stats.duplicateDialogues.length > 0 && (
            <div>
              <div className="font-semibold">중복 대사</div>
              {stats.duplicateDialogues.map((d) => (
                <div key={d.line} className="text-slate-600">“{d.line}” × {d.count}</div>
              ))}
            </div>
          )}
          <div>
            <div className="font-semibold">{scene.episode}화 반복 점검</div>
            {repetition.length === 0 ? (
              <div className="text-slate-400">반복 후보가 없습니다.</div>
            ) : (
              <ul className="max-h-40 overflow-y-auto space-y-0.5">
                {repetition.map((r) => (
                  <li key={`${r.kind}:${r.phrase}`} className="text-slate-700">
                    <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold mr-1.5">{r.kind}</span>
                    {r.phrase} × {r.count}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
