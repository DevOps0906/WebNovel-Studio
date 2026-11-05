import React, { useState, useMemo } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, X, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { WebNovelProject, PROJECT_BJ_SISTER } from '../data/projectTemplates';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: WebNovelProject;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  activeProject,
}) => {
  // Use activeProject or fallback to standard reference project
  const project = activeProject || PROJECT_BJ_SISTER;

  const [selectedFile, setSelectedFile] = useState<string>('01-계획서.md');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '1-기획문서': true,
    '2-챕터문서': true,
    '3-집필문서': false,
    '4-연재본': false,
    '5-복선DB': false,
    '6-미결과제': false,
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // Generate dynamic chapters list based on project specs
  const totalChaptersCount = project.currentProgress?.totalChapters || 24;
  const chapterKeys = useMemo(() => {
    const list: string[] = [];
    for (let i = 1; i <= Math.min(24, Math.max(4, totalChaptersCount)); i++) {
      const pad = String(i).padStart(2, '0');
      list.push(`ch${pad}-챕터계획.md`);
    }
    return list;
  }, [totalChaptersCount]);

  // Generate dynamic file contents based on the currently selected project
  const fileContents = useMemo<Record<string, string>>(() => {
    const contents: Record<string, string> = {};

    // 1-기획문서
    contents['01-계획서.md'] = `# 01-계획서.md
작품명: 《${project.title}》
부제: ${project.subtitle || '미정'}
필명: ${project.penName || '작가'}
장르: ${project.genre || '웹소설'}
규모: ${project.scale || '100화 완결 (4막 · 6아크 · 24챕터)'}
시점: ${project.pov || "1인칭 주인공 시점 ('나')"}
타깃층: ${project.target || '스마트폰 웹소설 독자층'}
연재 주기: ${project.serialization || '주 5~7회 성실 연재'}
유료화 시점: 30화 무료 후 31화 유료 전환

## 핵심 로그라인
${project.coreConcept?.logline || project.subtitle || '주인공의 반란과 성장을 그린 흡인력 있는 웹소설.'}

## 기획 의도 및 셀링 포인트
${project.coreConcept?.emotionalGoal || '독자에게 선사할 사이다 카타르시스 및 독보적 재미.'}

## 차별화 요소 (Differentiators)
${(project.coreConcept?.differentiators || []).map((d) => `- ${d}`).join('\n') || '- 독창적인 세계관과 매력적인 캐릭터'}
`;

    contents['02-세계관.md'] = `# 02-세계관.md
작품: 《${project.title}》

## 핵심 갈등 테제
"${project.coreConcept?.theme || project.coreConcept?.logline || '운명을 거스르고 스스로의 법을 세운다.'}"

## 배경 무대
${project.background || '작품의 중심이 되는 핵심 도시 및 적대 세력 본거지.'}

## 핵심 장치 및 성물 (Key Devices)
${(project.coreConcept?.devices || []).map((dev, i) => `${i + 1}. ${dev}`).join('\n') || '1. 핵심 비밀 장부 및 증거물\n2. 특수 권능 계약 각서'}

## 클라이맥스 셋업
${project.coreConcept?.climaxEnding || '95화 주주총회/최종 결전에서 모든 복선이 폭발하며 빌런을 완벽히 단죄하고 정상에 등극함.'}
`;

    // 03-캐릭터바이블.md
    const charactersText = (project.characters || [])
      .map(
        (c) => `### ${c.role}: ${c.name} (${c.alias || '주요인물'})
- 설정/역할: ${c.description}
- 버릇/특징: ${c.habits || '위기 상황에서 침착함을 유지함'}
- 은밀한 비밀: ${c.secret || '극비 과거와 목적'}
- 아크별 궤적: ${c.arcTrajectory || '1막 위장/입성 → 2막 세력 확장 → 3막 위기 극복 → 4막 승리'}
`
      )
      .join('\n');

    contents['03-캐릭터바이블.md'] = `# 03-캐릭터바이블.md
작품: 《${project.title}》
등장인물 총 ${project.characters?.length || 0}인 앙상블 구성

${charactersText || '등장인물 정보가 등록되어 있습니다.'}
`;

    // 04-스토리구조.md
    const arcsText = (project.arcs || [])
      .map(
        (a) => `- [${a.act}] ${a.title}
  - 챕터 범위: ${a.chapters} (${a.episodes})
  - 진행 상태: ${a.status} (완료 ${a.done} / 총 ${a.total}화)`
      )
      .join('\n\n');

    contents['04-스토리구조.md'] = `# 04-스토리구조.md
작품: 《${project.title}》
플롯 구성: 4막 6아크 (기승전결 100화 완결 로드맵)

${arcsText || '스토리 구조 타임라인이 등록되어 있습니다.'}
`;

    contents['05-문체가이드.md'] = `# 05-문체가이드.md
작품: 《${project.title}》

## 3대 집필 원칙
1. 감정 명명 금지:
   - 슬픔, 분노, 두려움 단어를 직접 쓰지 않고 호흡, 심박수, 건조한 신체 반응으로 묘사.
2. 3중 보이스 분리:
   - 독백: 차가운 반말과 냉철한 계산
   - 연기: 상황에 맞춘 대외적 표정 및 대사
   - 서술: 건조한 관찰과 육체적 감각
3. 엔딩 훅 (클리프행어):
   - 모든 화와 씬의 끝은 상대의 침묵, 비밀 폭로, 인식 뒤집힘으로 종결하여 다음 화 결제를 유도.
`;

    // 2-챕터문서 (Dynamic Chapter Plans)
    chapterKeys.forEach((key, idx) => {
      const chNum = idx + 1;
      const pad = String(chNum).padStart(2, '0');
      const startEp = (chNum - 1) * 4 + 1;
      const endEp = Math.min(project.currentProgress?.episodesTarget || 100, chNum * 4);
      const isDone = chNum <= (project.currentProgress?.completedChapters || 0);
      const isCurrent = `ch${pad}` === project.currentProgress?.currentChapter;

      contents[key] = `# ${key}
작품: 《${project.title}》
챕터: ch${pad}
편성 화수: ${startEp}~${endEp}화
집필 상태: ${isDone ? '완결 (검토 통과)' : isCurrent ? '집필 진행 중' : '대기 (시놉시스 준비)'}

## 챕터 목표
- 핵심 사건: ${chNum === 1 ? '발단 및 세계관 규칙 도입, 주인공의 결핍 확인' : chNum === 2 ? '본격적인 사건 전개 및 갈등의 징후 포착' : chNum === 3 ? '1막 전환점 클리프행어 및 세력 대치' : `${chNum}챕터 핵심 사건 및 갈등 심화`}
- 씬 구성: 총 4~6개 씬 분할
- 엔딩 훅: 다음 화 결제를 유도하는 강렬한 위기 또는 진실 폭로
`;
    });

    // 3-집필문서 (씬)
    contents['3-집필문서/ch01-씬01.md'] = `# ch01-씬01.md
작품: 《${project.title}》
시점: 1인칭 주인공 시점 ('나')

문이 열리고 서늘한 공기가 목덜미를 스쳤다.
테이블 너머로 차가운 시선들이 쏟아져 내렸다.
나는 발소리를 죽인 채 세 걸음 앞으로 다가가 턱을 당겼다.

"왔습니다."

목소리 끝을 반 음 낮췄다. 거울 앞에서 수백 번을 연습했던 표정.
의심이 가득한 눈동자들이 나를 훑어내렸지만, 나는 눈썹 하나 까딱하지 않았다.
이제 시작일 뿐이었다.
`;

    contents['3-집필문서/ch01-씬02.md'] = `# ch01-씬02.md
작품: 《${project.title}》
침묵은 길지 않았다.
상석에 앉은 상대가 서류 봉투를 툭 내려놓으며 입을 열었다.

"자네가 가져온 게 진짜라고 확신하나?"

나는 천천히 고개를 들었다. 입꼬리를 아주 미세하게 끌어올리며 대답했다.
"직접 확인해 보시면 압니다. 그 숫자가 거짓말을 하는지."
`;

    // 4-연재본
    contents['4-연재본/ch01-연재본.md'] = `# 4-연재본/ch01-연재본.md
작품명: 《${project.title}》
제1장: 운명의 시작 (01~04화 통합본)
글자 수: 22,480자
퇴고 상태: 10단계 린터 검토 완료 (출간용)

[01화]
서늘한 밤공기 사이로 휴대폰 진동이 울렸다...
`;

    // 5-복선DB
    const foreshadowingText = (project.foreshadowing || [])
      .map(
        (f) => `- [${f.id}] ${f.title}
  - 위치: ${f.location} | 소속 아크: ${f.arc} | 상태: ${f.status}
  - 복선 단서: ${f.description}
  - 회수 카타르시스: ${f.payoff}`
      )
      .join('\n\n');

    contents['5-복선DB/복선추적DB.md'] = `# 5-복선DB/복선추적DB.md
작품: 《${project.title}》
등록된 복선 총 ${project.foreshadowing?.length || 0}건

${foreshadowingText || '등록된 복선이 없습니다.'}
`;

    // 6-미결과제
    const issuesText = (project.unresolvedIssues || [])
      .map(
        (i) => `- [${i.id}] ${i.title}
  - 분류: ${i.category} | 상태: ${i.status}
  - 상세 내용: ${i.description}`
      )
      .join('\n\n');

    contents['6-미결과제/미결과제목록.md'] = `# 6-미결과제/미결과제목록.md
작품: 《${project.title}》
미결 과제 총 ${project.unresolvedIssues?.length || 0}건

${issuesText || '미결 과제가 모두 해결되었습니다.'}
`;

    // aiwc-dashboard.json
    contents['aiwc-dashboard.json'] = JSON.stringify(
      {
        projectId: project.id,
        novelTitle: project.title,
        subtitle: project.subtitle,
        penName: project.penName,
        genre: project.genre,
        scale: project.scale,
        lastCommit: project.currentProgress?.commitHash || 'a1b2c3d',
        updatedAt: project.updatedAt || new Date().toISOString(),
        currentChapter: project.currentProgress?.currentChapter || 'ch01',
        currentChapterTitle: project.currentProgress?.currentChapterTitle || '발단',
        episodesOrganized: project.currentProgress?.episodesOrganized || 0,
        episodesTarget: project.currentProgress?.episodesTarget || 100,
        totalWordCount: project.currentProgress?.totalWordCount || 0,
        completedChapters: project.currentProgress?.completedChapters || 0,
        totalChapters: project.currentProgress?.totalChapters || 24,
        openIssues: project.currentProgress?.openIssues || 0,
        foreshadowingCount: project.foreshadowing?.length || 0,
        charactersCount: project.characters?.length || 0,
        arcsCount: project.arcs?.length || 0,
      },
      null,
      2
    );

    return contents;
  }, [project, chapterKeys]);

  if (!isOpen) return null;

  const currentContent = fileContents[selectedFile] || '# 파일 내용이 없습니다.';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold truncate">
                  프로젝트 워크스페이스 구조 ({project.title})
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                  {project.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                WebNovel-Studio와 옵시디언 파일트리 규격을 실시간으로 탐색할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Left Folder Tree */}
          <div className="w-full sm:w-72 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto text-xs shrink-0 space-y-1">
            <div className="font-extrabold text-slate-600 text-[11px] tracking-wide px-2 py-1.5 flex items-center gap-1.5 border-b border-slate-200 mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate">00-project-root ({project.title})</span>
            </div>

            {/* Folder 1: 1-기획문서 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFolder('1-기획문서')}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-slate-800 hover:bg-slate-200/80 rounded-lg font-bold text-left cursor-pointer transition-colors"
              >
                {expandedFolders['1-기획문서'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span>1-기획문서</span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">5 files</span>
              </button>

              {expandedFolders['1-기획문서'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {['01-계획서.md', '02-세계관.md', '03-캐릭터바이블.md', '04-스토리구조.md', '05-문체가이드.md'].map((file) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left truncate cursor-pointer transition-all ${
                        selectedFile === file
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                      <span className="truncate">{file}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Folder 2: 2-챕터문서 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFolder('2-챕터문서')}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-slate-800 hover:bg-slate-200/80 rounded-lg font-bold text-left cursor-pointer transition-colors"
              >
                {expandedFolders['2-챕터문서'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span>2-챕터문서</span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">{chapterKeys.length} files</span>
              </button>

              {expandedFolders['2-챕터문서'] && (
                <div className="pl-6 space-y-0.5 mt-0.5 max-h-48 overflow-y-auto pr-1">
                  {chapterKeys.map((file) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left truncate cursor-pointer transition-all ${
                        selectedFile === file
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                      <span className="truncate">{file}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Folder 3: 3-집필문서 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFolder('3-집필문서')}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-slate-800 hover:bg-slate-200/80 rounded-lg font-bold text-left cursor-pointer transition-colors"
              >
                {expandedFolders['3-집필문서'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span>3-집필문서 (씬 원문)</span>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">2 files</span>
              </button>

              {expandedFolders['3-집필문서'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {['3-집필문서/ch01-씬01.md', '3-집필문서/ch01-씬02.md'].map((file) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left truncate cursor-pointer transition-all ${
                        selectedFile === file
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                      <span className="truncate">{file.split('/')[1]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Folder 4: 4-연재본 */}
            <div>
              <button
                type="button"
                onClick={() => toggleFolder('4-연재본')}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-slate-800 hover:bg-slate-200/80 rounded-lg font-bold text-left cursor-pointer transition-colors"
              >
                {expandedFolders['4-연재본'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span>4-연재본 (화 병합)</span>
              </button>

              {expandedFolders['4-연재본'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFile('4-연재본/ch01-연재본.md')}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left truncate cursor-pointer transition-all ${
                      selectedFile === '4-연재본/ch01-연재본.md'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    <span className="truncate">ch01-연재본.md</span>
                  </button>
                </div>
              )}
            </div>

            {/* Folder 5: 5-복선DB */}
            <div>
              <button
                type="button"
                onClick={() => {
                  toggleFolder('5-복선DB');
                  setSelectedFile('5-복선DB/복선추적DB.md');
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-bold text-left cursor-pointer transition-colors ${
                  selectedFile === '5-복선DB/복선추적DB.md'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-800 hover:bg-slate-200/80'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                <span>5-복선DB (복선추적)</span>
                <span className="text-[10px] font-mono opacity-80 ml-auto">
                  {project.foreshadowing?.length || 0}
                </span>
              </button>
            </div>

            {/* Folder 6: 6-미결과제 */}
            <div>
              <button
                type="button"
                onClick={() => {
                  toggleFolder('6-미결과제');
                  setSelectedFile('6-미결과제/미결과제목록.md');
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-bold text-left cursor-pointer transition-colors ${
                  selectedFile === '6-미결과제/미결과제목록.md'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-800 hover:bg-slate-200/80'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                <span>6-미결과제 (이슈목록)</span>
                <span className="text-[10px] font-mono opacity-80 ml-auto">
                  {project.unresolvedIssues?.length || 0}
                </span>
              </button>
            </div>

            {/* File: aiwc-dashboard.json */}
            <div className="pt-2 border-t border-slate-200 mt-2">
              <button
                type="button"
                onClick={() => setSelectedFile('aiwc-dashboard.json')}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left truncate font-mono text-[11px] cursor-pointer transition-all ${
                  selectedFile === 'aiwc-dashboard.json'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>aiwc-dashboard.json</span>
              </button>
            </div>
          </div>

          {/* Right File Preview Area */}
          <div className="flex-1 p-5 overflow-y-auto bg-white flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono text-xs font-bold text-slate-800">{selectedFile}</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  {project.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Obsidian Markdown View</span>
            </div>

            <div className="font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 overflow-y-auto shadow-inner">
              {currentContent}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
