import { STORY_SPECS, CHARACTERS_DATA, EPISODES_DATA, ARCS_DATA, FORESHADOWING_DATABASE } from '../data/storyData';
import { WebNovelProject } from '../data/projectTemplates';

export const exportToWordDoc = (project?: WebNovelProject) => {
  const specs = project ? {
    title: project.title,
    subtitle: project.subtitle,
    penName: project.penName,
    genre: project.genre,
    background: project.background,
    scale: project.scale,
    pov: project.pov,
    target: project.target,
    serialization: project.serialization,
    coreConcept: project.coreConcept,
  } : STORY_SPECS;

  const characters = project?.characters || CHARACTERS_DATA;
  const arcs = project?.arcs || ARCS_DATA;
  const episodes = project?.episodes && project.episodes.length > 0 ? project.episodes : EPISODES_DATA;
  const foreshadowing = project?.foreshadowing || FORESHADOWING_DATABASE;

  const docHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office'
        xmlns:w='urn:schemas-microsoft-com:office:word'
        xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>WebNovel-Studio 웹소설 제작 플랫폼 기획서 - ${specs.title}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page Section1 {
        size: 595.3pt 841.9pt; /* A4 */
        margin: 56.7pt 56.7pt 56.7pt 56.7pt;
      }
      div.Section1 { page: Section1; }
      body {
        font-family: 'Malgun Gothic', '맑은 고딕', 'Arial', sans-serif;
        font-size: 10.5pt;
        line-height: 1.6;
        color: #1e293b;
      }
      h1 {
        font-size: 22pt;
        color: #0f172a;
        border-bottom: 3pt solid #1e3a8a;
        padding-bottom: 8pt;
        margin-bottom: 4pt;
      }
      h2 {
        font-size: 14pt;
        color: #1e3a8a;
        border-left: 4pt solid #2563eb;
        padding-left: 8pt;
        margin-top: 20pt;
        margin-bottom: 8pt;
      }
      h3 {
        font-size: 11.5pt;
        color: #334155;
        margin-top: 12pt;
        margin-bottom: 6pt;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10pt 0;
        font-size: 9pt;
      }
      th, td {
        border: 1px solid #94a3b8;
        padding: 6pt 8pt;
        text-align: left;
      }
      th {
        background-color: #f1f5f9;
        font-weight: bold;
        color: #0f172a;
      }
      .quote-box {
        background-color: #f8fafc;
        border-left: 3pt solid #3b82f6;
        padding: 10pt;
        font-style: italic;
        margin: 10pt 0;
      }
      .badge {
        display: inline-block;
        padding: 2pt 6pt;
        font-size: 8pt;
        font-weight: bold;
        background-color: #e2e8f0;
        color: #334155;
        border-radius: 3pt;
        margin-right: 4pt;
      }
    </style>
  </head>
  <body>
    <div class="Section1">
      <span class="badge">WebNovel-Studio SPECIFICATION · STRICTLY CONFIDENTIAL</span>
      <h1>${specs.title}</h1>
      <p style="color: #64748b; font-size: 11pt;">부제: ${specs.subtitle} | 필명: ${specs.penName} | WebNovel-Studio 아키텍처 및 상세 기획서</p>

      <h2>1. 작품 기본 제원</h2>
      <table>
        <tr><th width="25%">작품명</th><td>${specs.title}</td></tr>
        <tr><th>장르 구성비</th><td>${specs.genre}</td></tr>
        <tr><th>배경 설정</th><td>${specs.background}</td></tr>
        <tr><th>연재 규모</th><td>${specs.scale}</td></tr>
        <tr><th>시점 원칙</th><td>${specs.pov}</td></tr>
        <tr><th>타깃 독자</th><td>${specs.target}</td></tr>
        <tr><th>연재 전략</th><td>${specs.serialization}</td></tr>
      </table>

      <h2>2. 핵심 컨셉 및 로그라인</h2>
      <div class="quote-box">
        "${specs.coreConcept.logline}"
      </div>
      <p><strong>주제 의식:</strong> ${specs.coreConcept.theme}</p>
      <p><strong>감정 목표:</strong> ${specs.coreConcept.emotionalGoal}</p>
      <p><strong>결말 방침:</strong> ${specs.coreConcept.climaxEnding}</p>

      <h2>3. 주요 인물 바이블</h2>
      <table>
        <thead>
          <tr>
            <th width="20%">인물명</th>
            <th width="20%">역할</th>
            <th>설정 및 캐릭터 기능</th>
          </tr>
        </thead>
        <tbody>
          ${characters.map(c => `
            <tr>
              <td><strong>${c.name}</strong><br><small>${c.alias}</small></td>
              <td>${c.role}</td>
              <td>${c.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>4. 100화 4막 6아크 마스터 플랜</h2>
      <table>
        <thead>
          <tr>
            <th width="15%">아크</th>
            <th width="25%">제목</th>
            <th width="15%">챕터 범위</th>
            <th width="25%">해당 막</th>
            <th width="20%">진행 현황</th>
          </tr>
        </thead>
        <tbody>
          ${arcs.map(a => `
            <tr>
              <td>${a.id}</td>
              <td><strong>${a.title}</strong></td>
              <td>${a.chapters}</td>
              <td>${a.act}</td>
              <td>${a.done} / ${a.total} 완료</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>5. 핵심 복선 추적 데이터</h2>
      <table>
        <thead>
          <tr>
            <th width="15%">위치</th>
            <th width="25%">복선 내용</th>
            <th width="40%">회수 지점 및 경로</th>
            <th width="20%">상태</th>
          </tr>
        </thead>
        <tbody>
          ${foreshadowing.slice(0, 10).map(f => `
            <tr>
              <td>${f.location}</td>
              <td><strong>${f.title}</strong></td>
              <td>${f.payoff}</td>
              <td>${f.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>6. 플랫폼 시스템 아키텍처 및 파이프라인</h2>
      <pre style="background-color: #0a0f1d; color: #f8fafc; font-family: 'Consolas', monospace; font-size: 8.5pt; padding: 12pt; border-radius: 4pt; line-height: 1.5;">
project-root/
├── 1-기획문서/
│   ├── 01-계획서.md
│   ├── 02-세계관.md
│   ├── 03-캐릭터바이블.md
│   ├── 04-스토리구조.md
│   └── 05-문체가이드.md
├── 2-챕터문서/
│   └── ch01-챕터계획.md ~ ch24-챕터계획.md (기승전결 씬 분할)
├── 3-집필문서/
│   └── ch01/
│       └── s01.md ~ s14.md (씬 단위 본문 원문)
├── 4-연재본/
│   └── ch01.md ~ ch24.md (화당 6,000~8,000자 병합 완성본)
├── 5-검토기록/
│   ├── 씬구성진단
│   ├── 퇴고 체크리스트
│   └── 페이싱 리포트
├── 6-덜어내기/
│   └── (분량 조절 시 잘라낸 씬 아카이빙)
└── aiwc-dashboard.json
      </pre>
    </div>
  </body>
  </html>
  `;

  const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `WebNovel_Studio_상세기획서_${specs.title.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
