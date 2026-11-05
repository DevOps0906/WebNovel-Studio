import React, { useState } from 'react';
import {
  User,
  Eye,
  X,
  Edit3,
  Save,
  Check,
  BookOpen,
  Globe,
  Feather,
  Layers,
  FolderTree,
  ShieldAlert,
  Key,
  Compass,
  Sparkles,
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import { WebNovelProject } from '../data/projectTemplates';
import { CharacterItem, CHARACTERS_DATA } from '../data/storyData';

interface TabOverviewProps {
  activeProject: WebNovelProject;
  onUpdateProject?: (updated: WebNovelProject) => void;
}

type OverviewSectionTab = 'all' | '01-plan' | '02-world' | '03-character' | '04-structure' | '05-style' | 'file-tree';

export const TabOverview: React.FC<TabOverviewProps> = ({
  activeProject,
  onUpdateProject,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState<OverviewSectionTab>('all');

  const getWorldSettings = (proj: WebNovelProject) => {
    if (proj.id === 'hunter-sovereign') {
      return {
        worldThesis: '힘의 논리에 짓밟힌 F급이라도, 성좌와의 절대 계약과 규칙을 손에 쥐면 세계의 지배자를 조련할 수 있다.',
        worldRisks: [
          '성좌 계약 페널티: 신탁 불이행 시 영혼 잠식 및 신체 붕괴 리스크',
          '블랙드래곤 길드의 비인가 게이트 생체 실험체 추적',
          '국제 헌터 협회 마력 감시망에 의한 신격 파동 탐지',
          'S급 게이트 브레이크 발생 시 민간인 지구 전멸 위기'
        ],
        worldKeyObjects: '태고의 룬 석판, 마력 계약서 양식, 심연의 모래시계, 최도현 길드마스터의 불법 코어 USB',
        styleRule1: '감정 명명 금지: 살의/공포 직접 서술 금지 -> 마력 파동의 냉기, 동공 축소, 손목 흉터 문지르기로 시각화',
        styleRule2: '3중 보이스 분리: [내면독백: F급 짐꾼의 비정한 계산] / [대외 대사: 순종적인 척하는 연기] / [성좌 신탁: 머리를 울리는 절대음]',
        styleRule3: '씬 엔딩 훅: 오만한 랭커의 상식이 깨지거나 게이트 심연의 새 규칙이 열리는 한 줄 클리프행어'
      };
    } else if (proj.id === 'villainess-escape') {
      return {
        worldThesis: '사랑을 구걸하는 악녀는 단두대로 가지만, 황실의 부채와 국채를 쥐어짠 악녀는 금융 제국의 여왕이 된다.',
        worldRisks: [
          '단두대 처형 D-90 타임리밋: 원작 사형 선고 판결 번복 필요',
          '황태자의 사병 동원 및 에르하르트 공작가 계좌 동결 시도',
          '원작 여주인공의 비소 독약 암살 음모',
          '마탑과의 비밀 국채 거래 발각 시 반역죄 기소 리스크'
        ],
        worldKeyObjects: '황실 친필 차용증 (30억 플로린), 은빛 마도 회중시계, 비소 해독제 처방전, 제국 최고법원 파혼 확인서',
        styleRule1: '감정 명명 금지: 슬픔/배신감 직접 서술 금지 -> 레이스 장갑을 낀 손가락 경련, 찻잔을 내려놓는 소리 없는 동작으로 묘사',
        styleRule2: '3중 보이스 분리: [내면독백: 냉철한 회계사의 대차대조표 계산] / [사교계 대사: 우아하게 뼈를 깎는 존댓말] / [황태자 독대: 서늘한 채권자의 목소리]',
        styleRule3: '씬 엔딩 훅: 황실의 숨통을 조이는 새로운 채무 증서나 독약 장부가 폭로되는 파혼 사이다 훅'
      };
    } else {
      return {
        worldThesis: '돈과 권력은 사람을 지배할 수 있지만, 남겨진 진실의 기록은 소멸시킬 수 없다.',
        worldRisks: [
          '신분 위장 붕괴 조건: 유전자 검사 결과서 봉인 씰 훼손 여부',
          '거대 재벌/적대 세력의 직계 출입 보안 생체 스캔 통과 여부',
          '과거 사망 전 미공개 영상이나 일기장 유출 리스크',
          '해외 병원 및 은닉 계좌의 송금 내역 추적'
        ],
        worldKeyObjects: '12인용 직사각형 식탁 (자리 배치가 곧 권력의 바로미터), 은색 만년필, 처방약 봉투, 6편의 암호 일기',
        styleRule1: '감정 명명 금지: 슬펐다/분노했다 직접 서술 대신 체온 변화, 손가락 경련, 마른 침 삼키기로 묘사',
        styleRule2: '3중 보이스 분리: [독백: 냉소적 반말] / [외적 연기: 깍듯한 존댓말] / [내레이션: 건조한 관찰]',
        styleRule3: '씬 엔딩 훅: 화의 끝은 반드시 비밀 서류 개봉이나 인식이 전복되는 한 줄 클리프행어로 종결'
      };
    }
  };

  const initialWorld = getWorldSettings(activeProject);

  const [formData, setFormData] = useState({
    title: activeProject.title || '',
    subtitle: activeProject.subtitle || '',
    penName: activeProject.penName || '',
    genre: activeProject.genre || '',
    background: activeProject.background || '',
    scale: activeProject.scale || '100화 완결 (4막 · 6아크 · 24챕터)',
    pov: activeProject.pov || '주인공 1인칭 관찰자 시점 + 3인칭 제한 시점 교차',
    target: activeProject.target || '2030 남성/여성 웹소설 독자층',
    serialization: activeProject.serialization || '주 5일 연재 (월·화·수·목·금 18시)',
    logline: activeProject.coreConcept.logline || '',
    theme: activeProject.coreConcept.theme || '',
    emotionalGoal: activeProject.coreConcept.emotionalGoal || '',
    differentiators: activeProject.coreConcept.differentiators || [],
    devices: activeProject.coreConcept.devices || [],
    climaxEnding: activeProject.coreConcept.climaxEnding || '',
    ...initialWorld
  });

  React.useEffect(() => {
    const updatedWorld = getWorldSettings(activeProject);
    setFormData({
      title: activeProject.title || '',
      subtitle: activeProject.subtitle || '',
      penName: activeProject.penName || '',
      genre: activeProject.genre || '',
      background: activeProject.background || '',
      scale: activeProject.scale || '100화 완결 (4막 · 6아크 · 24챕터)',
      pov: activeProject.pov || '주인공 1인칭 관찰자 시점 + 3인칭 제한 시점 교차',
      target: activeProject.target || '2030 남성/여성 웹소설 독자층',
      serialization: activeProject.serialization || '주 5일 연재 (월·화·수·목·금 18시)',
      logline: activeProject.coreConcept.logline || '',
      theme: activeProject.coreConcept.theme || '',
      emotionalGoal: activeProject.coreConcept.emotionalGoal || '',
      differentiators: activeProject.coreConcept.differentiators || [],
      devices: activeProject.coreConcept.devices || [],
      climaxEnding: activeProject.coreConcept.climaxEnding || '',
      ...updatedWorld
    });
    setIsEditing(false);
  }, [activeProject.id]);

  const handleSave = () => {
    if (!onUpdateProject) return;

    const updated: WebNovelProject = {
      ...activeProject,
      title: formData.title,
      subtitle: formData.subtitle,
      penName: formData.penName,
      genre: formData.genre,
      background: formData.background,
      scale: formData.scale,
      pov: formData.pov,
      target: formData.target,
      serialization: formData.serialization,
      coreConcept: {
        ...activeProject.coreConcept,
        logline: formData.logline,
        theme: formData.theme,
        emotionalGoal: formData.emotionalGoal,
        differentiators: formData.differentiators,
        devices: formData.devices,
        climaxEnding: formData.climaxEnding,
      },
    };

    onUpdateProject(updated);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const characters = activeProject.characters || CHARACTERS_DATA;

  return (
    <div className="space-y-6">

      {/* Top Banner: Mode Indicator & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                100화 기획 템플릿 구조 (Story Bible 01~05 순차 정렬)
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                작업 중: 《{formData.title}》
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              01-계획서 ➔ 02-세계관 ➔ 03-캐릭터바이블 ➔ 04-스토리구조 ➔ 05-문체가이드 순서로 체계적인 확인 및 편집이 가능합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveToast && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" /> 기획 바이블 저장 완료!
            </span>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>템플릿 저장하기</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>기획 템플릿 입력 / 수정</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Sequential Quick Filter Pills (1번부터 5번까지 차례대로 빠른 이동) */}
      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 px-2 py-1 shrink-0 flex items-center gap-1 font-mono">
          <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
          순차 바로가기:
        </span>

        <button
          type="button"
          onClick={() => setActiveSectionTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSectionTab === 'all'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          전체 순서대로 보기 (01~05)
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('01-plan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
            activeSectionTab === '01-plan'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">1</span>
          <span>01-계획서</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('02-world')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
            activeSectionTab === '02-world'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">2</span>
          <span>02-세계관</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('03-character')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
            activeSectionTab === '03-character'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">3</span>
          <span>03-캐릭터바이블</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('04-structure')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
            activeSectionTab === '04-structure'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">4</span>
          <span>04-스토리구조</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('05-style')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
            activeSectionTab === '05-style'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">5</span>
          <span>05-문체가이드</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSectionTab('file-tree')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
            activeSectionTab === 'file-tree'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
          <span>옵시디언 파일트리</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 01. 계획서: 기본 정보 제원 */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'all' || activeSectionTab === '01-plan') && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                01
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  01-계획서: 기본 정보 제원 및 연재 규격
                </h3>
                <p className="text-[11px] text-slate-500">작품 타이틀, 필명, 장르 배분율, 연재 주기 및 시점(POV) 설정</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
              단계 1 / 5
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3.5 text-xs pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">작품 제목 (메인 타이틀)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">부제 / 한 줄 카피</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">작가 필명</label>
                  <input
                    type="text"
                    value={formData.penName}
                    onChange={(e) => setFormData({ ...formData, penName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">연재 주기 (요일 및 업로드 시각)</label>
                  <input
                    type="text"
                    value={formData.serialization}
                    onChange={(e) => setFormData({ ...formData, serialization: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">장르 구성비</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">타깃 독자층</label>
                  <input
                    type="text"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">배경 무대</label>
                <input
                  type="text"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">연재 규모</label>
                  <input
                    type="text"
                    value={formData.scale}
                    onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">서술 시점 (POV)</label>
                  <input
                    type="text"
                    value={formData.pov}
                    onChange={(e) => setFormData({ ...formData, pov: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 text-slate-400 w-24 font-medium">작품 제목</td>
                    <td className="py-2.5 font-bold text-slate-900">
                      {formData.title} <span className="text-slate-400 font-normal">({formData.subtitle})</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-400 font-medium">작가 필명</td>
                    <td className="py-2.5 font-semibold text-slate-800">
                      {formData.penName}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-400 font-medium">장르 구성비</td>
                    <td className="py-2.5 text-slate-700 leading-relaxed">
                      {formData.genre}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-400 font-medium">배경 무대</td>
                    <td className="py-2.5 text-slate-700 leading-relaxed">
                      {formData.background}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 text-slate-400 w-24 font-medium">연재 규모</td>
                    <td className="py-2.5 text-slate-800 font-mono font-medium">
                      {formData.scale}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-400 font-medium">서술 시점</td>
                    <td className="py-2.5 text-slate-700 leading-relaxed">
                      {formData.pov}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-400 font-medium">연재 주기</td>
                    <td className="py-2.5 text-slate-700 leading-relaxed">
                      {formData.serialization}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-400 font-medium">독자 타깃</td>
                    <td className="py-2.5 text-slate-700 leading-relaxed">
                      {formData.target}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 02. 세계관: 핵심 규칙 및 설정 바이블 */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'all' || activeSectionTab === '02-world') && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                02
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>02-세계관: 핵심 규칙 & 설정 바이블</span>
                </h3>
                <p className="text-[11px] text-slate-500">한 줄 테제, 위장 붕괴/위험 조건, 핵심 설정 오브제</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
              단계 2 / 5
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-4 text-xs pt-1">
              <div>
                <label className="text-slate-700 font-bold block mb-1">세계관 한 줄 테제 (World Thesis)</label>
                <textarea
                  rows={2}
                  value={formData.worldThesis}
                  onChange={(e) => setFormData({ ...formData, worldThesis: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">핵심 설정 오브제 (Key Objects)</label>
                <input
                  type="text"
                  value={formData.worldKeyObjects}
                  onChange={(e) => setFormData({ ...formData, worldKeyObjects: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>세계관 한 줄 테제</span>
                </span>
                <p className="text-slate-700 italic leading-relaxed pt-1">
                  "{formData.worldThesis}"
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>위장 붕괴 조건 (위험 요소)</span>
                </span>
                <ul className="space-y-1.5 text-slate-600 pl-3 list-disc marker:text-rose-500 pt-1 leading-relaxed">
                  {formData.worldRisks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>핵심 설정 오브제</span>
                </span>
                <p className="text-slate-700 leading-relaxed pt-1">
                  {formData.worldKeyObjects}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 03. 캐릭터바이블: 인물 설정 & 은밀한 비밀 */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'all' || activeSectionTab === '03-character') && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                03
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>03-캐릭터바이블: 인물 설정 & 바이블</span>
                </h3>
                <p className="text-[11px] text-slate-500">주요 등장인물 {characters.length}인의 역할, 무의식적 습관, 은밀한 비밀, 궤적</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
              단계 3 / 5
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {characters.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCharacter(c)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {c.role}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {c.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({c.alias})
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span className="truncate max-w-[120px]">비밀: {c.secret ? '보유' : '없음'}</span>
                  <span className="text-blue-600 font-bold group-hover:underline">상세보기 ➔</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 04. 스토리구조: 핵심 컨셉 & 100화 4막 플롯 */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'all' || activeSectionTab === '04-structure') && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                04
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>04-스토리구조: 핵심 컨셉 & 100화 4막 플롯 아키텍처</span>
                </h3>
                <p className="text-[11px] text-slate-500">한 문장 로그라인, 주제의식, 감정 목표, 차별화 및 구조 장치, 결말</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
              단계 4 / 5
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3.5 text-xs pt-1">
              <div>
                <label className="text-slate-700 font-bold block mb-1">한 문장 로그라인 (Logline)</label>
                <textarea
                  rows={3}
                  value={formData.logline}
                  onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">주제 의식 (Theme)</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">독자 감정 목표 (Emotional Goal)</label>
                  <input
                    type="text"
                    value={formData.emotionalGoal}
                    onChange={(e) => setFormData({ ...formData, emotionalGoal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">클라이맥스 및 결말 (Climax & Ending)</label>
                <textarea
                  rows={2}
                  value={formData.climaxEnding}
                  onChange={(e) => setFormData({ ...formData, climaxEnding: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 leading-relaxed focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 text-xs">한 문장 로그라인 (Logline)</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {formData.logline}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[11px] mb-1">주제 의식</span>
                  <p className="text-slate-800 font-semibold leading-relaxed">{formData.theme}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[11px] mb-1">독자 감정 목표</span>
                  <p className="text-slate-800 font-semibold leading-relaxed">{formData.emotionalGoal}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[11px] mb-1">차별화 요소</span>
                  <ul className="text-slate-700 space-y-0.5 leading-relaxed text-[11px]">
                    {formData.differentiators.map((d, i) => (
                      <li key={i}>· {d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-500 block text-[11px] mb-1">구조 장치</span>
                  <ul className="text-slate-700 space-y-0.5 leading-relaxed text-[11px]">
                    {formData.devices.map((d, i) => (
                      <li key={i}>· {d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 text-xs">클라이맥스 및 완결 (Climax & Ending)</span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {formData.climaxEnding}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 05. 문체가이드: 3대 집필 원칙 & 연출 가이드 */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'all' || activeSectionTab === '05-style') && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                05
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Feather className="w-4 h-4 text-amber-600" />
                  <span>05-문체가이드: 3대 집필 표준 & 연출 원칙</span>
                </h3>
                <p className="text-[11px] text-slate-500">감정 명명 금지, 3중 보이스 분리, 씬 엔딩 훅 클리프행어</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
              단계 5 / 5
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block mb-0.5 text-xs">
                1. 감정 명명 금지 (Show, Don't Tell)
              </span>
              <p className="text-slate-600 leading-relaxed">
                {formData.styleRule1}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block mb-0.5 text-xs">
                2. 3개의 보이스 분리
              </span>
              <p className="text-slate-600 leading-relaxed">
                {formData.styleRule2}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block mb-0.5 text-xs">
                3. 씬 엔딩 훅 (클리프행어)
              </span>
              <p className="text-slate-600 leading-relaxed">
                {formData.styleRule3}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* Obsidian 6-Stage Folder Pipeline Structure */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'all' || activeSectionTab === 'file-tree') && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">
                WebNovel-Studio 옵시디언 6대 표준 파일트리 구조
              </h3>
            </div>
            <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              표준 파이프라인 트리
            </span>
          </div>

          <p className="text-xs text-slate-600">
            신규 웹소설 생성 시 옵시디언 표준 6단계 디렉토리 아키텍처가 자동으로 바인딩됩니다.
          </p>

          <div className="bg-[#0d1117] text-slate-100 p-5 rounded-lg font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border border-slate-800 shadow-inner">
            <pre className="whitespace-pre font-mono text-emerald-400/90 font-medium">{`project-root (${activeProject.title})/
├── 1-기획문서/
│   ├── 01-계획서.md (기본제원 및 기획의도)
│   ├── 02-세계관.md (테제 및 위험 규칙)
│   ├── 03-캐릭터바이블.md (인물 설정 및 비밀)
│   ├── 04-스토리구조.md (4막 6아크 플롯)
│   └── 05-문체가이드.md (3중 보이스 & 훅)
├── 2-챕터문서/
│   └── ch01-챕터계획.md ~ ch${String(activeProject.currentProgress?.totalChapters || 24).padStart(2, '0')}-챕터계획.md (기승전결 씬 분할)
├── 3-집필문서/
│   └── ch01/
│       └── s01.md ~ s14.md (씬 단위 본문 원문)
├── 4-연재본/
│   └── ch01.md ~ ch${String(activeProject.currentProgress?.totalChapters || 24).padStart(2, '0')}.md (화당 6,000~8,000자 병합 완성본)
├── 5-검토기록/
│   ├── 씬구성진단 / 퇴고 체크리스트 / 페이싱 리포트
├── 6-덜어내기/
└── aiwc-dashboard.json (${activeProject.id})`}</pre>
          </div>
        </section>
      )}

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600">{selectedCharacter.role}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCharacter.name} <span className="text-sm font-normal text-slate-400">({selectedCharacter.alias})</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-slate-900 block mb-1">인물 설정 및 기능</strong>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedCharacter.description}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">무의식적 습관 / 버릇</strong>
                <p className="text-slate-700">
                  {selectedCharacter.habits}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">은밀한 비밀 (극비)</strong>
                <p className="text-rose-700 bg-rose-50 p-2.5 rounded border border-rose-200">
                  {selectedCharacter.secret}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">아크별 위상 변화 (궤적)</strong>
                <p className="text-slate-600 font-mono text-[11px]">
                  {selectedCharacter.arcTrajectory}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCharacter(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
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
