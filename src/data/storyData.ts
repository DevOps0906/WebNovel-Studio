// Master restored database for the WebNovel-Studio and "bj-sister" Project

export interface SceneItem {
  id: string;
  sceneNumber: string;
  title: string;
  stage: '기' | '승' | '전' | '결';
  pacing: '전진' | '후퇴' | '전환';
  episode: number;
  wordCount: number;
  isEndingHook?: boolean;
  hookType?: string;
  status: '본문 완료' | '집필 중' | '대기';
  synopsis: string;
  content: string;
  characters: string[];
}

export interface ChapterData {
  id: string;
  number: number;
  title: string;
  arcId: string;
  arcTitle: string;
  act: string;
  status: '검토 완료' | '진행 중' | '대기';
  episodes: string;
  confirmedEpisodes: number[];
  plannedScenesCount: number;
  completedScenesCount: number;
  totalWords: number;
  steps: {
    step6: '완료' | '진행 중' | '대기';
    step8: '완료' | '진행 중' | '대기';
    step9: '완료' | '진행 중' | '대기';
    step10: '완료' | '진행 중' | '대기';
  };
  tasks: {
    id: string;
    text: string;
    status: '미결' | '해결';
  }[];
  scenes: SceneItem[];
  foreshadowingResolved: {
    id: string;
    source: string;
    text: string;
    resolvedAt: string;
    status: '회수됨';
  }[];
  foreshadowingPlanted: {
    id: string;
    source: string;
    text: string;
    target: string;
    status: '심음' | '심을 예정';
  }[];
}

export interface ForeshadowingItem {
  id: string;
  location: string;
  title: string;
  description: string;
  payoff: string;
  status: '심을 예정' | '심음' | '회수됨';
  arc: string;
}

export interface IssueItem {
  id: string;
  title: string;
  description: string;
  status: '미결' | '해결';
  category: '고증' | '구조' | '인물' | '타임라인' | '설정';
}

export interface DiaryItem {
  id: string;
  chapter: string;
  number: number;
  title: string;
  date: string;
  unlocked: boolean;
  unlockedAt?: string;
  previewText: string;
  fullText?: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  alias: string;
  role: string;
  description: string;
  habits: string;
  secret: string;
  arcTrajectory: string;
}

export const STORY_SPECS = {
  title: "가짜 막내손녀는 재벌가를 집어삼킨다",
  subtitle: "죽은 동생의 이름으로",
  penName: "구름발치",
  genre: "재벌 복수극 50% · 미스터리 30% · 가족 드라마 20% (노맨스 원톱)",
  background: "2023년 봄 서울 (가상의 상위 1% 재벌 '진성그룹' 본가 및 계열사)",
  scale: "노블 100화 · 4막 (1:2:2:1) · 6아크 · 24챕터 · 화당 6,000~8,000자",
  pov: "1인칭 '나' (강이현). 내레이션은 주인공의 본명을 절대 쓰지 않는다",
  target: "1차 현대물·재벌물 결제 독자 (20~40대, 성별 무관) / 2차 로맨스 피로층 여성향 독자, 위장·추리 스릴러 독자",
  serialization: "문피아 단독 (잠정) · 주 7일 · 무료 30화 → 31화부터 유료 · 비축 40화 후 오픈",
  currentProgress: {
    currentChapter: "ch04",
    currentChapterTitle: "식탁의 서열",
    nextStep: "8단계 씬 01 「가족의 시선」",
    episodesOrganized: 12,
    episodesTarget: 40,
    totalWordCount: 78710,
    completedChapters: 3,
    totalChapters: 24,
    currentChapterScenesDone: 0,
    currentChapterScenesTotal: 11,
    chapterForeshadowingResolved: 0,
    chapterForeshadowingTotal: 1,
    openIssues: 27,
    resolvedIssues: 34,
    commitDate: "2026-10-15 저녁",
    commitHash: "edd5a14"
  },
  coreConcept: {
    logline: "인기 BJ였던 동생의 석연찮은 죽음 뒤에 재벌가가 있음을 안 언니가, 동생이 생전 남긴 6편의 암호 일기를 단서로 가짜 잃어버린 막내손녀가 되어 재벌가에 입성, 가족들의 위선과 죄악을 내부에서부터 파멸시키고 자기 이름을 되찾는다.",
    theme: "가면과 진짜 얼굴 — 남을 홀리려고 쓴 가면 뒤에서 나는 누구인가 / 보조: 대신 사는 삶과 애도",
    emotionalGoal: "매 화의 사이다 통쾌함 + 배후 추적의 서스펜스 + 동생을 향한 먹먹한 여운",
    differentiators: [
      "역신데렐라 잠입극: 구원받는 신데렐라가 아니라 가문을 장악하고 징벌하는 지배자",
      "현실형 두뇌 치트: 초능력이나 환생 대신 지독한 관찰력, 회계 장부 해킹, 심리 유도",
      "부재의 공동 주인공: 죽은 동생 강유진이 6편의 일기를 통해 각 아크마다 단서 전달",
      "로맨스 없는 여성 원톱: 애정 전선에 휘둘리지 않는 완벽한 복수극"
    ],
    devices: [
      "식탁 좌석 지도: 본가 대식당 좌석 배치가 곧 진성그룹의 후계 서열과 역학",
      "동생의 일기 6편: 아크가 전환될 때마다 한 편씩 봉인 해금되는 나침반",
      "길들이기 루프의 반전: 회장의 조련에 순응하는 척하며 역으로 회장을 통제",
      "처방약 봉투: 차남의 젠틀한 미소 뒤에 숨겨진 신경안정제 및 범행 알리바이"
    ],
    climaxEnding: "95화 주주총회 공식석상에서 스스로 '저는 서이현이 아닙니다'라고 가면을 벗고, 차남 서동훈을 법의 이름으로 단죄한 뒤 원래의 자기 이름(강이현)으로 돌아온다."
  }
};

export const CHARACTERS_DATA: CharacterItem[] = [
  {
    id: "char-1",
    name: "강이현",
    alias: "가명: 서이현 (가짜 막내손녀)",
    role: "주인공 / 위장 잠입의 설계자",
    description: "죽은 동생의 복수를 위해 10년 전 실종된 진성그룹의 막내손녀 '서이현'으로 신분을 세탁하고 본가에 잠입한 인물. 뛰어난 정보 분석력과 위기 대처 능력을 지녔으며 감정을 철저히 배제하고 숫자로 계산한다.",
    habits: "긴장할 때 손목 안쪽의 흉터를 시계 알로 가리는 버릇이 있음. 내레이션에서 본명을 엄격히 숨김.",
    secret: "진짜 서이현의 행방을 알고 있으며, 동생이 죽기 전날 자신에게 남긴 마지막 음성 메시지를 보관 중.",
    arcTrajectory: "아크 1 잠입 성공 → 아크 2~3 가문 내 서열 장악 → 아크 4 정체 발각 위기 극복 → 아크 6 본명 회복 및 퇴장"
  },
  {
    id: "char-2",
    name: "강유진",
    alias: "BJ 유나 (사망)",
    role: "부재하는 공동 주인공",
    description: "주인공의 친동생이자 수십만 구독자를 지녔던 라이브 스트리머. 진성그룹 차남의 은밀한 사생활과 비자금 세탁 비리를 폭로하려다 의문의 추락사로 위장 살해당했다.",
    habits: "중요한 비밀이나 단서를 본인만의 은어와 날짜 암호로 일기장에 적어두는 습관.",
    secret: "진성그룹 차남 서동훈의 비자금 페이퍼컴퍼니 계좌와 연결된 암호화폐 하드월렛을 숨겨둠.",
    arcTrajectory: "생전 남긴 6편의 비밀 일기를 통해 주인공이 나아갈 수사 방향을 챕터마다 제시하는 정신적 나침반."
  },
  {
    id: "char-3",
    name: "서진태",
    alias: "진성그룹 창업주 겸 회장",
    role: "가문의 절대 지배자",
    description: "피도 눈물도 없는 기업가. 혈육이라 할지라도 쓸모와 가치가 증명되지 않으면 가차 없이 내친다. 돌아온 손녀(강이현)를 시험하며 후계 구도의 장기말로 활용하려 한다.",
    habits: "마음에 드는 대답을 들으면 조용히 숟가락을 내려놓고 3초간 상대를 응시함.",
    secret: "아크 4에서 이현이 친손녀가 아님을 눈치채지만, 무능하고 탐욕스러운 자식들을 쳐내기 위해 묵인함.",
    arcTrajectory: "아크 1 식탁 시험 인정(17화) → 아크 3 주인공에게 지분 위임 → 아크 6 95화에서 진실을 마주하고 쓸쓸히 퇴진"
  },
  {
    id: "char-4",
    name: "서동훈",
    alias: "차남 / 진성그룹 부회장",
    role: "최종 흑막 (메인 빌런)",
    description: "대외적으로 온화하고 젠틀하며 자선 사업에 앞장서는 재벌가 모범생. 하지만 실상은 소시오패스적 잔혹성을 지닌 채 동생 살해를 사주한 진범.",
    habits: "살의나 극도의 불안을 느낄 때 부드러운 미소를 지으며 상대의 잔을 채워주고, 오른손 검지로 귓바퀴를 두 번 톡톡 침.",
    secret: "동생 강유진을 제거하기 위해 동원했던 사채업자 조직 및 청부 브로커들과의 자금 흐름.",
    arcTrajectory: "초반 다정한 삼촌 행세 → 중반 주인공의 신분을 추적하며 덫 놓기 → 아크 6 법정에서 완전 몰락"
  },
  {
    id: "char-5",
    name: "민도혁",
    alias: "법무법인 진명 파트너 변호사",
    role: "전략적 조력자",
    description: "진성그룹의 법률 자문을 도맡아 온 엘리트 변호사. 냉철하고 원칙주의자이나, 주인공이 가짜임을 단번에 알아채고도 그녀의 비범한 지능과 배포에 흥미를 느끼며 파트너십을 맺는다.",
    habits: "서류를 볼 때 만년필 뚜껑을 돌리며 침묵하는 버릇.",
    secret: "자신의 아버지가 과거 서 회장의 계략으로 옥살이를 하고 희생양이었던 비밀을 품고 있음.",
    arcTrajectory: "아크 1 의심과 탐색 → 아크 2 위장 서류 위조 지원 → 아크 4 공범 선언 → 아크 6 법적 심판의 설계자"
  },
  {
    id: "char-6",
    name: "서명희",
    alias: "장녀 / 고모",
    role: "레드헤링 (위장된 적대자 → 반전 아군)",
    description: "히스테릭하고 신경질적인 성격으로, 이현이 나타나자마자 가짜라며 머리채를 잡으려 들었던 인물. 그러나 실상은 차남 서동훈에게 경영권에서 밀려나 핍박받고 있었음.",
    habits: "손톱을 딱딱 소리 내어 튕기며 날카롭게 쏘아붙임.",
    secret: "차남 서동훈이 자신의 남편을 음해하여 축출했던 증거 녹취록을 쥐고 있음.",
    arcTrajectory: "아크 1~3 주인공을 괴롭히는 시어머니 같은 악역 → 아크 5 차남을 치기 위해 주인공과 극비 연대"
  }
];

export const EPISODES_DATA = [
  { episode: 1, title: "동생의 장례식", words: 5888, chapter: "ch01", hook: "전환형 (유품 발견)" },
  { episode: 2, title: "일기장의 암호", words: 8305, chapter: "ch01", hook: "반전형 (일기 첫 장 해독)" },
  { episode: 3, title: "사채업자의 방문", words: 5900, chapter: "ch01", hook: "위기형 (차용증 서명)" },
  { episode: 4, title: "가짜 서이현의 탄생", words: 7080, chapter: "ch01", hook: "결의형 (위장 착수)" },
  { episode: 5, title: "유전자 검사의 틈", words: 5760, chapter: "ch02", hook: "서스펜스 (시차 트릭)" },
  { episode: 6, title: "로펌 진명의 문", words: 7420, chapter: "ch02", hook: "대면형 (민도혁의 눈빛)" },
  { episode: 7, title: "삼남의 음주운전", words: 6180, chapter: "ch02", hook: "사이다 (삼남 협박 통제)" },
  { episode: 8, title: "잃어버린 열쇠", words: 5463, chapter: "ch02", hook: "의문형 (사라진 보관함)" },
  { episode: 9, title: "약국 봉투의 진실", words: 6440, chapter: "ch02", hook: "단서형 (차남의 알리바이 균열)" },
  { episode: 10, title: "서류의 진실", words: 6403, chapter: "ch03", hook: "반전형 (인식 뒤집힘)" },
  { episode: 11, title: "차남의 손길", words: 7041, chapter: "ch03", hook: "반전형 (이름 호명)" },
  { episode: 12, title: "식탁의 서열", words: 7210, chapter: "ch03", hook: "위기형 (1막 클리프행어 - 회장의 질문)" }
];

export interface ArcItem {
  id: string;
  title: string;
  chapters: string;
  done: number;
  total: number;
  act: string;
  reviewStatus?: string;
  status?: string;
  episodes?: string;
}

export const ARCS_DATA: ArcItem[] = [
  { id: "arc01", title: "동생의 이름으로", chapters: "ch01~04", done: 3, total: 4, act: "1막 (arc01)", reviewStatus: "진행 중", status: "진행 중", episodes: "01~17화" },
  { id: "arc02", title: "재벌가 시험대", chapters: "ch05~08", done: 0, total: 4, act: "2막 (arc02~03)", reviewStatus: "대기", status: "대기", episodes: "18~33화" },
  { id: "arc03", title: "지분 사냥", chapters: "ch09~12", done: 0, total: 4, act: "막 검토 함께", reviewStatus: "대기", status: "대기", episodes: "34~50화" },
  { id: "arc04", title: "위장 발각 위기", chapters: "ch13~16", done: 0, total: 4, act: "3막 (arc04~05)", reviewStatus: "대기", status: "대기", episodes: "51~67화" },
  { id: "arc05", title: "침묵의 공범", chapters: "ch17~20", done: 0, total: 4, act: "막 검토 함께", reviewStatus: "대기", status: "대기", episodes: "68~83화" },
  { id: "arc06", title: "본래의 이름", chapters: "ch21~24", done: 0, total: 4, act: "4막 (arc06)", reviewStatus: "대기", status: "대기", episodes: "84~100화" }
];

export type EpisodeStat = typeof EPISODES_DATA[number];
export type EpisodeItem = typeof EPISODES_DATA[number];


export const DESIGN_STAGES = [
  { step: "01", name: "발상 및 컨셉화", date: "10-05 완료", status: "완료" },
  { step: "02", name: "기본 계획 수립", date: "10-05 완료", status: "완료" },
  { step: "03", name: "세계관 구축", date: "10-07 완료", status: "완료" },
  { step: "04", name: "캐릭터 개발", date: "10-07 완료", status: "완료" },
  { step: "05", name: "스토리 구조화", date: "10-07 초안 → 10-09 확정", status: "완료" },
  { step: "07", name: "문체 가이드", date: "10-08 확립", status: "완료" }
];

export const CHAPTER_03_DATA: ChapterData = {
  id: "ch03",
  number: 3,
  title: "가짜의 증명",
  arcId: "arc01",
  arcTitle: "동생의 이름으로",
  act: "1막 (1~17화)",
  status: "검토 완료",
  episodes: "10~12화",
  confirmedEpisodes: [10, 11, 12],
  plannedScenesCount: 14,
  completedScenesCount: 14,
  totalWords: 20654,
  steps: {
    step6: "완료",
    step8: "완료",
    step9: "완료",
    step10: "완료"
  },
  tasks: [
    { id: "t-1", text: "5화 암묵 전제: 유전자 검사 결과 수령 시차 (두 시간 이내 전달 완료)", status: "미결" },
    { id: "t-2", text: "민도혁이 주인공을 아는 경로 → 씬 10에서 대화로 확인", status: "해결" },
    { id: "t-3", text: "차남의 약국 봉투 → ch03 씬 4·7에서 전달받음", status: "해결" },
    { id: "t-4", text: "씬 7 카톡 문구와 컷의 반응 수위 확정", status: "해결" }
  ],
  scenes: [
    {
      id: "ch03-s01",
      sceneNumber: "01",
      title: "로펌 앞 대기",
      stage: "기",
      pacing: "전환",
      episode: 10,
      wordCount: 1152,
      status: "본문 완료",
      synopsis: "서초동 로펌 진명 로비에서 민도혁 변호사를 기다리며 주변 동태 파악.",
      characters: ["강이현"],
      content: `유리 회전문이 회전할 때마다 축축한 봄비 냄새가 로비 대리석 바닥으로 스며들었다.
시계는 오전 8시 40분. 서초동 로펌 진명의 출근 인파 속에서 나는 신문 가판대 옆 기둥 뒤에 멈춰 섰다.
코트 주머니 안에는 봉인된 유전자 감정 결과 통보서가 들어 있었다. 손끝에 닿는 봉투의 두께는 고작 2밀리미터. 하지만 이 종이 두 장이 진성그룹의 견고한 성벽을 부술 첫 번째 망치였다.`
    },
    {
      id: "ch03-s02",
      sceneNumber: "02",
      title: "유전자 서류",
      stage: "기",
      pacing: "후퇴",
      episode: 10,
      wordCount: 901,
      status: "본문 완료",
      synopsis: "봉인된 유전자 결과서의 도장과 위조 여부 최종 점검.",
      characters: ["강이현"],
      content: `화장실 세 번째 칸으로 들어가 문을 잠갔다. 
형광등 불빛에 비춰본 국립과학수사연구원 규격의 홀로그램 스티커는 정교했다.
친생자 일치 확률 99.998%. 
누구의 유전자냐고 묻는다면 대답은 간단했다. 진짜 서이현이 실종되기 직전, 소아청소년과 진료 기록에서 추출해낸 냉동 보관 검체. 민도혁이 이 서류를 확인하는 순간 게임은 시작된다.`
    },
    {
      id: "ch03-s03",
      sceneNumber: "03",
      title: "변호사 압박",
      stage: "기",
      pacing: "전환",
      episode: 10,
      wordCount: 1296,
      status: "본문 완료",
      synopsis: "민도혁 변호사 집무실 진입 및 기선 제압.",
      characters: ["강이현", "민도혁"],
      content: `"약속 시간보다 10분 빠르시군요."
민도혁은 고개를 들지 않은 채 서류철을 넘겼다. 책상 위에는 증기 한 줄기 피어오르지 않는 식은 아메리카노가 놓여 있었다.
"시간을 낭비하는 걸 싫어해서요, 변호사님."
나는 의자를 권하기도 전에 마주 앉았다. 그리고 가방에서 꺼낸 봉투를 책상 정중앙에 올려놓았다.`
    },
    {
      id: "ch03-s04",
      sceneNumber: "04",
      title: "의심의 시선",
      stage: "승",
      pacing: "후퇴",
      episode: 10,
      wordCount: 1733,
      status: "본문 완료",
      synopsis: "민도혁이 서류의 진위를 파고들며 정체를 떠보는 팽팽한 신경전.",
      characters: ["강이현", "민도혁"],
      content: `민도혁의 시선이 봉투에서 내 눈동자로 천천히 이동했다.
"강유진 씨 장례식장에는 왜 안 나타나셨습니까?"
그의 입에서 동생의 이름이 튀어나왔다. 
순간 심장이 갈비뼈 안쪽을 강하게 쳤지만, 얼굴 근육은 단 1밀리미터도 움직이지 않았다.`
    },
    {
      id: "ch03-s05",
      sceneNumber: "05",
      title: "첫 번째 대면",
      stage: "승",
      pacing: "전진",
      episode: 10,
      wordCount: 1304,
      isEndingHook: true,
      hookType: "★ 10화 엔딩 훅 (인식 뒤집힘)",
      status: "본문 완료",
      synopsis: "민도혁에게 동생의 사망이 단순 사고가 아님을 입증하는 음성 파일 재생.",
      characters: ["강이현", "민도혁"],
      content: `"그 장례식장에 진짜 와야 했던 건 저작권자가 아니라 살인 교사범이었으니까요."
재생 버튼을 눌렀다. 스피커에서 흘러나오는 차남 서동훈의 서늘한 목소리.
민도혁의 손가락에 끼워져 있던 만년필이 딱 멈췄다.`
    },
    {
      id: "ch03-s06",
      sceneNumber: "06",
      title: "삼남의 난입",
      stage: "승",
      pacing: "전진",
      episode: 11,
      wordCount: 1054,
      status: "본문 완료",
      synopsis: "진성그룹 삼남이 변호사 사무실에 들이닥쳐 소란 피움.",
      characters: ["강이현", "민도혁", "서재훈(삼남)"],
      content: `"민 변호사! 내 주주총회 의결권 위임장 어딨어!"
예고도 없이 열린 집무실 문틈으로 술 냄새와 고함이 들이쳤다. 삼남 서재훈이었다.
나는 재빨리 선글라스를 고쳐 쓰며 고개를 창가로 돌렸다.`
    },
    {
      id: "ch03-s06b",
      sceneNumber: "06b",
      title: "지갑 확인",
      stage: "승",
      pacing: "후퇴",
      episode: 11,
      wordCount: 736,
      status: "본문 완료",
      synopsis: "핸드백 속 위조 신분증과 지갑의 위치를 점검하며 노출 방지.",
      characters: ["강이현"],
      content: `삼남이 민도혁의 멱살을 잡으려 드는 난장판 속에서 가방 안쪽 지퍼를 만졌다.
지갑 안쪽 깊숙이 숨겨진 '강이현'의 진짜 주민등록증.
여기서 흘리면 모든 게 끝난다. 지퍼를 끝까지 당겨 닫았다.`
    },
    {
      id: "ch03-s07",
      sceneNumber: "07",
      title: "카톡 네 통",
      stage: "승",
      pacing: "후퇴",
      episode: 11,
      wordCount: 743,
      status: "본문 완료",
      synopsis: "차남 서동훈에게서 날아온 의문의 확인 문자 4건.",
      characters: ["강이현"],
      content: `[알림] 차남 서동훈 부회장
[10:14] 오늘 로펌 방문 건 들었습니다.
[10:14] 잃어버렸던 우리 조카님이 맞다면 정말 반가운 일이군요.
[10:15] 저녁 본가 만찬에 모시고 싶습니다.
[10:15] 할아버님께서도 기다리십니다.`
    },
    {
      id: "ch03-s08",
      sceneNumber: "08",
      title: "금고 속 열쇠",
      stage: "전",
      pacing: "전진",
      episode: 11,
      wordCount: 2143,
      status: "본문 완료",
      synopsis: "민도혁의 금고에서 동생 유진이 맡겨두었던 보관함 열쇠 인수.",
      characters: ["강이현", "민도혁"],
      content: `민도혁은 벽면 그림 뒤에 숨겨진 비밀 금고 다이얼을 돌렸다.
철컥, 소리와 함께 열린 금고 속에서 그가 작은 벨벳 주머니를 꺼냈다.
"유진 씨가 사망하기 사흘 전 맡긴 물건입니다. 언니가 서이현의 이름을 입고 오면 전해주라더군요."`
    },
    {
      id: "ch03-s09",
      sceneNumber: "09",
      title: "회장의 침묵",
      stage: "전",
      pacing: "후퇴",
      episode: 11,
      wordCount: 1504,
      status: "본문 완료",
      synopsis: "본가 만찬장 참석 통보를 받고 회장의 심중을 계산하는 전략 수립.",
      characters: ["강이현", "민도혁"],
      content: `"회장님은 보고서를 보시고도 아무 말씀도 안 하셨습니다."
"숟가락을 놓으셨나요?"
"아니요, 그대로 식사를 계속하셨습니다."
침묵. 그것은 거절이 아니었다. 시험대에 오를 자격을 주겠다는 냉혹한 허가였다.`
    },
    {
      id: "ch03-s10",
      sceneNumber: "10",
      title: "지갑의 실종",
      stage: "전",
      pacing: "후퇴",
      episode: 11,
      wordCount: 882,
      isEndingHook: true,
      hookType: "★ 11화 엔딩 훅 (호명)",
      status: "본문 완료",
      synopsis: "로펌을 나서는 순간 지갑이 사라졌음을 감지하고 엄습하는 공포.",
      characters: ["강이현"],
      content: `택시를 타기 위해 코트 주머니에 손을 넣었다.
텅 비어 있었다.
가방 안을 뒤졌다. 화장품 파우치, 서류철, 볼펜... 지갑이 없었다.
진짜 내 이름 강이현이 적힌 주민등록증이 들어 있는 그 가죽 지갑이 사라졌다.
그때 등 뒤에서 나지막한 목소리가 내 귀를 파고들었다.
"강이현 씨."`
    },
    {
      id: "ch03-s11",
      sceneNumber: "11",
      title: "전화 한 통",
      stage: "결",
      pacing: "전진",
      episode: 12,
      wordCount: 1599,
      status: "본문 완료",
      synopsis: "사라진 지갑을 회수하고 고모의 도발을 역이용하는 전술.",
      characters: ["강이현", "서명희 고모"],
      content: `뒤를 돌아보지 않았다. 호흡을 가다듬고 3초를 센 뒤 천천히 몸을 돌렸다.
서 있는 사람은 민도혁의 비서였다. 손에는 떨어뜨렸던 내 가죽 지갑이 들려 있었다.
"떨어뜨리셨습니다, 서이현 님."
위기를 넘겼다는 안도감도 잠시, 전화벨이 울렸다. 발신인은 고모 서명희였다.`
    },
    {
      id: "ch03-s12",
      sceneNumber: "12",
      title: "만찬장의 초대",
      stage: "결",
      pacing: "후퇴",
      episode: 12,
      wordCount: 2156,
      status: "본문 완료",
      synopsis: "진성그룹 평창동 본가 대식당 입성과 살얼음판 좌석 배치.",
      characters: ["강이현", "서진태 회장", "서동훈 부회장", "서명희"],
      content: `평창동 저택의 철문이 육중한 소리를 내며 열렸다.
대식당의 12인용 식탁. 상석에는 서진태 회장, 그 우측에는 차남 서동훈, 좌측에는 고모 서명희.
모두가 나를 쳐다보고 있었다. 10년 만에 살아 돌아왔다는 가짜 손녀를 도륙할 준비가 된 눈빛들이었다.`
    },
    {
      id: "ch03-s13",
      sceneNumber: "13",
      title: "안경의 위치",
      stage: "결",
      pacing: "전진",
      episode: 12,
      wordCount: 1449,
      status: "본문 완료",
      synopsis: "차남 서동훈이 건네는 잔을 받으며 동생의 안경 케이스 복선 회수.",
      characters: ["강이현", "서동훈 부회장"],
      content: `"이현아, 오랜만이다. 목이 탈 텐데 물부터 마시렴."
서동훈이 물잔을 채워주며 다정하게 웃었다.
그의 셔츠 주머니 위로 비치는 둥근 안경테.
동생 유진이의 방에서 사라졌던 바로 그 티타늄 안경이었다.`
    },
    {
      id: "ch03-s14",
      sceneNumber: "14",
      title: "1막 챕터 훅",
      stage: "결",
      pacing: "전진",
      episode: 12,
      wordCount: 2310,
      isEndingHook: true,
      hookType: "★ 12화 엔딩 (1막 클리프행어)",
      status: "본문 완료",
      synopsis: "서 회장의 갑작스러운 질문으로 1막이 절정의 서스펜스로 종결.",
      characters: ["강이현", "서진태 회장"],
      content: `식사가 끝날 무렵, 서 회장이 나직하게 숟가락을 내려놓았다.
달그락, 식당 안의 모든 수저질이 멎었다.
서 회장의 백발 섞인 눈썹 아래 매서운 안광이 내 얼굴을 꿰뚫듯 꽂혔다.
"그런데 이현아. 네 동생 유진이는 왜 죽었느냐?"
숨이 턱 막혔다. 서 회장은 이미 동생의 존재를 알고 있었다.`
    }
  ],
  foreshadowingResolved: [
    {
      id: "fr-1",
      source: "ch01 s02",
      text: "동생의 빈 안경 케이스",
      resolvedAt: "ch03 s13 (서동훈 차남 셔츠 주머니 착용 확인)",
      status: "회수됨"
    },
    {
      id: "fr-2",
      source: "ch02 s03",
      text: "로펌 화장실 위조 신분증 은폐",
      resolvedAt: "ch03 s09 (민도혁 심문 통과 후 은폐 성공)",
      status: "회수됨"
    }
  ],
  foreshadowingPlanted: [
    {
      id: "fp-1",
      source: "ch03 s06",
      text: "차남의 신경안정제 처방약 봉투",
      target: "ch12 기록 대조 및 아크 6 자백 유도",
      status: "심음"
    },
    {
      id: "fp-2",
      source: "ch03 s08",
      text: "비밀 다이어리 사본 암호",
      target: "ch24 법정 최종 증거 제출",
      status: "심음"
    }
  ]
};

export const CHAPTER_04_DATA: ChapterData = {
  id: "ch04",
  number: 4,
  title: "식탁의 서열",
  arcId: "arc01",
  arcTitle: "동생의 이름으로",
  act: "1막 (1~17화)",
  status: "진행 중",
  episodes: "13~17화 (예정)",
  confirmedEpisodes: [13, 14, 15, 16, 17],
  plannedScenesCount: 11,
  completedScenesCount: 0,
  totalWords: 0,
  steps: {
    step6: "완료",
    step8: "진행 중",
    step9: "대기",
    step10: "대기"
  },
  tasks: [
    { id: "t-41", text: "씬 01 가족의 시선 본문 집필 착수", status: "미결" },
    { id: "t-42", text: "회장의 질문에 대한 회피 논리: '그 아이는 제 친구였습니다' 위장 유지", status: "미결" },
    { id: "t-43", text: "17화 회장의 '네 말이 맞다' 사이다 전환점 씬 트리거 확정", status: "해결" }
  ],
  scenes: [
    {
      id: "ch04-s01",
      sceneNumber: "01",
      title: "가족의 시선",
      stage: "기",
      pacing: "후퇴",
      episode: 13,
      wordCount: 1600,
      status: "집필 중",
      synopsis: "회장의 서슬 퍼런 유진 질문 직후 식탁 가족들의 적나라한 반응과 주인공의 방어.",
      characters: ["강이현", "서진태 회장", "서동훈 부회장"],
      content: `서진태 회장의 질문이 식탁 위에 떨어지는 순간, 공기가 영하로 곤두박질쳤다.
'동생 유진이는 왜 죽었느냐.'
이현이라는 가짜 신분 뒤에 숨겨둔 내 진짜 혈육의 이름.
나는 숟가락을 쥔 손에 힘을 주지 않았다. 손끝을 미세하게 떨며, 어리숙하고 당황한 가짜 서이현의 표정을 입에 올렸다.`
    },
    {
      id: "ch04-s02",
      sceneNumber: "02",
      title: "차남의 변호",
      stage: "기",
      pacing: "전환",
      episode: 13,
      wordCount: 1450,
      status: "대기",
      synopsis: "차남 서동훈이 짐짓 조카를 감싸며 대화의 주도권을 가로채려 함.",
      characters: ["서동훈", "서진태 회장", "강이현"],
      content: `차남 서동훈이 부드럽게 냅킨으로 입가를 닦으며 끼어들었다. "아버님, 오랜만에 돌아온 아이에게 너무 가혹한 질문이십니다."`
    },
    {
      id: "ch04-s03",
      sceneNumber: "03",
      title: "고모의 물어뜯기",
      stage: "기",
      pacing: "후퇴",
      episode: 13,
      wordCount: 1300,
      status: "대기",
      synopsis: "고모 서명희가 유전자 검사 시차를 들먹이며 식탁에서 공격 시작.",
      characters: ["서명희", "강이현"],
      content: `"가혹하긴 뭐가 가혹해? 10년이나 소식 끊겼던 애가 갑자기 유전자 서류 한 장 들고 나타났는데!" 서명희의 손톱이 식탁보를 긁었다.`
    },
    {
      id: "ch04-s04",
      sceneNumber: "04",
      title: "좌석의 비밀",
      stage: "승",
      pacing: "전진",
      episode: 14,
      wordCount: 1800,
      status: "대기",
      synopsis: "식탁 말석에 앉은 주인공이 좌석 배치를 분석해 계열사 지분 분할 구도를 파악.",
      characters: ["강이현"],
      content: `내 자리는 문가 맨 끝. 하지만 이 자리의 장점은 식탁에 앉은 모든 자의 손짓과 시선 교환을 사각지대 없이 훑을 수 있다는 것이다.`
    },
    {
      id: "ch04-s05",
      sceneNumber: "05",
      title: "첫 번째 반격",
      stage: "승",
      pacing: "전진",
      episode: 14,
      wordCount: 1750,
      isEndingHook: true,
      hookType: "★ 14화 엔딩 (사이다)",
      status: "대기",
      synopsis: "고모의 재산 분할 약점을 회장 앞에서 공손하게 폭로하여 침묵시킴.",
      characters: ["강이현", "서명희", "서진태 회장"],
      content: `"고모님께서 관리하시던 문화재단 분기 결산서에서 32억의 미수금이 있던데, 그것 때문이십니까?" 식탁이 얼어붙었다.`
    },
    {
      id: "ch04-s06",
      sceneNumber: "06",
      title: "서재 독대",
      stage: "전",
      pacing: "전환",
      episode: 15,
      wordCount: 1900,
      status: "대기",
      synopsis: "만찬 종료 후 회장 서재로 단독 호출되어 진검승부 돌입.",
      characters: ["강이현", "서진태 회장"],
      content: `서재 문이 닫히자 회장은 뒤도 돌아보지 않고 말했다. "재단 미수금은 어떻게 알았지?"`
    },
    {
      id: "ch04-s07",
      sceneNumber: "07",
      title: "숫자의 칼날",
      stage: "전",
      pacing: "전진",
      episode: 15,
      wordCount: 1650,
      status: "대기",
      synopsis: "진성물산 비자금 회계 장부의 허점을 숫자로 브리핑.",
      characters: ["강이현", "서진태 회장"],
      content: `"감정에 호소하러 온 게 아닙니다. 저는 회장님의 돈을 지켜드릴 수 있습니다."`
    },
    {
      id: "ch04-s08",
      sceneNumber: "08",
      title: "차남의 도청",
      stage: "전",
      pacing: "후퇴",
      episode: 16,
      wordCount: 1500,
      isEndingHook: true,
      hookType: "★ 16화 엔딩 (서스펜스)",
      status: "대기",
      synopsis: "서재 밖에서 차남 서동훈이 서재 문손잡이를 만지작거리며 엿듣고 있음.",
      characters: ["서동훈"],
      content: `차남의 손가락이 귓바퀴를 두 번 톡톡 쳤다. "조카님의 입이 생각보다 무겁지 않군."`
    },
    {
      id: "ch04-s09",
      sceneNumber: "09",
      title: "새벽의 침입자",
      stage: "결",
      pacing: "후퇴",
      episode: 16,
      wordCount: 1400,
      status: "대기",
      synopsis: "본가 게스트룸에 배정된 주인공의 방에 누군가 침입하여 짐을 수색.",
      characters: ["강이현"],
      content: `새벽 3시 14분. 문손잡이가 조용히 아래로 내려갔다.`
    },
    {
      id: "ch04-s10",
      sceneNumber: "10",
      title: "덫의 역이용",
      stage: "결",
      pacing: "전진",
      episode: 17,
      wordCount: 1800,
      status: "대기",
      synopsis: "침입자의 정체가 차남의 수하임을 확인하고 가짜 단서를 쥐어 보냄.",
      characters: ["강이현"],
      content: `일부러 떨어뜨려 놓은 가짜 메모장. 차남은 이제 내가 엉뚱한 계좌를 쫓고 있다고 믿을 것이다.`
    },
    {
      id: "ch04-s11",
      sceneNumber: "11",
      title: "네 말이 맞다",
      stage: "결",
      pacing: "전진",
      episode: 17,
      wordCount: 2400,
      isEndingHook: true,
      hookType: "★ 17화 1차 전환점 (A급 사이다)",
      status: "대기",
      synopsis: "회장이 전 가족을 소집하여 '이현이 말이 맞다. 진성물산 기획조정실로 출근해라' 선언.",
      characters: ["강이현", "서진태 회장", "서동훈", "서명희"],
      content: `서진태 회장은 찻잔을 내려놓고 고요하게 차남과 장녀를 둘러보았다. "네 말이 맞다, 이현아. 내일부터 기획조정실로 출근해라."`
    }
  ],
  foreshadowingResolved: [],
  foreshadowingPlanted: [
    {
      id: "fp-41",
      source: "ch04 s08",
      text: "서재 문틈 차남의 도청 습관",
      target: "아크 4 도청기 역이용 폭로",
      status: "심을 예정"
    }
  ]
};

export const FORESHADOWING_DATABASE: ForeshadowingItem[] = [
  { id: "fs-01", location: "ch01 s02", title: "동생의 빈 안경 케이스", description: "유진이 쓰던 티타늄 안경테가 실종된 상태", payoff: "ch02 s05 발견 → ch03 s13 차남 주머니 착용 확인", status: "회수됨", arc: "아크 1" },
  { id: "fs-02", location: "ch01 s03", title: "사채업자의 차용증 서명", description: "유진의 빚 뒤에 진성그룹 계열사 보증 발견", payoff: "ch02 s02 사채업자 압박 자백", status: "회수됨", arc: "아크 1" },
  { id: "fs-03", location: "ch01 s04", title: "차남의 잔을 채우는 버릇", description: "살의를 품을 때 다정하게 잔을 채우며 귓바퀴 노크", payoff: "ch04 s01 식탁 대면 → 아크 6 범행 유도 자백", status: "심음", arc: "아크 1" },
  { id: "fs-04", location: "ch01 s06", title: "비밀 다이어리 노트 암호", description: "유진이 날짜와 숫자로 숨겨둔 비자금 하드월렛 암호", payoff: "ch12 일기 #3 대조 → ch24 법정 제출", status: "심음", arc: "아크 3" },
  { id: "fs-05", location: "ch02 s04", title: "로펌 진명 비밀 금고 비밀번호", description: "유진의 생일이 아닌 주인공의 첫 수능 날짜", payoff: "ch03 s08 금고 개방", status: "회수됨", arc: "아크 1" },
  { id: "fs-06", location: "ch02 s07", title: "첫 번째 일기 '오늘 언니를 찾았다'", description: "사망 한 달 전 주인공을 찾아 헤매던 기록", payoff: "ch02 s07 해독 완료", status: "회수됨", arc: "아크 1" },
  { id: "fs-07", location: "ch03 s06", title: "차남의 신경안정제 처방약 봉투", description: "살인 당일 알리바이 병원 진료 기록의 시차 결함", payoff: "ch12 알리바이 분쇄 → 아크 6 기소", status: "심음", arc: "아크 1" },
  { id: "fs-08", location: "ch03 s10", title: "사라진 지갑 속 위조 신분증", description: "로펌 복도에서 떨어진 강이현 본명 신분증", payoff: "ch14 고모 서명희의 불시 심문", status: "심을 예정", arc: "아크 2" },
  { id: "fs-09", location: "ch04 s05", title: "문화재단 32억 미수금 장부", description: "고모 서명희의 비자금이자 차남의 협박 수단", payoff: "ch18 고모를 아군으로 포섭하는 결정적 카드", status: "심을 예정", arc: "아크 2" },
  { id: "fs-10", location: "ch04 s08", title: "차남의 서재 도청 장치", description: "서 회장의 서재 램프 밑에 심겨진 초소형 녹음기", payoff: "ch16 역정보 흘려 차남을 주식 사기 덫에 빠뜨림", status: "심을 예정", arc: "아크 3" },
  { id: "fs-11", location: "ch06 s02", title: "진짜 서이현의 스위스 요양원 청구서", description: "식물인간 상태인 진짜 손녀의 병원비 입금처", payoff: "ch20 차남이 회장을 협박하는 최후 카드", status: "심을 예정", arc: "아크 5" },
  { id: "fs-12", location: "ch08 s04", title: "BJ 유나의 2차 암호 하드월렛", description: "비자금 1200억의 해외 코인 이동 경로", payoff: "ch22 주주총회 직전 자금 동결", status: "심을 예정", arc: "아크 6" },
  { id: "fs-13", location: "ch02 s03", title: "유전자 검사 2시간 수령 시차", description: "연구원 퀵배송 기사와 주인공의 접선 시간", payoff: "ch03 s02 봉인 통과", status: "회수됨", arc: "아크 1" }
];

export const ISSUES_DATABASE: IssueItem[] = [
  { id: "iss-01", title: "5화 암묵 전제: 유전자 검사 결과 수령 시차", description: "의뢰인 본인 직접 수령 및 봉인 씰 훼손 여부 법의학 고증", status: "미결", category: "고증" },
  { id: "iss-02", title: "총 화수 밸런스: ch01 5화 지연 대비 ch03 3화 압축", description: "100화 정량 완결을 위한 아크 2 진입 화수 확정", status: "해결", category: "구조" },
  { id: "iss-03", title: "차남의 호칭 규칙: '조카님' vs '이현아'", description: "대중 앞과 단둘이 있을 때의 이중성 연출 수위 조절", status: "해결", category: "인물" },
  { id: "iss-04", title: "동생의 일기 6편 공개 시점 캘린더 일치 여부", description: "2023년 봄 기준 과거 2021~2022년 날짜 타임라인 정합성", status: "미결", category: "타임라인" },
  { id: "iss-05", title: "식탁 서열 배치도에서 삼남 서재훈의 퇴출 타이밍", description: "ch05 음주운전 폭로 후 좌석 박탈 장면 연출", status: "해결", category: "구조" },
  { id: "iss-06", title: "주인공의 내레이션 본명 비노출 린터 규칙", description: "내레이션에서 '이현' 검색 시 경고 플래그 띄우는 알고리즘", status: "해결", category: "구조" },
  { id: "iss-07", title: "국과수 민간 위탁 유전자 검사소 설립 허가 기준", description: "로펌이 지정 검사소로 결과서를 빼돌리는 현실적 트릭 검토", status: "미결", category: "고증" }
];

export const DIARIES_DATA: DiaryItem[] = [
  {
    id: "diary-1",
    chapter: "ch02",
    number: 1,
    title: "오늘 언니를 찾았다",
    date: "2022년 11월 4일 흐림",
    unlocked: true,
    unlockedAt: "ch02 s07 해금 완료",
    previewText: "화면 너머로 익숙한 얼굴을 보았다. 언니는 여전히 나를 모른 척하겠지만...",
    fullText: `2022년 11월 4일 흐림.

오늘 언니를 찾았다.
서초동 법원 앞 횡단보도, 신호를 기다리는 사람들 틈에서 서 있는 언니를 보았다.
머리를 짧게 자르고, 굽 높은 구두를 신고, 차가운 표정으로 서류를 넘기고 있었다. 내가 알던 고시원 방바닥에서 컵라면을 쪼개 먹던 그 언니가 아니었다.

말을 걸고 싶어서 세 걸음 다가갔다가 멈췄다.
내 등 뒤에는 여전히 검은 승용차가 따라붙고 있었으니까.
내가 언니에게 아는 척을 하는 순간, 언니까지 저 사람들의 먹잇감이 될 거라는 걸 안다.

언니, 미안해.
내가 방송에서 너무 많은 걸 말해버렸어. 
돌이킬 수 없다는 걸 알아. 하지만 내가 남긴 이 노트만은 언니 손에 들어가길 바랄게.
내가 죽으면... 꼭 내 이름을 찾아줘.`
  },
  {
    id: "diary-2",
    chapter: "ch08",
    number: 2,
    title: "방송 등록과 그 남자의 후원",
    date: "2022년 12월 19일 맑음",
    unlocked: false,
    previewText: "닉네임 '화이트로즈'가 보낸 5천만 원의 후원금. 그 뒤에 숨겨진 악마의 제안."
  },
  {
    id: "diary-3",
    chapter: "ch12",
    number: 3,
    title: "미행과 낯선 차량",
    date: "2023년 1월 8일 눈",
    unlocked: false,
    previewText: "주차장에 세워진 77로 9841 검은 세단. 운전석의 남자는 차남의 운전기사였다."
  },
  {
    id: "diary-4",
    chapter: "ch16",
    number: 4,
    title: "못 만난 약속",
    date: "2023년 2월 14일 비",
    unlocked: false,
    previewText: "강남역 카페 4번 출구. 약속 장소에 나온 건 기자가 아니라 사채업자들이었다."
  },
  {
    id: "diary-5",
    chapter: "ch19",
    number: 5,
    title: "그날 하지 못한 말",
    date: "2023년 3월 2일 바람",
    unlocked: false,
    previewText: "마지막 통화에서 차마 '사랑한다'고 말하지 못했다. 언니가 위험해질까 봐."
  },
  {
    id: "diary-6",
    chapter: "ch24",
    number: 6,
    title: "언니의 글씨",
    date: "2023년 3월 15일 (사망 전날 밤)",
    unlocked: false,
    previewText: "언니, 내가 죽더라도 슬퍼하지 마. 언니의 진짜 삶을 살아줘. 약속해."
  }
];

export const UNRESOLVED_ISSUES: IssueItem[] = ISSUES_DATABASE;

export const CHAPTER_01_DATA: ChapterData = {
  ...CHAPTER_03_DATA,
  id: "ch01",
  number: 1,
  title: "동생의 장례식과 암호 일기",
  episodes: "01~04화",
  status: "검토 완료",
};

export const CHAPTER_02_DATA: ChapterData = {
  ...CHAPTER_03_DATA,
  id: "ch02",
  number: 2,
  title: "로펌 진명과 유전자 검사",
  episodes: "05~09화",
  status: "검토 완료",
};

export const ALL_CHAPTERS_DATA: Record<string, ChapterData> = {
  ch01: CHAPTER_01_DATA,
  ch02: CHAPTER_02_DATA,
  ch03: CHAPTER_03_DATA,
  ch04: CHAPTER_04_DATA,
};
