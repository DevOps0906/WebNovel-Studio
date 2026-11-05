import React, { useMemo, useState } from 'react';
import { DIARIES_DATA, DiaryItem } from '../data/storyData';
import { X, AlertTriangle } from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { collectLoreWarnings } from '../data/lore';
import { knowledgeWarnings } from '../data/characterTimeline';
import { hookWarnings } from '../data/hooks';
import { NarrativePanel } from './NarrativePanel';
import { ForeshadowPanel } from './ForeshadowPanel';
import { IssuePanel } from './IssuePanel';
import { LoreManager } from './LoreManager';

interface TabListsProps {
  activeProject?: WebNovelProject;
  onUpdateProject?: (p: WebNovelProject) => void;
}

export const TabLists: React.FC<TabListsProps> = ({ activeProject, onUpdateProject }) => {
  // 일기 열람 모달 상태
  const [selectedDiary, setSelectedDiary] = useState<DiaryItem | null>(null);
  const warnings = useMemo(
    () =>
      activeProject
        ? [...collectLoreWarnings(activeProject), ...knowledgeWarnings(activeProject), ...hookWarnings(activeProject)]
        : [],
    [activeProject]
  );
  const alerts = warnings.filter((w) => w.level !== 'info');

  if (!activeProject || !onUpdateProject) {
    return <div className="text-xs text-slate-400 p-6">작품을 선택하면 복선·미결·설정결정 목록이 표시됩니다.</div>;
  }

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div role="status" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900 space-y-0.5">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            확인이 필요한 항목 {alerts.length}건
          </div>
          {alerts.slice(0, 8).map((w, i) => (
            <div key={i}>· {w.message}</div>
          ))}
          {alerts.length > 8 && <div className="text-rose-700">… 외 {alerts.length - 8}건</div>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ForeshadowPanel project={activeProject} onUpdateProject={onUpdateProject} />
        <IssuePanel project={activeProject} onUpdateProject={onUpdateProject} />
      </div>

      <LoreManager project={activeProject} onUpdateProject={onUpdateProject} />

      <NarrativePanel project={activeProject} onUpdateProject={onUpdateProject} />

      {/* Bottom 2 Columns: Sister's 6 Diaries & Dashboard Notes Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sister's 6 Diaries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900">동생의 일기 6편</h3>
            <p className="text-[11px] text-slate-400">아크마다 한 편. 다음 단서는 늘 일기에 먼저 있어요.</p>
          </div>

          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {DIARIES_DATA.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => d.unlocked && setSelectedDiary(d)}
                  className={`transition-colors ${
                    d.unlocked ? 'hover:bg-blue-50 cursor-pointer group' : 'opacity-60'
                  }`}
                >
                  <td className="py-2.5 font-mono text-slate-400 w-16">{d.chapter}</td>
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      #{d.number} {d.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{d.previewText}</div>
                  </td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    {d.unlocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {d.unlockedAt || '공개됨'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                        미공개
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dashboard Note Sync Checklist */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900">대시보드 노트 반영 체크</h3>
            <p className="text-[11px] text-slate-400">에디터노트-대시보드 반영 체크리스트예요.</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-700">① 파일럿 스냅샷 대시보드 제작 (10-09)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                완료
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-700">① 탭 구성 개편 (작품 개요/전체/챕터/목록)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                완료
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-700">② 복선 표 '회수 예정'에 챕터 번호 명시 규칙</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                완료
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-700">③ 갱신 커맨드 작성 (/studio:30-dashboard)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                연동됨
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-700">④ 100화 완결용 4막 6아크 마스터 맵 시각화</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                완료
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Diary Full Reader Modal */}
      {selectedDiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-amber-50/95 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-amber-200">
            <div className="flex justify-between items-start border-b border-amber-200 pb-3">
              <div>
                <span className="text-[11px] font-mono text-amber-700 font-bold">
                  {selectedDiary.chapter} · 일기 #{selectedDiary.number}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  「{selectedDiary.title}」
                </h3>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedDiary.date}</div>
              </div>
              <button
                onClick={() => setSelectedDiary(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-amber-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white/80 rounded-lg border border-amber-200 text-slate-800 text-xs leading-loose whitespace-pre-wrap font-sans max-h-80 overflow-y-auto">
              {selectedDiary.fullText || selectedDiary.previewText}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDiary(null)}
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
