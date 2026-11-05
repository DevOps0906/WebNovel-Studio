import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitSentences,
  parseAnnotations,
  stripAnnotations,
  hasUnclosedAnnotation,
  detectStyleIssues,
  detectRepetition,
  computeTextStats,
  diffSentences,
  applyVerdicts,
  verdictSummary,
} from '../src/data/editing';

test('splitSentences: 따옴표 안의 마침표에서 끊지 않는다', () => {
  const s = splitSentences('나는 문을 열었다. "왔느냐. 앉거라." 그가 말했다.\n다음 줄이다');
  assert.deepEqual(s, ['나는 문을 열었다.', '"왔느냐. 앉거라."', '그가 말했다.', '다음 줄이다']);
});

test('R-01: %% 주석을 위치와 함께 찾고, 직전 문장을 앵커로 잡는다', () => {
  const t = '그는 웃었다. 하지만 눈은 웃지 않았다. %% 이 문장 너무 설명적임 %% 나는 침을 삼켰다.';
  const a = parseAnnotations(t);
  assert.equal(a.length, 1);
  assert.equal(a[0].comment, '이 문장 너무 설명적임');
  assert.equal(a[0].anchor, '하지만 눈은 웃지 않았다.');
  assert.equal(stripAnnotations(t).includes('%%'), false);
  assert.ok(stripAnnotations(t).includes('나는 침을 삼켰다.'));
});

test('R-01: 여러 줄 주석과 짝이 맞지 않는 주석', () => {
  assert.equal(parseAnnotations('a. %% 첫째\n둘째 %% b. %% 셋째 %%').length, 2);
  assert.equal(hasUnclosedAnnotation('a %% b'), true);
  assert.equal(hasUnclosedAnnotation('a %% b %% c'), false);
});

test('R-03: 6유형 후보를 문장 단위로 표시한다', () => {
  const text = [
    '그것은 두려움 때문이었다.', // 설명 과잉
    '마치 칼날처럼 차가운 시선이 마치 얼음 같은 공기를 갈랐다.', // 꾸밈
    '그는 화가 난 듯했다.', // 돌려 말하기
    '나는 걸었다. 멈췄다. 숨을 쉬었다. 다시 걸었다.', // 쪼갠 문장 (줄이 하나라 문장 4개)
    '"하나." "둘." "셋." "넷." "다섯." "여섯." "일곱."', // 빈자리
  ].join('\n');
  const types = new Set(detectStyleIssues(text).map((i) => i.type));
  for (const t of ['설명 과잉', '꾸밈', '돌려 말하기', '쪼갠 문장'] as const) assert.ok(types.has(t), `${t} 후보`);
});

test('R-03: 빈자리는 대사만 6줄 이상 이어질 때만 표시', () => {
  const six = Array.from({ length: 6 }, (_, i) => `"대사 ${i}입니다."`).join('\n');
  assert.ok(detectStyleIssues(six).some((i) => i.type === '빈자리'));
  const five = Array.from({ length: 5 }, (_, i) => `"대사 ${i}입니다."`).join('\n');
  assert.ok(!detectStyleIssues(five).some((i) => i.type === '빈자리'));
  const mixed = `${five}\n그는 고개를 끄덕였다.\n"대사 하나 더."`;
  assert.ok(!detectStyleIssues(mixed).some((i) => i.type === '빈자리'));
});

test('R-03: 주석은 점검 대상에서 제외하고, 정상 문장은 후보가 아니다', () => {
  assert.equal(detectStyleIssues('나는 문을 열었다. 찬 바람이 들이쳤다.').length, 0);
  assert.equal(detectStyleIssues('나는 문을 열었다. %% 그것은 두려움 때문이었다. %%').length, 0);
});

test('R-04: 화 단위 반복(문장 시작, 같은 어구)을 찾는다', () => {
  const text = Array.from({ length: 5 }, (_, i) => `그의 손끝이 떨렸다 ${i}번째 신호였다.`).join('\n') + '\n서늘한 공기가 방 안을 가득 채웠다.\n서늘한 공기가 방 안을 가득 채웠다.\n서늘한 공기가 방 안을 가득 채웠다.';
  const f = detectRepetition(text);
  assert.ok(f.some((x) => x.kind === '문장 시작' && x.phrase === '그의 손끝이' && x.count === 5));
  assert.ok(f.some((x) => x.kind === '어구' && x.phrase.includes('서늘한 공기가') && x.count >= 3));
  assert.deepEqual(detectRepetition('나는 걸었다. 그는 앉았다.'), []);
});

test('R-05: 대사 비중, 문장 길이, 중복 대사', () => {
  const text = '"괜찮아요 정말로." 그는 웃었다.\n"괜찮아요 정말로." 그녀가 되물었다.\n긴 서술 문장이 여기에 하나 들어간다고 해 봅시다 정말로 길게 이어집니다.';
  const s = computeTextStats(text);
  assert.ok(s.dialogueRatio > 0.2 && s.dialogueRatio < 0.7);
  assert.equal(s.duplicateDialogues[0].line, '괜찮아요 정말로.'.replace('.', '') === '괜찮아요 정말로' ? '괜찮아요 정말로.' : '');
  assert.equal(s.duplicateDialogues[0].count, 2);
  assert.equal(s.lengthBuckets.reduce((a, b) => a + b.count, 0), s.sentenceCount);
  assert.equal(computeTextStats('').totalChars, 0);
});

test('R-02: 문장 단위 비교로 변경 구간을 만들고 판정대로 최종 본문을 만든다', () => {
  const original = '나는 문을 열었다. 그것은 두려움 때문이었다. 찬 바람이 들이쳤다.';
  const revised = '나는 문을 열었다. 손이 떨렸다. 찬 바람이 들이쳤다.';
  const segs = diffSentences(original, revised);
  assert.equal(segs.length, 3);
  assert.deepEqual(segs.map((s) => s.changed), [false, true, false]);
  assert.equal(segs[1].original, '그것은 두려움 때문이었다.');
  assert.equal(segs[1].revised, '손이 떨렸다.');
  assert.equal(segs[1].verdict, '미판정');

  assert.equal(applyVerdicts(segs), original.split('. ').join('.\n').replace(/\.\n/g, '.\n'));
  segs[1].verdict = '채택';
  assert.ok(applyVerdicts(segs).includes('손이 떨렸다.'));
  assert.ok(!applyVerdicts(segs).includes('두려움'));
  segs[1].verdict = '기각';
  assert.ok(applyVerdicts(segs).includes('두려움'));

  const sum = verdictSummary(segs);
  assert.deepEqual(sum, { total: 1, adopted: 0, rejected: 1, held: 0, pending: 0 });
});

test('R-02: 삭제만, 추가만 있는 경우와 동일 본문', () => {
  const del = diffSentences('가. 나. 다.', '가. 다.');
  assert.deepEqual(del.filter((s) => s.changed).map((s) => [s.original, s.revised]), [['나.', '']]);
  assert.equal(applyVerdicts(del.map((s) => (s.changed ? { ...s, verdict: '채택' as const } : s))), '가.\n다.');

  const add = diffSentences('가. 다.', '가. 나. 다.');
  assert.deepEqual(add.filter((s) => s.changed).map((s) => [s.original, s.revised]), [['', '나.']]);

  assert.equal(diffSentences('가. 나.', '가. 나.').every((s) => !s.changed), true);
});
