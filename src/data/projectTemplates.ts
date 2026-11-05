import {
  CharacterItem,
  ArcItem,
  EpisodeStat,
  ForeshadowingItem,
  IssueItem,
  DiaryItem,
  ChapterData,
  STORY_SPECS,
  CHARACTERS_DATA,
  ARCS_DATA,
  EPISODES_DATA,
  ALL_CHAPTERS_DATA,
  FORESHADOWING_DATABASE,
  UNRESOLVED_ISSUES,
  DIARIES_DATA
} from './storyData';
import { KeyValueStore, browserStore, quarantineRaw } from './storage';
import { recomputeDerived } from './metrics';
import type { DecisionItem, ResearchItem } from './lore';
import type { ReviewNote } from './editing';
import type { EpisodeHook } from './hooks';
import type { KnowledgeEntry } from './characterTimeline';

export interface ProjectProgress {
  currentChapter: string;
  currentChapterTitle: string;
  nextStep: string;
  episodesOrganized: number;
  episodesTarget: number;
  totalWordCount: number;
  completedChapters: number;
  totalChapters: number;
  currentChapterScenesDone: number;
  currentChapterScenesTotal: number;
  chapterForeshadowingResolved: number;
  chapterForeshadowingTotal: number;
  openIssues: number;
  resolvedIssues: number;
  commitDate: string;
  commitHash: string;
}

export interface ProjectCoreConcept {
  logline: string;
  theme: string;
  emotionalGoal: string;
  differentiators: string[];
  devices: string[];
  climaxEnding: string;
}

export interface WebNovelProject {
  id: string;
  title: string;
  subtitle: string;
  penName: string;
  genre: string;
  background: string;
  scale: string;
  pov: string;
  target: string;
  serialization: string;
  templateType: 'chaebol' | 'hunter' | 'romfantasy' | 'wuxia' | 'custom';
  createdAt: string;
  updatedAt: string;
  currentProgress: ProjectProgress;
  coreConcept: ProjectCoreConcept;
  characters: CharacterItem[];
  arcs: ArcItem[];
  episodes: EpisodeStat[];
  chapters: Record<string, ChapterData>;
  foreshadowing: ForeshadowingItem[];
  unresolvedIssues: IssueItem[];
  diaries: DiaryItem[];
  /** C-01: 설정결정 목록 */
  decisions?: DecisionItem[];
  /** C-03: 고증 목록 */
  research?: ResearchItem[];
  /** R-02: 윤문 비교노트 */
  reviewNotes?: ReviewNote[];
  /** U-04: 화별 엔딩 훅 기록 (키: 화 번호) */
  episodeHooks?: Record<number, EpisodeHook>;
  /** C-07: 인물 시간선 (인물이 알게 된 사실) */
  knowledge?: KnowledgeEntry[];
}

// 1. Initial Reference Project: bj-sister (가짜 막내손녀는 재벌가를 집어삼킨다)
export const PROJECT_BJ_SISTER: WebNovelProject = {
  id: 'bj-sister',
  title: STORY_SPECS.title,
  subtitle: STORY_SPECS.subtitle,
  penName: STORY_SPECS.penName,
  genre: STORY_SPECS.genre,
  background: STORY_SPECS.background,
  scale: STORY_SPECS.scale,
  pov: STORY_SPECS.pov,
  target: STORY_SPECS.target,
  serialization: STORY_SPECS.serialization,
  templateType: 'chaebol',
  createdAt: '2026-10-15',
  updatedAt: '2026-10-30',
  currentProgress: STORY_SPECS.currentProgress,
  coreConcept: STORY_SPECS.coreConcept,
  characters: CHARACTERS_DATA,
  arcs: ARCS_DATA,
  episodes: EPISODES_DATA,
  chapters: ALL_CHAPTERS_DATA,
  foreshadowing: FORESHADOWING_DATABASE,
  unresolvedIssues: UNRESOLVED_ISSUES,
  diaries: DIARIES_DATA,
};

// 2. Preset Template: 현대 판타지 / 헌터·성좌물
export const PROJECT_HUNTER_SOVEREIGN: WebNovelProject = {
  id: 'hunter-sovereign',
  title: 'F급 성좌는 랭커들을 조련한다',
  subtitle: '태고의 잊혀진 성좌와 나눈 절대 계약',
  penName: '밤하늘',
  genre: '현대 판타지 60% · 성좌 계약 25% · 길드 정치 15%',
  background: '2025년 대한민국 서울 및 1급 던전 게이트 지구',
  scale: '100화 완결 · 4막 6아크 24챕터 · 화당 5,500~7,500자',
  pov: '1인칭 주인공 시점 (강태산, F급 짐꾼에서 성좌 대행자로 각성)',
  target: '카카오페이지/문피아 판타지 레이드물 및 사이다 육성물 선호 독자층',
  serialization: '문피아 독점 연재 · 주 7회 성실 연재',
  templateType: 'hunter',
  createdAt: '2026-10-20',
  updatedAt: '2026-10-29',
  currentProgress: {
    currentChapter: 'ch03',
    currentChapterTitle: '성좌의 첫 번째 신탁',
    nextStep: '8단계 씬 02 「게이트 붕괴」',
    episodesOrganized: 8,
    episodesTarget: 40,
    totalWordCount: 52400,
    completedChapters: 2,
    totalChapters: 24,
    currentChapterScenesDone: 2,
    currentChapterScenesTotal: 9,
    chapterForeshadowingResolved: 1,
    chapterForeshadowingTotal: 2,
    openIssues: 19,
    resolvedIssues: 12,
    commitDate: '2026-10-28',
    commitHash: 'a9b2c31',
  },
  coreConcept: {
    logline: '만년 F급 짐꾼 강태산이 버려진 S급 게이트 심연에서 잊혀진 태고의 성좌 「영원의 침묵」과 계약을 맺고, 자신을 토사구팽한 거대 길드와 오만한 S급 랭커들을 차례로 길들이며 세계 최강의 조련사로 군림한다.',
    theme: '약탈당한 자의 역습 — 힘의 논리에 짓밟힌 자가 규칙 그 자체가 되는 과정',
    emotionalGoal: '압도적인 사이다 통쾌함 + 성좌 육성의 대리만족 + 길드 수뇌부의 절망',
    differentiators: [
      '성좌의 선택을 받는 자가 아닌, 성좌를 관리하고 조련하는 대행자 시스템',
      '물리적 마력 격차를 뒤집는 신탁 디버프와 절대 영역 규칙 활용',
      '버림받은 짐꾼 동료들을 S급 헌터로 육성하는 길드 창립 서사'
    ],
    devices: [
      '성좌의 석판: 미지의 퀘스트를 달성할 때마다 해금되는 고대 권능',
      '마력 계약서: 적대 길드원의 약점을 저당 잡아 강제로 노예 계약 체결',
      '심연의 모래시계: 게이트 붕괴 위기 시 시간 흐름을 3초간 정지'
    ],
    climaxEnding: '95화 세계 헌터 협회 총회에서 전 세계 1위 길드의 마스터를 생중계 결투로 굴복시키고 세계 유일의 신급 조련사로 공인받음.'
  },
  characters: [
    {
      id: 'char-h1',
      name: '강태산',
      alias: '코드명: 사일런트 (F급 짐꾼 → 성좌 대행자)',
      role: '주인공 / 성좌 조련사',
      description: '각성 실패로 10년간 대형 길드의 시체 수습 짐꾼으로 착취당했으나, 던전 함정에서 고대 성좌를 만나 계약. 냉철한 판단력과 비정한 실행력을 갖춤.',
      habits: '위기 시 손목의 흉터를 문지르며 상대의 마력 파동을 읽음.',
      secret: '그의 체내에 봉인된 성좌는 천 년 전 신들을 학살했던 파멸신.',
      arcTrajectory: '아크 1 각성 및 첫 던전 탈출 → 아크 2 개인 길드 창설 → 아크 3 랭킹전 제패 → 아크 6 심연 게이트 정복'
    },
    {
      id: 'char-h2',
      name: '영원의 침묵',
      alias: '태고의 성좌 (칭호: 만상의 침묵자)',
      role: '스폰서 성좌 / 공동 주역',
      description: '다른 성좌들에게 배신당해 심연에 유폐되었던 신격. 태산의 냉혹함과 집념에 매료되어 자신의 권능을 무제한 위임함.',
      habits: '말 대신 귓가에 울리는 심장 고동 소리로 반응.',
      secret: '태산이 100화에서 마지막 시련을 통과하지 못하면 육신을 강탈할 계약 조항 보유.',
      arcTrajectory: '아크 1 계약 → 아크 3 권능 전수 → 아크 5 성좌 간의 배신 폭로 → 아크 6 완전한 파트너십 구축'
    },
    {
      id: 'char-h3',
      name: '최도현',
      alias: '블랙드래곤 길드 마스터 (국내 랭킹 1위)',
      role: '메인 안타고니스트 / 숙적',
      description: '태산을 함정에 빠뜨려 죽이려 했던 장본인. 언론을 장악한 국민 영웅이지만 뒤로는 불법 게이트 생체 실험을 자행함.',
      habits: '웃는 얼굴로 타인의 목숨을 경매에 부침.',
      secret: '자신의 S급 마력이 실은 인공 코어 이식으로 인한 시한부 능력.',
      arcTrajectory: '아크 1 방심 → 아크 3 위기감 촉발 → 아크 5 전면전 개시 → 아크 6 생방송 폭로 후 몰락'
    }
  ],
  arcs: [
    { id: 'arc01', title: '버려진 짐꾼과 태고의 신탁', chapters: 'ch01~04', act: '1막 (기)', episodes: '01~17화', done: 8, total: 17, status: '진행 중' },
    { id: 'arc02', title: '그림자 길드의 태동', chapters: 'ch05~08', act: '2막 전반 (승)', episodes: '18~33화', done: 0, total: 16, status: '대기' },
    { id: 'arc03', title: '랭커 사냥과 경매장의 반란', chapters: 'ch09~12', act: '2막 전반 (승)', episodes: '34~50화', done: 0, total: 17, status: '대기' },
    { id: 'arc04', title: '성좌들의 성전 (Holy War)', chapters: 'ch13~16', act: '2막 후반 (전)', episodes: '51~67화', done: 0, total: 17, status: '대기' },
    { id: 'arc05', title: '블랙드래곤 길드의 몰락', chapters: 'ch17~20', act: '2막 후반 (전)', episodes: '68~83화', done: 0, total: 16, status: '대기' },
    { id: 'arc06', title: '심연의 군주', chapters: 'ch21~24', act: '3막 (결)', episodes: '84~100화', done: 0, total: 17, status: '대기' },
  ],
  episodes: [
    { episode: 1, title: '심연에 버려진 F급', words: 6850, chapter: 'ch01', hook: 'S급 게이트 함정에서 유기당한 순간 태고의 석판이 반응함 (절체절명 위기)' },
    { episode: 2, title: '영원의 침묵', words: 7120, chapter: 'ch01', hook: '침묵의 성좌가 내민 금지된 피의 계약 (상식 파괴)' },
    { episode: 3, title: '첫 번째 신탁', words: 6450, chapter: 'ch01', hook: '최도현이 버리고 간 보스룸에서 전설급 룬 코어 수확' },
    { episode: 4, title: '게이트 붕괴', words: 7900, chapter: 'ch01', hook: '아무도 살아나오지 못한 균열을 홀로 찢고 걸어나옴' },
    { episode: 5, title: 'F급의 귀환', words: 6300, chapter: 'ch02', hook: '헌터 협회 마력 측정기가 과부하로 폭발' },
    { episode: 6, title: '그림자 경매', words: 6700, chapter: 'ch02', hook: '블랙드래곤 길드의 비자금 장부를 익명으로 낙찰' },
    { episode: 7, title: '조련사의 자격', words: 7200, chapter: 'ch02', hook: '오만한 A급 랭커가 태산의 발밑에 무릎을 꿇음' },
    { episode: 8, title: '신탁의 대가', words: 6900, chapter: 'ch03', hook: '성좌의 진짜 목적인 잊혀진 신들의 전쟁이 언급됨' },
  ],
  chapters: {
    ch01: {
      id: 'ch01',
      number: 1,
      title: '심연에 버려진 짐꾼',
      arcId: 'arc01',
      arcTitle: '버려진 짐꾼과 태고의 신탁',
      act: '1막 (기)',
      status: '검토 완료',
      episodes: '01~04화',
      confirmedEpisodes: [1, 2, 3, 4],
      plannedScenesCount: 8,
      completedScenesCount: 8,
      totalWords: 28320,
      steps: { step6: '완료', step8: '완료', step9: '완료', step10: '완료' },
      tasks: [
        { id: 't-h01', text: 'S급 게이트 함정 유기 묘사 완료', status: '해결' },
        { id: 't-h02', text: '최도현 길드마스터의 비열한 배신 동기 확정', status: '해결' },
      ],
      scenes: [
        {
          id: 'ch01-s01',
          sceneNumber: '01',
          title: '어둠 속의 버려짐',
          stage: '기',
          pacing: '후퇴',
          episode: 1,
          wordCount: 1720,
          status: '본문 완료',
          synopsis: 'S급 던전 3층에서 짐꾼 강태산이 최도현의 명령으로 미끼로 던져진다.',
          characters: ['강태산', '최도현'],
          content: '등 뒤에서 둔탁한 굉음과 함께 셸터의 방폭문이 닫혔다. "미안하게 됐네, 강 군. F급 하나 살리자고 우리 S급 레이드팀이 전멸할 순 없잖아?" 최도현의 목소리는 너무나 산뜻해서 역겨웠다.'
        },
        {
          id: 'ch01-s02',
          sceneNumber: '02',
          title: '심연의 석판',
          stage: '승',
          pacing: '전환',
          episode: 2,
          wordCount: 1850,
          isEndingHook: true,
          hookType: '★ 절대 계약',
          status: '본문 완료',
          synopsis: '피를 흘리며 쓰러진 태산의 손끝이 부서진 제단 석판에 닿는다.',
          characters: ['강태산', '영원의 침묵'],
          content: '피비린내 나는 어둠 속에서 차가운 돌의 감촉이 느껴졌다. [태고의 성좌 「영원의 침묵」이 그대의 침묵과 원한을 내려다봅니다.]'
        }
      ],
      foreshadowingResolved: [],
      foreshadowingPlanted: [
        { id: 'fp-h1', source: 'ch01', text: '부서진 제단의 룬 문자', target: 'ch04 각성', status: '심음' }
      ]
    },
    ch02: {
      id: 'ch02',
      number: 2,
      title: '영원의 침묵과 계약',
      arcId: 'arc01',
      arcTitle: '버려진 짐꾼과 태고의 신탁',
      act: '1막 (기)',
      status: '검토 완료',
      episodes: '05~07화',
      confirmedEpisodes: [5, 6, 7],
      plannedScenesCount: 8,
      completedScenesCount: 8,
      totalWords: 20200,
      steps: { step6: '완료', step8: '완료', step9: '완료', step10: '완료' },
      tasks: [
        { id: 't-h03', text: '성좌의 디버프 권능 규칙 정립', status: '해결' },
        { id: 't-h04', text: '마력 측정소 폭파 씬 연출 확정', status: '해결' },
      ],
      scenes: [
        {
          id: 'ch02-s01',
          sceneNumber: '01',
          title: '신탁의 조건',
          stage: '기',
          pacing: '전진',
          episode: 5,
          wordCount: 1680,
          status: '본문 완료',
          synopsis: '성좌가 제시한 계약 조건은 신을 조련하는 대행자가 되는 것.',
          characters: ['강태산', '영원의 침묵'],
          content: '[신을 길들일 자격이 있는가.] 머릿속을 찢는 듯한 음성에 태산은 피 묻은 입꼬리를 올렸다. "신이든 악마든 상관없어. 내 몫을 돌려받게 해준다면."'
        }
      ],
      foreshadowingResolved: [],
      foreshadowingPlanted: [
        { id: 'fp-h2', source: 'ch02', text: '최도현의 시계 일련번호', target: 'ch12 경매장', status: '심음' }
      ]
    },
    ch03: {
      id: 'ch03',
      number: 3,
      title: '성좌의 첫 번째 신탁',
      arcId: 'arc01',
      arcTitle: '버려진 짐꾼과 태고의 신탁',
      act: '1막 (기)',
      status: '진행 중',
      episodes: '08~10화 (집필 중)',
      confirmedEpisodes: [8],
      plannedScenesCount: 9,
      completedScenesCount: 2,
      totalWords: 3880,
      steps: { step6: '완료', step8: '진행 중', step9: '대기', step10: '대기' },
      tasks: [
        { id: 't-h05', text: '씬 02 게이트 붕괴 탈출 액션 묘사', status: '미결' },
        { id: 't-h06', text: '버려진 보스룸 보물 탈취 사이다 포인트', status: '미결' },
        { id: 't-h07', text: '1막 전환점 17화 랭커 조련선 설계', status: '해결' },
      ],
      scenes: [
        {
          id: 'ch03-s01',
          sceneNumber: '01',
          title: '보스룸의 적막',
          stage: '기',
          pacing: '전진',
          episode: 8,
          wordCount: 1950,
          status: '본문 완료',
          synopsis: '최도현 레이드팀이 도망치며 남겨둔 S급 보스 몬스터의 약점을 태산이 찌른다.',
          characters: ['강태산'],
          content: '바닥에 나뒹구는 고급 포션 병들과 버려진 마도 장비들. 저들은 살기 위해 도망쳤지만, 나는 살아남기 위해 이곳에 남았다. [성좌의 권능 「침묵의 심연」이 개방됩니다.]'
        },
        {
          id: 'ch03-s02',
          sceneNumber: '02',
          title: '게이트 붕괴',
          stage: '승',
          pacing: '전환',
          episode: 9,
          wordCount: 1930,
          isEndingHook: true,
          hookType: '★ 반전 훅',
          status: '집필 중',
          synopsis: '게이트 차원문이 닫히기 직전 침묵의 힘으로 균열을 강제로 붙잡고 탈출한다.',
          characters: ['강태산', '최도현'],
          content: '붉은 경고음과 함께 차원의 벽이 갈라져 내렸다. 지상 통제실의 계기판이 미친 듯이 솟구쳤다. "아직 안에 생존자가… 아니, 신호가 F급이 아닙니다!"'
        }
      ],
      foreshadowingResolved: [
        { id: 'fr-h1', source: 'ch01', text: '부서진 제단의 룬 문자', resolvedAt: 'ch03 보스룸 붕괴 씬', status: '회수됨' }
      ],
      foreshadowingPlanted: [
        { id: 'fp-h3', source: 'ch03', text: '사라진 F급 헌터 생체 실험 USB', target: 'ch19 재판정', status: '심을 예정' }
      ]
    },
    ch04: {
      id: 'ch04',
      number: 4,
      title: '랭커들의 경악',
      arcId: 'arc01',
      arcTitle: '버려진 짐꾼과 태고의 신탁',
      act: '1막 (기)',
      status: '대기',
      episodes: '11~14화 (잠정)',
      confirmedEpisodes: [],
      plannedScenesCount: 8,
      completedScenesCount: 0,
      totalWords: 0,
      steps: { step6: '진행 중', step8: '대기', step9: '대기', step10: '대기' },
      tasks: [
        { id: 't-h08', text: '최도현과의 병원 독대 씬 설계', status: '미결' },
        { id: 't-h09', text: '17화 신탁 선언 사이다 클리프행어', status: '미결' }
      ],
      scenes: [],
      foreshadowingResolved: [],
      foreshadowingPlanted: []
    }
  },
  foreshadowing: [
    { id: 'f-h1', location: 'ch01 s01', title: '심연의 석판에 새겨진 피의 룬', description: '첫 번째 퀘스트 보상으로 지급된 고대 룬문자', payoff: 'ch04 각성 씬에서 발동', status: '회수됨', arc: 'arc01' },
    { id: 'f-h2', location: 'ch02 s03', title: '최도현의 시계 뒷면 일련번호', description: '불법 게이트 코어와 연결된 제어 장치', payoff: 'ch12 경매장 폭로', status: '심음', arc: 'arc01' },
    { id: 'f-h3', location: 'ch03 s02', title: '사라진 F급 헌터 명단', description: '생체 실험 피해자들의 암호화된 USB', payoff: 'ch19 재판정 제출', status: '심을 예정', arc: 'arc02' },
  ],
  unresolvedIssues: [
    { id: 'i-h1', title: '성좌 계약의 페널티 수치 계산', description: '권능 사용 시 체력 소모 공식 확정 필요', status: '미결', category: '설정' },
    { id: 'i-h2', title: '블랙드래곤 길드 산하 연구소 위치', description: '서울 외곽 폐공장 vs 지하 연구동 고증', status: '미결', category: '타임라인' },
  ],
  diaries: [],
};

// 3. Preset Template: 로맨스 판타지 / 악녀 빙의물
export const PROJECT_VILLAINESS_ESCAPE: WebNovelProject = {
  id: 'villainess-escape',
  title: '시한부 악녀는 황태자의 청혼을 거절합니다',
  subtitle: '단두대 대신 황실 채권을 매입한 공녀의 생존기',
  penName: '달리아',
  genre: '로맨스 판타지 50% · 악녀 생존 30% · 경제 암투 20%',
  background: '가상의 19세기풍 에르하르트 제국 수도 및 공작령',
  scale: '100화 완결 · 4막 6아크 24챕터 · 화당 5,800~7,200자',
  pov: '1인칭 주인공 시점 (로젤리아 공녀)',
  target: '카카오페이지/시리즈 로판 독자, 걸크러시 및 사이다 복수극 선호층',
  serialization: '카카오페이지 오리지널 선독점',
  templateType: 'romfantasy',
  createdAt: '2026-10-22',
  updatedAt: '2026-10-29',
  currentProgress: {
    currentChapter: 'ch02',
    currentChapterTitle: '파혼장과 국채 매입',
    nextStep: '8단계 씬 01 「황실 연회」',
    episodesOrganized: 6,
    episodesTarget: 35,
    totalWordCount: 38200,
    completedChapters: 1,
    totalChapters: 24,
    currentChapterScenesDone: 1,
    currentChapterScenesTotal: 8,
    chapterForeshadowingResolved: 0,
    chapterForeshadowingTotal: 2,
    openIssues: 14,
    resolvedIssues: 8,
    commitDate: '2026-10-27',
    commitHash: 'e3f4a12',
  },
  coreConcept: {
    logline: '원작 소설의 단두대 처형을 3개월 앞둔 악녀 로젤리아로 빙의한 주인공이, 매달리던 황태자에게 먼저 위자료 청구서와 파혼장을 던지고, 제국 최대의 국채와 마탑 지분을 매입해 황실의 숨통을 쥐어짜며 살아남는다.',
    theme: '사랑을 구걸하는 대신 경제적 자유와 권력을 쟁취하는 여성 서사',
    emotionalGoal: '당당한 파혼 사이다 + 황실 귀족들의 굴종 + 주도적인 연애 역학',
    differentiators: [
      '황태자의 후회물 요소를 완벽히 차단하고 경제적 예속으로 응징',
      '마탑 연계 마도 상단 설립 및 신문사 인수를 통한 여론 통제',
      '시한부 독주 음모를 해독제로 역이용하는 의학 치트'
    ],
    devices: [
      '황실 국채 증서: 황태자가 전쟁 자금을 위해 비밀리에 발행한 차용증',
      '은빛 마도 회중시계: 과거의 기억을 홀로그램으로 재생하는 마도구',
      '비소 해독제 처방전: 원작 여주인공이 몰래 투여하던 독약의 결정적 증거'
    ],
    climaxEnding: '95화 황실 파산 선고 공판에서 황태자의 왕위 계승권을 박탈하고 제국 초대 민간 은행 총재로 취임.'
  },
  characters: [
    {
      id: 'char-v1',
      name: '로젤리아 폰 에르하르트',
      alias: '악녀 공녀 → 제국 제일의 거상',
      role: '주인공 / 빙의자',
      description: '빙의 전 회계사이자 투자 전문가. 빙의 직후 황태자의 가스라이팅을 단칼에 끊고 가문의 막대한 부를 바탕으로 금융 제국을 설립함.',
      habits: '계산할 때 부채로 턱을 가볍게 톡톡 치는 습관.',
      secret: '원작 여주인공 역시 다른 세계에서 건너온 악의적 전생자임을 간파함.',
      arcTrajectory: '아크 1 파혼 선언 → 아크 2 상단 설립 → 아크 4 황실 부채 압류 → 아크 6 제국 실권 장악'
    },
    {
      id: 'char-v2',
      name: '카이엔 황태자',
      alias: '원작 남주 / 후회남 (안타고니스트)',
      role: '오만한 제국 후계자',
      description: '로젤리아의 헌신을 당연시하며 원작 여주에게 한눈을 팔았으나, 로젤리아가 파혼을 선언하고 황실 자금을 압류하자 뒤늦게 매달림.',
      habits: '분노하면 군검 자루를 쥐어뜯음.',
      secret: '황실 금고가 이미 탕진되어 로젤리아의 채권 없이는 군대를 움직일 수 없음.',
      arcTrajectory: '아크 1 오만 → 아크 3 당황과 후회 → 아크 5 무릎 꿇고 애원 → 아크 6 폐위'
    }
  ],
  arcs: [
    { id: 'arc01', title: '단두대 대신 파혼장', chapters: 'ch01~04', act: '1막 (기)', episodes: '01~17화', done: 6, total: 17, status: '진행 중' },
    { id: 'arc02', title: '마도 상단과 국채 매입', chapters: 'ch05~08', act: '2막 전반 (승)', episodes: '18~33화', done: 0, total: 16, status: '대기' },
    { id: 'arc03', title: '마탑 지분 쟁탈전', chapters: 'ch09~12', act: '2막 전반 (승)', episodes: '34~50화', done: 0, total: 17, status: '대기' },
    { id: 'arc04', title: '황실 독점 조세권 압류', chapters: 'ch13~16', act: '2막 후반 (전)', episodes: '51~67화', done: 0, total: 17, status: '대기' },
    { id: 'arc05', title: '황태자의 참회와 폐위', chapters: 'ch17~20', act: '2막 후반 (전)', episodes: '68~83화', done: 0, total: 16, status: '대기' },
    { id: 'arc06', title: '제국 은행 총재 로젤리아', chapters: 'ch21~24', act: '3막 (결)', episodes: '84~100화', done: 0, total: 17, status: '대기' },
  ],
  episodes: [
    { episode: 1, title: '사형선고 90일 전', words: 6300, chapter: 'ch01', hook: '빙의 직후 거울 속에 비친 악녀의 목에 둘러진 단두대 흉터' },
    { episode: 2, title: '파혼을 청합니다', words: 6950, chapter: 'ch01', hook: '황태자의 집무실에 날아든 3억 골드 위자료 청구서' },
    { episode: 3, title: '채권의 주인', words: 7100, chapter: 'ch01', hook: '황실 근위대의 월급이 공작가의 금고에서 지급되고 있음을 증명' },
    { episode: 4, title: '연회장의 파문', words: 6800, chapter: 'ch02', hook: '새로운 여주인공의 드레스를 밟고 지나가며 던진 독약 성분표' },
    { episode: 5, title: '마탑주의 맹세', words: 7400, chapter: 'ch02', hook: '제국 최강의 대마법사가 로젤리아의 개인 자산 관리인으로 계약' },
    { episode: 6, title: '황태자의 오열', words: 6650, chapter: 'ch02', hook: '뒤늦게 매달리는 황태자를 향해 "더 이상 당신의 황후가 되지 않겠습니다"' },
  ],
  chapters: {
    ch01: {
      id: 'ch01',
      number: 1,
      title: '단두대 처형 90일 전',
      arcId: 'arc01',
      arcTitle: '단두대 대신 파혼장',
      act: '1막 (기)',
      status: '검토 완료',
      episodes: '01~03화',
      confirmedEpisodes: [1, 2, 3],
      plannedScenesCount: 7,
      completedScenesCount: 7,
      totalWords: 20350,
      steps: { step6: '완료', step8: '완료', step9: '완료', step10: '완료' },
      tasks: [
        { id: 't-v01', text: '회계사 주인공의 빙의 직후 장부 감사 묘사', status: '해결' },
        { id: 't-v02', text: '황태자 차용증 비밀 금고 발견', status: '해결' },
      ],
      scenes: [
        {
          id: 'ch01-s01',
          sceneNumber: '01',
          title: '악녀의 각성',
          stage: '기',
          pacing: '전진',
          episode: 1,
          wordCount: 1650,
          status: '본문 완료',
          synopsis: '원작 소설의 단두대 처형을 앞둔 악녀 로젤리아로 눈을 뜬 순간.',
          characters: ['로젤리아'],
          content: '눈을 떴을 때, 머리맡에 놓인 달력의 붉은 동그라미가 시야를 가득 채웠다. D-90. 제국 최고재판소의 단두대 처형일이었다.'
        }
      ],
      foreshadowingResolved: [],
      foreshadowingPlanted: [
        { id: 'fp-v1', source: 'ch01', text: '황태자 친필 비밀 차용증', target: 'ch06 재판정', status: '심음' }
      ]
    },
    ch02: {
      id: 'ch02',
      number: 2,
      title: '파혼장과 국채 매입',
      arcId: 'arc01',
      arcTitle: '단두대 대신 파혼장',
      act: '1막 (기)',
      status: '진행 중',
      episodes: '04~06화 (집필 중)',
      confirmedEpisodes: [4],
      plannedScenesCount: 8,
      completedScenesCount: 1,
      totalWords: 2450,
      steps: { step6: '완료', step8: '진행 중', step9: '대기', step10: '대기' },
      tasks: [
        { id: 't-v03', text: '황실 무도회 파혼 선언 씬 연출', status: '미결' },
        { id: 't-v04', text: '마탑주와의 비공개 채권 담보 계약', status: '미결' },
      ],
      scenes: [
        {
          id: 'ch02-s01',
          sceneNumber: '01',
          title: '황실 연회',
          stage: '기',
          pacing: '전진',
          episode: 4,
          wordCount: 1820,
          status: '본문 완료',
          synopsis: '황태자가 여주인공을 에스코트하며 입장할 때 로젤리아가 파혼장을 펼친다.',
          characters: ['로젤리아', '카이엔 황태자'],
          content: '"전하, 황실 근위대 군복에 들어간 금실 값은 갚고 그 계집을 감싸시는 겁니까?" 로젤리아의 차가운 목소리가 연회홀의 현악 합주를 얼어붙게 만들었다.'
        }
      ],
      foreshadowingResolved: [],
      foreshadowingPlanted: [
        { id: 'fp-v2', source: 'ch02', text: '비소 해독제 처방전 원본', target: 'ch14 마탑 공판', status: '심음' }
      ]
    },
    ch03: {
      id: 'ch03',
      number: 3,
      title: '마탑주의 은밀한 거래',
      arcId: 'arc01',
      arcTitle: '단두대 대신 파혼장',
      act: '1막 (기)',
      status: '대기',
      episodes: '07~09화 (잠정)',
      confirmedEpisodes: [],
      plannedScenesCount: 8,
      completedScenesCount: 0,
      totalWords: 0,
      steps: { step6: '완료', step8: '대기', step9: '대기', step10: '대기' },
      tasks: [
        { id: 't-v05', text: '마탑주 캐릭터 대사 톤앤매너 확립', status: '미결' }
      ],
      scenes: [],
      foreshadowingResolved: [],
      foreshadowingPlanted: []
    },
    ch04: {
      id: 'ch04',
      number: 4,
      title: '황실 채권 30억 플로린',
      arcId: 'arc01',
      arcTitle: '단두대 대신 파혼장',
      act: '1막 (기)',
      status: '대기',
      episodes: '10~13화 (잠정)',
      confirmedEpisodes: [],
      plannedScenesCount: 8,
      completedScenesCount: 0,
      totalWords: 0,
      steps: { step6: '대기', step8: '대기', step9: '대기', step10: '대기' },
      tasks: [],
      scenes: [],
      foreshadowingResolved: [],
      foreshadowingPlanted: []
    }
  },
  foreshadowing: [
    { id: 'f-v1', location: 'ch01 s01', title: '황태자 친필 차용증 10만 골드', description: '황실 근위대 무기 구입용 비밀 부채', payoff: 'ch06 재산 분할 심판', status: '심음', arc: 'arc01' },
    { id: 'f-v2', location: 'ch02 s01', title: '원작 여주의 비소 독약 장부', description: '황실 의무관실에서 빼돌린 밀수 독약 내역', payoff: 'ch14 독살 미수 폭로', status: '심을 예정', arc: 'arc01' },
  ],
  unresolvedIssues: [
    { id: 'i-v1', title: '에르하르트 공작가의 상속법 체계', description: '여성 단독 계승 가능 여부 고증 확정', status: '미결', category: '설정' },
    { id: 'i-v2', title: '황실 채권 이자율 및 압류 절차', description: '제국 최고법원 강제 집행 요건', status: '미결', category: '구조' },
  ],
  diaries: [],
};

export const INITIAL_PROJECTS: WebNovelProject[] = [
  PROJECT_BJ_SISTER,
  PROJECT_HUNTER_SOVEREIGN,
  PROJECT_VILLAINESS_ESCAPE,
];

export const STORAGE_PROJECTS_KEY = 'webnovel_studio_projects_v2';
export const STORAGE_ACTIVE_ID_KEY = 'webnovel_studio_active_project_id_v2';

export const ensureProjectIntegrity = (p: any): WebNovelProject => recomputeDerived(normalizeProject(p));

const normalizeProject = (p: any): WebNovelProject => {
  if (!p || typeof p !== 'object') {
    return PROJECT_BJ_SISTER;
  }

  const defaultProgress: ProjectProgress = {
    currentChapter: 'ch01',
    currentChapterTitle: '서막의 시작',
    nextStep: '1단계 기획서 작성 및 씬 01 착수',
    episodesOrganized: 0,
    episodesTarget: 100,
    totalWordCount: 0,
    completedChapters: 0,
    totalChapters: 24,
    currentChapterScenesDone: 0,
    currentChapterScenesTotal: 10,
    chapterForeshadowingResolved: 0,
    chapterForeshadowingTotal: 2,
    openIssues: 0,
    resolvedIssues: 0,
    commitDate: '2026-10-30',
    commitHash: 'init01',
  };

  const defaultCoreConcept: ProjectCoreConcept = {
    logline: p.subtitle || `${p.title || '작품'}의 핵심 로그라인`,
    theme: '운명 극복 및 역전의 쾌감',
    emotionalGoal: '독자에게 선사할 사이다 카타르시스',
    differentiators: ['주인공의 독보적 역량과 치트', '치밀한 복선 설계', '매 챕터 엔딩 클리프행어'],
    devices: ['상징물', '관계도', '핵심 증거물'],
    climaxEnding: '최종 결전에서 모든 복선이 폭발하며 승리를 거둔다.',
  };

  return {
    id: p.id || `project-${Date.now().toString(36)}`,
    title: p.title || '새로운 웹소설 프로젝트',
    subtitle: p.subtitle || '4막 6아크 공학적 플롯',
    penName: p.penName || '작가',
    genre: p.genre || '웹소설 100화 완결 플롯',
    background: p.background || '작품 설정 배경',
    scale: p.scale || '100화 완결 · 4막 6아크 24챕터',
    pov: p.pov || "1인칭 주인공 시점 ('나')",
    target: p.target || '스마트폰 웹소설 독자층',
    serialization: p.serialization || '주 7회 성실 연재 기준',
    templateType: p.templateType || 'custom',
    createdAt: p.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: p.updatedAt || new Date().toISOString().split('T')[0],
    currentProgress: {
      ...defaultProgress,
      ...(p.currentProgress || {}),
      episodesOrganized: Number(p.currentProgress?.episodesOrganized ?? 0),
      episodesTarget: Number(p.currentProgress?.episodesTarget ?? 100),
      totalWordCount: Number(p.currentProgress?.totalWordCount ?? 0),
      completedChapters: Number(p.currentProgress?.completedChapters ?? 0),
      totalChapters: Number(p.currentProgress?.totalChapters ?? 24),
      openIssues: Number(p.currentProgress?.openIssues ?? 0),
      chapterForeshadowingResolved: Number(p.currentProgress?.chapterForeshadowingResolved ?? 0),
      chapterForeshadowingTotal: Number(p.currentProgress?.chapterForeshadowingTotal ?? 1),
    },
    coreConcept: {
      ...defaultCoreConcept,
      ...(p.coreConcept || {}),
      differentiators: Array.isArray(p.coreConcept?.differentiators) ? p.coreConcept.differentiators : defaultCoreConcept.differentiators,
      devices: Array.isArray(p.coreConcept?.devices) ? p.coreConcept.devices : defaultCoreConcept.devices,
    },
    characters: Array.isArray(p.characters) ? p.characters : [],
    arcs: Array.isArray(p.arcs) && p.arcs.length > 0 ? p.arcs : ARCS_DATA,
    episodes: Array.isArray(p.episodes) ? p.episodes : [],
    chapters: p.chapters && typeof p.chapters === 'object' ? p.chapters : ALL_CHAPTERS_DATA,
    foreshadowing: Array.isArray(p.foreshadowing) ? p.foreshadowing : [],
    unresolvedIssues: Array.isArray(p.unresolvedIssues) ? p.unresolvedIssues : [],
    diaries: Array.isArray(p.diaries) ? p.diaries : [],
    decisions: Array.isArray(p.decisions) ? p.decisions : [],
    research: Array.isArray(p.research) ? p.research : [],
    reviewNotes: Array.isArray(p.reviewNotes) ? p.reviewNotes : [],
    episodeHooks: p.episodeHooks && typeof p.episodeHooks === 'object' && !Array.isArray(p.episodeHooks) ? p.episodeHooks : {},
    knowledge: Array.isArray(p.knowledge) ? p.knowledge : [],
  };
};

export interface LoadReport {
  /** 손상된 저장 데이터를 격리했다면 격리 키 */
  quarantinedKey?: string;
  /** 손상 사유 */
  reason?: string;
  /** 격리 자체에 실패한 경우. 이때는 원본이 그대로 남아 있다. */
  quarantineFailed?: boolean;
}

export const loadProjectsWithReport = (
  store: KeyValueStore = browserStore
): { projects: WebNovelProject[]; report: LoadReport } => {
  const fresh = () => INITIAL_PROJECTS.map(ensureProjectIntegrity);
  let raw: string | null = null;
  try {
    raw = store.getItem(STORAGE_PROJECTS_KEY);
  } catch (err: any) {
    return { projects: fresh(), report: { reason: `저장소를 읽지 못했습니다: ${err?.message || err}` } };
  }

  if (!raw) {
    const initial = fresh();
    saveAllProjects(initial, store);
    return { projects: initial, report: {} };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('프로젝트 목록 형식이 배열이 아닙니다.');
    if (parsed.length === 0) return { projects: fresh(), report: {} };
    if (parsed.some((p) => !p || typeof p !== 'object' || typeof p.id !== 'string')) {
      throw new Error('id 가 없는 프로젝트 항목이 있습니다.');
    }
    return { projects: parsed.map(ensureProjectIntegrity), report: {} };
  } catch (err: any) {
    const reason = err?.message || String(err);
    console.error('Error loading projects:', err);
    const quarantinedKey = quarantineRaw(store, STORAGE_PROJECTS_KEY, raw, reason);
    return {
      projects: fresh(),
      report: quarantinedKey ? { quarantinedKey, reason } : { reason, quarantineFailed: true },
    };
  }
};

export const loadAllProjects = (): WebNovelProject[] => loadProjectsWithReport().projects;

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export const saveAllProjects = (projects: WebNovelProject[], store: KeyValueStore = browserStore): SaveResult => {
  try {
    store.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    return { ok: true };
  } catch (err: any) {
    console.error('Error saving projects:', err);
    const quota = err?.name === 'QuotaExceededError';
    return {
      ok: false,
      error: quota ? '브라우저 저장 공간이 가득 찼습니다. 백업을 내보낸 뒤 공간을 확보해주세요.' : `저장에 실패했습니다: ${err?.message || err}`,
    };
  }
};

export const loadActiveProjectId = (store: KeyValueStore = browserStore): string => {
  try {
    return store.getItem(STORAGE_ACTIVE_ID_KEY) || 'bj-sister';
  } catch {
    return 'bj-sister';
  }
};

export const saveActiveProjectId = (id: string, store: KeyValueStore = browserStore): void => {
  try {
    store.setItem(STORAGE_ACTIVE_ID_KEY, id);
  } catch (err) {
    console.error('Error saving active project ID:', err);
  }
};
// Factory: Create a new project from blueprint template
export const createProjectFromTemplate = (
  templateType: 'chaebol' | 'hunter' | 'romfantasy' | 'wuxia' | 'custom',
  formData: {
    title: string;
    subtitle?: string;
    penName?: string;
    genre?: string;
    logline?: string;
    targetEpisodes?: number;
  }
): WebNovelProject => {
  const newId = `project-${Date.now().toString(36)}`;
  const title = formData.title.trim() || '새로운 웹소설 프로젝트';
  const subtitle = formData.subtitle?.trim() || '4막 6아크 공학적 플롯';
  const penName = formData.penName?.trim() || '작가';
  const episodesTarget = formData.targetEpisodes || 100;

  // Base setup
  const baseProject: WebNovelProject = {
    id: newId,
    title,
    subtitle,
    penName,
    genre: formData.genre || '웹소설 100화 완결 플롯',
    background: '작품 설정 배경',
    scale: `${episodesTarget}화 완결 · 4막 6아크 24챕터`,
    pov: "1인칭 주인공 시점 ('나')",
    target: '주요 독자층 (카카오페이지/문피아/시리즈)',
    serialization: '주 7회 성실 연재 기준',
    templateType,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    currentProgress: {
      currentChapter: 'ch01',
      currentChapterTitle: '서막의 시작',
      nextStep: '1단계 기획서 작성 및 씬 01 착수',
      episodesOrganized: 0,
      episodesTarget,
      totalWordCount: 0,
      completedChapters: 0,
      totalChapters: 24,
      currentChapterScenesDone: 0,
      currentChapterScenesTotal: 10,
      chapterForeshadowingResolved: 0,
      chapterForeshadowingTotal: 2,
      openIssues: 5,
      resolvedIssues: 0,
      commitDate: '방금 전 생성',
      commitHash: 'init01',
    },
    coreConcept: {
      logline: formData.logline || `${title}의 핵심 로그라인이 여기에 작성됩니다.`,
      theme: '운명과의 결투 및 승리',
      emotionalGoal: '매 화 독자를 사로잡는 사이다 통쾌함과 반전의 클리프행어',
      differentiators: [
        '주인공의 독보적 두뇌와 특별한 규칙 치트',
        '매 챕터 회수되는 치밀한 복선 설계',
        '독자 이탈을 방지하는 엔딩 훅의 정량화'
      ],
      devices: [
        '핵심 상징물 1 (계약서 / 비밀 일기 / 고대 석판)',
        '관계 역학 지도 (식탁 서열 / 길드 랭킹 / 황실 좌석표)',
        '결정적 증거물 (녹취록 / 마도 회중시계 / 독약 성분표)'
      ],
      climaxEnding: '95화 주총/결전 클라이맥스에서 빌런을 완벽히 단죄하고 목표를 달성한다.'
    },
    characters: [
      {
        id: `c-${newId}-1`,
        name: '주인공',
        alias: '가명 / 별칭',
        role: '주인공 / 서사의 주도자',
        description: '강력한 동기와 치밀한 전략으로 세계관의 부조리와 빌런을 응징하는 주인공.',
        habits: '긴장할 때 특유의 제스처가 있음.',
        secret: '아직 아무에게도 밝혀지지 않은 치명적 과거와 비밀 계약.',
        arcTrajectory: '아크 1 각성/잠입 → 아크 2~3 입지 구축 → 아크 4 위기 봉착 → 아크 6 최종 승리'
      },
      {
        id: `c-${newId}-2`,
        name: '라이벌 / 조력자',
        alias: '그림자 파트너',
        role: '조력자 겸 관찰자',
        description: '주인공의 정체를 가장 먼저 눈치채지만, 자신의 목적을 위해 은밀히 공조함.',
        habits: '차를 마실 때 잔을 가볍게 돌림.',
        secret: '가문/조직의 숨겨진 비자금 장부를 관리하고 있음.',
        arcTrajectory: '아크 1 탐색 → 아크 3 동맹 체결 → 아크 5 희생적 위기 지원 → 아크 6 공동 목표 달성'
      },
      {
        id: `c-${newId}-3`,
        name: '메인 빌런',
        alias: '권력의 정점',
        role: '메인 안타고니스트',
        description: '표면적으로는 인자하고 존경받는 리더이나 실상은 모든 비극의 배후 주동자.',
        habits: '상대를 제압할 때 서늘한 미소를 유지함.',
        secret: '범행 알리바이에 사용된 조작된 공문서 및 증거 인멸 기록.',
        arcTrajectory: '아크 1 군림 → 아크 3 균열 발생 → 아크 5 전면 반격 → 아크 6 생중계 파멸'
      }
    ],
    arcs: [
      { id: 'arc01', title: '서막과 위장 착수', chapters: 'ch01~04', act: '1막 (기)', episodes: '01~17화', done: 0, total: 17, status: '진행 중' },
      { id: 'arc02', title: '적대 세력과의 1차 충돌', chapters: 'ch05~08', act: '2막 전반 (승)', episodes: '18~33화', done: 0, total: 16, status: '대기' },
      { id: 'arc03', title: '조직 내 서열 장악', chapters: 'ch09~12', act: '2막 전반 (승)', episodes: '34~50화', done: 0, total: 17, status: '대기' },
      { id: 'arc04', title: '정체 발각의 최대 위기', chapters: 'ch13~16', act: '2막 후반 (전)', episodes: '51~67화', done: 0, total: 17, status: '대기' },
      { id: 'arc05', title: '연합 전선과 반격', chapters: 'ch17~20', act: '2막 후반 (전)', episodes: '68~83화', done: 0, total: 16, status: '대기' },
      { id: 'arc06', title: '최종 결전과 완결', chapters: 'ch21~24', act: '3막 (결)', episodes: '84~100화', done: 0, total: 17, status: '대기' },
    ],
    episodes: [],
    chapters: ALL_CHAPTERS_DATA,
    foreshadowing: [
      { id: `f-${newId}-1`, location: 'ch01 s01', title: '첫 번째 단서 물품의 발견', description: '사건의 진실을 가리키는 유품 또는 암호', payoff: 'ch04에서 1차 해독', status: '심을 예정', arc: 'arc01' },
      { id: `f-${newId}-2`, location: 'ch02 s03', title: '빌런의 비밀 회합 목격', description: '배후 조직과의 통화 내용 도청', payoff: 'ch12 폭로', status: '심을 예정', arc: 'arc01' },
    ],
    unresolvedIssues: [
      { id: `i-${newId}-1`, title: '초반 1~3화 연재 무료 결제 유도선 설정', description: '3화 엔딩 훅의 임팩트 극대화', status: '미결', category: '구조' },
      { id: `i-${newId}-2`, title: '주요 배경 디테일 고증', description: '공간 배치와 시대적 소품 확정', status: '미결', category: '설정' },
    ],
    diaries: [],
  };

  return baseProject;
};
