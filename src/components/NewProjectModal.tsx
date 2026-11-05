import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  User,
  Feather,
  CheckCircle2,
  Shield,
  Target,
  Sword,
  Check,
  Crown,
  Flame,
  Layers,
  Heart,
  Zap,
  Tag,
  Plus
} from 'lucide-react';
import {
  WebNovelProject,
  createProjectFromTemplate
} from '../data/projectTemplates';
import {
  GenreKey,
  GENRE_OPTIONS,
  GENRE_PROPOSALS,
  PERSONA_CATEGORIES,
  FAMOUS_WRITER_PERSONAS,
  PersonaCategoryKey
} from './NewProjectPage';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (newProject: WebNovelProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState<number>(1);

  // 1. Step 1: Selected Genre (FIRST)
  const [selectedGenreKey, setSelectedGenreKey] = useState<GenreKey>('chaebol');

  // 2. Step 1: Keywords Management
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['#지분전쟁', '#가짜혈통', '#사이다복수']);
  const [customKeywordInput, setCustomKeywordInput] = useState<string>('');

  // 3. Step 1: 3-Tab AI Proposal
  const [activeStep1ProposalIndex, setActiveStep1ProposalIndex] = useState<number>(0);

  const currentProposals = GENRE_PROPOSALS[selectedGenreKey] || GENRE_PROPOSALS.chaebol;
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

  // Step 2: Worldbuilding
  const [worldThesis, setWorldThesis] = useState('상위 0.01% 자본 카르텔과 제도권 권력의 결탁. 돈과 지분 앞에서는 친족의 목숨조차 교환 가치로 환산되는 냉혈한 정글.');
  const [specialRules, setSpecialRules] = useState('직계 상속 15% 신탁 조항: 만 25세 생존 및 친자 확인 시 즉시 발동.');
  const [factionDynamics, setFactionDynamics] = useState('태성그룹 총수파 vs 후계 차남파 vs 법조 카르텔 vs 주인공 연대.');
  const [keyArtifacts, setKeyArtifacts] = useState('암호 일기장, 15% 신탁 증서, 불법 승계 녹취 파일');

  // Step 3: Characters
  const [protagonistName, setProtagonistName] = useState('서이안 (26세 / 위장명 서이현)');
  const [protagonistRole, setProtagonistRole] = useState('주인공 / 위장 신분의 지략가');
  const [protagonistLack, setProtagonistLack] = useState('동생을 지키지 못했다는 자책감과 계약직의 한계');
  const [protagonistCheat, setProtagonistCheat] = useState('동생의 6편 암호 일기와 냉철한 수치 계산 능력');
  const [protagonistQuote, setProtagonistQuote] = useState('"네가 빼앗은 건 내 동생의 목숨만이 아니야. 이 집안 전체지."');

  const [companionName, setCompanionName] = useState('강태우 (32세 / 반골 변호사)');
  const [antagonistName, setAntagonistName] = useState('서진우 (38세 / 부사장)');
  const [rivalName, setRivalName] = useState('서채린 (24세 / 차녀)');

  // Step 4: 1~4 Acts
  const [act1Text, setAct1Text] = useState('1막 (기 / 01~25화) 발단 및 입성: 일상 파괴 → 암호 일기 해독 → 가짜 막내손녀 입성.');
  const [act2Text, setAct2Text] = useState('2막 (승 / 26~50화) 갈등 심화: 30화 무료 록인 폭로 사이다 → 50화 미드포인트 반전.');
  const [act3Text, setAct3Text] = useState('3막 (전 / 51~75화) 위기 절정: 정체 발각 위기 → 조력자 비자금 확보 → 75화 총수 쓰러짐.');
  const [act4Text, setAct4Text] = useState('4막 (결 / 76~100화) 총력전: 95화 클라이맥스 생중계 실명 폭로 → 100화 완결.');

  // Step 5: Persona
  const [selectedPersonaCategory, setSelectedPersonaCategory] = useState<PersonaCategoryKey>('all');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('sankyeong');

  // Progress Bar State between Card 1 and Card 2
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const handleRunAiRecommendation = async () => {
    if (isAiGenerating) return;
    setIsAiGenerating(true);
    setProgressPercent(25);

    const intervalId = setInterval(() => {
      setProgressPercent((prev) => (prev >= 90 ? prev : prev + 20));
    }, 100);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const genreOpt = GENRE_OPTIONS.find((g) => g.key === selectedGenreKey) || GENRE_OPTIONS[0];
      setSelectedKeywords(genreOpt.keywords.slice(0, 3));
      const proposals = GENRE_PROPOSALS[selectedGenreKey] || GENRE_PROPOSALS.chaebol;
      if (proposals && proposals[activeStep1ProposalIndex]) {
        const p = proposals[activeStep1ProposalIndex];
        if (p.title) setTitle(p.title);
        if (p.subtitle) setSubtitle(p.subtitle);
        if (p.penName) setPenName(p.penName);
        if (p.genreBreakdown) setGenreBreakdown(p.genreBreakdown);
        if (p.targetEpisodes) setTargetEpisodes(p.targetEpisodes);
        if (p.background) setBackground(p.background);
        if (p.scale) setScale(p.scale);
        if (p.pov) setPov(p.pov);
        if (p.target) setTarget(p.target);
        if (p.serialization) setSerialization(p.serialization);
        if (p.logline) setLogline(p.logline);
        if (p.sellingPoint) setSellingPoint(p.sellingPoint);
        if (p.personaId) setSelectedPersonaId(p.personaId);
      }
    } finally {
      clearInterval(intervalId);
      setProgressPercent(100);
      await new Promise((r) => setTimeout(r, 200));
      setIsAiGenerating(false);
      setProgressPercent(0);
    }
  };

  const handleSelectGenre = (genreKey: GenreKey) => {
    setSelectedGenreKey(genreKey);
    setSelectedPersonaCategory(genreKey as any);
  };

  const handleToggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter((k) => k !== kw));
    } else {
      setSelectedKeywords([...selectedKeywords, kw]);
    }
  };

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

  const handleSelectProposalTab = (index: number) => {
    setActiveStep1ProposalIndex(index);
    const p = currentProposals[index];
    if (p) {
      setTitle(p.title);
      setSubtitle(p.subtitle);
      setPenName(p.penName);
      setGenreBreakdown(p.genreBreakdown);
      setTargetEpisodes(p.targetEpisodes);
      setBackground(p.background);
      setScale(p.scale);
      setPov(p.pov);
      setTarget(p.target);
      setSerialization(p.serialization);
      setLogline(p.logline);
      setSellingPoint(p.sellingPoint);
      setSelectedPersonaId(p.personaId);
    }
  };

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

    newProject.background = background;
    newProject.scale = scale;
    newProject.pov = pov;
    newProject.target = target;
    newProject.serialization = serialization;

    if (newProject.coreConcept) {
      newProject.coreConcept.logline = logline;
      newProject.coreConcept.theme = worldThesis;
      newProject.coreConcept.emotionalGoal = sellingPoint;
      newProject.coreConcept.differentiators = [
        `주인공 특수 능력: ${protagonistCheat}`,
        `핵심 키워드: ${selectedKeywords.join(', ')}`,
        `작가 페르소나 스타일: ${selectedPersona.name}`
      ];
      newProject.coreConcept.devices = keyArtifacts.split(',').map((s) => s.trim()).filter(Boolean);
    }

    newProject.characters = [
      {
        id: `c-${newProject.id}-1`,
        name: protagonistName,
        alias: '서사의 주도자',
        role: protagonistRole,
        description: `결핍: ${protagonistLack} | 치트: ${protagonistCheat} | 대사: ${protagonistQuote}`,
        habits: '침착한 호흡 유지.',
        secret: '대외적으로 밝혀지지 않은 치명적 목적.',
        arcTrajectory: '1막 입성/각성 → 2막 세력 장악 → 3막 위기 극복 → 4막 최종 심판'
      },
      {
        id: `c-${newProject.id}-2`,
        name: companionName,
        alias: '핵심 파트너',
        role: '핵심 조력자',
        description: '주인공을 보완할 핵심 동료.',
        habits: '증거 수집.',
        secret: '숨겨진 공익 제보자.',
        arcTrajectory: '1막 탐색 → 2막 동맹 → 3막 위기 지원 → 4막 공동 승리'
      },
      {
        id: `c-${newProject.id}-3`,
        name: antagonistName,
        alias: '권력의 정점',
        role: '메인 빌런',
        description: '타도해야 할 배후 주동자.',
        habits: '서늘한 미소.',
        secret: '비자금 세탁 장부.',
        arcTrajectory: '1막 군림 → 2막 균열 → 3막 총력전 → 4막 파멸'
      },
      {
        id: `c-${newProject.id}-4`,
        name: rivalName,
        alias: '변수의 핵심',
        role: '라이벌 / 복병',
        description: '상황을 뒤흔드는 복병.',
        habits: '상황 관망.',
        secret: '위장 신분 의심.',
        arcTrajectory: '1막 경계 → 2막 대립 → 3막 내부 교란 → 4막 승복'
      }
    ];

    onCreateProject(newProject);
    onClose();
  };

  const selectedPersona = FAMOUS_WRITER_PERSONAS.find((p) => p.id === selectedPersonaId) || FAMOUS_WRITER_PERSONAS[0];

  const filteredPersonas = FAMOUS_WRITER_PERSONAS.filter((p) => {
    if (selectedPersonaCategory === 'all') return true;
    return p.category === selectedPersonaCategory;
  });

  const activeGenreOption = GENRE_OPTIONS.find((g) => g.key === selectedGenreKey) || GENRE_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                새로운 웹소설 기획 및 작성 위저드
              </h3>
              <p className="text-xs text-slate-300">
                1. 장르 선택 → 2. AI 추천 키워드 → 3. 3가지 추천안 카드뷰 → 4. 1~4막 구조 → 5. 장르별 페르소나
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-xs font-bold text-center shrink-0">
          {[
            { step: 1, label: '1단계: 기본계획서&장르선택' },
            { step: 2, label: '2단계: 세계관' },
            { step: 3, label: '3단계: 캐릭터' },
            { step: 4, label: '4단계: 1~4막' },
            { step: 5, label: '5단계: 페르소나' },
          ].map((s) => {
            const isCurrent = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`py-3 px-1 border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isCurrent
                    ? 'border-blue-600 text-blue-600 bg-white font-extrabold shadow-xs'
                    : isDone
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className={`w-3.5 h-3.5 rounded-full text-[10px] flex items-center justify-center font-mono shrink-0 ${
                    isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.step}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.step}단</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: Genre First + Keywords + 3 Proposal CardViews */}
          {currentStep === 1 && (
            <div className="space-y-5">
              
              {/* 1. Genre Selection First (Card 1) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>웹소설 메인 장르 선택 (가장 먼저 선택)</span>
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold">장르에 맞게 키워드와 기획서가 AI 추천됩니다</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GENRE_OPTIONS.map((g) => {
                    const isSelected = selectedGenreKey === g.key;
                    const Icon = g.icon;
                    return (
                      <div
                        key={g.key}
                        onClick={() => handleSelectGenre(g.key)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg text-white bg-gradient-to-br ${g.color} shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 truncate">{g.label.split('(')[0]}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1번 카드와 2번 카드 사이: AI로 추천하기 버튼 및 동일 높이(h-10) 프로그레스바 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      선택된 장르: <span className="text-blue-600">{activeGenreOption.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      버튼을 누르면 키워드와 3가지 기획안이 생성됩니다.
                    </p>
                  </div>
                </div>

                <div className="sm:shrink-0 w-full sm:w-auto flex items-center justify-end">
                  {isAiGenerating ? (
                    <div className="w-full sm:w-56 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden relative flex items-center justify-center shadow-inner">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-150 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                      <span className="relative z-10 text-xs font-bold text-white flex items-center gap-1.5 px-2 drop-shadow">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                        <span>AI 추천 생성 중... {progressPercent}%</span>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRunAiRecommendation}
                      className="w-full sm:w-auto h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI로 추천하기</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Keywords Recommended & Custom Input (Card 2) */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>[{activeGenreOption.label.split('(')[0].trim()}] 어울림 키워드 AI 추천</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeGenreOption.keywords.map((kw) => {
                    const isChosen = selectedKeywords.includes(kw);
                    return (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => handleToggleKeyword(kw)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          isChosen
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {kw}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
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
                    placeholder="키워드 직접 입력 후 추가"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomKeyword()}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 3. 3-Tab Proposal CardViews for this Genre */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>장르 맞춤 AI 기획서 3가지 추천 카드뷰 (선택 시 자동 반영)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentProposals.map((p, idx) => {
                    const isSelected = activeStep1ProposalIndex === idx;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProposalTab(idx)}
                        className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-blue-600 mb-0.5">{p.badge}</div>
                        <div className="font-extrabold text-xs text-slate-900 line-clamp-1">{p.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.logline}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Editable Inputs */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-bold block text-xs mb-1">작품 제목 (Title) *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-800 font-bold block text-xs mb-1">서브타이틀</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-800 font-bold block text-xs mb-1">작가 필명</label>
                    <input
                      type="text"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-800 font-bold block text-xs mb-1">장르 구성비</label>
                    <input
                      type="text"
                      value={genreBreakdown}
                      onChange={(e) => setGenreBreakdown(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block text-xs mb-1">핵심 로그라인</label>
                  <textarea
                    value={logline}
                    onChange={(e) => setLogline(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg">
                작품: <strong>{title}</strong> ({activeGenreOption.label})
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-800 font-bold block text-xs mb-1">세계관 핵심 테제</label>
                  <textarea
                    value={worldThesis}
                    onChange={(e) => setWorldThesis(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-800 font-bold block text-xs mb-1">특수 법칙 및 시스템 제약</label>
                  <textarea
                    value={specialRules}
                    onChange={(e) => setSpecialRules(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-900">주인공 (Protagonist)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={protagonistName}
                    onChange={(e) => setProtagonistName(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg p-1.5"
                  />
                  <input
                    type="text"
                    value={protagonistCheat}
                    onChange={(e) => setProtagonistCheat(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold block mb-1">조력자</span>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1"
                  />
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold block mb-1">빌런</span>
                  <input
                    type="text"
                    value={antagonistName}
                    onChange={(e) => setAntagonistName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1"
                  />
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold block mb-1">라이벌</span>
                  <input
                    type="text"
                    value={rivalName}
                    onChange={(e) => setRivalName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200">
                  <span className="font-bold text-blue-800 block mb-1">1막: 기 (起)</span>
                  <textarea
                    value={act1Text}
                    onChange={(e) => setAct1Text(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-blue-300 rounded p-1.5"
                  />
                </div>
                <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <span className="font-bold text-indigo-800 block mb-1">2막: 승 (承)</span>
                  <textarea
                    value={act2Text}
                    onChange={(e) => setAct2Text(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-indigo-300 rounded p-1.5"
                  />
                </div>
                <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200">
                  <span className="font-bold text-purple-800 block mb-1">3막: 전 (轉)</span>
                  <textarea
                    value={act3Text}
                    onChange={(e) => setAct3Text(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-purple-300 rounded p-1.5"
                  />
                </div>
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-800 block mb-1">4막: 결 (結)</span>
                  <textarea
                    value={act4Text}
                    onChange={(e) => setAct4Text(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-amber-300 rounded p-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Genre-Classified Persona Cards */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800">장르별 페르소나 카테고리 필터:</span>
                <div className="flex flex-wrap gap-1">
                  {PERSONA_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedPersonaCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPersonaCategory === cat.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredPersonas.map((p) => {
                  const isSelected = selectedPersonaId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPersonaId(p.id)}
                      className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{p.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-[11px] text-blue-600 font-mono mt-0.5">{p.masterpiece}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.styleDescription}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1">
                <div>제목: <strong>{title}</strong> ({activeGenreOption.label})</div>
                <div>페르소나: <span className="text-amber-300 font-bold">{selectedPersona.name}</span></div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-300 cursor-pointer"
            >
              취소
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>다음</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>완료 & 웹소설 생성</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
