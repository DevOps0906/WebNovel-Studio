import React, { useState } from 'react';
import {
  FORESHADOWING_DATABASE,
  ISSUES_DATABASE,
  DIARIES_DATA,
  ForeshadowingItem,
  IssueItem,
  DiaryItem
} from '../data/storyData';
import { Search, Plus, CheckCircle2, Clock, BookMarked, X, AlertTriangle } from 'lucide-react';

import { WebNovelProject } from '../data/projectTemplates';

interface TabListsProps {
  activeProject?: WebNovelProject;
}

export const TabLists: React.FC<TabListsProps> = ({ activeProject }) => {
  const [foreshadowingList, setForeshadowingList] = useState<ForeshadowingItem[]>(
    activeProject?.foreshadowing || FORESHADOWING_DATABASE
  );
  const [issuesList, setIssuesList] = useState<IssueItem[]>(
    activeProject?.unresolvedIssues || ISSUES_DATABASE
  );
  const [fsFilter, setFsFilter] = useState<'전체' | '심을 예정' | '심음' | '회수됨'>('전체');
  const [fsSearch, setFsSearch] = useState('');
  
  // Update state when activeProject changes
  React.useEffect(() => {
    if (activeProject) {
      setForeshadowingList(activeProject.foreshadowing || FORESHADOWING_DATABASE);
      setIssuesList(activeProject.unresolvedIssues || ISSUES_DATABASE);
    }
  }, [activeProject?.id]);
  
  // Diary modal state
  const [selectedDiary, setSelectedDiary] = useState<DiaryItem | null>(null);

  // New foreshadowing modal
  const [isAddingFs, setIsAddingFs] = useState(false);
  const [newFsLocation, setNewFsLocation] = useState('');
  const [newFsTitle, setNewFsTitle] = useState('');
  const [newFsPayoff, setNewFsPayoff] = useState('');

  // New Issue modal
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueCategory, setNewIssueCategory] = useState<'고증' | '구조' | '인물' | '타임라인'>('고증');

  // Filter foreshadowing
  const filteredForeshadowing = foreshadowingList.filter(f => {
    const matchesFilter = fsFilter === '전체' || f.status === fsFilter;
    const matchesSearch =
      f.title.toLowerCase().includes(fsSearch.toLowerCase()) ||
      f.location.toLowerCase().includes(fsSearch.toLowerCase()) ||
      f.payoff.toLowerCase().includes(fsSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleIssueStatus = (id: string) => {
    setIssuesList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: item.status === '미결' ? '해결' : '미결' } : item
      )
    );
  };

  const handleAddForeshadowing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFsTitle) return;
    const newItem: ForeshadowingItem = {
      id: `fs-${Date.now()}`,
      location: newFsLocation || 'ch04 s01',
      title: newFsTitle,
      description: '새로 등록된 복선',
      payoff: newFsPayoff || '회수 지점 미정',
      status: '심을 예정',
      arc: '아크 1'
    };
    setForeshadowingList([newItem, ...foreshadowingList]);
    setNewFsLocation('');
    setNewFsTitle('');
    setNewFsPayoff('');
    setIsAddingFs(false);
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle) return;
    const newItem: IssueItem = {
      id: `iss-${Date.now()}`,
      title: newIssueTitle,
      description: '작가 검토 대기 과제',
      status: '미결',
      category: newIssueCategory
    };
    setIssuesList([newItem, ...issuesList]);
    setNewIssueTitle('');
    setIsAddingIssue(false);
  };

  const openIssuesCount = issuesList.filter(i => i.status === '미결').length;
  const resolvedIssuesCount = issuesList.filter(i => i.status === '해결').length;

  return (
    <div className="space-y-6">
      {/* Top 2 Columns: Foreshadowing DB & Issue Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 1. Foreshadowing Database */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">복선 목록 (작품 전체)</h3>
              <p className="text-[11px] text-slate-400">심을 예정 → 심음 → 회수 예정 → 회수됨.</p>
            </div>
            
            <button
              onClick={() => setIsAddingFs(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>새 복선</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[11px]">
              {(['전체', '심을 예정', '심음', '회수됨'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFsFilter(tab)}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    fsFilter === tab
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab} {tab === '전체' ? foreshadowingList.length : ''}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-40">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="복선 검색..."
                value={fsSearch}
                onChange={e => setFsSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Foreshadowing Table */}
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white shadow-2xs">
                <tr className="text-slate-400 text-[11px] border-b border-slate-100">
                  <th className="text-left pb-1.5 font-medium">챕터/씬</th>
                  <th className="text-left pb-1.5 font-medium">복선 내용</th>
                  <th className="text-left pb-1.5 font-medium">회수 지점</th>
                  <th className="text-right pb-1.5 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredForeshadowing.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono text-slate-500 font-semibold">{f.location}</td>
                    <td className="py-2.5 font-medium text-slate-800">{f.title}</td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{f.payoff}</td>
                    <td className="text-right py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.status === '회수됨'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.status === '심음'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Issue Tracker */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                미결 과제 (열림 {openIssuesCount} · 해결 {resolvedIssuesCount})
              </h3>
              <p className="text-[11px] text-slate-400">해결 시 '해결'로 넘어가고 작업로그에 기록돼요.</p>
            </div>
            
            <button
              onClick={() => setIsAddingIssue(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>새 과제</span>
            </button>
          </div>

          {/* Issues List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {issuesList.map((issue) => (
              <div
                key={issue.id}
                onClick={() => toggleIssueStatus(issue.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 select-none ${
                  issue.status === '미결'
                    ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {issue.category}
                    </span>
                    <span className={`text-xs font-bold ${issue.status === '해결' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {issue.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  issue.status === '미결'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      {/* Add Foreshadowing Modal */}
      {isAddingFs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddForeshadowing} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 복선 등록</h3>
              <button type="button" onClick={() => setIsAddingFs(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">챕터 / 씬 위치 (예: ch04 s01)</label>
                <input
                  type="text"
                  required
                  placeholder="ch04 s01"
                  value={newFsLocation}
                  onChange={e => setNewFsLocation(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">복선 내용</label>
                <input
                  type="text"
                  required
                  placeholder="예: 차남의 만년필 각인"
                  value={newFsTitle}
                  onChange={e => setNewFsTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">회수 목표 지점</label>
                <input
                  type="text"
                  required
                  placeholder="예: ch18 고모와의 대면에서 증거로 제시"
                  value={newFsPayoff}
                  onChange={e => setNewFsPayoff(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingFs(false)}
                className="px-3 py-1.5 rounded bg-slate-100 text-xs font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold"
              >
                등록
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Issue Modal */}
      {isAddingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddIssue} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 미결 과제 등록</h3>
              <button type="button" onClick={() => setIsAddingIssue(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">분류</label>
                <select
                  value={newIssueCategory}
                  onChange={e => setNewIssueCategory(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="고증">고증</option>
                  <option value="구조">구조</option>
                  <option value="인물">인물</option>
                  <option value="타임라인">타임라인</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">과제 제목 및 내용</label>
                <input
                  type="text"
                  required
                  placeholder="예: 6화 회장 독대 시 차 브랜드 고증"
                  value={newIssueTitle}
                  onChange={e => setNewIssueTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingIssue(false)}
                className="px-3 py-1.5 rounded bg-slate-100 text-xs font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold"
              >
                등록
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
