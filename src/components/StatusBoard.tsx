import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, EyeOff, Eye, ExternalLink } from 'lucide-react';
import type { WebNovelProject } from '../data/projectTemplates';
import { buildDashboardMetrics, redactForShare, MetricTab } from '../data/dashboard';

interface StatusBoardProps {
  project: WebNovelProject;
  onSelectTab: (tab: MetricTab) => void;
}

const TAB_LABEL: Record<MetricTab, string> = {
  timeline: '타임라인',
  chapter: '챕터 보드',
  lists: '복선·미결',
  overview: '작품 개요',
};

/** D-01~D-03: 계산값 지표 카드, 근거 출처 펼침, 공유용 가림 미리보기 */
export const StatusBoard: React.FC<StatusBoardProps> = ({ project, onSelectTab }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [shareView, setShareView] = useState(false);

  const redaction = useMemo(() => redactForShare(project), [project]);
  const shown = shareView ? redaction.project : project;
  const cards = useMemo(() => buildDashboardMetrics(shown), [shown]);
  const s = redaction.summary;

  return (
    <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4" aria-label="현황판">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">현황판 · {project.title}</h2>
          <p className="text-[11px] text-slate-500">모든 숫자는 작품 데이터에서 계산한 값입니다. 카드를 눌러 근거를 확인하세요.</p>
        </div>
        <button
          type="button"
          onClick={() => setShareView((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
            shareView ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {shareView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {shareView ? '공유용 보기 (가림 적용)' : '작가용 보기'}
        </button>
      </div>

      {shareView && (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          공유 시 가려지는 항목: 잠긴 일기 {s.diaries}건, 회수 전 복선 {s.foreshadowing}건, 본문 미완료 씬 {s.scenes}개
          {s.ending ? ', 결말' : ''}. 공유 기능 자체는 MVP 이후이며 지금은 미리보기만 제공합니다.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => {
          const open = openId === c.id;
          return (
            <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50/60">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : c.id)}
                className="w-full text-left p-3 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="text-[11px] text-slate-500">{c.label}</div>
                  <div className="text-lg font-extrabold text-slate-900 font-mono">
                    {c.display} <span className="text-xs font-normal text-slate-400">{c.unit}</span>
                  </div>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {open && (
                <div className="px-3 pb-3 space-y-2 border-t border-slate-200 pt-2">
                  <p className="text-[11px] text-slate-600">{c.rule}</p>
                  <p className="text-[10px] font-mono text-slate-400 break-all">{c.sourcePath}</p>
                  {c.evidence.length === 0 ? (
                    <p className="text-[11px] text-slate-400">근거 항목이 없습니다.</p>
                  ) : (
                    <ul className="max-h-40 overflow-y-auto space-y-0.5 text-[11px]">
                      {c.evidence.map((e, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span className="text-slate-700 truncate">{e.label}</span>
                          {e.value && <span className="text-slate-500 font-mono shrink-0">{e.value}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectTab(c.sourceTab)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {TAB_LABEL[c.sourceTab]}에서 보기
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
