import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileCheck,
  Layers,
  LayoutDashboard,
  Compass,
  Cpu,
  MousePointerClick,
  CheckCircle2,
  FolderTree,
  Sparkles,
  BookOpen,
  ListChecks,
  Bot
} from 'lucide-react';
import {
  STORY_SPECS,
  CHARACTERS_DATA,
  ARCS_DATA,
} from '../data/storyData';
import { WebNovelProject } from '../data/projectTemplates';
import { exportToWordDoc } from '../utils/exportWord';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: WebNovelProject;
}

type PdfSectionFilter = 'all' | 'diagrams' | 'designs' | 'buttons' | 'bible';

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, activeProject }) => {
  const [activeFilter, setActiveFilter] = useState<PdfSectionFilter>('all');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const projectTitle = activeProject?.title || STORY_SPECS.title;
  const projectSubtitle = activeProject?.subtitle || STORY_SPECS.subtitle;
  const projectGenre = activeProject?.genre || STORY_SPECS.genre;
  const projectBg = activeProject?.background || STORY_SPECS.background;
  const projectScale = activeProject?.scale || STORY_SPECS.scale;
  const projectPov = activeProject?.pov || STORY_SPECS.pov;
  const projectTarget = activeProject?.target || STORY_SPECS.target;
  const projectSerial = activeProject?.serialization || STORY_SPECS.serialization;
  const projectLogline = activeProject?.coreConcept.logline || STORY_SPECS.coreConcept.logline;
  const characters = activeProject?.characters || CHARACTERS_DATA;
  const arcs = activeProject?.arcs || ARCS_DATA;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-300">
        
        {/* Floating Top Control Bar (Hidden when printing) */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>WebNovel-Studio 종합 기획서 & 디자인 시안 / 전체 개념도 (A4 PDF)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                  A4 ISO 216
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                [PDF로 즉시 저장 / 인쇄]를 클릭하여 전체 디자인 시안과 개념도를 PDF로 내보내세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportToWordDoc(activeProject)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>워드(.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PDF로 즉시 저장 / 인쇄</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Screen Only) */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-print">
          <span className="text-slate-500 font-bold shrink-0">출력 영역 필터:</span>
          {[
            { id: 'all' as PdfSectionFilter, label: '전체 리포트 (통합 A4)', icon: Sparkles },
            { id: 'diagrams' as PdfSectionFilter, label: '전체 개념도 (아키텍처)', icon: Compass },
            { id: 'designs' as PdfSectionFilter, label: '모든 디자인 시안 (UI/UX)', icon: Layers },
            { id: 'buttons' as PdfSectionFilter, label: '인터랙티브 버튼 명세', icon: MousePointerClick },
            { id: 'bible' as PdfSectionFilter, label: '스토리 바이블 & 100화 플롯', icon: BookOpen },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                activeFilter === item.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Document Container (Printable Area) */}
        <div className="p-6 sm:p-12 overflow-y-auto font-sans text-slate-800 leading-relaxed text-xs sm:text-sm bg-white print:p-0 print:m-0 print:overflow-visible">
          
          {/* Document Header Cover */}
          <div className="border-b-4 border-slate-900 pb-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-mono">
                ENTERPRISE SYSTEM & DESIGN SPECIFICATION
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                WebNovel-Studio v2.0
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              WebNovel-Studio — 종합 개발 명세서 & 전체 개념도 / UI 디자인 시안집
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              4막 6아크 24챕터 100화 공학적 플롯 아키텍처 및 인터랙티브 전장(Battlefield) 구현 명세: 《{projectTitle}》
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4 text-xs font-mono">
              <div><strong className="text-slate-900">플랫폼:</strong> WebNovel-Studio</div>
              <div><strong className="text-slate-900">문서 버전:</strong> v2.0.0-PROD (Final)</div>
              <div><strong className="text-slate-900">프로젝트:</strong> {activeProject?.id || 'bj-sister'}</div>
              <div><strong className="text-slate-900">엔진:</strong> Gemini · Claude · OpenAI 멀티 프록시</div>
              <div><strong className="text-slate-900">인터랙션:</strong> 풀스택 반응형 SPA + Express</div>
              <div><strong className="text-slate-900">출력 규격:</strong> ISO 216 A4 Portrait</div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 1: 전체 개념도 (Architecture & Diagrams)                 */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'diagrams') && (
            <div className="space-y-6 mb-10 print:break-after-page">
              <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>1. 전체 개념도: 시스템 아키텍처 및 11단계 집필 파이프라인</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">CONCEPTUAL DIAGRAM</span>
              </div>

              {/* 1.1 전체 시스템 아키텍처 다이어그램 */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span>1.1 클라이언트-서버-AI 멀티 모델 프록시 아키텍처</span>
                </h3>
                <div className="bg-[#0f172a] text-slate-100 p-4 sm:p-5 rounded-xl font-mono text-xs leading-relaxed border border-slate-800 shadow-md">
                  <pre className="whitespace-pre overflow-x-auto text-emerald-400">{`+---------------------------------------------------------------------------------------+
|                               WebNovel-Studio 프론트엔드 (React SPA)                    |
|  - Top GNB: 프로젝트 스위처 / AI 제공자 선택 / PDF 출력 / 옵시디언 동기화 / 사용자 정보     |
|  - Left GNB: 관제 대시보드 / 100화 타임라인 / 씬보드 / 복선DB / 100화 플롯 메이커           |
|  - Main Viewport: 대시보드 / 타임라인 / 씬보드 / 복선DB / AI 코치 / 옵시디언 트리        |
+-------------------------------------------+-------------------------------------------+
                                            │ REST / JSON (Express Vite Proxy)
                                            ▼
+---------------------------------------------------------------------------------------+
|                          Node.js Express 백엔드 (server.ts / Port 3000)                |
|  - Vite Middleware Mode (hmr: false - 클라우드 WebSocket 에러 원천 차단)              |
|  - withTimeout() 지능형 타임아웃 레이어 (3.5s ~ 5s 한도 내 안전 폴백 보증)            |
|  - /api/generate-step-1~5 (단계별 프롬프트 엔지니어링)                                |
|  - /api/ai-coach (문체/사이다/클리프행어 진단 프록시)                                  |
|  - /api/export-obsidian-zip (6대 폴더 마크다운 자동 생성)                             |
+-------------------------------------------+-------------------------------------------+
                                            │ Multi-Provider API Gateways
                                            ▼
+---------------------------------------------------------------------------------------+
|                                AI 파운데이션 모델 게이트웨이                           |
|  [Google Gemini 3.8 Flash]          [Anthropic Claude 3.5 Sonnet]     [OpenAI GPT-4o]  |
|  - 초고속 100화 씬 비트 생성         - 캐릭터 대사 감수 및 문체 개선    - 복선 논리 검증 |
+---------------------------------------------------------------------------------------+`}</pre>
                </div>
              </div>

              {/* 1.2 11단계 공학적 웹소설 창작 파이프라인 */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>1.2 11단계 공학적 집필 파이프라인 흐름도</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { step: '01', title: '로그라인 수립', desc: '주인공 + 핵심 결핍 + 극적 보상' },
                    { step: '02', title: '4대 인물 바이블', desc: '주인공·적대자·조력자·트릭스터' },
                    { step: '03', title: '세계관 3대 철칙', desc: '능력 체계, 계급, 페널티 규칙' },
                    { step: '04', title: '4막 6아크 분할', desc: '기-승-전-결 100화 정량 할당' },
                    { step: '05', title: '24챕터 씬 비트', desc: '챕터당 4~5개 기승전결 씬 분할' },
                    { step: '06', title: '복선 심기 & 회수', desc: '회차별 복선 매핑 및 미회수 추적' },
                    { step: '07', title: '화당 6,500자 통제', desc: '씬별 1,300자 블록 결합 집필' },
                    { step: '08', title: '엔딩 클리프행어', desc: '매 씬 마지막 후킹 포인트 의무화' },
                    { step: '09', title: '사이다/고구마 밸런스', desc: '3화 이상 위기 지속 방지 모니터' },
                    { step: '10', title: 'AI 페어 라이팅 퇴고', desc: '문체 튜닝 및 어색한 표현 교정' },
                    { step: '11', title: '다중 포맷 패키징', desc: '옵시디언 6대 폴더, Word, PDF' },
                  ].map((p) => (
                    <div key={p.step} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded text-[10px]">
                          STEP {p.step}
                        </span>
                        <span className="font-bold text-slate-800">{p.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.3 4막 6아크 정량 구조도 */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>1.3 4막 6아크 24챕터 100화 마스터 플롯 구조도</span>
                </h3>
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-white font-mono">
                      <tr>
                        <th className="p-2.5">대구분</th>
                        <th className="p-2.5">아크 코드 / 명칭</th>
                        <th className="p-2.5">챕터 범위</th>
                        <th className="p-2.5">회차 분량</th>
                        <th className="p-2.5">극적 기능 및 사이다 설계</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold bg-blue-50/50">제1막: 발단</td>
                        <td className="p-2.5 font-semibold">ARC-01: 각성과 시작</td>
                        <td className="p-2.5 font-mono">ch01 ~ ch04</td>
                        <td className="p-2.5 font-mono">01~16화</td>
                        <td className="p-2.5 text-slate-600">주인공의 결핍 노출, 이변의 발생, 첫 번째 능력 각성</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-indigo-50/50" rowSpan={2}>제2막: 전개</td>
                        <td className="p-2.5 font-semibold">ARC-02: 급성장과 첫 충돌</td>
                        <td className="p-2.5 font-mono">ch05 ~ ch08</td>
                        <td className="p-2.5 font-mono">17~32화</td>
                        <td className="p-2.5 text-slate-600">중간 라이벌과의 대치, 시원한 1차 사이다 보상</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold">ARC-03: 세계관의 확장</td>
                        <td className="p-2.5 font-mono">ch09 ~ ch12</td>
                        <td className="p-2.5 font-mono">33~50화</td>
                        <td className="p-2.5 text-slate-600">상위 세력 개입, 세계관의 이면(떡밥) 심기</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-amber-50/50" rowSpan={2}>제3막: 위기 & 절정</td>
                        <td className="p-2.5 font-semibold">ARC-04: 배신과 붕괴</td>
                        <td className="p-2.5 font-mono">ch13 ~ ch16</td>
                        <td className="p-2.5 font-mono">51~68화</td>
                        <td className="p-2.5 text-slate-600">믿었던 조력자의 이탈, 최대 위기(고구마 2화 이내 해소)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold">ARC-05: 대반격과 각성</td>
                        <td className="p-2.5 font-mono">ch17 ~ ch20</td>
                        <td className="p-2.5 font-mono">69~84화</td>
                        <td className="p-2.5 text-slate-600">비축된 복선의 폭발적 회수, 압도적 사이다 카타르시스</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-emerald-50/50">제4막: 결말</td>
                        <td className="p-2.5 font-semibold">ARC-06: 최종 결전과 완결</td>
                        <td className="p-2.5 font-mono">ch21 ~ ch24</td>
                        <td className="p-2.5 font-mono">85~100화</td>
                        <td className="p-2.5 text-slate-600">최종 흑막 제압, 세계관 3대 미결 과제 완결 및 에필로그</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: 모든 디자인 시안 (UI / UX Blueprint)                 */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'designs') && (
            <div className="space-y-6 mb-10 print:break-after-page">
              <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>2. 모든 디자인 시안 정리 (7대 코어 UI/UX 레이아웃)</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">DESIGN SYSTEM SPEC</span>
              </div>

              {/* 시안 1 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>[시안 1] 메인 관제 대시보드 (View A - Overview Dashboard)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                    ACTIVE TAB: dashboard
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  작가가 현재 집필 중인 모든 소설의 현황을 실시간 게이지와 템플릿 배지로 조망하는 작전 관제 센터입니다.
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono">
                  <div className="grid grid-cols-4 gap-2 text-center pb-2 border-b border-slate-100">
                    <div className="p-2 bg-slate-50 rounded">총 목표: <span className="font-bold text-blue-600">100화</span></div>
                    <div className="p-2 bg-slate-50 rounded">비축 회차: <span className="font-bold text-emerald-600">14화 (14%)</span></div>
                    <div className="p-2 bg-slate-50 rounded">누적 단어: <span className="font-bold text-indigo-600">77,000자</span></div>
                    <div className="p-2 bg-slate-50 rounded">미회수 복선: <span className="font-bold text-rose-600">3건</span></div>
                  </div>
                  <div className="pt-2 text-slate-500 text-[11px]">
                    ※ 주요 컴포넌트: <code>ProjectDashboardCards</code>, 아크별 원형 프로그레스, 100화 달성 게이지, 최근 프로젝트 캐러셀
                  </div>
                </div>
              </div>

              {/* 시안 2 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>[시안 2] 5단계 원클릭 소설 생성 스튜디오 (View F - Story Generator)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    ACTIVE TAB: new-project
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  키워드 입력과 AI 프롬프트 체인을 통해 1단계 로그라인에서 5단계 100화 씬 비트 트리까지 원클릭으로 기획·생성하는 파이프라인 뷰입니다.
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 pb-2 border-b border-slate-100 overflow-x-auto">
                    <span className="px-2 py-1 bg-blue-600 text-white rounded font-bold">1.장르·로그라인</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-slate-200 rounded">2.인물 바이블</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-slate-200 rounded">3.세계관 철칙</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-slate-200 rounded">4.4막 6아크</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-slate-200 rounded">5.100화 씬트리</span>
                  </div>
                  <div className="pt-2 text-slate-500 text-[11px]">
                    ※ 주요 컴포넌트: <code>NewProjectView</code>, <code>Step1Logline</code> ~ <code>Step5SceneTree</code>, AI 아이디어 칩
                  </div>
                </div>
              </div>

              {/* 시안 3 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>[시안 3] 4막 6아크 마스터 타임라인 뷰 (View B - Master Timeline)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    ACTIVE TAB: timeline
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100화 전편의 대서사를 6대 아크 카드로 시각화하여 분량 배분 및 기승전결 텐션의 편중을 방지합니다.
                </p>
              </div>

              {/* 시안 4 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                    <span>[시안 4] 24챕터 씬 보드 & 기승전결 집필기 (View D - Chapter Board)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    ACTIVE TAB: chapter
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  선택한 챕터의 씬들을 기(起)·승(承)·전(轉)·결(結) 4단 칸반 보드로 시각화하고 단락별 글자 수와 클리프행어 마크를 실시간 추적합니다.
                </p>
              </div>

              {/* 시안 5 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">5</span>
                    <span>[시안 5] 복선 & 떡밥 추적기 (View E - Foreshadowing Database)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                    ACTIVE TAB: lists
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  연재 중 독자 이탈을 부르는 '설정 붕괴'와 '미회수 떡밥'을 0%로 만들기 위한 전용 복선 추적 인터페이스입니다.
                </p>
              </div>

              {/* 시안 6 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">6</span>
                    <span>[시안 6] AI 페어 라이팅 코치 관제탑 (View G - AI Coach Studio)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    ACTIVE TAB: ai-coach
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Claude, OpenAI, Gemini 모델을 스위칭하며 사이다 지수 측정, 절정 클리프행어 생성, 번역투 제거를 수행하는 집필 코치입니다.
                </p>
              </div>

              {/* 시안 7 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">7</span>
                    <span>[시안 7] 옵시디언 6대 폴더 워크스페이스 모달 (Workspace Modal)</span>
                  </h4>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                    MODAL: WorkspaceModal
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1-기획문서부터 6-덜어내기까지 옵시디언 표준 마크다운 트리 구조를 시각화하고 원클릭 ZIP 압축 다운로드를 제공합니다.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: 인터랙티브 버튼 구현 상세 명세                        */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'buttons') && (
            <div className="space-y-6 mb-10 print:break-after-page">
              <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5 text-emerald-600" />
                  <span>3. 인터랙티브 버튼 & 사용자 조작 구현 명세서</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">INTERACTIVE COMPONENT SPEC</span>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white font-mono">
                    <tr>
                      <th className="p-2.5">버튼 명칭</th>
                      <th className="p-2.5">컴포넌트 위치</th>
                      <th className="p-2.5">핸들러 / 상태 바인딩</th>
                      <th className="p-2.5">인터랙션 및 동작 메커니즘</th>
                      <th className="p-2.5">피드백 효과</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold text-blue-700">대시보드 HOME</td>
                      <td className="p-2.5 font-mono">Sidebar.tsx</td>
                      <td className="p-2.5 font-mono">onSelectTab('dashboard')</td>
                      <td className="p-2.5">전체 소설 프로젝트 목록 및 대시보드 뷰포트 전환</td>
                      <td className="p-2.5">파란색 배경 하이라이트 & HOME 배지</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-700">새로운 웹소설 작성하기</td>
                      <td className="p-2.5 font-mono">Sidebar.tsx</td>
                      <td className="p-2.5 font-mono">onSelectTab('new-project')</td>
                      <td className="p-2.5">5단계 공학적 100화 생성기 폼 초기화 및 뷰 전환</td>
                      <td className="p-2.5">그라디언트 링 애니메이션 & NEW 배지</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">기획서 PDF 뷰어</td>
                      <td className="p-2.5 font-mono">Sidebar / TopGnb</td>
                      <td className="p-2.5 font-mono">setIsPdfModalOpen(true)</td>
                      <td className="p-2.5">A4 규격 공식 리포트 및 디자인 시안 모달 오픈</td>
                      <td className="p-2.5">Backdrop 블러 & 모달 슬라이드업</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-700">PDF로 즉시 저장 / 인쇄</td>
                      <td className="p-2.5 font-mono">PdfExportModal.tsx</td>
                      <td className="p-2.5 font-mono">window.print()</td>
                      <td className="p-2.5">A4 인쇄 최적화 미디어 쿼리 적용 후 PDF 내보내기 대화상자 호출</td>
                      <td className="p-2.5">인쇄용 스타일 변환 및 A4 페이지 분할</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-700">옵시디언 워크스페이스</td>
                      <td className="p-2.5 font-mono">Sidebar / TopGnb</td>
                      <td className="p-2.5 font-mono">setIsWorkspaceModalOpen(true)</td>
                      <td className="p-2.5">6대 폴더 트리 탐색 및 ZIP 다운로드 모달 오픈</td>
                      <td className="p-2.5">폴더 트리 활성화</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-800">옵시디언 ZIP 다운로드</td>
                      <td className="p-2.5 font-mono">WorkspaceModal.tsx</td>
                      <td className="p-2.5 font-mono">fetch('/api/export-obsidian-zip')</td>
                      <td className="p-2.5">서버 백엔드에서 6대 폴더 마크다운을 ZIP으로 패키징 후 다운로드</td>
                      <td className="p-2.5">로딩 스피너 & 파일 저장</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-700">설정 (AI 모델 & API)</td>
                      <td className="p-2.5 font-mono">Sidebar / TopGnb</td>
                      <td className="p-2.5 font-mono">setIsSettingsModalOpen(true)</td>
                      <td className="p-2.5">Claude / OpenAI / Gemini API 키 등록 및 모델 변경 모달 오픈</td>
                      <td className="p-2.5">활성 모델 배지 갱신</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-800">AI 단계별 생성 버튼</td>
                      <td className="p-2.5 font-mono">NewProjectView.tsx</td>
                      <td className="p-2.5 font-mono">handleGenerateStep(n)</td>
                      <td className="p-2.5">각 단계별 최적화 프롬프트를 AI 백엔드로 전송하여 실시간 플롯 도출</td>
                      <td className="p-2.5">스켈레톤 로딩 & 데이터 자동 입력</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-800">AI 본문 즉시 적용</td>
                      <td className="p-2.5 font-mono">AiCoachView.tsx</td>
                      <td className="p-2.5 font-mono">handleApplyAiTextToScene()</td>
                      <td className="p-2.5">AI가 제안한 개선 단락을 현재 선택된 씬 본문에 즉각 반영</td>
                      <td className="p-2.5">완료 토스트 & 글자 수 갱신</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 4: 스토리 바이블 및 기본 제원                            */}
          {/* ============================================================== */}
          {(activeFilter === 'all' || activeFilter === 'bible') && (
            <div className="space-y-6 mb-8 avoid-break">
              <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-700" />
                  <span>4. 작품 기본 제원 및 스토리 바이블: 《{projectTitle}》</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">STORY BIBLE</span>
              </div>

              <table className="w-full text-xs border border-slate-300">
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="p-2.5 bg-slate-100 font-bold w-32">작품명</td><td className="p-2.5 font-bold text-slate-900">《{projectTitle}》 ({projectSubtitle})</td></tr>
                  <tr><td className="p-2.5 bg-slate-100 font-bold">장르 구성비</td><td className="p-2.5">{projectGenre}</td></tr>
                  <tr><td className="p-2.5 bg-slate-100 font-bold">배경 설정</td><td className="p-2.5">{projectBg}</td></tr>
                  <tr><td className="p-2.5 bg-slate-100 font-bold">규모 및 분량</td><td className="p-2.5">{projectScale}</td></tr>
                  <tr><td className="p-2.5 bg-slate-100 font-bold">시점 원칙</td><td className="p-2.5">{projectPov}</td></tr>
                  <tr><td className="p-2.5 bg-slate-100 font-bold">타깃 독자</td><td className="p-2.5">{projectTarget}</td></tr>
                  <tr><td className="p-2.5 bg-slate-100 font-bold">연재 전략</td><td className="p-2.5">{projectSerial}</td></tr>
                </tbody>
              </table>

              <div className="p-4 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-lg italic text-blue-900 text-xs sm:text-sm">
                "{projectLogline}"
              </div>

              {/* Characters */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-900 text-sm">핵심 등장인물 설정 (Character Bible)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {characters.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{c.name} ({c.alias})</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{c.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-1">{c.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono">아크 궤적: {c.arcTrajectory}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-6 border-t-2 border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>WebNovel-Studio Enterprise Architecture & UX Specification</span>
            <span className="font-mono">Doc ID: WNS-SPEC-202611-PROD | ISO 216 A4 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
