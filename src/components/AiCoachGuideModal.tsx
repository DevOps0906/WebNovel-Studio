import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Terminal,
  FileText,
  ChevronRight,
  HelpCircle,
  Eye,
  Zap
} from 'lucide-react';

interface AiCoachGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCoachGuideModal: React.FC<AiCoachGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'voice' | 'emotion' | 'hook' | 'commands'>('pipeline');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  WebNovel-Studio 코칭 가이드
                </span>
                <span className="text-xs text-slate-300">공학적 집필 매뉴얼</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                AI 페어 라이팅 코치 사용방법 및 집필 공학 원칙
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto gap-1 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>11단계 공학 파이프라인</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'voice'
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>3중 보이스 분리 규칙</span>
          </button>

          <button
            onClick={() => setActiveTab('emotion')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'emotion'
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>감정 명명 금지 원칙</span>
          </button>

          <button
            onClick={() => setActiveTab('hook')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'hook'
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>엔딩 훅 & 클리프행어</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'commands'
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>프롬프트 & 슬래시 커맨드</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          {/* TAB 1: 11단계 파이프라인 */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <h3 className="font-extrabold text-blue-900 text-sm sm:text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>100화 완결을 보장하는 11단계 공학적 웹소설 집필 파이프라인</span>
                </h3>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  작가들이 연재 도중 연중하거나 슬럼프에 빠지는 주원인은 '즉흥적 집필' 때문입니다. WebNovel-Studio는 건축가가 청사진을 그리듯 11단계로 분할하여 안정적인 주 5~7회 완결 연재를 견인합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { step: '01', title: '발상 및 컨셉화', desc: '1문장 로그라인, 감정적 목표, 기존 히트작과의 3가지 차별화 요소 확정' },
                  { step: '02', title: '기본 계획 수립', desc: '화수(100화), 연재 주기, 플랫폼 독자층(문피아/시리즈/카카오) 맞춤 설계' },
                  { step: '03', title: '세계관 구축 (Story Bible)', desc: '세계관의 대전제(Thesis), 신분/마력 붕괴 리스크, 4대 핵심 상징물 정의' },
                  { step: '04', title: '캐릭터 개발', desc: '주인공의 결핍과 내면독백 톤, 안타고니스트의 비열한 동기, 아크별 궤적' },
                  { step: '05', title: '문체 가이드 확립', desc: '3중 보이스 분리 원칙 및 감정 명명 금지(Show, Don’t Tell) 헌장 수립' },
                  { step: '06', title: '스토리 구조화', desc: '100화를 4막 6아크 24챕터로 분할하고 화별 구조 클리프행어 매핑' },
                  { step: '07', title: '복선 & 미결 과제 DB', desc: '챕터별 심을 복선과 회수 위치(Payoff) 사전 등록 및 회수율 추적' },
                  { step: '08', title: '씬 트리 집필 (AI 페어)', desc: '기·승·전·결 씬별 1,200~2,000자 초안을 AI 코치와 함께 빠르게 탈고' },
                  { step: '09', title: '화 편성 (Episode Packaging)', desc: '완성된 씬들을 묶어 화당 5,500~7,500자로 편성하고 300자 엔딩 훅 배치' },
                  { step: '10', title: '퇴고 및 AI 코칭 검토', desc: '감정 단어 누출 검사, 3중 보이스 일치율 판정, 복선 회수 누락 자동 검사' },
                  { step: '11', title: '아크·막 종합 검토', desc: '4개 챕터(1개 아크) 완료 시 긴장도 곡선 및 독자 결제 전환율 시뮬레이션' }
                ].map((item) => (
                  <div key={item.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                        {item.step}단계
                      </span>
                      <span className="font-bold text-slate-900">{item.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed pl-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 3중 보이스 분리 규칙 */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <h3 className="font-extrabold text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>3중 보이스 분리 원칙 (The Triple-Voice System)</span>
                </h3>
                <p className="text-xs text-indigo-900 mt-1">
                  1인칭 웹소설의 흔한 실패는 모든 문장이 주인공의 푸념이나 단순 설명으로 뒤섞이는 것입니다. WebNovel-Studio는 3가지 성격을 엄격히 분리하여 텍스트의 입체감과 몰입도를 극대화합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">보이스 1: 내레이션 (건조한 관찰 카메라)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    공간, 행동, 사물의 변화를 감정 없이 건조하게 묘사합니다. 수식어를 최대한 줄이고 물리적인 사실만을 독자에게 전달합니다.
                  </p>
                  <div className="bg-slate-100 p-2.5 rounded-lg font-sans text-xs text-slate-800">
                    "서진태 회장이 찻잔을 내려놓았다. 백자 잔받침에 닿은 굽이 둔탁한 소리를 냈다."
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-bold text-blue-950 text-xs sm:text-sm">보이스 2: 주인공 내면독백 (냉소적·비정한 계산)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    주인공의 진짜 본심과 전략적 두뇌 회전. 겉모습과 대비되는 냉혹한 속마음을 반말이나 혼잣말 형태로 날카롭게 전개합니다.
                  </p>
                  <div className="bg-blue-100/70 p-2.5 rounded-lg font-sans text-xs text-blue-900">
                    ['저 노인은 지금 내가 손을 떠는지 보고 있다. 동생의 죽음을 슬퍼하는 손녀가 아니라, 살아남으려는 맹수의 눈빛을 원하고 있어.']
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-bold text-emerald-950 text-xs sm:text-sm">보이스 3: 인물 대사 (사회적 가면과 연기)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    상대를 속이거나 도발하기 위한 대외적 가면. 극존칭 혹은 천진난만한 척하는 어조로 상대의 방심을 유도합니다.
                  </p>
                  <div className="bg-emerald-100/70 p-2.5 rounded-lg font-sans text-xs text-emerald-900">
                    "할아버님 말씀이 맞아요. 제가 아직 배울 게 너무나 많습니다."
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 감정 명명 금지 원칙 */}
          {activeTab === 'emotion' && (
            <div className="space-y-4">
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
                <h3 className="font-extrabold text-rose-950 text-sm sm:text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>감정 명명 금지 헌장 (No Emotion Naming Rule)</span>
                </h3>
                <p className="text-xs text-rose-900 mt-1">
                  "슬펐다", "화가 났다", "공포에 질렸다" 같은 감정 단어를 직접 쓰는 순간 독자의 상상력은 차단됩니다. 인물의 신체 반응과 감각 묘사(Show, Don't Tell)로 감정을 역추적하게 하세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                  <span className="font-extrabold text-rose-700 flex items-center gap-1.5 text-xs">
                    <X className="w-4 h-4" />
                    <span>금지 예시 (아마추어식 명명)</span>
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-rose-200 text-slate-700 space-y-2 font-mono text-[11px] leading-relaxed">
                    <p className="line-through text-rose-600">
                      나는 동생이 죽었다는 소식에 <strong>너무나 슬펐고 절망스러웠다.</strong>
                    </p>
                    <p className="line-through text-rose-600">
                      서동훈의 오만한 태도에 <strong>살의가 솟구칠 정도로 화가 났다.</strong>
                    </p>
                    <p className="line-through text-rose-600">
                      비밀이 들킬까 봐 <strong>심장이 쿵쾅거리고 두려웠다.</strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                  <span className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>권장 예시 (프로의 신체화 감각 묘사)</span>
                  </span>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-slate-800 space-y-2 text-[11px] leading-relaxed">
                    <p>
                      숨이 목구멍에 걸렸다. 손끝의 온기가 빠르게 식어 나가며, 차가운 땀이 손바닥을 적셨다.
                    </p>
                    <p>
                      어금니가 맞물리며 턱선이 굳었다. 냅킨을 쥔 엄지손톱이 하얗게 질리도록 눌렀다.
                    </p>
                    <p>
                      마른 침을 삼키는 소리가 귓가에 고막을 때릴 만큼 크게 울렸다. 시야의 가장자리가 좁아졌다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <strong className="text-slate-900 block mb-1">💡 AI 페어 코치 활용 팁:</strong>
                AI에게 초안을 요청한 뒤 <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">/studio:10-review</code>를 실행하면, 본문에 남아있는 직접 감정 명명 단어를 자동으로 감지하여 신체 반응 문장으로 치환 제안해줍니다.
              </div>
            </div>
          )}

          {/* TAB 4: 엔딩 훅 & 클리프행어 */}
          {activeTab === 'hook' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                <h3 className="font-extrabold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>화당 5,500자 호흡 & 엔딩 300자 클리프행어 공식</span>
                </h3>
                <p className="text-xs text-amber-900 mt-1">
                  웹소설 독자의 90%는 한 화의 마지막 300자를 읽고 '다음 화 결제' 버튼을 누릅니다. 매 화의 엔딩은 반드시 아래 4대 훅 중 하나로 귀결되어야 합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <span className="font-extrabold text-blue-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>1. 반전형 훅 (Reversal Hook)</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    독자가 믿고 있던 전제나 상식을 마지막 대사 한마디로 완전히 뒤집는 패턴.
                  </p>
                  <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-800">
                    "서동훈 부회장님, 이 장부… 회장님이 아니라 당신이 작성한 거더군요?"
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <span className="font-extrabold text-rose-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>2. 위기형 훅 (Peril Cliffhanger)</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    주인공의 정체나 목숨이 1초 뒤에 발각될 일촉즉발의 순간에 암전하는 패턴.
                  </p>
                  <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-800">
                    문이 벌컥 열리며 서진태 회장의 차가운 눈빛이 내 손의 암호 일기장에 꽂혔다.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <span className="font-extrabold text-amber-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>3. 비밀발견형 훅 (Discovery Hook)</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    오랫동안 추적하던 핵심 증거나 숨겨진 유품의 봉인이 열리는 순간.
                  </p>
                  <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-800">
                    테이프로 밀봉된 금고 밑바닥에서 나온 USB. 그 파일명은 『동생의 마지막 방송』이었다.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <span className="font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>4. 결단·선전포고 훅 (Declaration Hook)</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    당하기만 하던 주인공이 반격의 서막을 알리며 통쾌한 선언을 던지는 순간.
                  </p>
                  <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-800">
                    "오늘부터 태성물산 주총 준비는 제가 직접 하겠습니다."
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 프롬프트 & 슬래시 커맨드 */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-extrabold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>AI 페어 라이팅 코치 슬래시 커맨드 사전</span>
                </h3>
                <p className="text-xs text-emerald-900 mt-1">
                  AI 코치 드로어에서 슬래시 커맨드를 선택하거나 입력하면, 파이프라인의 각 단계에 최적화된 프롬프트가 즉시 작동합니다.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 text-xs">/studio:08-scene</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">본문 집필</span>
                  </div>
                  <p className="text-slate-700">
                    선택된 씬의 기·승·전·결 포지션, 텐션 목표, 3중 보이스 분리 규칙, 감정 명명 금지 원칙을 100% 적용하여 1,500~2,200자의 초안 본문을 고밀도로 집필합니다.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-600 text-xs">/studio:10-review</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">문체 & 복선 감사</span>
                  </div>
                  <p className="text-slate-700">
                    작성된 씬 본문에서 '직접 감정 서술(명명)' 누출 여부, 3중 보이스 일치율, 심은 복선의 자연스러움을 100점 만점으로 정밀 평가하고 개선 문장을 출력합니다.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-600 text-xs">/studio:hook-ending</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">엔딩 훅 생성</span>
                  </div>
                  <p className="text-slate-700">
                    현재 씬의 마지막 300자를 다음 화 결제 전환율 95% 이상을 목표로 하는 4가지 훅(반전/위기/발견/결단) 중 최적의 옵션으로 완성합니다.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-600 text-xs">/studio:06-chapter</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">씬 트리 구성</span>
                  </div>
                  <p className="text-slate-700">
                    해당 챕터에서 반드시 다뤄야 할 미결 과제와 복선을 분배하여, 기승전결 8~10개 씬의 개요와 인물 동선을 자동으로 트리 구조로 생성합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0 text-xs">
          <span className="text-slate-500 font-mono">
            WebNovel-Studio 집필 공학 헌장 v1.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            가이드 확인 완료 (닫기)
          </button>
        </div>

      </div>
    </div>
  );
};
