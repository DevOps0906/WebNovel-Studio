import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sword,
  Crown,
  Flame,
  Layers,
  ChevronRight,
  ChevronLeft,
  User,
  Feather,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Target,
  Check,
  RotateCcw,
  Compass,
  FileText,
  Tag,
  Plus,
  X,
  Heart,
  Globe,
  Upload,
  Edit3,
  Sliders
} from 'lucide-react';
import {
  WebNovelProject,
  createProjectFromTemplate
} from '../data/projectTemplates';
import { getActiveAiCredentials } from '../data/aiSettings';
import { requestAi, describeModel } from '../data/aiClient';

interface NewProjectPageProps {
  onCreateProject: (newProject: WebNovelProject) => void;
  onCancel: () => void;
}

export type GenreKey = 'chaebol' | 'hunter' | 'romfantasy' | 'wuxia' | 'fantasy' | 'cyberpunk';

interface GenreOption {
  key: GenreKey;
  label: string;
  sublabel: string;
  icon: any;
  color: string;
  keywords: string[];
}

export const GENRE_OPTIONS: GenreOption[] = [
  {
    key: 'chaebol',
    label: '현대판타지 (기업·전문직·복수극)',
    sublabel: '재벌가 입성 · 지분 전쟁 · M&A · 사이다 내부자',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
    keywords: [
      '#지분전쟁',
      '#가짜혈통',
      '#재벌3세',
      '#비자금',
      '#M&A',
      '#암호일기',
      '#주주총회',
      '#사이다복수',
      '#승계권',
      '#내부고발'
    ]
  },
  {
    key: 'hunter',
    label: '현대판타지 (헌터·성좌·레이드)',
    sublabel: '태고 성좌 계약 · 랭커 조련 · 게이트 붕괴 · 1인 군단',
    icon: Sword,
    color: 'from-blue-600 to-cyan-600',
    keywords: [
      '#F급짐꾼',
      '#태고성좌',
      '#절대계약',
      '#랭커조련',
      '#게이트붕괴',
      '#그림자군단',
      '#스킬강탈',
      '#상태창',
      '#1인군단',
      '#사이다각성'
    ]
  },
  {
    key: 'romfantasy',
    label: '로맨스판타지 (악녀·빙의·황실암투)',
    sublabel: '단두대 회피 · 파혼 선언 · 황실 국채 매입 · 걸크러시',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    keywords: [
      '#시한부',
      '#악녀빙의',
      '#파혼선언',
      '#황실국채',
      '#마탑지분',
      '#걸크러시',
      '#후회남주',
      '#사교계암투',
      '#계약결혼',
      '#단두대회피'
    ]
  },
  {
    key: 'wuxia',
    label: '무협 (신무협·환생·문파부흥)',
    sublabel: '화산 대장로 환생 · 24수 매화검결 · 마교 참교육 · 문파 재건',
    icon: Flame,
    color: 'from-red-600 to-amber-600',
    keywords: [
      '#화산귀환',
      '#매화검결',
      '#대장로환생',
      '#문파부흥',
      '#마교참교육',
      '#천하제일',
      '#기연독식',
      '#장문인',
      '#구파일방',
      '#사이다초식'
    ]
  },
  {
    key: 'fantasy',
    label: '퓨전판타지 (착각계·영지물·힐링)',
    sublabel: '백수 지망 망나니 · 주변인 과잉충성 · 신수 사육 · 치트',
    icon: Layers,
    color: 'from-emerald-500 to-teal-600',
    keywords: [
      '#백수지망생',
      '#착각계',
      '#절대충성',
      '#영지발전',
      '#치트스킬',
      '#힐링사이다',
      '#망나니영주',
      '#신수육성',
      '#시스템귀환',
      '#황금만능'
    ]
  },
  {
    key: 'cyberpunk',
    label: 'SF판타지 (아포칼립스·사이버펑크)',
    sublabel: '네오서울 0급 해커 · 뉴럴넷 장악 · 사이보그 혁명 · 벙커',
    icon: Zap,
    color: 'from-purple-600 to-indigo-600',
    keywords: [
      '#0급해커',
      '#네오서울',
      '#메가코프',
      '#뉴럴넷해킹',
      '#사이보그',
      '#고대AI코어',
      '#인형해방',
      '#디스토피아',
      '#나노바이러스',
      '#생존쉘터'
    ]
  }
];

// Persona Genre Categories for Step 5
export type PersonaCategoryKey = 'all' | 'chaebol' | 'hunter' | 'romfantasy' | 'wuxia' | 'fantasy' | 'custom';

export interface PersonaCategory {
  key: PersonaCategoryKey;
  label: string;
}

export const PERSONA_CATEGORIES: PersonaCategory[] = [
  { key: 'all', label: '전체 보기 (All)' },
  { key: 'chaebol', label: '현대판타지 / 기업·복수' },
  { key: 'hunter', label: '헌터 / 성좌 / 레이드' },
  { key: 'romfantasy', label: '로맨스 판타지' },
  { key: 'wuxia', label: '무협 / 동양 판타지' },
  { key: 'fantasy', label: '판타지 / 착각계' },
  { key: 'custom', label: '자유 맞춤 (Custom)' }
];

export interface WriterPersona {
  id: string;
  name: string;
  masterpiece: string;
  category: PersonaCategoryKey;
  genre: string;
  styleDescription: string;
  signatureHook: string;
  quote: string;
}

export const FAMOUS_WRITER_PERSONAS: WriterPersona[] = [
  {
    id: 'sankyeong',
    name: '산경 작가 페르소나',
    masterpiece: '《재벌집 막내아들》',
    category: 'chaebol',
    genre: '재벌 복수극 · 현대 판타지 · 기업물',
    styleDescription: '건조하고 날카로운 팩트 단문, 기업 M&A 및 지분 계산의 긴장감, 노회한 재벌 총수의 대화 심리전.',
    signatureHook: '숫자는 거짓말을 하지 않는다. 지분 4.8%가 시장에 풀렸다. 주사위는 이미 던져졌다.',
    quote: '"돈이란 건 말이다, 피보다 진하고 영혼보다 질긴 법이야."'
  },
  {
    id: 'singshong',
    name: '싱숑 작가 페르소나',
    masterpiece: '《전지적 독자 시점》',
    category: 'hunter',
    genre: '현대 판타지 · 성좌물 · 아포칼립스',
    styleDescription: '성좌 후원 시스템창 메시지, 메타픽션적 독백, 신화/고전 모티프 비유, 담담하면서도 벅차오르는 감정선.',
    signatureHook: '[성좌, \'영원의 침묵\'이 당신의 결단에 경의를 표합니다.] [코인 5,000개가 후원되었습니다.]',
    quote: '"이야기는 결코 끝나지 않는다. 단 한 사람의 독자가 남아 있는 한."'
  },
  {
    id: 'chugong',
    name: '츄공 작가 페르소나',
    masterpiece: '《나 혼자만 레벨업》',
    category: 'hunter',
    genre: '현대 레이드물 · 솔로 플레이 · 먼치킨',
    styleDescription: '간결하고 직관적인 문장, 그림자 군단 소환의 시각적 쾌감, 압도적인 일격 필살의 카타르시스.',
    signatureHook: '일어나라. 그의 한마디에 칠흑 같은 어둠 속에서 수만 개의 그림자가 고개를 들었다.',
    quote: '"나 혼자면 충분하다."'
  },
  {
    id: 'solche',
    name: '솔체 작가 페르소나',
    masterpiece: '《울어 봐, 빌어도 좋고》',
    category: 'romfantasy',
    genre: '로맨스 판타지 · 피폐/구원 · 귀족 암투',
    styleDescription: '고밀도 심리 묘사, 우아하고 귀족적인 서정 문체, 미학적인 은유와 위험한 집착, 절제된 긴장감.',
    signatureHook: '그것은 새장에 갇힌 카나리아의 날갯짓이었다. 그가 서서히 철창 문을 닫는 순간까지도.',
    quote: '"울어 봐. 빌어도 좋아. 하지만 넌 결코 내 손아귀에서 벗어날 수 없어."'
  },
  {
    id: 'biga',
    name: '비가 작가 페르소나',
    masterpiece: '《화산귀환》',
    category: 'wuxia',
    genre: '신무협 · 문파 부흥 · 환생물',
    styleDescription: '호쾌하고 리듬감 있는 구어체, 능청스러운 유머와 가슴을 에는 비장미의 절묘한 교차, 매화 검의 카타르시스.',
    signatureHook: '붉은 매화가 천하를 뒤덮는다. 검끝에 맺힌 꽃잎 하나가 세상을 벨 때까지.',
    quote: '"이 썩을 놈들아! 대가리 딱 대라!"'
  },
  {
    id: 'hanjungwolya',
    name: '한중월야 작가 페르소나',
    masterpiece: '《나노마신》 · 《마도전생기》',
    category: 'wuxia',
    genre: '정통/퓨전 무협 · 먼치킨 · 사이다',
    styleDescription: '망설임 없는 초고속 사이다 처단, 뼈와 혈도가 갈라지는 정밀한 초식 묘사, 마도(魔道)의 서늘한 패기.',
    signatureHook: '사죄의 말은 필요 없다. 흑철검이 호를 긋자, 오만하던 숨통이 허공에서 끊어졌다.',
    quote: '"마도(魔道)에 타협이란 없다. 오직 굴복 아니면 죽음뿐."'
  },
  {
    id: 'yuryeohan',
    name: '유려한 작가 페르소나',
    masterpiece: '《백작가의 망나니가 되었다》',
    category: 'fantasy',
    genre: '판타지 · 착각계 · 힐링/사이다',
    styleDescription: '"난 그저 편하게 백수로 살고 싶다"는 주인공의 착각계 독백, 동료들의 절대적 신뢰와 눈물겨운 충성.',
    signatureHook: '"난 영웅 따위 될 생각 전혀 없어." 하지만 뒤돌아선 동료들의 눈빛은 이미 눈물로 젖어 있었다.',
    quote: '"내 목표는 오직 하나다. 뒹굴거리며 백수로 사는 것."'
  },
  {
    id: 'custom_voice',
    name: '자유 맞춤 페르소나 (Custom)',
    masterpiece: '《작가 고유 스타일》',
    category: 'custom',
    genre: '자유 장르 · 공학적 3중 보이스',
    styleDescription: '3중 보이스 분리 가이드(독백/대사/서술) 및 감정 명명 금지 원칙(신체 반응으로 표현) 적용.',
    signatureHook: '숨을 멈췄다. 0.3초의 정적이 흐르고, 마침내 결단의 신호가 떨어졌다.',
    quote: '"진짜 웹소설은 문장이 아니라 긴장감으로 독자를 사로잡는다."'
  }
];

// Rich 3-tab AI Proposals for EACH Genre
export interface GenreProposal {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  penName: string;
  genreBreakdown: string;
  targetEpisodes: number;
  background: string;
  scale: string;
  pov: string;
  target: string;
  serialization: string;
  logline: string;
  sellingPoint: string;
  personaId: string;
}

export const GENRE_PROPOSALS: Record<GenreKey, GenreProposal[]> = {
  chaebol: [
    {
      id: 'chaebol-1',
      tabLabel: '추천 1: 위장 입성 & 지분 사냥형',
      badge: '재벌 복수극 · 내부자 암투',
      title: '가짜 막내손녀는 재벌가를 집어삼킨다',
      subtitle: '죽은 동생의 이름으로 지분 15%를 사냥하다',
      penName: '구름발치',
      genreBreakdown: '현대판타지 50% · 재벌 복수극 30% · 두뇌 심리전 20%',
      targetEpisodes: 100,
      background: '대한민국 상위 0.01% 태성그룹 본사와 서초동 법조 카르텔',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 서이안)",
      target: '20~40대 스마트폰 독자 (출퇴근 스낵컬처)',
      serialization: '주 7회 성실 연재 (매일 18:00 정시 업로드)',
      logline: '인기 BJ였던 동생의 의문사를 파헤치기 위해, 동생의 암호 일기를 쥐고 잃어버린 막내손녀로 위장 입성한 주인공이 재벌가의 지분을 잠식하며 파멸시키는 복수극.',
      sellingPoint: '철저한 위장 신분의 쫄깃한 긴장감 + 주총 지분 전쟁의 통쾌한 사이다 카타르시스 + 매화 회수되는 암호 복선',
      personaId: 'sankyeong'
    },
    {
      id: 'chaebol-2',
      tabLabel: '추천 2: 타임리프 & 국가 부도 M&A형',
      badge: '외환위기 M&A · 금융 사이다',
      title: 'IMF 전날로 회귀한 막내사원의 지분 독식',
      subtitle: '국가 부도의 위기를 삼키고 재벌 1위로 군림하다',
      penName: '골드스톤',
      genreBreakdown: '현대판타지 60% · 금융 기업물 25% · 두뇌전 15%',
      targetEpisodes: 100,
      background: '1997년 외환위기 전야의 여의도 증권가와 대한민국 5대 재벌사',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 한도진)",
      target: '20~50대 남녀 직장인 (통쾌한 경제 역전극 선호층)',
      serialization: '주 6회 월~토 연재 (카카오/시리즈 매일 19:00)',
      logline: '재벌가의 꼬리 자르기로 횡령 누명을 쓰고 버려진 비자금 관리자가 1997년 IMF 직전으로 회귀, 전 세계 금융의 흐름을 쥐고 대한민국 1위 재벌을 거꾸로 집어삼킨다.',
      sellingPoint: '실제 경제 사건을 바탕으로 한 치밀한 금융 심리전 + 달러 환율 폭등을 이용한 압도적 지분 사냥의 쾌감',
      personaId: 'sankyeong'
    },
    {
      id: 'chaebol-3',
      tabLabel: '추천 3: 내부고발 & 미디어 사이다 복수형',
      badge: '실시간 폭로 · 공매도 사이다',
      title: '회장님의 0.01% 비밀 장부를 털었습니다',
      subtitle: '침묵하는 사법과 언론을 100일 만에 폭파하는 법',
      penName: '팩트체커',
      genreBreakdown: '현대판타지 45% · 미디어 스릴러 35% · 사이다 복수 20%',
      targetEpisodes: 100,
      background: '정재계 카르텔과 결탁한 초대형 법무법인 및 1인 라이브 방송실',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 강우주)",
      target: '20~30대 독자 (속도감 있는 정의 구현 서사 선호층)',
      serialization: '주 5회 월~금 연재 (문피아 독점 18:00)',
      logline: '상위 0.01% 재벌 카르텔의 모든 살인과 정경유착이 기록된 비밀 장부를 손에 쥔 주인공이, 1인 방송과 주식 공매도를 결합해 카르텔을 내부에서부터 붕괴시키는 서스펜스 복수극.',
      sellingPoint: '생방송 폭로전의 도파민 폭발 + 주가 폭락을 이용한 적대적 M&A 참교육의 짜릿함',
      personaId: 'sankyeong'
    }
  ],
  hunter: [
    {
      id: 'hunter-1',
      tabLabel: '추천 1: 태고 성좌 & 랭커 조련형',
      badge: '성좌 계약 · 역전 관계',
      title: 'F급 성좌는 랭커들을 조련한다',
      subtitle: '태고의 잊혀진 성좌와 나눈 절대 계약',
      penName: '신화기록자',
      genreBreakdown: '현대판타지 60% · 성좌 계약 25% · 길드 정치 15%',
      targetEpisodes: 100,
      background: '대재앙 게이트 붕괴 이후의 신도림 던전 및 5대 거대 길드 연합',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 강태산)",
      target: '10~30대 남성 독자 (먼치킨 카타르시스 선호층)',
      serialization: '주 5회 월~금 연재 (문피아/시리즈 19:00)',
      logline: '버려진 S급 게이트 심연에서 태고의 잊혀진 성좌와 계약한 만년 F급 짐꾼이, 자신을 배신한 랭커들과 길드를 하수인으로 길들이며 세계의 지배자로 군림하는 이야기.',
      sellingPoint: '성좌를 하위 계약자로 부리는 역전 관계 + 압도적 무력과 두뇌로 갑질 랭커들을 조련하는 압도적 쾌감',
      personaId: 'singshong'
    },
    {
      id: 'hunter-2',
      tabLabel: '추천 2: 솔로 플레이 & 그림자 군단형',
      badge: '단독 레이드 · 언데드 군단',
      title: '나 혼자 심연의 군주가 되었다',
      subtitle: '죽음을 지배하는 자의 전 세계 게이트 독식기',
      penName: '블랙소울',
      genreBreakdown: '현대 레이드물 70% · 솔로 플레이 20% · 먼치킨 10%',
      targetEpisodes: 100,
      background: '전 세계 수도를 집어삼킨 초특급 SSS급 심연 게이트 망',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 성진우)",
      target: '10~30대 독자 (압도적 전투와 무쌍 쾌감 선호층)',
      serialization: '주 7회 성실 연재 (카카오페이지 매일 18:00)',
      logline: '복합 게이트에서 파티원들에게 미끼로 버려진 최하급 헌터가 \'심연의 망령 군주\'로 각성, 쓰러뜨린 모든 보스 몬스터를 자신의 군단 병사로 부활시켜 세상을 지배한다.',
      sellingPoint: '솔로 헌터의 거침없는 사이다 일격필살 + 무한대로 불어나는 그림자 군단 소환의 시각적 쾌감',
      personaId: 'chugong'
    },
    {
      id: 'hunter-3',
      tabLabel: '추천 3: 던전 편의점 & 물자 독점형',
      badge: '갑을 역전 · 힐링 사이다',
      title: 'S급 던전에서 편의점을 차렸습니다',
      subtitle: '목숨이 아쉬운 랭커들은 줄을 서시오',
      penName: '스낵마스터',
      genreBreakdown: '현대판타지 50% · 일상 힐링 30% · 레이드 사이다 20%',
      targetEpisodes: 100,
      background: '공간 단절로 고립된 위험도 1위 재앙급 던전 최심부',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 이진수)",
      target: '전 연령대 독자 (유쾌하고 신선한 판타지 선호층)',
      serialization: '주 6회 월~토 연재 (시리즈 타임딜 18:00)',
      logline: '던전 내부에서만 무적 결계와 물자 무한 복제가 가능한 공간 스킬을 얻은 주인공이, 보스룸 앞마다 무적 편의점을 열어 거만하던 랭커들의 콧대를 꺾고 세계 최고 부자가 된다.',
      sellingPoint: '갑을 관계 역전 사이다 + 컵라면과 포션 하나로 랭커들을 휘어잡는 신선한 힐링 비즈니스',
      personaId: 'singshong'
    }
  ],
  romfantasy: [
    {
      id: 'romfantasy-1',
      tabLabel: '추천 1: 황실 국채 매입 & 파혼 사이다형',
      badge: '걸크러시 · 경제 지배',
      title: '시한부 악녀는 황태자의 청혼을 거절합니다',
      subtitle: '단두대 대신 황실 국채를 매입한 공녀의 생존기',
      penName: '은빛라일락',
      genreBreakdown: '로맨스판타지 50% · 악녀 생존 30% · 경제 암투 20%',
      targetEpisodes: 100,
      background: '에델가르드 제국 황궁과 대륙 최대의 마탑 상단 금융 연합',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 여주인공 시점 ('나' / 에밀리아 폰 카이저)",
      target: '20~30대 여성 독자 (걸크러시 & 후회남 클리셰 선호층)',
      serialization: '주 6회 월~토 연재 (카카오페이지 기다무 18:00)',
      logline: '단두대 처형을 3개월 앞둔 희대의 악녀로 빙의한 주인공이, 매달리던 황태자에게 파혼장을 던지고 제국 국채와 마탑 지분을 매입해 황실의 경제줄을 틀어쥐는 이야기.',
      sellingPoint: '후회남 황태자의 애원을 짓밟는 걸크러시 사이다 + 경제 암투로 제국 서열 1위에 오르는 짜릿한 성취감',
      personaId: 'solche'
    },
    {
      id: 'romfantasy-2',
      tabLabel: '추천 2: 흑막 괴물 대공 & 계약결혼 구원형',
      badge: '집착 대공 · 구원 서사',
      title: '괴물 대공의 계약 부인이 된 사정',
      subtitle: '이혼을 요구했더니 제국 전체를 바치겠다고 합니다',
      penName: '로즈마리',
      genreBreakdown: '로맨스판타지 60% · 계약결혼 25% · 후회/집착 15%',
      targetEpisodes: 100,
      background: '만년설이 덮인 북부 흑막 대공성과 타락한 황실 사교계',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 여주인공 시점 ('나' / 세레나)",
      target: '20~30대 여성 독자 (애절한 혐관 및 맹목적 순애 선호층)',
      serialization: '주 5회 월~금 연재 (리디/시리즈 18:00)',
      logline: '친가 가문의 학대에서 벗어나기 위해 피에 굶주린 괴물이라 불리는 북부 흑막 대공과 1년 시한부 계약결혼을 맺은 여주인공이, 대공의 피폐한 저주를 치료해주자 대공이 맹목적 집착남으로 돌변한다.',
      sellingPoint: '서로에게 유일한 구원이 되는 애절한 로맨스 + 여주를 짓밟던 친정 귀족들을 대공의 칼날로 쓸어버리는 사이다',
      personaId: 'solche'
    },
    {
      id: 'romfantasy-3',
      tabLabel: '추천 3: 마탑주 각성 & 제국 전복형',
      badge: '전설의 마탑주 · 황실 굴복',
      title: '버려진 황녀가 마탑의 주인이 될 때',
      subtitle: '황실의 핏줄 따위 내가 직접 끊어내마',
      penName: '아스트리드',
      genreBreakdown: '로맨스판타지 45% · 능력여주 35% · 제국 전복 20%',
      targetEpisodes: 100,
      background: '금기의 마법이 봉인된 대륙 최정상의 고대 에테르 마탑',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 여주인공 시점 ('나' / 엘레나)",
      target: '10~30대 독자 (주체적이고 압도적인 여주인공 선호층)',
      serialization: '주 6회 월~토 연재 (카카오/시리즈 19:00)',
      logline: '황위 계승 서열 최하위로 차가운 유폐탑에 갇혔던 황녀가 1000년 만에 전설의 고대 마탑주로 각성, 자신을 버린 황실과 귀족 원로원을 절대 마법으로 굴복시키는 장대한 복수극.',
      sellingPoint: '압도적인 마법 무력으로 모든 억압을 깨부수는 걸크러시 대서사시의 장엄함',
      personaId: 'solche'
    }
  ],
  wuxia: [
    {
      id: 'wuxia-1',
      tabLabel: '추천 1: 화산 환생 & 문파 부흥형',
      badge: '화산귀환 · 매화검결',
      title: '화산파 망나니 장로의 귀환',
      subtitle: '300년 전 대장로가 매화검결을 복원할 때',
      penName: '청운검',
      genreBreakdown: '정통/신무협 60% · 환생 25% · 문파 부흥 15%',
      targetEpisodes: 100,
      background: '천마와의 대전쟁 후 300년이 흐른 화음현 화산파의 폐허',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 청명호)",
      target: '전 연령대 무협 팬 (문파 애착 및 호쾌한 검도 선호층)',
      serialization: '주 7회 성실 연재 (문피아/시리즈 매일 19:00)',
      logline: '천마와의 결전에서 장렬히 전사했던 화산파의 전설적 대장로가 300년 뒤 몰락 직전의 화산파 망나니 3대 제자로 환생하여, 실전된 24수 매화검결을 복원하고 천하제일문파로 재건한다.',
      sellingPoint: '화산파 매화검결의 완벽 복원 + 사형제들을 굴리는 츤데레 대장로의 통쾌한 참교육 사이다',
      personaId: 'biga'
    },
    {
      id: 'wuxia-2',
      tabLabel: '추천 2: 마교 소교주 & 정파 잠입형',
      badge: '마존 은둔 · 착각계 무림',
      title: '마존(魔尊)은 무림맹 서고에 은둔한다',
      subtitle: '낮에는 하급 서생, 밤에는 천하의 지배자',
      penName: '흑월야',
      genreBreakdown: '퓨전무협 55% · 은둔고수 30% · 정파풍자 15%',
      targetEpisodes: 100,
      background: '정파의 심장부 무림맹 장서각 지하 밀실과 십만대산',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 단우혁)",
      target: '20~40대 남성 독자 (서늘하고 압도적인 마도 패기 선호층)',
      serialization: '주 6회 월~토 연재 (카카오/문피아 18:00)',
      logline: '마교 최강의 패왕이 심마를 극복하기 위해 신분을 숨기고 무림맹 장서각의 하급 서생으로 취직했으나, 정파의 장로들이 찾아와 가르침을 구하며 무림의 서열이 거꾸로 뒤흔들린다.',
      sellingPoint: '정체를 숨긴 절대 고수의 착각계 쾌감 + 위선적인 정파 원로들을 손가락 하나로 제압하는 사이다',
      personaId: 'hanjungwolya'
    },
    {
      id: 'wuxia-3',
      tabLabel: '추천 3: 나노 머신 융합 퓨전 무협형',
      badge: '나노머신 · 기혈 3D 분석',
      title: '천마 신공 대신 나노머신을 이식했다',
      subtitle: '내 단전은 초전도체 양자 컴퓨터',
      penName: '메탈블레이드',
      genreBreakdown: '퓨전무협 60% · SF 나노테크 25% · 사이다 무쌍 15%',
      targetEpisodes: 100,
      background: '음모와 암투가 난무하는 마교 본산 서혈궁과 무림맹 전선',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 천여운)",
      target: '10~30대 독자 (과학적 초식 분석과 즉각 처단 사이다 선호층)',
      serialization: '주 7회 성실 연재 (시리즈/카카오 20:00)',
      logline: '기혈이 뒤틀려 무공을 익히지 못하던 마교의 버림받은 서자가 미래에서 온 7세대 나노머신 AI를 척추에 이식받고, 혈도와 기의 흐름을 3D 시뮬레이션으로 분석해 무적의 초식을 창안한다.',
      sellingPoint: '테크놀로지와 정통 무협의 완벽한 융합 + 0.001초 단위로 적의 초식을 파훼하는 압도적 무쌍',
      personaId: 'hanjungwolya'
    }
  ],
  fantasy: [
    {
      id: 'fantasy-1',
      tabLabel: '추천 1: 백수 지망 & 영웅 착각형',
      badge: '착각계 · 과잉 충성',
      title: '망나니 영주는 편히 쉬고 싶을 뿐이다',
      subtitle: '잠 좀 자려 했더니 제국의 대영웅으로 추앙받습니다',
      penName: '낮잠요정',
      genreBreakdown: '정통판타지 50% · 착각계 30% · 힐링 사이다 20%',
      targetEpisodes: 100,
      background: '괴수들이 출몰하는 변방의 척박한 헤니투스 백작령 영지',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 케일)",
      target: '10~30대 남녀 독자 (힐링, 따뜻한 동료애, 유머 선호층)',
      serialization: '주 6회 월~토 연재 (카카오/문피아 18:00)',
      logline: '전생의 과로사를 피하기 위해 망나니 짓을 하며 쫓겨나 변방 영지에서 평생 백수로 살려던 주인공이, 대충 던진 말과 행동이 모두 기적의 전략이 되어 제국을 구원해버린다.',
      sellingPoint: '본인은 백수를 원하지만 주변인들의 눈물겨운 과잉 충성 + 빵 터지는 착각계 유머와 훈훈한 힐링',
      personaId: 'yuryeohan'
    },
    {
      id: 'fantasy-2',
      tabLabel: '추천 2: 신수 사육 & 힐링 농장형',
      badge: '신수 육성 · 슬로우 라이프',
      title: '신수들이 자꾸 제 농장으로 탈출합니다',
      subtitle: '드래곤은 밭갈이에 딱 좋습니다',
      penName: '초록농부',
      genreBreakdown: '퓨전판타지 55% · 힐링 육성 30% · 사이다 15%',
      targetEpisodes: 100,
      background: '대륙 최남단 평화로운 숲속에 위치한 신비한 마법 약초 농장',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 유준)",
      target: '전 연령대 독자 (귀여운 동물과 평화로운 힐링 선호층)',
      serialization: '주 5회 월~금 연재 (카카오페이지 기다무 18:00)',
      logline: '황실의 맹수 조련사였던 주인공이 시골에서 작은 약초 농장을 차렸는데, 멸종된 줄 알았던 고대 드래곤과 불사조 새끼들이 찾아와 눌러앉으며 농사일을 돕기 시작한다.',
      sellingPoint: '귀여운 신수들의 힐링 케미 + 농장을 건드리려는 악덕 영주들을 새끼 드래곤이 브레스로 응징하는 사이다',
      personaId: 'yuryeohan'
    },
    {
      id: 'fantasy-3',
      tabLabel: '추천 3: 아카데미 숨은 먼치킨 조교형',
      badge: '아카데미 · 칼퇴 기원',
      title: '퇴근하고 싶은 S급 아카데미 조교',
      subtitle: '내 정체를 알면 교장도 무릎을 꿇는다',
      penName: '칼퇴기원',
      genreBreakdown: '학원판타지 60% · 먼치킨 25% · 착각계 15%',
      targetEpisodes: 100,
      background: '제국 제일의 영재들이 모인 엘리트 로열 마법 아카데미',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 펠릭스)",
      target: '10~20대 독자 (아카데미물 및 츤데레 스승 캐릭터 선호층)',
      serialization: '주 6회 월~토 연재 (시리즈/문피아 19:00)',
      logline: '마왕을 토벌하고 은퇴한 전설의 용사가 제국 마법 아카데미의 말단 조교로 신분을 속이고 조용히 살려 하지만, 사고뭉치 천재 학생들이 자꾸만 그를 시험에 들게 한다.',
      sellingPoint: '귀찮아하면서도 제자들을 단숨에 구원하는 츤데레 먼치킨 + 아카데미물의 낭만과 사이다',
      personaId: 'yuryeohan'
    }
  ],
  cyberpunk: [
    {
      id: 'cyberpunk-1',
      tabLabel: '추천 1: 0급 해커 & 뉴럴넷 혁명형',
      badge: '네오서울 · 사이버펑크',
      title: '네오서울 0급 해커는 인형들을 해방한다',
      subtitle: '사이보그 대기업의 뇌간을 장악한 유령',
      penName: '제로바이트',
      genreBreakdown: 'SF 사이버펑크 60% · 테크 스릴러 25% · 혁명 15%',
      targetEpisodes: 100,
      background: '2099년 거대 네온사인과 지하 슬럼이 공존하는 메가시티 네오서울',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / K-09)",
      target: '20~40대 SF 독자 (스타일리시한 하이테크 액션 선호층)',
      serialization: '주 5회 월~금 연재 (문피아/시리즈 19:00)',
      logline: '기억을 거세당한 채 폐기 처분될 뻔한 하급 해커가 네오서울 지하에서 고대 AI 코어를 이식받고, 도시를 지배하는 4대 메가코퍼레이션의 중앙 뉴럴넷을 해킹하여 뒤집어엎는다.',
      sellingPoint: '하이테크 해킹 배틀 + 사이버펑크 네오서울의 디스토피아 혁명 카타르시스',
      personaId: 'custom_voice'
    },
    {
      id: 'cyberpunk-2',
      tabLabel: '추천 2: 멸망 후 쉘터 관리자형',
      badge: '아포칼립스 · 자원 독점',
      title: '아포칼립스 마지막 벙커의 관리자',
      subtitle: '바깥 세상은 지옥이어도 여긴 최고급 호텔입니다',
      penName: '벙커킹',
      genreBreakdown: '아포칼립스 60% · 생존 경영 25% · 사이다 15%',
      targetEpisodes: 100,
      background: '돌연변이 바이러스로 황폐화된 지상 100m 아래의 첨단 핵벙커',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 박민호)",
      target: '20~30대 남성 독자 (생존 쉘터 확장 및 자원 독점 선호층)',
      serialization: '주 6회 월~토 연재 (카카오/문피아 18:00)',
      logline: '외계 침공과 바이러스로 인류 문명이 멸망한 날, 우연히 자급자족 1급 군사 쉘터의 총관리 권한을 얻은 주인공이 생존자들을 선별 수용하며 지상 최고의 요새를 구축한다.',
      sellingPoint: '절망적인 아포칼립스 속 풍족한 자원 독점의 쾌감 + 기지 업그레이드 성장 카타르시스',
      personaId: 'custom_voice'
    },
    {
      id: 'cyberpunk-3',
      tabLabel: '추천 3: 폐기된 전투 병기의 반격형',
      badge: '사이보그 복수 · 중화기 액션',
      title: '강제 종료된 전쟁 병기가 눈을 떴다',
      subtitle: '나를 버린 기업들에게 죽음을 반환한다',
      penName: '티타늄',
      genreBreakdown: 'SF 액션 65% · 복수극 25% · 하드보일드 10%',
      targetEpisodes: 100,
      background: '폐기물 처리장 제7구역과 메가코프 군사복합체 타워',
      scale: '100화 완결 (4막 6아크 24챕터)',
      pov: "1인칭 주인공 시점 ('나' / 유닛 734)",
      target: '20~40대 독자 (거침없는 메카닉 하드보일드 액션 선호층)',
      serialization: '주 5회 월~금 연재 (시리즈 독점 19:00)',
      logline: '폐기물 처리장에 버려졌던 전설의 군용 사이보그 코어에 현대 프로그래머의 영혼이 깃들어, 자신을 소모품으로 버린 메가코프의 사설 군대를 하나씩 해체해 나간다.',
      sellingPoint: '압도적인 중화기와 티타늄 신체의 시각적 액션 + 복수 대상들을 철저히 무너뜨리는 냉혹한 사이다',
      personaId: 'custom_voice'
    }
  ]
};

export const NewProjectPage: React.FC<NewProjectPageProps> = ({
  onCreateProject,
  onCancel,
}) => {
  // Wizard Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 1. Step 1: Selected Genre (FIRST THING)
  const [selectedGenreKey, setSelectedGenreKey] = useState<GenreKey>('chaebol');

  // 2. Step 1: Keywords Management
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['#지분전쟁', '#가짜혈통', '#사이다복수']);
  const [customKeywordInput, setCustomKeywordInput] = useState<string>('');

  // 2.5 Step 1: 스토리라인 기본 소스 3대 탭 (직접입력, 파일업로드, URL링크)
  const [storySourceTab, setStorySourceTab] = useState<'text' | 'upload' | 'url'>('text');
  const [rawStoryText, setRawStoryText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('');
  const [referenceUrl, setReferenceUrl] = useState<string>('');

  // 2.6 Step 1: AI 추천 생성 여부 (추천 전: 기본 템플릿 3개 탭 / 추천 후: 키워드 맞춤 추천 3개 탭)
  const [hasGeneratedProposals, setHasGeneratedProposals] = useState<boolean>(false);

  // 2.7 Step 1: 2번 카드뷰 하단 div에 표시될 기본 스토리라인 요약 (AI 분석 및 장르 연계)
  const [storySummary, setStorySummary] = useState<string>(
    '재벌 가문의 억울한 희생양이었던 주인공이 10년 전으로 회귀하여, 미래 금융 지식과 지분 선점으로 적들을 하나씩 도산시키는 통쾌한 복수극.'
  );

  // 3. Step 1: AI Proposal Tabs (3 Tabs for that Genre)
  const [activeStep1ProposalIndex, setActiveStep1ProposalIndex] = useState<number>(0);
  const [isAiProposalOpen, setIsAiProposalOpen] = useState<boolean>(true);

  // Auto-fill Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic AI Proposals state (overrides static GENRE_PROPOSALS when AI generates)
  const [dynamicProposals, setDynamicProposals] = useState<Record<string, GenreProposal[]>>({});

  // Editable Form Fields (Populated by selected tab, editable)
  const currentProposals = dynamicProposals[selectedGenreKey] || GENRE_PROPOSALS[selectedGenreKey] || GENRE_PROPOSALS.chaebol;
  const initialProposal = currentProposals[activeStep1ProposalIndex] || currentProposals[0];

  const [title, setTitle] = useState(initialProposal.title);
  const [subtitle, setSubtitle] = useState(initialProposal.subtitle);
  const [penName, setPenName] = useState(initialProposal.penName);
  const [genreBreakdown, setGenreBreakdown] = useState(initialProposal.genreBreakdown);
  const [targetEpisodes, setTargetEpisodes] = useState(initialProposal.targetEpisodes);
  const [background, setBackground] = useState(initialProposal.background);
  const [scale, setScale] = useState(initialProposal.scale);
  const [pov, setPov] = useState(initialProposal.pov);
  const [target, setTarget] = useState(initialProposal.target);
  const [serialization, setSerialization] = useState(initialProposal.serialization);
  const [logline, setLogline] = useState(initialProposal.logline);
  const [sellingPoint, setSellingPoint] = useState(initialProposal.sellingPoint);

  // Step 2: Worldbuilding Fields
  const [worldThesis, setWorldThesis] = useState('상위 0.01% 자본 카르텔과 제도권 권력의 결탁. 돈과 지분 앞에서는 친족의 목숨조차 교환 가치로 환산되는 냉혈한 정글.');
  const [specialRules, setSpecialRules] = useState('직계 상속 15% 신탁 조항: 만 25세 생존 및 친자 확인 시 즉시 발동. 암호 일기의 6가지 해독 프로토콜.');
  const [factionDynamics, setFactionDynamics] = useState('태성그룹 총수파 vs 후계 야욕의 차남 연합 vs 서초동 법조 카르텔 vs 주인공과 언론 내부고발자의 비밀 연대.');
  const [keyArtifacts, setKeyArtifacts] = useState('동생의 암호 일기장, 15% 의결권 신탁 증서, 불법 승계 녹취 파일, VVIP 밀실 금고 열쇠');

  // Step 3: Character Ensemble Fields
  const [protagonistName, setProtagonistName] = useState('서이안 (26세 / 위장명 서이현)');
  const [protagonistRole, setProtagonistRole] = useState('주인공 / 위장 신분의 지략가');
  const [protagonistLack, setProtagonistLack] = useState('동생을 지키지 못했다는 자책감과 빈털터리 계약직의 한계');
  const [protagonistCheat, setProtagonistCheat] = useState('동생이 목숨 걸고 남긴 6편의 암호 일기와 냉철한 수치 계산 능력');
  const [protagonistQuote, setProtagonistQuote] = useState('"네가 빼앗은 건 내 동생의 목숨만이 아니야. 이 집안 전체지."');

  const [companionName, setCompanionName] = useState('강태우 (32세 / 로펌 진명의 반골 변호사)');
  const [companionRole, setCompanionRole] = useState('핵심 조력자 / 법률 방패');
  const [companionSecret, setCompanionSecret] = useState('과거 주인공 동생의 공익 제보를 접수했으나 외압으로 묵살당했던 부채감 보유.');

  const [antagonistName, setAntagonistName] = useState('서진우 (38세 / 태성물산 부사장)');
  const [antagonistRole, setAntagonistRole] = useState('메인 빌런 / 가문 후계 주동자');
  const [antagonistSecret, setAntagonistSecret] = useState('동생 사망 사건의 실질적 교사자이자 3년 전 페이퍼컴퍼니 비자금 세탁 장부 보유.');

  const [rivalName, setRivalName] = useState('서채린 (24세 / 사교계의 여왕이자 차녀)');
  const [rivalRole, setRivalRole] = useState('라이벌 / 내부 의심자');
  const [rivalSecret, setRivalSecret] = useState('위장 입성한 주인공의 눈빛과 제스처에서 가짜임을 직감하고 뒷조사 착수.');

  // Step 4: 1~4 Act Fields
  const [act1Text, setAct1Text] = useState('1막 (기 / 01~25화) 발단 및 위장 입성: 일상 파괴 → 암호 일기 1편 해독 → 가짜 막내손녀로 재벌가 입성 → 17화 1차 전환점(친자 유전자 검사 인정 & 지분 3% 획득).');
  const [act2Text, setAct2Text] = useState('2막 (승 / 26~50화) 갈등 심화 & 세력 장악: 30화 무료 독자 록인 사이다 폭로 → 차남파의 역공 격퇴 → 50화 미드포인트 반전(차남의 완벽했던 알리바이 분쇄 & 지분 5% 추가 장악).');
  const [act3Text, setAct3Text] = useState('3막 (전 / 51~75화) 위기 절정 & 정체 발각 위기: 진짜 막내손녀의 유골 단서 조작 위기 → 67화 정체 탄핵 주총 개최 → 조력자의 목숨 건 비자금 증거 확보 → 75화 회장 쓰러짐.');
  const [act4Text, setAct4Text] = useState('4막 (결 / 76~100화) 총력전 & 대단원 완결: 84화 주총 표 대결 → 95화 클라이맥스(생중계 폭로 & 빌런 구속, "내 진짜 이름은 서이안이다" 선언) → 100화 동생 명예 회복과 새로운 회장 취임.');

  const [cliffhanger1, setCliffhanger1] = useState('01화: 동생의 장례식 날 도착한 의문의 암호 일기');
  const [cliffhanger17, setCliffhanger17] = useState('17화: 1막 전환점 "네 말이 맞다" 인정받고 유전자 검사 통과');
  const [cliffhanger33, setCliffhanger33] = useState('33화: 2막 아크 완결 — 태성그룹 후계 구도 공식 참여 선언');
  const [cliffhanger50, setCliffhanger50] = useState('50화: 2막 미드포인트 반전 — 차남의 완벽했던 알리바이 분쇄');
  const [cliffhanger67, setCliffhanger67] = useState('67화: 3막 위기 — 주인공의 진짜 지문 감식 결과 발표 직전 정전');
  const [cliffhanger95, setCliffhanger95] = useState('95화: 4막 절정 — 주주총회 마이크를 쥐고 실명 선언');

  // Step 5: Persona Selection & Category Filter
  const [selectedPersonaCategory, setSelectedPersonaCategory] = useState<PersonaCategoryKey>('all');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('sankyeong');

  // Progress Bar State between Card 1 and Card 2
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isCard3Generating, setIsCard3Generating] = useState<boolean>(false);

  const getActiveLlmDisplay = () => {
    try {
      const saved = localStorage.getItem('webnovel_ai_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const prov = parsed.activeProvider || 'gemini';
        const model = parsed[prov]?.model || '3.8 Flash';
        return `${prov.toUpperCase()} · ${model.split('-')[0]}`;
      }
    } catch {}
    return 'GEMINI · 3.8 Flash';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedFileContent(content || '');
      showToast(`📁 [${file.name}] 파일 내용이 성공적으로 로드되었습니다 (${(content?.length || 0).toLocaleString()}자)`);
    };
    reader.readAsText(file);
  };

  const handleRunAiRecommendation = async () => {
    if (isAiGenerating) return;
    setIsAiGenerating(true);
    setProgressPercent(20);

    const genreOpt = GENRE_OPTIONS.find((g) => g.key === selectedGenreKey) || GENRE_OPTIONS[0];
    const initialKws = selectedKeywords.length > 0 ? selectedKeywords : genreOpt.keywords.slice(0, 3);

    // Source context from 3 tabs
    const sourceContext = storySourceTab === 'text'
      ? rawStoryText.trim()
      : storySourceTab === 'upload'
        ? uploadedFileContent.trim()
        : '';
    const sourceUrl = storySourceTab === 'url' ? referenceUrl.trim() : '';

    // Stepwise smooth progress interval
    const intervalId = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
    }, 120);

    const credentials = getActiveAiCredentials();
    const result = await requestAi<any>('/api/ai/generate-proposals', {
      genreKey: selectedGenreKey,
      genreLabel: genreOpt.label,
      keywords: initialKws,
      sourceContext,
      sourceUrl,
      provider: credentials.provider,
      apiKey: credentials.apiKey,
      model: credentials.model,
    });
    clearInterval(intervalId);

    if (result.ok && Array.isArray(result.data.proposals) && result.data.proposals.length > 0) {
      const data = result.data;

      // 2번 카드뷰 하단 스토리라인 요약 자동 반영
      if (data.storySummary) {
        setStorySummary(data.storySummary);
      }

      // 2번 카드뷰 키워드 자동 등록
      if (Array.isArray(data.keywords) && data.keywords.length > 0) {
        setSelectedKeywords(data.keywords);
      } else if (selectedKeywords.length === 0) {
        setSelectedKeywords(initialKws);
      }

      setDynamicProposals((prev) => ({ ...prev, [selectedGenreKey]: data.proposals }));
      setActiveStep1ProposalIndex(0);
      applyProposal(data.proposals[0], data.keywords || initialKws);
      setHasGeneratedProposals(true);

      setProgressPercent(100);
      await new Promise((r) => setTimeout(r, 200));
      setIsAiGenerating(false);
      setProgressPercent(0);
      showToast(
        `✨ [${credentials.provider.toUpperCase()} · ${describeModel(data, credentials.model)}] 분석 완료: 스토리라인 요약과 키워드, 맞춤 기획안 3개가 생성되었습니다.`
      );
      return;
    }

    const failReason = result.ok ? 'AI가 기획안을 반환하지 않았습니다.' : result.error;
    // Reliable fallback path: guarantees completion without ever getting stuck
    const proposals = GENRE_PROPOSALS[selectedGenreKey] || GENRE_PROPOSALS.chaebol;
    setDynamicProposals((prev) => ({ ...prev, [selectedGenreKey]: proposals }));
    if (sourceContext) {
      setStorySummary(`[작가 입력 소스 요약] ${sourceContext.slice(0, 180)}...`);
    } else if (proposals && proposals[0]) {
      setStorySummary(proposals[0].logline);
    }
    if (selectedKeywords.length === 0) {
      setSelectedKeywords(genreOpt.keywords.slice(0, 4));
    }
    setHasGeneratedProposals(true);
    if (proposals && proposals[0]) {
      applyProposal(proposals[0]);
    }
    setProgressPercent(100);
    await new Promise((r) => setTimeout(r, 200));
    setIsAiGenerating(false);
    setProgressPercent(0);
    showToast(`⚠️ AI 호출 실패 (${failReason}). 표시된 3개는 AI 결과가 아닌 [${genreOpt.label.split('(')[0].trim()}] 기본 템플릿 예시입니다.`);
  };

  // When Genre changes in Step 1:
  const handleSelectGenre = (genreKey: GenreKey) => {
    setSelectedGenreKey(genreKey);
    const initialProps = GENRE_PROPOSALS[genreKey] || GENRE_PROPOSALS.chaebol;
    if (initialProps && initialProps[0]) {
      setStorySummary(initialProps[0].logline);
    }
    // Auto-align persona category for step 3 without shifting layout
    if (genreKey === 'chaebol') setSelectedPersonaCategory('chaebol');
    else if (genreKey === 'hunter') setSelectedPersonaCategory('hunter');
    else if (genreKey === 'romfantasy') setSelectedPersonaCategory('romfantasy');
    else if (genreKey === 'wuxia') setSelectedPersonaCategory('wuxia');
    else if (genreKey === 'fantasy') setSelectedPersonaCategory('fantasy');
    else setSelectedPersonaCategory('all');
  };

  // Toggle keyword from recommendations
  const handleToggleKeyword = (kw: string) => {
    let next: string[];
    if (selectedKeywords.includes(kw)) {
      next = selectedKeywords.filter((k) => k !== kw);
    } else {
      next = [...selectedKeywords, kw];
    }
    setSelectedKeywords(next);
  };

  // Add custom keyword
  const handleAddCustomKeyword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customKeywordInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!selectedKeywords.includes(formatted)) {
      setSelectedKeywords([...selectedKeywords, formatted]);
    }
    setCustomKeywordInput('');
  };

  // Apply a proposal to the form fields
  const applyProposal = (proposal: GenreProposal, keywordsList: string[] = selectedKeywords) => {
    // If keywords exist, we can blend them into the subtitle/selling point or title
    setTitle(proposal.title);
    setSubtitle(proposal.subtitle);
    setPenName(proposal.penName);
    setGenreBreakdown(proposal.genreBreakdown);
    setTargetEpisodes(proposal.targetEpisodes);
    setBackground(proposal.background);
    setScale(proposal.scale);
    setPov(proposal.pov);
    setTarget(proposal.target);
    setSerialization(proposal.serialization);
    setLogline(proposal.logline);
    setSellingPoint(proposal.sellingPoint);
    setSelectedPersonaId(proposal.personaId);

    // Dynamically adjust step 2 worldbuilding and step 3 characters based on genre proposal
    if (selectedGenreKey === 'hunter') {
      setWorldThesis('게이트 붕괴로 몬스터와 성좌가 공존하는 현대 아포칼립스. 기득권 랭커 길드가 마정석 자원과 성좌의 가호를 독점하고 하위 헌터를 착취하는 세계.');
      setSpecialRules('성좌 계약의 절대 구속력: 계약 위반 시 영혼 소멸. 게이트 브레이크 타임리밋 72시간. 랭커 제압 시 고유 스킬 1개 강제 귀속 룰.');
      setFactionDynamics('중앙 랭커 길드 연합회 vs 암시장 불법 용병단 vs 태고 성좌의 비밀 결사대 vs 주인공의 1인 군단.');
      setKeyArtifacts('태고 성좌의 봉인구, S급 마정석 코어, 랭커 계약 각서, 절대 명령의 낙인');
      setProtagonistName('강태산 (24세 / F급 짐꾼 → 성좌 대행자)');
      setProtagonistRole('주인공 / 절대 성좌의 조련사');
      setProtagonistLack('10년간 최하위 짐꾼으로 착취당하며 굳어진 생존 트라우마');
      setProtagonistCheat('태고 성좌 「영원의 침묵」과의 절대 계약 및 랭커 길들이기 권능');
      setProtagonistQuote('"이제부터 내가 룰을 정한다. 꿇어라."');
      setCompanionName('윤세아 (25세 / 천재 연금술사)');
      setAntagonistName('천도진 (42세 / 랭커 길드 천공 총수)');
      setRivalName('백승혁 (27세 / S급 최연소 검성)');
    } else if (selectedGenreKey === 'romfantasy') {
      setWorldThesis('겉으로는 우아한 귀족주의와 사교계의 낭만이 흐르지만, 이면에는 막대한 국가 부채와 마탑의 독점 자본으로 인해 언제든 파탄 날 수 있는 모래성 제국.');
      setSpecialRules('황실 부채 상환 만기 90일: 기한 내 미변제 시 국고 징발권 발동. 마도 계약의 영혼 담보 조항. 사교계 파문 시 모든 재산 동결 법안.');
      setFactionDynamics('황태자 직속 근위대 vs 대륙 최대 부호 카이저 공작가 vs 마탑 금융 연합 vs 주인공의 독점 상단.');
      setKeyArtifacts('제국 황실 국채 증서, 마탑의 0호 금고 증서, 파혼 각서 원본, 진실을 비추는 마도 거울');
      setProtagonistName('에밀리아 폰 카이저 (22세 / 공작가 영애)');
      setProtagonistRole('주인공 / 제국 경제를 쥔 악녀');
      setProtagonistLack('단두대 처형까지 남은 3개월의 시한부 운명');
      setProtagonistCheat('현대 거시경제학 지식과 공작가 마탑 지분 20%의 상속권');
      setProtagonistQuote('"청혼? 미안하지만 전 빚쟁이 황태자님을 부양할 생각이 없어요."');
      setCompanionName('카시안 (28세 / 그림자 정보길드 마스터)');
      setAntagonistName('에드워드 (25세 / 에델가르드 황태자)');
      setRivalName('비올레타 (20세 / 신전의 성녀)');
    } else if (selectedGenreKey === 'wuxia') {
      setWorldThesis('약육강식이 지배하는 중원 무림. 천마와의 대전쟁 이후 구파일방은 기득권 유지에 급급하고, 몰락한 문파들은 멸문지화를 겪는 난세.');
      setSpecialRules('문파 간 생사결(生死決) 룰: 패배 문파는 무공 비급과 영지를 승자에게 헌납. 실전된 매화검결의 24초식 심법.');
      setFactionDynamics('무림맹 원로원 vs 사파 연합 사도련 vs 마교 잔당 혈천교 vs 화산파 재건 연대.');
      setKeyArtifacts('실전된 24수 매화검결 진본 비급, 화산파 장문인 옥인, 천마의 흑철검 파편, 자하신공 구결');
      setProtagonistName('청명호 (화산파 3대 제자로 환생한 300년 전 대장로)');
      setProtagonistRole('주인공 / 화산파의 구원자이자 츤데레 스승');
      setProtagonistLack('과거 천마와의 결전에서 사형제들을 지키지 못했다는 뼈아픈 한');
      setProtagonistCheat('300년 전 천하제일고수의 무학 지식과 매화검결의 완벽한 심법');
      setProtagonistQuote('"이 썩을 놈들아! 대가리 딱 대라!"');
      setCompanionName('백현 (화산파 2대 제자 수석 / 우직한 조력자)');
      setAntagonistName('단리천 (종남파 장문인 / 화산파 영지를 빼앗으려는 흑막)');
      setRivalName('진금룡 (종남파 최연소 천재 검수)');
    } else if (selectedGenreKey === 'fantasy') {
      setWorldThesis('마왕 토벌 이후 제국은 번영을 구가하지만, 귀족들의 권력 투쟁과 신수/괴수 출몰로 변방 영지들은 방치된 상태.');
      setSpecialRules('고대 드래곤 계약 규약: 신수를 길들이는 자에게 대지의 마나가 무한 공급됨. 영지 자치법상 황실 간섭 불가 조항.');
      setFactionDynamics('황실 근위 마법사단 vs 대륙 3대 상단 연합 vs 변방 자치 영지 연맹 vs 주인공의 힐링 농장.');
      setKeyArtifacts('고대 드래곤의 알, 황금 마나 나침반, 백수 계약서 원본, 만병통치 세계수 잎사귀');
      setProtagonistName('케일 (23세 / 망나니 영주이자 백수 지망생)');
      setProtagonistRole('주인공 / 눕고 싶은 천재 지략가');
      setProtagonistLack('전생의 극심한 과로사 트라우마로 인한 만성 피로와 안식 갈망');
      setProtagonistCheat('대충 던진 말도 신의 한 수가 되는 초월적 전략 혜안과 신수 친화력');
      setProtagonistQuote('"내 목표는 오직 하나다. 뒹굴거리며 백수로 사는 것."');
      setCompanionName('로온 (새끼 드래곤 / 든든한 무력 조력자)');
      setAntagonistName('베로니카 공작 (황위를 노리는 제국 제1권력자)');
      setRivalName('테오도르 (아카데미 수석이자 과잉 충성 기사)');
    } else if (selectedGenreKey === 'cyberpunk') {
      setWorldThesis('거대 메가코퍼레이션 4사가 인류의 뇌에 칩을 심어 생체 데이터와 감정을 통제하는 2099년 네오서울의 디스토피아.');
      setSpecialRules('0급 해킹 룰: 뉴럴 링크 접속 시 뇌 손상 위험 감수. 오프라인 블랙마켓 화폐 바이트 코인 통용.');
      setFactionDynamics('신한 바이오텍 & 삼진 뉴럴넷 vs 네오서울 슬럼 레지스탕스 vs 고대 AI 숭배 결사 vs 주인공의 해커 크루.');
      setKeyArtifacts('고대 제로데이 해킹 툴킷, 나노 사이보그 코어, 4대 기업 비자금 뉴럴 키, 해방 암호문');
      setProtagonistName('K-09 (25세 / 0급 천재 해커)');
      setProtagonistRole('주인공 / 디스토피아를 뒤엎는 사이버 유령');
      setProtagonistLack('기업에 의해 강제 삭제된 어린 시절의 가족 기억');
      setProtagonistCheat('네오서울 전체 뉴럴넷의 방화벽을 0.1초 만에 무력화하는 고대 AI 코어');
      setProtagonistQuote('"숫자와 코드는 거짓말을 하지 않아. 지옥을 보여주마."');
      setCompanionName('아이리스 (사이보그 저격수 / 레지스탕스 간부)');
      setAntagonistName('정태준 회장 (삼진 뉴럴넷 총수 / 인류 뇌 장악 주동자)');
      setRivalName('바이퍼 (기업 최고 사설 암살 요원)');
    }
  };

  // Select a Proposal Tab in Step 1
  const handleSelectProposalTab = (index: number) => {
    setActiveStep1ProposalIndex(index);
    const p = currentProposals[index];
    if (p) {
      applyProposal(p);
      showToast(`✨ [${p.tabLabel}] 기획안이 선택되었습니다. 아래 항목들이 자동 입력되었으며 자유롭게 수정할 수 있습니다.`);
    }
  };

  // Re-run AI Recommendation with current selected keywords (Card 3)
  const handleGenerateAiWithKeywords = async () => {
    if (isCard3Generating) return;
    setIsCard3Generating(true);
    setIsAiProposalOpen(true);

    const genreOpt = GENRE_OPTIONS.find((g) => g.key === selectedGenreKey) || GENRE_OPTIONS[0];
    const sourceContext = storySourceTab === 'text'
      ? rawStoryText.trim()
      : storySourceTab === 'upload'
        ? uploadedFileContent.trim()
        : '';
    const sourceUrl = storySourceTab === 'url' ? referenceUrl.trim() : '';

    const credentials = getActiveAiCredentials();
    const result = await requestAi<any>('/api/ai/generate-proposals', {
      genreKey: selectedGenreKey,
      genreLabel: genreOpt.label,
      keywords: selectedKeywords,
      sourceContext,
      sourceUrl,
      provider: credentials.provider,
      apiKey: credentials.apiKey,
      model: credentials.model,
    });
    setIsCard3Generating(false);

    if (result.ok && Array.isArray(result.data.proposals) && result.data.proposals.length > 0) {
      setDynamicProposals((prev) => ({ ...prev, [selectedGenreKey]: result.data.proposals }));
      setHasGeneratedProposals(true);
      setActiveStep1ProposalIndex(0);
      applyProposal(result.data.proposals[0], selectedKeywords);
      showToast(`✨ 선택 키워드 [${selectedKeywords.join(', ')}] 기반으로 AI 기획안 3개가 생성되었습니다. (${describeModel(result.data, credentials.model)})`);
      return;
    }

    const failReason = result.ok ? 'AI가 기획안을 반환하지 않았습니다.' : result.error;
    // Fallback if error or timeout
    const proposals = GENRE_PROPOSALS[selectedGenreKey] || GENRE_PROPOSALS.chaebol;
    setDynamicProposals((prev) => ({ ...prev, [selectedGenreKey]: proposals }));
    setHasGeneratedProposals(true);
    const p = proposals[0];
    setActiveStep1ProposalIndex(0);
    applyProposal(p, selectedKeywords);
    showToast(`⚠️ AI 호출 실패 (${failReason}). 표시된 3개는 AI 결과가 아닌 기본 템플릿 예시입니다.`);
  };

  // Final Submission
  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const templateBase = (selectedGenreKey === 'cyberpunk' ? 'custom' : selectedGenreKey === 'fantasy' ? 'custom' : selectedGenreKey) as any;
    const newProject = createProjectFromTemplate(templateBase, {
      title,
      subtitle,
      penName,
      genre: genreBreakdown,
      logline,
      targetEpisodes: targetEpisodes || 100,
    });

    // Custom Spec Overrides
    newProject.background = background;
    newProject.scale = scale;
    newProject.pov = pov;
    newProject.target = target;
    newProject.serialization = serialization;

    // Core Concept Overrides
    if (newProject.coreConcept) {
      newProject.coreConcept.logline = logline;
      newProject.coreConcept.theme = worldThesis;
      newProject.coreConcept.emotionalGoal = sellingPoint;
      newProject.coreConcept.differentiators = [
        `주인공 특수 능력: ${protagonistCheat}`,
        `핵심 키워드: ${selectedKeywords.join(', ')}`,
        `작가 페르소나 스타일: ${selectedPersona.name} (${selectedPersona.masterpiece})`
      ];
      newProject.coreConcept.devices = keyArtifacts.split(',').map((s) => s.trim()).filter(Boolean);
      newProject.coreConcept.climaxEnding = `95화 클라이맥스: ${cliffhanger95}`;
    }

    // Characters Overrides
    newProject.characters = [
      {
        id: `c-${newProject.id}-1`,
        name: protagonistName,
        alias: '서사의 주도자',
        role: protagonistRole,
        description: `결핍: ${protagonistLack} | 치트: ${protagonistCheat} | 대표 대사: ${protagonistQuote}`,
        habits: '긴장하거나 결단할 때 특유의 침착한 호흡을 유지함.',
        secret: '아직 대외적으로 밝혀지지 않은 치명적 과거와 비밀 목적.',
        arcTrajectory: '1막 위장 입성/각성 → 2막 세력 장악 → 3막 정체 위기 극복 → 4막 최종 심판 및 승리'
      },
      {
        id: `c-${newProject.id}-2`,
        name: companionName,
        alias: '핵심 파트너',
        role: companionRole,
        description: '주인공의 부족한 자원을 보완해 줄 핵심 조력자.',
        habits: '사건의 핵심 증거를 수집할 때 메모를 남김.',
        secret: companionSecret,
        arcTrajectory: '1막 의혹 탐색 → 2막 동맹 체결 → 3막 희생적 위기 지원 → 4막 공동 승리'
      },
      {
        id: `c-${newProject.id}-3`,
        name: antagonistName,
        alias: '권력의 정점',
        role: antagonistRole,
        description: '주인공이 타도해야 할 메인 빌런이자 부조리의 배후 주동자.',
        habits: '상대를 제압할 때 서늘한 미소를 유지함.',
        secret: antagonistSecret,
        arcTrajectory: '1막 절대 군림 → 2막 균열 발생 → 3막 총력 반격 → 4막 파멸 및 단죄'
      },
      {
        id: `c-${newProject.id}-4`,
        name: rivalName,
        alias: '변수의 핵심',
        role: rivalRole,
        description: '주인공을 견제하거나 상황을 뒤흔드는 복병/라이벌.',
        habits: '상황을 관망하며 결정적인 순간에만 개입함.',
        secret: rivalSecret,
        arcTrajectory: '1막 경계 → 2막 대립 격화 → 3막 내부 교란 → 4막 결과 승복'
      }
    ];

    // Arcs Overrides
    newProject.arcs = [
      { id: 'arc01', title: '1막 (기): 발단 및 입성', chapters: 'ch01~06', act: '1막 (기)', episodes: '01~25화', done: 0, total: 25, status: '진행 중' },
      { id: 'arc02', title: '2막 (승): 갈등 심화 및 세력 확장', chapters: 'ch07~12', act: '2막 전반 (승)', episodes: '26~50화', done: 0, total: 25, status: '대기' },
      { id: 'arc03', title: '3막 (전): 위기 절정 및 정체 탄핵', chapters: 'ch13~18', act: '3막 (전)', episodes: '51~75화', done: 0, total: 25, status: '대기' },
      { id: 'arc04', title: '4막 (결): 총력전 및 대단원 완결', chapters: 'ch19~24', act: '4막 (결)', episodes: '76~100화', done: 0, total: 25, status: '대기' },
    ];

    onCreateProject(newProject);
  };

  const selectedPersona = FAMOUS_WRITER_PERSONAS.find((p) => p.id === selectedPersonaId) || FAMOUS_WRITER_PERSONAS[0];

  // Filtered Personas for Step 5
  const filteredPersonas = FAMOUS_WRITER_PERSONAS.filter((p) => {
    if (selectedPersonaCategory === 'all') return true;
    return p.category === selectedPersonaCategory;
  });

  const activeGenreOption = GENRE_OPTIONS.find((g) => g.key === selectedGenreKey) || GENRE_OPTIONS[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onCancel}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>대시보드로 돌아가기</span>
              </button>
              <span className="text-slate-500">/</span>
              <span className="text-blue-300 font-mono font-bold">새로운 웹소설 기획 및 작성</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <span>새로운 웹소설 기획 및 작성</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                4단계 공학적 AI 위저드
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong>1. 장르 & 스토리라인 소스</strong> → <strong>2. 키워드 & 줄거리 요약</strong> → <strong>3. 작가 페르소나</strong> → <strong>4. 3가지 맞춤 추천안</strong>을 거쳐 기획서를 완성하고, 세계관·캐릭터 설계 후 4단계에서 100화 완결 플롯을 완성합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              작성 취소
            </button>
          </div>
        </div>
      </div>

      {/* Floating Auto-fill Toast Notification (Fixed so it causes 0px layout shift) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/50 text-xs sm:text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 pointer-events-none backdrop-blur-md">
          <Sparkles className={`w-4 h-4 text-amber-300 shrink-0 ${isAiGenerating || isCard3Generating ? 'animate-spin' : ''}`} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 2. Stepper Header (4단계) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-center">
          {[
            { step: 1, label: '1단계: 기획 발상 & 맞춤 스토리라인' },
            { step: 2, label: '2단계: 세계관 & 규칙 (1단계 연계)' },
            { step: 3, label: '3단계: 캐릭터 바이블' },
            { step: 4, label: '4단계: 1~4막 스토리구조 & 최종 완성' },
          ].map((s) => {
            const isCurrent = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`py-3.5 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'border-blue-600 text-blue-600 bg-white font-extrabold shadow-xs'
                    : isDone
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono shrink-0 ${
                    isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.step}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.step}단계</span>
              </button>
            );
          })}
        </div>

        {/* 3. Wizard Content Body */}
        <form onSubmit={handleFinish} className="p-6 sm:p-8 space-y-6">
          
          {/* ========================================================================= */}
          {/* STEP 1: 기본계획서 & 장르선택 */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* SECTION A (1번 카드): 장르 선택 및 3대 스토리라인 소스 탭 */}
              <div className="space-y-4 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      웹소설 메인 장르 선택 & 기본 스토리라인 소스 제공
                    </h3>
                  </div>
                  <span className="text-xs text-blue-700 font-bold bg-blue-100/70 px-2.5 py-1 rounded-lg border border-blue-200">
                    ※ 장르 부제는 장르 성격을 돕기 위한 참고용 예시이며 절대적인 스토리라인이 아닙니다.
                  </span>
                </div>

                {/* 1.1 장르 선택 카드 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {GENRE_OPTIONS.map((genreOpt) => {
                    const isSelected = selectedGenreKey === genreOpt.key;
                    const Icon = genreOpt.icon;
                    return (
                      <div
                        key={genreOpt.key}
                        onClick={() => handleSelectGenre(genreOpt.key)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/30 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${genreOpt.color} shrink-0 shadow-xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {genreOpt.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed" title="참고용 예시 부제">
                            {genreOpt.sublabel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 1.2 선택된 장르의 기본 스토리라인 소스 입력 3대 탭 */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        선택된 장르 [{activeGenreOption.label.split('(')[0].trim()}] 기본 스토리라인 소스 제공 (3대 탭)
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      입력된 소스를 바탕으로 선택된 AI가 분석하여 키워드 및 스토리라인을 추천합니다.
                    </span>
                  </div>

                  {/* 3대 탭 전환 헤더 */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setStorySourceTab('text')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        storySourceTab === 'text'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>직접 텍스트 입력</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStorySourceTab('upload')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        storySourceTab === 'upload'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>파일 업로드 (.txt, .md)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStorySourceTab('url')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        storySourceTab === 'url'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>URL 링크 입력</span>
                    </button>
                  </div>

                  {/* 탭 1: 직접 텍스트 입력 */}
                  {storySourceTab === 'text' && (
                    <div className="space-y-1.5 animate-in fade-in duration-100">
                      <textarea
                        value={rawStoryText}
                        onChange={(e) => setRawStoryText(e.target.value)}
                        placeholder="작가님이 구상하신 기본 스토리라인, 세계관 메모, 주인공 설정, 줄거리 아이디어를 자유롭게 입력하세요. (예: 대기업 비자금을 관리하던 주인공이 IMF 직전으로 회귀하여 가문을 상대로 적대적 M&A를 펼치는 복수극...)"
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white resize-y leading-relaxed"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>* 입력된 내용을 바탕으로 AI가 핵심 갈등과 키워드를 분석합니다.</span>
                        <span>{rawStoryText.length.toLocaleString()} 자</span>
                      </div>
                    </div>
                  )}

                  {/* 탭 2: 파일 업로드 */}
                  {storySourceTab === 'upload' && (
                    <div className="space-y-2 animate-in fade-in duration-100">
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center bg-slate-50 hover:bg-blue-50/20 transition-all relative">
                        <input
                          type="file"
                          accept=".txt,.md,.doc,.docx"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800">
                              {uploadedFileName ? `선택된 파일: ${uploadedFileName}` : '기본 스토리라인 / 시놉시스 파일 업로드'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              .txt, .md 형식의 소설 기획서, 메모 텍스트 파일을 드래그하거나 클릭하여 업로드하세요.
                            </p>
                          </div>
                        </div>
                      </div>
                      {uploadedFileContent && (
                        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono max-h-24 overflow-y-auto">
                          <span className="font-bold text-blue-700 block mb-1">파일 내용 미리보기:</span>
                          {uploadedFileContent.slice(0, 300)}...
                        </div>
                      )}
                    </div>
                  )}

                  {/* 탭 3: URL 링크 */}
                  {storySourceTab === 'url' && (
                    <div className="space-y-1.5 animate-in fade-in duration-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={referenceUrl}
                          onChange={(e) => setReferenceUrl(e.target.value)}
                          placeholder="참고할 웹소설, 나무위키, 기사 링크 URL (예: https://...)"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        * 참고하고 싶은 스토리 소재, 레퍼런스 웹페이지의 링크를 입력해 주시면 AI가 컨텍스트로 참조합니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 1번 카드와 2번 카드 사이: AI로 추천하기 버튼 및 동일 높이(h-11) 프로그레스바 */}
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[44px]">
                  {/* Left Info: Selected Genre badge & description */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2 truncate">
                        <span>선택된 장르:</span>
                        <span className="text-blue-700 font-extrabold bg-white px-2 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                          {activeGenreOption.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        버튼을 누르면 선택된 LLM이 소스를 분석하여 2번에 키워드를 자동 등록하고 3번에 3가지 스토리라인을 추천합니다.
                      </p>
                    </div>
                  </div>

                  {/* Right: AI로 추천하기 Button or Same-Height Progress Bar (h-11 for both) */}
                  <div className="sm:shrink-0 w-full sm:w-auto flex items-center justify-end">
                    {isAiGenerating ? (
                      <div className="w-full sm:w-80 h-11 rounded-xl bg-slate-200/90 border border-slate-300 overflow-hidden relative flex items-center justify-center shadow-inner">
                        {/* Progress fill */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-150 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                        {/* Progress label */}
                        <span className="relative z-10 text-xs font-bold text-white drop-shadow flex items-center gap-1.5 px-3">
                          <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                          <span>{getActiveLlmDisplay()} 분석 및 생성 중... {progressPercent}%</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRunAiRecommendation}
                        className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>AI 추천하기 (선택된 LLM: {getActiveLlmDisplay()} 분석)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION B (2번 카드): 장르 어울림 키워드 자동 추천 & 직접 입력 */}
              <div className="space-y-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-5 rounded-2xl border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>[{activeGenreOption.label.split('(')[0].trim()}] 추천 키워드 자동 등록 & 키워드 추가</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        AI가 소스를 분석해 추천 키워드를 자동 등록해 드립니다. 직접 키워드를 추가하면 3번 카드뷰에 3개의 스토리라인이 맞춤 추천됩니다.
                      </p>
                    </div>
                  </div>

                  {/* Re-generate Card 3 using current keywords */}
                  {isCard3Generating ? (
                    <div className="h-9 px-3.5 rounded-xl bg-slate-200/90 border border-slate-300 overflow-hidden relative flex items-center justify-center shrink-0 min-w-[210px] shadow-inner">
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full animate-pulse" />
                      <span className="relative z-10 text-white text-xs font-extrabold flex items-center gap-1.5 drop-shadow">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                        <span>키워드로 3번 스토리라인 생성 중...</span>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateAiWithKeywords}
                      className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>선택 키워드로 3가지 스토리라인 추천받기</span>
                    </button>
                  )}
                </div>

                {/* Recommended Keywords Badges */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI 추천 키워드 (클릭하여 선택/해제):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeGenreOption.keywords.map((kw) => {
                      const isChosen = selectedKeywords.includes(kw);
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleToggleKeyword(kw)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isChosen
                              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/30'
                              : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          {isChosen && <Check className="w-3 h-3 text-white" />}
                          <span>{kw}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Keyword Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1">
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={customKeywordInput}
                      onChange={(e) => setCustomKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomKeyword();
                        }
                      }}
                      placeholder="키워드 직접 입력 (예: #비밀경호원, #공매도, #인공지능) 입력 후 추가"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomKeyword()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>키워드 추가</span>
                    </button>
                  </div>
                </div>

                {/* Selected Keywords Display Strip */}
                {selectedKeywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-blue-200/60">
                    <span className="text-[11px] font-bold text-slate-600 mr-1">현재 적용된 키워드:</span>
                    {selectedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 text-xs font-semibold border border-indigo-200"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleKeyword(kw)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* 2.4 AI 분석 기본 스토리라인 요약 (요청사항: 2번 카드뷰 하단 div) */}
                <div className="pt-3 border-t border-blue-200/60 space-y-1.5 bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-blue-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>기본 스토리라인 핵심 요약 (AI 분석 및 장르 연계)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold self-start sm:self-auto">
                      {hasGeneratedProposals ? 'AI 맞춤 요약 완료' : '기본 스토리라인'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {storySummary}
                  </p>
                </div>
              </div>

              {/* SECTION C (3번 카드): 장르별 작가 페르소나 카드뷰 분류 & 선택 (5단계에서 이동) */}
              <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <span>장르별 작가 페르소나 카드뷰 분류 & 선택</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                        집필 스타일 연계
                      </span>
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    선택한 페르소나의 문체와 시그니처 연출이 다음 4번 카드의 스토리라인 추천안에 직접 반영됩니다.
                  </span>
                </div>

                {/* Genre Category Filter Tabs for Personas */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>페르소나 카테고리:</span>
                    </span>
                    {PERSONA_CATEGORIES.map((cat) => {
                      const isCatSelected = selectedPersonaCategory === cat.key;
                      const isNovelGenreMatch = selectedGenreKey === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setSelectedPersonaCategory(cat.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCatSelected
                              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                          }`}
                        >
                          <span>{cat.label}</span>
                          {isNovelGenreMatch && (
                            <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full">
                              현재 장르
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Persona Cards Grid (Filtered) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {filteredPersonas.map((persona) => {
                    const isSelected = selectedPersonaId === persona.id;
                    const isGenreMatch = persona.category === selectedGenreKey;
                    return (
                      <div
                        key={persona.id}
                        onClick={() => {
                          setSelectedPersonaId(persona.id);
                          showToast(`🖋️ 작가 페르소나가 [${persona.name}] 님으로 설정되었습니다.`);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 text-slate-900 ring-2 ring-blue-500/30 shadow-md'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                              <Feather className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span>{persona.name}</span>
                            </span>
                            <div className="flex items-center gap-1">
                              {isGenreMatch && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  장르 최적화
                                </span>
                              )}
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400">{persona.masterpiece}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] font-mono text-blue-700 font-semibold">
                            {persona.genre}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {persona.styleDescription}
                          </p>
                        </div>

                        {/* Signature Hook Preview */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <div className="text-[10px] text-slate-400 font-mono mb-1">대표 시그니처 연출:</div>
                          <div className="text-[11px] text-slate-800 font-mono italic bg-slate-50 p-2 rounded-lg border border-slate-200 line-clamp-2">
                            {persona.signatureHook}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION D (4번 카드): 키워드기반 맞춤 스토리라인 3가지 추천 (3개 탭) */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                      4
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span>키워드기반 맞춤 스토리라인 3가지 추천</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded text-white ${
                          hasGeneratedProposals ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}>
                          {hasGeneratedProposals ? 'AI 키워드 맞춤 추천안 (3개 탭)' : '기본 템플릿 3가지 추천안 (3개 탭)'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {hasGeneratedProposals
                          ? 'AI 추론이 완료되어 키워드 및 페르소나에 맞춤화된 3가지 스토리라인입니다. 원하는 탭을 선택하면 기획서 상세 항목에 즉시 추가됩니다.'
                          : '현재 기본 템플릿 스토리라인 3가지가 제공 중입니다. 1번 카드에서 [AI 추천하기] 버튼을 누르면 AI가 추론을 완료하여 키워드 맞춤 스토리라인 3가지로 교체됩니다.'}
                      </p>
                    </div>
                  </div>

                  {!hasGeneratedProposals && (
                    <button
                      type="button"
                      onClick={handleRunAiRecommendation}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>키워드 맞춤 AI 추론 실행</span>
                    </button>
                  )}
                </div>

                {/* 3 Tabs Header (항상 노출되어 바로 확인 가능) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-200 pb-2 pt-1">
                  {currentProposals.map((proposal, idx) => {
                    const isSelected = activeStep1ProposalIndex === idx;
                    return (
                      <button
                        key={proposal.id}
                        type="button"
                        onClick={() => handleSelectProposalTab(idx)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        <span>{proposal.tabLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 3 Proposal Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                  {currentProposals.map((proposal, idx) => {
                    const isSelected = activeStep1ProposalIndex === idx;
                    return (
                      <div
                        key={proposal.id}
                        onClick={() => handleSelectProposalTab(idx)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {proposal.badge}
                            </span>
                            {isSelected && (
                              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>기획서 반영됨</span>
                              </span>
                            )}
                          </div>

                          <div className="font-extrabold text-sm text-slate-900 leading-snug">
                            {proposal.title}
                          </div>
                          <div className="text-xs text-blue-700 font-semibold">
                            {proposal.subtitle}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {proposal.logline}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-mono text-[11px]">필명: {proposal.penName}</span>
                          <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>
                            {isSelected ? '상세항목 추가 완료' : '이 탭 선택하여 상세항목 추가 →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION D: 기획서 상세 항목 (직접 편집 가능) */}
              <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>기획서 상세 항목 (자유롭게 직접 편집 가능)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    선택한 탭의 내용이 자동 입력되어 있으며, 작가님의 의도에 맞게 문구를 수정하세요.
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block text-xs">
                      작품 제목 (Title) *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="웹소설 제목"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block text-xs">
                      서브타이틀 (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="핵심 슬로건 및 부제"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Pen Name & Genre Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block text-xs">작가 필명</label>
                    <input
                      type="text"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      placeholder="필명"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-slate-800 font-bold block text-xs">장르 세부 구성비</label>
                    <input
                      type="text"
                      value={genreBreakdown}
                      onChange={(e) => setGenreBreakdown(e.target.value)}
                      placeholder="예: 현대판타지 50% · 재벌 복수극 30% · 두뇌 심리전 20%"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Scale, Background, Serialization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block text-xs">완결 목표 분량</label>
                    <input
                      type="text"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      placeholder="100화 완결 (4막 6아크 24챕터)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block text-xs">연재 주기 및 플랫폼</label>
                    <input
                      type="text"
                      value={serialization}
                      onChange={(e) => setSerialization(e.target.value)}
                      placeholder="주 7회 성실 연재 (카카오/시리즈 18시)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-800 font-bold block text-xs">서술 시점 (POV)</label>
                    <input
                      type="text"
                      value={pov}
                      onChange={(e) => setPov(e.target.value)}
                      placeholder="1인칭 주인공 시점 ('나')"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Logline */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">핵심 로그라인 (1~2문장 요약)</label>
                  <textarea
                    value={logline}
                    onChange={(e) => setLogline(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Selling Point */}
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">기획 의도 및 셀링 포인트 (차별화 요소)</label>
                  <input
                    type="text"
                    value={sellingPoint}
                    onChange={(e) => setSellingPoint(e.target.value)}
                    placeholder="독자에게 선사할 사이다 카타르시스 및 특별한 흥미 유발점"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: 세계관 (규칙 & 시스템) */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* 1단계 기획서 종합 연계 카드 (2단계에서는 1단계의 정보를 가지고 2단계로 진행) */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 rounded-2xl border border-blue-200 text-xs space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-blue-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]">1단계 기획 연계</span>
                    <strong className="text-slate-900 text-sm font-extrabold">{title}</strong>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-blue-700 font-bold font-mono">[{activeGenreOption.label.split('(')[0].trim()}]</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500">선택 페르소나:</span>
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Feather className="w-3 h-3 text-amber-300" />
                      <span>{selectedPersona.name}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold mr-1">로그라인:</span>
                    <span className="font-medium line-clamp-1">{logline}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold mr-1">스토리라인 요약:</span>
                    <span className="font-medium line-clamp-1">{storySummary}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">적용 키워드:</span>
                  {selectedKeywords.map((kw) => (
                    <span key={kw} className="bg-white border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Editable Fields for Step 2 */}
              <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>세계관 세부 설정 (직접 편집 가능)</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    장르와 키워드에 맞게 자동 구성된 세계관 설정입니다.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">
                    세계관 핵심 테제 / 메인 전제 (World Thesis)
                  </label>
                  <textarea
                    value={worldThesis}
                    onChange={(e) => setWorldThesis(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                    placeholder="세계관의 기본 법칙 및 갈등의 토대가 되는 사회/물리적 전제"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">
                    특수 법칙 및 시스템 제약 / 리스크 (Special Rules & Risk Constraints)
                  </label>
                  <textarea
                    value={specialRules}
                    onChange={(e) => setSpecialRules(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                    placeholder="상속 신탁 규정, 성좌 계약의 대가, 회귀 패널티, 마도 계약 등"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">
                    주요 세력 및 파벌 구도 (Faction Dynamics)
                  </label>
                  <textarea
                    value={factionDynamics}
                    onChange={(e) => setFactionDynamics(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-blue-500"
                    placeholder="주인공이 상대해야 할 총수파 vs 후계파, 중앙 길드 연합 등"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">
                    핵심 설정 오브젝트 / 키 아이템 (Key Artifacts)
                  </label>
                  <input
                    type="text"
                    value={keyArtifacts}
                    onChange={(e) => setKeyArtifacts(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="암호 일기장, 15% 신탁 증서, 절대 명령의 낙인 등 쉼표(,)로 구분"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: 캐릭터 바이블 (인물 앙상블) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">작품:</span>
                  <strong className="text-blue-700 font-extrabold">{title}</strong>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600 font-mono">[{activeGenreOption.label.split('(')[0].trim()}]</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  4대 핵심 인물 앙상블 편집 모드
                </span>
              </div>

              {/* Editable Fields for Step 3 */}
              <div className="space-y-4">
                
                {/* 1. Protagonist Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>1. 주인공 (Protagonist)</span>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold font-mono">서사의 주도자</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 text-xs block mb-1 font-bold">주인공 이름 / 신분</label>
                      <input
                        type="text"
                        value={protagonistName}
                        onChange={(e) => setProtagonistName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 text-xs block mb-1 font-bold">고유 치트 / 특별한 능력 (Cheat)</label>
                      <input
                        type="text"
                        value={protagonistCheat}
                        onChange={(e) => setProtagonistCheat(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 text-xs block mb-1 font-bold">근원적 결핍 / 트라우마 (Lack)</label>
                      <input
                        type="text"
                        value={protagonistLack}
                        onChange={(e) => setProtagonistLack(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 text-xs block mb-1 font-bold">시그니처 대표 대사</label>
                      <input
                        type="text"
                        value={protagonistQuote}
                        onChange={(e) => setProtagonistQuote(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 italic font-serif"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Supporting, Antagonist, Rival Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Companion */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>핵심 조력자 (Companion)</span>
                    </div>
                    <div>
                      <label className="text-slate-600 text-[11px] block mb-1 font-semibold">이름 및 역할</label>
                      <input
                        type="text"
                        value={companionName}
                        onChange={(e) => setCompanionName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-[11px] block mb-1 font-semibold">비밀 및 시너지</label>
                      <textarea
                        value={companionSecret}
                        onChange={(e) => setCompanionSecret(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Antagonist */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                      <Sword className="w-3.5 h-3.5 text-rose-600" />
                      <span>메인 대립자 (Antagonist)</span>
                    </div>
                    <div>
                      <label className="text-slate-600 text-[11px] block mb-1 font-semibold">이름 및 지위</label>
                      <input
                        type="text"
                        value={antagonistName}
                        onChange={(e) => setAntagonistName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-[11px] block mb-1 font-semibold">악행 동기 및 약점</label>
                      <textarea
                        value={antagonistSecret}
                        onChange={(e) => setAntagonistSecret(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Rival / Wildcard */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                      <Target className="w-3.5 h-3.5 text-amber-600" />
                      <span>라이벌 / 복병 (Rival)</span>
                    </div>
                    <div>
                      <label className="text-slate-600 text-[11px] block mb-1 font-semibold">이름 및 구도</label>
                      <input
                        type="text"
                        value={rivalName}
                        onChange={(e) => setRivalName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-[11px] block mb-1 font-semibold">의심 및 변수</label>
                      <textarea
                        value={rivalSecret}
                        onChange={(e) => setRivalSecret(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 leading-relaxed"
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: 1~4막 (기승전결) 스토리 구조 */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      1~3단계 집필 정보 집약
                    </span>
                    <strong className="text-sm font-extrabold text-white">{title}</strong>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">100화 4막(기·승·전·결) 공학적 매핑</span>
                </div>
                <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>장르:</strong> {activeGenreOption.label.split('(')[0].trim()}</span>
                  <span><strong>주인공:</strong> {protagonistName.split('(')[0]}</span>
                  <span><strong>대립자:</strong> {antagonistName.split('(')[0]}</span>
                </div>
              </div>

              {/* 4 Acts Visual Cards (기·승·전·결) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1막: 기 (起) */}
                <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-blue-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-xs">1막: 기 (起)</span>
                      <span>발단 및 입성 (01~25화)</span>
                    </span>
                    <span className="text-[11px] text-blue-700 font-mono font-bold">ch01 ~ ch06</span>
                  </div>
                  <textarea
                    value={act1Text}
                    onChange={(e) => setAct1Text(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-blue-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-[11px] text-blue-800/80 bg-blue-100/60 p-2.5 rounded-lg">
                    <strong>1막 전환점:</strong> 01화 훅({cliffhanger1}) → 17화 1차 전환점({cliffhanger17})
                  </div>
                </div>

                {/* 2막: 승 (承) */}
                <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-indigo-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-xs">2막: 승 (承)</span>
                      <span>갈등 심화 & 세력 장악 (26~50화)</span>
                    </span>
                    <span className="text-[11px] text-indigo-700 font-mono font-bold">ch07 ~ ch12</span>
                  </div>
                  <textarea
                    value={act2Text}
                    onChange={(e) => setAct2Text(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-indigo-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                  <div className="text-[11px] text-indigo-800/80 bg-indigo-100/60 p-2.5 rounded-lg">
                    <strong>2막 전환점:</strong> 30화 무료 록인({cliffhanger33}) → 50화 미드포인트 반전({cliffhanger50})
                  </div>
                </div>

                {/* 3막: 전 (轉) */}
                <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-purple-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-xs">3막: 전 (轉)</span>
                      <span>위기 절정 & 정체 발각 위기 (51~75화)</span>
                    </span>
                    <span className="text-[11px] text-purple-700 font-mono font-bold">ch13 ~ ch18</span>
                  </div>
                  <textarea
                    value={act3Text}
                    onChange={(e) => setAct3Text(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-purple-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                  <div className="text-[11px] text-purple-800/80 bg-purple-100/60 p-2.5 rounded-lg">
                    <strong>3막 전환점:</strong> 67화 정체 발각 최대 위기({cliffhanger67}) → 75화 총력 반격
                  </div>
                </div>

                {/* 4막: 결 (結) */}
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-xs">4막: 결 (結)</span>
                      <span>총력전 & 대단원 완결 (76~100화)</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-mono font-bold">ch19 ~ ch24</span>
                  </div>
                  <textarea
                    value={act4Text}
                    onChange={(e) => setAct4Text(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[11px] text-amber-800/80 bg-amber-100/60 p-2.5 rounded-lg">
                    <strong>4막 전환점:</strong> 95화 클라이맥스 실명 선언({cliffhanger95}) → 100화 완결
                  </div>
                </div>

              </div>

              {/* Cliffhangers Milestone Input List */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">
                  전환점 클리프행어 마일스톤 (자유 수정 가능)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">1화 훅</label>
                    <input
                      type="text"
                      value={cliffhanger1}
                      onChange={(e) => setCliffhanger1(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">17화 1차 전환점</label>
                    <input
                      type="text"
                      value={cliffhanger17}
                      onChange={(e) => setCliffhanger17(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">33화 후계 참여 선언</label>
                    <input
                      type="text"
                      value={cliffhanger33}
                      onChange={(e) => setCliffhanger33(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">50화 미드포인트 반전</label>
                    <input
                      type="text"
                      value={cliffhanger50}
                      onChange={(e) => setCliffhanger50(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">67화 정체 발각 위기</label>
                    <input
                      type="text"
                      value={cliffhanger67}
                      onChange={(e) => setCliffhanger67(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">95화 클라이맥스</label>
                    <input
                      type="text"
                      value={cliffhanger95}
                      onChange={(e) => setCliffhanger95(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold text-blue-700"
                    />
                  </div>
                </div>
              </div>

              {/* Final Review Summary Card (4단계에서 완료) */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="font-extrabold text-sm text-white">생성될 웹소설 프로젝트 마스터 요약</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">100화 4막 24챕터</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1.5">
                    <div><span className="text-slate-400">선택 장르:</span> <span className="text-blue-300 font-bold">{activeGenreOption.label}</span></div>
                    <div><span className="text-slate-400">제목:</span> <strong className="text-white text-sm">{title}</strong></div>
                    <div><span className="text-slate-400">부제:</span> <span className="text-slate-300">{subtitle}</span></div>
                    <div><span className="text-slate-400">필명:</span> <span className="text-slate-200">{penName}</span></div>
                    <div><span className="text-slate-400">주인공:</span> <span className="text-emerald-300 font-bold">{protagonistName}</span></div>
                  </div>

                  <div className="space-y-1.5">
                    <div><span className="text-slate-400">적용 키워드:</span> <span className="text-indigo-300">{selectedKeywords.join(', ')}</span></div>
                    <div><span className="text-slate-400">세계관 테제:</span> <span className="text-slate-200 line-clamp-1">{worldThesis}</span></div>
                    <div><span className="text-slate-400">1~4막 구조:</span> <span className="text-slate-200">기(25화) · 승(25화) · 전(25화) · 결(25화)</span></div>
                    <div><span className="text-slate-400">선택 페르소나 (1단계 3번 카드):</span> <span className="text-amber-300 font-bold">{selectedPersona.name}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>아래 [완료 & 웹소설 생성] 버튼을 누르면 Workspace에 즉시 반영되고 작품보기 화면으로 전환됩니다.</span>
                </div>
              </div>

            </div>
          )}

          {/* Footer Navigation Buttons (4단계 체계) */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>이전 단계</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  취소 및 대시보드
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>다음 단계</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>완료 & 웹소설 생성 (Workspace 즉시 전환)</span>
                </button>
              )}
            </div>
          </div>

        </form>
      </div>

    </div>
  );
};
