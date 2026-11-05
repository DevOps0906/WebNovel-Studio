// 윤문·검토 도구 (R-01~R-05). 규칙으로 후보를 찾고, 고칠지는 작가가 판정한다.

// ---- 문장 분리 ----

/** 따옴표 안의 마침표에서 끊지 않고 문장을 나눈다. 줄바꿈은 문장 경계로 본다. */
export const splitSentences = (text: string): string[] => {
  const out: string[] = [];
  for (const rawLine of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    let buf = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      buf += ch;
      if (ch === '"' || ch === '“' || ch === '”') {
        const wasIn = inQuote;
        if (ch === '“') inQuote = true;
        else if (ch === '”') inQuote = false;
        else inQuote = !inQuote;
        // 대사가 마침표로 끝난 채 닫히면 거기서 문장을 끊는다
        if (wasIn && !inQuote && /[.!?…]/.test(buf[buf.length - 2] || '')) {
          out.push(buf.trim());
          buf = '';
          continue;
        }
      }
      const isEnd = /[.!?…]/.test(ch) && !inQuote;
      if (isEnd) {
        const next = line[i + 1];
        if (next === undefined || /\s/.test(next) || /["”'’)]/.test(next)) {
          // 닫는 따옴표가 바로 뒤따르면 함께 붙인다
          if (next && /["”'’)]/.test(next)) {
            buf += next;
            i++;
            if (next === '"' || next === '”') inQuote = false;
          }
          out.push(buf.trim());
          buf = '';
        }
      }
    }
    if (buf.trim()) out.push(buf.trim());
  }
  return out;
};

// ---- R-01: %% 주석 ----

export interface Annotation {
  index: number;
  start: number;
  end: number;
  comment: string;
  /** 주석 바로 앞 문장 (어디에 대한 의견인지) */
  anchor: string;
}

export const parseAnnotations = (text: string): Annotation[] => {
  const out: Annotation[] = [];
  const re = /%%([\s\S]*?)%%/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const before = text.slice(0, m.index);
    const sentences = splitSentences(before.replace(/%%[\s\S]*?%%/g, ''));
    out.push({
      index: out.length,
      start: m.index,
      end: m.index + m[0].length,
      comment: m[1].trim(),
      anchor: sentences.length ? sentences[sentences.length - 1] : '',
    });
  }
  return out;
};

export const stripAnnotations = (text: string): string => text.replace(/%%[\s\S]*?%%/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

/** 짝이 맞지 않는 %% 가 있는지 */
export const hasUnclosedAnnotation = (text: string): boolean => (text.match(/%%/g) || []).length % 2 === 1;

// ---- R-03: 윤문 6유형 후보 ----

export type StyleType = '설명 과잉' | '꾸밈' | '돌려 말하기' | '반복' | '쪼갠 문장' | '빈자리';

export interface StyleIssue {
  type: StyleType;
  sentence: string;
  reason: string;
  /** 문장 순번 (splitSentences 결과 기준) */
  index: number;
}

const EXPLAIN_PATTERNS: [RegExp, string][] = [
  [/(즉|다시 말해|말하자면|요컨대)[,\s]/, "풀어 쓰는 연결어('즉', '다시 말해')"],
  [/(라는|라는\s)?\s*(뜻|의미|이유)(였다|이었다|이다|였던 것이다)/, '뜻·이유를 설명하는 서술'],
  [/(하기 위해서|하려는 것|하려던 것)(였다|이었다|이다)/, '의도를 설명하는 서술'],
  [/(때문이었다|때문이다|까닭이었다)\s*[.!?]?$/, '원인을 덧붙이는 서술'],
];

const INDIRECT_PATTERNS: [RegExp, string][] = [
  [/(것 같았다|듯했다|듯하였다|듯 보였다|듯싶었다)/, "추측형 마무리('~듯했다', '~것 같았다')"],
  [/(수도 있었다|수 있을지도|지도 모른다|지도 몰랐다)/, '단정을 피하는 표현'],
  [/(하지 않을 수 없었다|않을 수가 없었다)/, '이중 부정으로 돌려 말함'],
  [/(셈이었다|셈이다|이라 할 수 있었다|라고 할 수 있었다)/, "'~셈이다'류 우회"],
];

const SIMILE = /(마치|처럼|같은|같이|듯이|인 양|듯)/g;

const isShort = (s: string) => s.replace(/["“”'’\s]/g, '').length <= 9;

const isDialogueOnly = (s: string) => /^["“].*["”]$/.test(s.trim());

export const detectStyleIssues = (text: string): StyleIssue[] => {
  const sentences = splitSentences(stripAnnotations(text));
  const issues: StyleIssue[] = [];
  const push = (type: StyleType, i: number, reason: string) => issues.push({ type, sentence: sentences[i], reason, index: i });

  sentences.forEach((s, i) => {
    for (const [re, why] of EXPLAIN_PATTERNS) {
      if (re.test(s)) {
        push('설명 과잉', i, why);
        break;
      }
    }
    const similes = (s.match(SIMILE) || []).length;
    const commaChain = (s.match(/[하며고]\s*[,，]/g) || []).length >= 3;
    if (similes >= 2) push('꾸밈', i, `비유 표현이 한 문장에 ${similes}개 겹칩니다.`);
    else if (commaChain) push('꾸밈', i, '수식이 쉼표로 길게 이어집니다.');
    for (const [re, why] of INDIRECT_PATTERNS) {
      if (re.test(s)) {
        push('돌려 말하기', i, why);
        break;
      }
    }
  });

  // 쪼갠 문장: 아주 짧은 서술 문장이 3개 이상 연속 (대사 제외)
  let run: number[] = [];
  const flushRun = () => {
    if (run.length >= 3) push('쪼갠 문장', run[0], `짧은 문장이 ${run.length}개 연속입니다. 맥락이 이어지면 합칠 수 있습니다.`);
    run = [];
  };
  sentences.forEach((s, i) => {
    if (isShort(s) && !isDialogueOnly(s)) run.push(i);
    else flushRun();
  });
  flushRun();

  // 빈자리: 대사만 6줄 이상 이어지고 동작·표정 서술이 없음
  let dlg: number[] = [];
  const flushDlg = () => {
    if (dlg.length >= 6) push('빈자리', dlg[0], `대사가 ${dlg.length}줄 연속이고 동작·표정 서술이 없습니다.`);
    dlg = [];
  };
  sentences.forEach((s, i) => {
    if (isDialogueOnly(s)) dlg.push(i);
    else flushDlg();
  });
  flushDlg();

  return issues.sort((a, b) => a.index - b.index);
};

// ---- R-04: 반복 점검 (화 단위) ----

export interface RepetitionFinding {
  kind: '문장 시작' | '어구';
  phrase: string;
  count: number;
}

const words = (s: string) => s.replace(/["“”'’.,!?…~\-—()]/g, ' ').split(/\s+/).filter(Boolean);

export const detectRepetition = (text: string, opts: { minStarts?: number; minPhrase?: number } = {}): RepetitionFinding[] => {
  const minStarts = opts.minStarts ?? 4;
  const minPhrase = opts.minPhrase ?? 3;
  const sentences = splitSentences(stripAnnotations(text)).filter((s) => !isDialogueOnly(s));
  const out: RepetitionFinding[] = [];

  const starts = new Map<string, number>();
  for (const s of sentences) {
    const w = words(s);
    if (w.length < 3) continue;
    const key = w.slice(0, 2).join(' ');
    starts.set(key, (starts.get(key) || 0) + 1);
  }
  starts.forEach((count, phrase) => {
    if (count >= minStarts) out.push({ kind: '문장 시작', phrase, count });
  });

  const grams = new Map<string, number>();
  for (const s of sentences) {
    const w = words(s);
    const seen = new Set<string>();
    for (let i = 0; i + 4 <= w.length; i++) {
      const g = w.slice(i, i + 4).join(' ');
      if (g.length < 8 || seen.has(g)) continue;
      seen.add(g);
      grams.set(g, (grams.get(g) || 0) + 1);
    }
  }
  grams.forEach((count, phrase) => {
    if (count >= minPhrase) out.push({ kind: '어구', phrase, count });
  });

  return out.sort((a, b) => b.count - a.count).slice(0, 30);
};

// ---- R-05: 대사·문장 통계 ----

export interface TextStats {
  totalChars: number;
  dialogueChars: number;
  dialogueRatio: number; // 0~1
  sentenceCount: number;
  avgSentenceLength: number;
  medianSentenceLength: number;
  lengthBuckets: { label: string; count: number }[];
  duplicateDialogues: { line: string; count: number }[];
}

export const computeTextStats = (text: string): TextStats => {
  const clean = stripAnnotations(text);
  const total = clean.replace(/\s/g, '').length;
  let dialogue = 0;
  const re = /["“]([^"”\n]*)["”]/g;
  let m: RegExpExecArray | null;
  const dialogueLines = new Map<string, number>();
  while ((m = re.exec(clean))) {
    const inner = m[1].trim();
    dialogue += inner.replace(/\s/g, '').length;
    if (inner.length >= 4) dialogueLines.set(inner, (dialogueLines.get(inner) || 0) + 1);
  }
  const sentences = splitSentences(clean);
  const lens = sentences.map((s) => s.replace(/\s/g, '').length).sort((a, b) => a - b);
  const sum = lens.reduce((a, b) => a + b, 0);
  const median = lens.length ? (lens.length % 2 ? lens[(lens.length - 1) / 2] : (lens[lens.length / 2 - 1] + lens[lens.length / 2]) / 2) : 0;
  const buckets = [
    { label: '~10자', test: (n: number) => n <= 10 },
    { label: '11~30자', test: (n: number) => n > 10 && n <= 30 },
    { label: '31~60자', test: (n: number) => n > 30 && n <= 60 },
    { label: '61자~', test: (n: number) => n > 60 },
  ].map((b) => ({ label: b.label, count: lens.filter(b.test).length }));

  return {
    totalChars: total,
    dialogueChars: dialogue,
    dialogueRatio: total ? dialogue / total : 0,
    sentenceCount: sentences.length,
    avgSentenceLength: lens.length ? Math.round((sum / lens.length) * 10) / 10 : 0,
    medianSentenceLength: median,
    lengthBuckets: buckets,
    duplicateDialogues: Array.from(dialogueLines.entries())
      .filter(([, c]) => c >= 2)
      .map(([line, count]) => ({ line, count }))
      .sort((a, b) => b.count - a.count),
  };
};

// ---- R-02: 윤문 비교노트와 판정표 ----

export type Verdict = '미판정' | '채택' | '기각' | '보류';

export interface DiffSegment {
  id: string;
  original: string;
  revised: string;
  /** 변경된 구간인지. false 면 그대로 둔 문장 */
  changed: boolean;
  reason: string;
  verdict: Verdict;
}

export interface ReviewNote {
  id: string;
  /** chapterId/sceneId */
  sceneRef: string;
  createdAt: string;
  segments: DiffSegment[];
}

/** 문장 단위 LCS 로 원문과 윤문본을 맞춘다. 인접한 삭제·추가는 하나의 변경 구간으로 묶는다. */
export const diffSentences = (original: string, revised: string): DiffSegment[] => {
  const a = splitSentences(original);
  const b = splitSentences(revised);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const segs: DiffSegment[] = [];
  let id = 0;
  const mk = (o: string, r: string, changed: boolean): DiffSegment => ({
    id: `seg-${id++}`,
    original: o,
    revised: r,
    changed,
    reason: '',
    verdict: changed ? '미판정' : '채택',
  });

  let i = 0;
  let j = 0;
  let delBuf: string[] = [];
  let addBuf: string[] = [];
  const flush = () => {
    if (delBuf.length || addBuf.length) segs.push(mk(delBuf.join(' '), addBuf.join(' '), true));
    delBuf = [];
    addBuf = [];
  };
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flush();
      segs.push(mk(a[i], b[j], false));
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      delBuf.push(a[i++]);
    } else {
      addBuf.push(b[j++]);
    }
  }
  while (i < n) delBuf.push(a[i++]);
  while (j < m) addBuf.push(b[j++]);
  flush();
  return segs;
};

/** 판정을 반영한 최종 본문. 채택은 윤문본, 기각·보류·미판정은 원문을 쓴다. */
export const applyVerdicts = (segments: DiffSegment[]): string =>
  segments
    .map((s) => (!s.changed ? s.original : s.verdict === '채택' ? s.revised : s.original))
    .filter((t) => t.length > 0)
    .join('\n');

export const verdictSummary = (segments: DiffSegment[]) => {
  const changed = segments.filter((s) => s.changed);
  return {
    total: changed.length,
    adopted: changed.filter((s) => s.verdict === '채택').length,
    rejected: changed.filter((s) => s.verdict === '기각').length,
    held: changed.filter((s) => s.verdict === '보류').length,
    pending: changed.filter((s) => s.verdict === '미판정').length,
  };
};
