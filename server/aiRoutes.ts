import type { Express, Response } from 'express';
import { AiError, callModel, isProvider, modelInfo } from './aiGateway';

const sendAiError = (res: Response, err: unknown) => {
  const e = err instanceof AiError ? err : new AiError('internal_error', (err as any)?.message || '서버 오류', 500);
  if (e.code === 'cancelled') {
    // 클라이언트가 이미 연결을 끊은 경우 응답 시도만 한다.
    if (!res.headersSent) res.status(499).json({ success: false, status: 'failed', code: e.code, error: e.message });
    return;
  }
  console.warn(`[ai] ${e.code}: ${e.message}`);
  if (!res.headersSent) {
    res.status(e.status).json({ success: false, status: 'failed', code: e.code, error: e.message });
  }
};

// 클라이언트가 연결을 끊으면 외부 AI 호출도 취소한다.
const abortOnDisconnect = (res: Response) => {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  return controller.signal;
};

const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : '');

const DEFAULT_STYLE_GUIDE =
  '작품 문체 지침이 제공되지 않았다. 입력된 줄거리와 등장인물 정보에 맞는 시점과 어조를 유지하고, 감정 단어를 직접 쓰기보다 행동과 장면으로 보여 준다.';

export const registerAiRoutes = (app: Express) => {
  // 연결 테스트: 실제 호출 경로(callModel)와 동일하다.
  app.post('/api/ai/test-connection', async (req, res) => {
    try {
      const { provider, apiKey, model } = req.body || {};
      if (!isProvider(provider)) {
        return res.status(400).json({ success: false, status: 'failed', error: '지원되지 않는 AI 제공자입니다.' });
      }
      const result = await callModel({
        provider,
        apiKey,
        model,
        prompt: 'WebNovel-Studio 연결 확인. "OK" 라고만 답하세요.',
        maxTokens: 16,
        temperature: 0,
        timeoutMs: 15000,
        signal: abortOnDisconnect(res),
      });
      res.json({
        success: true,
        status: 'ok',
        message: `${provider} (${result.requestedModel}) 연결 정상. 실행 모델: ${result.actualModel}, 응답 지연: ${result.latencyMs}ms`,
        response: result.text.trim().slice(0, 100),
        ...modelInfo(result),
      });
    } catch (err) {
      sendAiError(res, err);
    }
  });

  // 씬 초고 생성. 실패하면 예시 원고를 반환하지 않고 실패로 응답한다.
  app.post('/api/aiwc/generate-scene', async (req, res) => {
    try {
      const b = req.body || {};
      const targetWordCount = Number(b.targetWordCount) > 0 ? Number(b.targetWordCount) : 1500;

      const system = `당신은 웹소설 집필을 돕는 AI 파트너 작가입니다. 작가가 승인하기 전의 초고를 작성합니다.
[작품 문체 지침]
${str(b.styleGuide, 4000) || DEFAULT_STYLE_GUIDE}`;

      const prompt = `다음 씬의 웹소설 본문을 집필해 주세요.
작품: ${str(b.projectTitle, 200) || '(제목 미정)'}
챕터: ${str(b.chapterTitle, 200) || '(미지정)'}
씬: ${str(b.sceneNumber, 20)}번 씬 - 「${str(b.sceneTitle, 200)}」
유형: ${str(b.pacingType, 50) || '전진'} (엔딩 훅: ${b.isEndingHook ? '필수' : '선택'})
등장인물: ${str(b.characters, 1000) || '줄거리에 등장하는 인물'}
직전 사건: ${str(b.previousEvents, 1500) || '(제공되지 않음)'}
줄거리 개요: ${str(b.synopsis, 3000) || '(제공되지 않음)'}
추가 지시: ${str(b.customPrompt, 2000) || '(없음)'}

목표 분량: 약 ${targetWordCount}자의 완성된 본문 텍스트만 출력하세요. 해설이나 머리말은 쓰지 않습니다.`;

      const result = await callModel({
        provider: b.provider,
        apiKey: b.apiKey,
        model: b.model,
        system,
        prompt,
        temperature: typeof b.temperature === 'number' ? b.temperature : 0.75,
        maxTokens: Number(b.maxTokens) > 0 ? Number(b.maxTokens) : 3500,
        timeoutMs: 90000,
        signal: abortOnDisconnect(res),
      });

      res.json({
        success: true,
        status: 'ok',
        isDemo: false,
        text: result.text,
        wordCount: result.text.length,
        modelUsed: result.requestedModel,
        ...modelInfo(result),
      });
    } catch (err) {
      sendAiError(res, err);
    }
  });

  // 챕터/씬 검토. 고정 점수나 예시 리포트를 반환하지 않는다.
  app.post('/api/aiwc/review-chapter', async (req, res) => {
    try {
      const b = req.body || {};
      const sceneText = str(b.sceneText, 6000).trim();
      if (!sceneText) {
        return res.status(400).json({ success: false, status: 'failed', error: '검토할 본문이 비어 있습니다.' });
      }

      const prompt = `다음 웹소설 씬을 검토해 주세요.
[작품 문체 지침]
${str(b.styleGuide, 4000) || DEFAULT_STYLE_GUIDE}

검토 항목:
1. 위 문체 지침(시점, 어조, 금지 규칙) 위반 여부와 해당 문장
2. 설명 과잉, 꾸밈, 돌려 말하기, 반복, 쪼갠 문장, 빈자리 후보 (문장을 인용하고 이유를 쓸 것)
3. 감정을 직접 명명한 문장이 있는지
4. 엔딩 훅의 효과와 개선 제안
점수는 근거를 설명할 수 있을 때만 쓰고, 최종 판단은 작가가 한다고 명시하세요.

본문:
"""
${sceneText}
"""`;

      const result = await callModel({
        provider: b.provider,
        apiKey: b.apiKey,
        model: b.model,
        prompt,
        temperature: 0.3,
        maxTokens: 2500,
        timeoutMs: 60000,
        signal: abortOnDisconnect(res),
      });

      res.json({
        success: true,
        status: 'ok',
        isDemo: false,
        review: result.text,
        ...modelInfo(result),
      });
    } catch (err) {
      sendAiError(res, err);
    }
  });

  // %% 주석 편집: 작가의 주석에 답하고 윤문본을 돌려준다. 저장은 하지 않으며 작가가 비교노트에서 판정한다.
  app.post('/api/aiwc/revise-scene', async (req, res) => {
    try {
      const b = req.body || {};
      const sceneText = str(b.sceneText, 12000).trim();
      if (!sceneText) {
        return res.status(400).json({ success: false, status: 'failed', error: '윤문할 본문이 비어 있습니다.' });
      }
      const annotations: { index: number; comment: string; anchor: string }[] = Array.isArray(b.annotations)
        ? b.annotations
            .filter((a: any) => a && typeof a.comment === 'string')
            .slice(0, 50)
            .map((a: any, i: number) => ({ index: Number.isInteger(a.index) ? a.index : i, comment: str(a.comment, 500), anchor: str(a.anchor, 500) }))
        : [];

      const prompt = `다음 웹소설 씬을 작가의 주석에 따라 윤문해 주세요.
[작품 문체 지침]
${str(b.styleGuide, 4000) || DEFAULT_STYLE_GUIDE}

규칙:
- 작가 주석이 있는 부분만 고치고, 나머지 문장은 한 글자도 바꾸지 않습니다.
- 주석이 없으면 설명 과잉, 꾸밈, 돌려 말하기, 반복, 쪼갠 문장, 빈자리 후보만 최소한으로 고칩니다.
- 설정과 사건을 새로 만들거나 바꾸지 않습니다.
- 반드시 JSON 으로만 답하고 코드블록은 쓰지 않습니다: {"revised": "윤문된 전체 본문(주석 제거)", "replies": [{"index": 주석번호, "reply": "작가에게 하는 짧은 답변과 고친 이유"}]}

작가 주석:
${annotations.length ? annotations.map((a) => `#${a.index} (앞 문장: ${a.anchor || '없음'}) ${a.comment}`).join('\n') : '(없음)'}

본문:
"""
${sceneText}
"""`;

      const result = await callModel({
        provider: b.provider,
        apiKey: b.apiKey,
        model: b.model,
        prompt,
        temperature: 0.3,
        maxTokens: Number(b.maxTokens) > 0 ? Number(b.maxTokens) : 4000,
        timeoutMs: 90000,
        signal: abortOnDisconnect(res),
      });

      let clean = result.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch {
        throw new AiError('invalid_format', 'AI 응답을 JSON 으로 해석하지 못했습니다. 다시 시도해주세요.');
      }
      if (typeof parsed?.revised !== 'string' || !parsed.revised.trim()) {
        throw new AiError('invalid_format', 'AI가 윤문 본문을 반환하지 않았습니다. 다시 시도해주세요.');
      }
      res.json({
        success: true,
        status: 'ok',
        isDemo: false,
        revised: parsed.revised,
        replies: Array.isArray(parsed.replies)
          ? parsed.replies.filter((r: any) => r && typeof r.reply === 'string').map((r: any) => ({ index: Number(r.index), reply: String(r.reply) }))
          : [],
        ...modelInfo(result),
      });
    } catch (err) {
      sendAiError(res, err);
    }
  });

  // 기획안 3종. 실패 시 기본은 실패 응답이며, allowDemo=true 일 때만 예시를 isDemo 로 표시해 반환한다.
  app.post('/api/ai/generate-proposals', async (req, res) => {
    const b = req.body || {};
    const genreKey = str(b.genreKey, 50);
    const genreLabel = str(b.genreLabel, 100);
    const keywords: string[] = Array.isArray(b.keywords)
      ? b.keywords.filter((k: unknown) => typeof k === 'string').slice(0, 20)
      : [];
    const sourceContext = str(b.sourceContext, 3000);
    const sourceUrl = str(b.sourceUrl, 500);
    const customPrompt = str(b.customPrompt, 1000);

    try {
      const prompt = `당신은 웹소설 기획자입니다.
다음 조건과 작가가 제공한 스토리라인 소스를 분석해 100화 완결 웹소설 기획안 3개와 추천 키워드 6~8개를 생성해 주세요.

[요청 조건]
- 선택 장르: ${genreLabel || genreKey}
- 작가가 입력한 스토리라인 소스: ${sourceContext ? `"""\n${sourceContext}\n"""` : '없음 (장르 트렌드 기반 창작)'}
${sourceUrl ? `- 참고 URL: ${sourceUrl}` : ''}
- 핵심 키워드: ${keywords.join(', ') || '(없음)'}
${customPrompt ? `- 작가 특별 요청: ${customPrompt}` : ''}

반드시 유효한 JSON 으로만 응답하고 마크다운 코드블록은 쓰지 마세요.
최상위는 "keywords", "storySummary", "proposals" 키를 가진 객체입니다.
proposals 의 각 항목 키: id, tabLabel, badge, title, subtitle, penName, genreBreakdown, targetEpisodes(숫자 100), background, scale, pov, target, serialization, logline, sellingPoint, worldThesis, specialRules, protagonistName, protagonistRole, protagonistLack, protagonistCheat, protagonistQuote, companionName, antagonistName, rivalName, personaId("sankyeong")
{ "keywords": ["#키워드"], "storySummary": "3~4문장 요약", "proposals": [ {...}, {...}, {...} ] }`;

      const result = await callModel({
        provider: b.provider,
        apiKey: b.apiKey,
        model: b.model,
        prompt,
        temperature: 0.8,
        maxTokens: 6000,
        timeoutMs: 90000,
        signal: abortOnDisconnect(res),
      });

      let clean = result.text.trim();
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch {
        throw new AiError('invalid_format', 'AI 응답을 JSON 으로 해석하지 못했습니다. 다시 시도해주세요.');
      }
      const proposals = Array.isArray(parsed) ? parsed : parsed.proposals;
      if (!Array.isArray(proposals) || proposals.length < 3) {
        throw new AiError('invalid_format', 'AI가 기획안 3개를 반환하지 않았습니다. 다시 시도해주세요.');
      }

      res.json({
        success: true,
        status: 'ok',
        isRealAi: true,
        isDemo: false,
        proposals: proposals.slice(0, 3),
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        storySummary:
          typeof parsed.storySummary === 'string' && parsed.storySummary.trim()
            ? parsed.storySummary.trim()
            : proposals[0]?.logline || '',
        ...modelInfo(result),
      });
    } catch (err) {
      if (b.allowDemo === true && !(err instanceof AiError && err.code === 'cancelled')) {
        const demo = buildDemoProposals(genreKey, genreLabel, keywords, sourceContext);
        return res.json({
          success: true,
          status: 'demo',
          isRealAi: false,
          isDemo: true,
          demoNotice: `AI 호출에 실패하여 예시 데이터를 표시합니다. (${err instanceof AiError ? err.message : '알 수 없는 오류'})`,
          ...demo,
        });
      }
      sendAiError(res, err);
    }
  });
};

function buildDemoProposals(genreKey: string, genreLabel: string, keywords: string[], sourceContext: string) {
    const kwText = keywords.length > 0 ? keywords.join(' ') : '사이다 반전';
    const firstKw = keywords[0]?.replace('#', '') || '비밀';
    const secondKw = keywords[1]?.replace('#', '') || '지분';
    const thirdKw = keywords[2]?.replace('#', '') || '복수';

    const dynamicProposals = [
      {
        id: `dyn-1-${Date.now()}`,
        tabLabel: `추천 1: [${firstKw} & ${secondKw} 중심 극대화형]`,
        badge: `${firstKw} 특화 · 사이다`,
        title: `${firstKw}을(를) 독점한 자가 세계를 지배한다`,
        subtitle: `${secondKw}의 힘으로 ${thirdKw}의 전복을 이뤄내다`,
        penName: '별빛서사',
        genreBreakdown: `${genreLabel || '현대판타지'} 60% · ${firstKw} 25% · 두뇌전 15%`,
        targetEpisodes: 100,
        background: `${genreLabel || '작품'} 설정에 따른 핵심 무대 및 적대 카르텔 본거지`,
        scale: '100화 완결 (4막 6아크 24챕터)',
        pov: "1인칭 주인공 시점 ('나')",
        target: '2030 스마트폰 웹소설 독자층',
        serialization: '주 7회 성실 연재 (카카오/시리즈 18:00)',
        logline: `${firstKw}과 관련된 숨겨진 비밀을 손에 쥔 주인공이, 자신을 몰락시켰던 적대 세력을 상대로 ${secondKw}을(를) 활용해 하나씩 무너뜨려 나가는 통쾌한 이야기.`,
        sellingPoint: `${firstKw}을(를) 이용한 압도적 권능 + 매 아크마다 밝혀지는 충격적인 진실과 사이다 카타르시스`,
        worldThesis: `모든 인간관계와 가치가 ${firstKw}의 보유 여부로 판가름 나는 냉혹한 세계.`,
        specialRules: `${firstKw} 계약 시 위반 페널티 룰 및 48시간 내 대응 프로토콜`,
        protagonistName: `유이현 (26세 / ${firstKw}의 계승자)`,
        protagonistRole: '주인공 / 서사의 주도자',
        protagonistLack: '과거 소중한 사람을 지키지 못했다는 뼈아픈 자책감',
        protagonistCheat: `${firstKw}을(를) 자유자재로 다루는 독점적 권능과 냉철한 계산력`,
        protagonistQuote: `"네가 빼앗은 모든 것을 원금에 이자까지 쳐서 돌려받겠다."`,
        companionName: '강태우 (신뢰할 수 있는 핵심 조력자)',
        antagonistName: '서도진 (모든 비극의 배후 주동자)',
        rivalName: '윤채린 (예측 불가능한 내부 복병)',
        personaId: genreKey === 'hunter' ? 'singshong' : genreKey === 'wuxia' ? 'biga' : genreKey === 'romfantasy' ? 'solche' : 'sankyeong'
      },
      {
        id: `dyn-2-${Date.now()}`,
        tabLabel: `추천 2: [${secondKw} 반전 & 전략적 쟁패형]`,
        badge: `${secondKw} 반전 · 전략 쾌감`,
        title: `내가 버린 ${secondKw}이(가) 제국을 삼켰다`,
        subtitle: `나락에서 시작된 가장 완벽한 ${thirdKw}`,
        penName: '흑요석',
        genreBreakdown: `${genreLabel || '현대판타지'} 55% · ${secondKw} 30% · 심리전 15%`,
        targetEpisodes: 100,
        background: `철저한 서열 중심의 상류 사회 및 은밀한 지하 거래소`,
        scale: '100화 완결 (4막 6아크 24챕터)',
        pov: "1인칭 주인공 시점 ('나')",
        target: '남녀 전 연령대 웹소설 애호가',
        serialization: '주 6회 월~토 연재 (문피아/시리즈 19:00)',
        logline: `가장 밑바닥으로 추락했던 주인공이 ${secondKw}의 숨겨진 가치를 홀로 꿰뚫어보고, 거대 권력층의 눈을 피해 판세를 뒤흔들며 정상에 오르는 이야기.`,
        sellingPoint: `적들의 방심을 찌르는 치밀한 두뇌 싸움과 ${secondKw}을(를) 통한 역전승의 도파민`,
        worldThesis: `겉으로는 공정한 질서를 표방하나 이면에는 ${secondKw}의 독점이 지배하는 부조리한 질서.`,
        specialRules: `비밀 유출 시 계좌 및 권리 동결 조항. 3대 가문의 불가침 협약.`,
        protagonistName: `한도윤 (25세 / 판세를 뒤흔드는 지략가)`,
        protagonistRole: '주인공 / 언더독의 반란',
        protagonistLack: '자신을 배신한 집단으로부터 버림받은 상처',
        protagonistCheat: `남들이 보지 못하는 ${secondKw}의 데이터와 미래를 읽는 혜안`,
        protagonistQuote: `"규칙을 만든 게 너희라면, 그 규칙을 깨부수는 건 나다."`,
        companionName: '민아린 (정보길드 마스터이자 자금책)',
        antagonistName: '천태준 (오만한 권력의 정점)',
        rivalName: '백승현 (주인공의 성장을 뒤쫓는 라이벌)',
        personaId: genreKey === 'hunter' ? 'chugong' : genreKey === 'wuxia' ? 'hanjungwolya' : 'sankyeong'
      },
      {
        id: `dyn-3-${Date.now()}`,
        tabLabel: `추천 3: [${thirdKw} 클라이맥스 & 완전 제패형]`,
        badge: `${thirdKw} 심판 · 대단원 사이다`,
        title: `${thirdKw}의 끝에서 신이 되기로 했다`,
        subtitle: `모든 금기를 깨부순 단 하나의 절대자`,
        penName: '크로니클',
        genreBreakdown: `${genreLabel || '현대판타지'} 50% · ${thirdKw} 35% · 대서사 15%`,
        targetEpisodes: 100,
        background: `정재계 혹은 대륙 전역을 아우르는 최상위 결전 무대`,
        scale: '100화 완결 (4막 6아크 24챕터)',
        pov: "1인칭 주인공 시점 ('나')",
        target: '통쾌하고 거침없는 대단원 완결을 선호하는 독자층',
        serialization: '주 5회 월~금 연재 (카카오/시리즈 18:00)',
        logline: `세상의 부조리를 강요하던 지배자들을 향해 최후의 ${thirdKw}을(를) 선언한 주인공이, 감춰진 세계의 진실을 만천하에 드러내고 새로운 질서를 세우는 장대한 서사.`,
        sellingPoint: `망설임 없는 사이다 처단 + 모든 복선이 하나로 맞춰지는 95화 주총/결전 클라이맥스 카타르시스`,
        worldThesis: `오직 결과와 실력만이 용납되는 비정한 승자독식의 정글.`,
        specialRules: `최후의 결전에서 패배한 자는 영구 제명 및 모든 권리 몰수.`,
        protagonistName: `강서진 (24세 / 새로운 질서의 설계자)`,
        protagonistRole: '주인공 / 절대 심판자',
        protagonistLack: '완벽주의에 가까운 강박과 고독',
        protagonistCheat: `${thirdKw}을(를) 완벽히 성공시키는 초월적 실행력과 시스템 권능`,
        protagonistQuote: `"사죄는 필요 없다. 네가 한 일에 걸맞은 대가를 치러라."`,
        companionName: '윤세아 (신뢰의 동반자)',
        antagonistName: '서진우 (가장 거대한 최후의 흑막)',
        rivalName: '이하늘 (마지막 순간 주인공을 인정하는 적)',
        personaId: genreKey === 'romfantasy' ? 'solche' : genreKey === 'fantasy' ? 'yuryeohan' : 'sankyeong'
      }
    ];
  return {
    proposals: dynamicProposals,
    keywords: keywords.length > 0 ? keywords : [`#${firstKw}`, `#${secondKw}`, `#${thirdKw}`],
    storySummary: sourceContext
      ? `[예시] ${sourceContext.slice(0, 160)}...`
      : `[예시] ${genreLabel || '웹소설'} 장르의 ${firstKw}, ${secondKw}, ${thirdKw} 키워드 예시 스토리라인입니다.`,
  };
}
