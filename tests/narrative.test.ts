import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PROJECTS, ensureProjectIntegrity, WebNovelProject } from '../src/data/projectTemplates';
import { episodeEndLine, recordHook, hookWarnings, HOOK_TYPES, isRecommendedHook } from '../src/data/hooks';
import { addKnowledge, knowledgeWarnings, sceneOrderMap } from '../src/data/characterTimeline';
import { recordUsage, readUsage, summarizeUsage, UsageEntry, MAX_USAGE_ENTRIES, USAGE_STORAGE_KEY } from '../src/data/usage';
import { MemoryStore } from '../src/data/storage';

const fresh = (i = 0): WebNovelProject => ensureProjectIntegrity(JSON.parse(JSON.stringify(INITIAL_PROJECTS[i])));

// ---- U-04 ----

test('U-04: 화의 마지막 문장은 마지막 씬의 끝 문장이다 (주석 제외)', () => {
  const p = fresh(0);
  const ep = Object.values(p.chapters).flatMap((c) => c.scenes).find((s) => s.status !== '대기' && s.content.trim())!.episode;
  // 본문 순서(챕터 ID 순, 씬 배열 순)상 해당 화의 마지막 본문 씬을 찾는다
  let last: { scene: (typeof p.chapters)[string]['scenes'][number] } | null = null;
  for (const cid of Object.keys(p.chapters).sort()) {
    for (const s of p.chapters[cid].scenes) {
      if (s.episode === ep && s.status !== '대기' && s.content.trim()) last = { scene: s };
    }
  }
  assert.ok(last);
  last!.scene.content = '문이 닫혔다. %% 주석 %% 그는 끝내 대답하지 않았다.';
  assert.equal(episodeEndLine(p, ep), '그는 끝내 대답하지 않았다.');
});

test('U-04: 본문이 없는 화는 끝 문장이 빈 문자열', () => {
  assert.equal(episodeEndLine(fresh(0), 99999), '');
});

test('U-04: recordHook 은 입력을 바꾸지 않고 유형과 메모를 저장한다', () => {
  const p = fresh(0);
  const next = recordHook(p, 3, { type: '배신·반전', note: '차남 등장' });
  assert.equal(p.episodeHooks?.[3], undefined);
  assert.equal(next.episodeHooks?.[3].type, '배신·반전');
  const again = recordHook(next, 3, { note: '메모만 변경' });
  assert.equal(again.episodeHooks?.[3].type, '배신·반전', '기존 유형 유지');
});

test('U-04: 훅 점검은 차단하지 않고 info/warn 으로만 보고한다', () => {
  const p = fresh(0);
  const w = hookWarnings(p);
  assert.ok(w.length > 0);
  assert.ok(w.every((x) => x.level !== 'error'));
  assert.ok(w.some((x) => x.code === 'hook-missing'));
  const all = Object.keys(p.episodeHooks || {});
  assert.equal(all.length, 0);
});

test('U-04: 장르별 권장 밖 유형은 info 로 알린다', () => {
  const p = fresh(0);
  assert.equal(p.templateType, 'chaebol');
  assert.equal(isRecommendedHook(p, '정보 공개'), true);
  assert.equal(isRecommendedHook(p, '위기 도래'), false);
  const row = Object.keys(p.chapters).length;
  assert.ok(row >= 1);
  const withHook = recordHook(p, 12, { type: '위기 도래' });
  assert.ok(hookWarnings(withHook).some((x) => x.code === 'hook-not-recommended' && x.targetId === '12'));
  assert.ok(HOOK_TYPES.length === 6);
});

// ---- C-07 ----

test('C-07: 같은 인물·주제에 값이 다르면 모순 후보로 표시한다', () => {
  const p = fresh(0);
  const cid = p.characters[0].id;
  const refs = Array.from(sceneOrderMap(p).keys());
  assert.ok(refs.length >= 2);
  let r = addKnowledge(p, { characterId: cid, topic: '검사 결과', value: '양성', sceneRef: refs[0] });
  assert.ok(r.ok);
  if (!r.ok) return;
  const q = { ...p, knowledge: r.list };
  let r2 = addKnowledge(q, { characterId: cid, topic: '검사 결과', value: '음성', sceneRef: refs[1] });
  assert.ok(r2.ok);
  if (!r2.ok) return;
  const w = knowledgeWarnings({ ...q, knowledge: r2.list });
  assert.ok(w.some((x) => x.code === 'knowledge-conflict' && x.level === 'warn'));
});

test('C-07: 같은 값이거나 다른 인물이면 모순으로 보지 않는다', () => {
  const p = fresh(0);
  const [a, b] = [p.characters[0].id, p.characters[1]?.id ?? p.characters[0].id];
  const refs = Array.from(sceneOrderMap(p).keys());
  const list = [
    { id: '1', characterId: a, topic: '약', value: '수면제', sceneRef: refs[0] },
    { id: '2', characterId: a, topic: '약', value: '수면제', sceneRef: refs[1] },
    { id: '3', characterId: b, topic: '약', value: '진정제', sceneRef: refs[1] },
  ];
  const w = knowledgeWarnings({ ...p, knowledge: list });
  assert.equal(w.filter((x) => x.code === 'knowledge-conflict').length, 0);
});

test('C-07: 입력 검증 - 인물, 주제, 씬 누락 거부', () => {
  const p = fresh(0);
  const ref = Array.from(sceneOrderMap(p).keys())[0];
  assert.equal(addKnowledge(p, { characterId: 'nope', topic: 'x', value: 'y', sceneRef: ref }).ok, false);
  assert.equal(addKnowledge(p, { characterId: p.characters[0].id, topic: ' ', value: 'y', sceneRef: ref }).ok, false);
  assert.equal(addKnowledge(p, { characterId: p.characters[0].id, topic: 'x', value: 'y', sceneRef: 'ch99/none' }).ok, false);
});

test('C-07: 삭제된 씬을 가리키는 기록은 정보로 보고한다', () => {
  const p = fresh(0);
  const w = knowledgeWarnings({ ...p, knowledge: [{ id: 'k', characterId: p.characters[0].id, topic: 't', value: 'v', sceneRef: 'ch99/none' }] });
  assert.equal(w[0].code, 'knowledge-scene-missing');
  assert.equal(w[0].level, 'info');
});

// ---- A-09 ----

test('A-09: 작품별로 호출 수, 실패, 평균 지연, 제공자별 횟수를 집계한다', () => {
  const store = new MemoryStore();
  const base = { at: new Date().toISOString(), route: '/x', model: 'm' };
  recordUsage({ ...base, projectId: 'a', provider: 'openai', ok: true, latencyMs: 100 }, store);
  recordUsage({ ...base, projectId: 'a', provider: 'openai', ok: false, latencyMs: 9000, code: 'timeout' }, store);
  recordUsage({ ...base, projectId: 'a', provider: 'claude', ok: true, latencyMs: 300 }, store);
  recordUsage({ ...base, projectId: 'b', provider: 'gemini', ok: true, latencyMs: 50 }, store);
  const s = summarizeUsage(readUsage(store), 'a');
  assert.equal(s.calls, 3);
  assert.equal(s.failed, 1);
  assert.equal(s.avgLatencyMs, 200, '성공 호출만 평균');
  assert.deepEqual(s.byProvider, { openai: 2, claude: 1 });
});

test('A-09: 기록은 최대 개수를 넘지 않고, 저장 실패는 기능을 막지 않는다', () => {
  const store = new MemoryStore();
  for (let i = 0; i < MAX_USAGE_ENTRIES + 10; i++) {
    recordUsage({ at: '', projectId: 'a', route: '', provider: 'x', model: '', ok: true, latencyMs: 1 }, store);
  }
  assert.equal(readUsage(store).length, MAX_USAGE_ENTRIES);
  store.failWrites = true;
  assert.doesNotThrow(() => recordUsage({ at: '', projectId: 'a', route: '', provider: 'x', model: '', ok: true, latencyMs: 1 }, store));
  assert.ok(store.getItem(USAGE_STORAGE_KEY));
});

test('A-09: 손상된 사용량 데이터는 빈 목록으로 읽는다', () => {
  const store = new MemoryStore();
  store.setItem(USAGE_STORAGE_KEY, '{not json');
  assert.deepEqual(readUsage(store) as UsageEntry[], []);
});
