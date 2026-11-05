import test from 'node:test';
import assert from 'node:assert/strict';
import { applySceneContent } from '../src/data/sceneEdit';
import { recordVersion, listVersions, historyKey, MAX_VERSIONS_PER_SCENE } from '../src/data/sceneHistory';
import { MemoryStore } from '../src/data/storage';
import { INITIAL_PROJECTS, ensureProjectIntegrity } from '../src/data/projectTemplates';

const pickProject = () => {
  const p = ensureProjectIntegrity(JSON.parse(JSON.stringify(INITIAL_PROJECTS[0])));
  for (const [chapterId, ch] of Object.entries(p.chapters)) {
    if (ch.scenes.length > 0) return { p, chapterId, scene: ch.scenes[0] };
  }
  throw new Error('씬이 있는 챕터가 없음');
};

test('applySceneContent: 입력 프로젝트를 변경하지 않는다', () => {
  const { p, chapterId, scene } = pickProject();
  const snapshot = JSON.stringify(p);
  const r = applySceneContent(p, chapterId, scene.id, '새 본문');
  assert.ok(r.ok);
  assert.equal(JSON.stringify(p), snapshot, '원본 불변');
  if (r.ok) {
    assert.equal(r.scene.content, '새 본문');
    assert.equal(r.scene.wordCount, 4);
    assert.equal(r.previousContent, scene.content);
    assert.notEqual(r.project, p);
    assert.notEqual(r.project.chapters[chapterId], p.chapters[chapterId]);
  }
});

test('applySceneContent: 챕터 합계는 변동분만 반영', () => {
  const { p, chapterId, scene } = pickProject();
  const before = p.chapters[chapterId];
  const r = applySceneContent(p, chapterId, scene.id, 'x'.repeat(100), { status: '본문 완료' });
  assert.ok(r.ok);
  if (!r.ok) return;
  const after = r.project.chapters[chapterId];
  assert.equal(after.totalWords, Math.max(0, before.totalWords + 100 - scene.wordCount));
  const wasDone = scene.status === '본문 완료';
  assert.equal(after.completedScenesCount, before.completedScenesCount + (wasDone ? 0 : 1));
});

test('applySceneContent: 없는 챕터/씬은 실패', () => {
  const { p, chapterId, scene } = pickProject();
  assert.equal(applySceneContent(p, 'nope', scene.id, 'x').ok, false);
  assert.equal(applySceneContent(p, chapterId, 'nope', 'x').ok, false);
});

test('recordVersion/listVersions: 최신순, 중복 생략, 빈 본문 생략', () => {
  const store = new MemoryStore();
  const key = historyKey('p', 'c', 's');
  assert.ok(recordVersion(store, key, { reason: 'manual-edit', content: 'v1' }, new Date(1000)).ok);
  assert.ok(recordVersion(store, key, { reason: 'ai-apply', content: 'v2' }, new Date(2000)).ok);
  recordVersion(store, key, { reason: 'ai-apply', content: 'v2' }, new Date(3000)); // 중복
  recordVersion(store, key, { reason: 'ai-apply', content: '   ' }, new Date(4000)); // 빈 본문
  const list = listVersions(store, key);
  assert.deepEqual(list.map((v) => v.content), ['v2', 'v1']);
  assert.equal(list[0].reason, 'ai-apply');
});

test('recordVersion: 씬당 최대 개수 유지, 다른 씬과 분리', () => {
  const store = new MemoryStore();
  const key = historyKey('p', 'c', 's');
  for (let i = 0; i < MAX_VERSIONS_PER_SCENE + 5; i++) {
    recordVersion(store, key, { reason: 'manual-edit', content: `v${i}` }, new Date(i));
  }
  const list = listVersions(store, key);
  assert.equal(list.length, MAX_VERSIONS_PER_SCENE);
  assert.equal(list[0].content, `v${MAX_VERSIONS_PER_SCENE + 4}`);
  assert.equal(listVersions(store, historyKey('p', 'c', 'other')).length, 0);
});

test('recordVersion: 저장 실패를 결과로 알린다', () => {
  const store = new MemoryStore();
  store.failWrites = true;
  const r = recordVersion(store, 'k', { reason: 'manual-edit', content: 'x' });
  assert.equal(r.ok, false);
});

test('S-04: 복원도 이력으로 남는다 (현재 본문이 스냅샷으로 기록)', () => {
  const store = new MemoryStore();
  const { p, chapterId, scene } = pickProject();
  const key = historyKey(p.id, chapterId, scene.id);

  // 1) 직접 수정: 원래 본문이 이력에 남는다
  const original = scene.content || '원래 본문';
  const base = applySceneContent(p, chapterId, scene.id, original).ok ? p : p;
  const e1 = applySceneContent(base, chapterId, scene.id, '수정본');
  assert.ok(e1.ok);
  if (!e1.ok) return;
  recordVersion(store, key, { reason: 'manual-edit', content: original });

  // 2) 이력의 원래 본문으로 복원: 복원 직전(수정본)이 이력에 남는다
  const target = listVersions(store, key)[0];
  const e2 = applySceneContent(e1.project, chapterId, scene.id, target.content);
  assert.ok(e2.ok);
  if (!e2.ok) return;
  recordVersion(store, key, { reason: 'restore', content: e2.previousContent });

  const contents = listVersions(store, key).map((v) => v.content);
  assert.deepEqual(contents, ['수정본', original]);
  assert.equal(e2.scene.content, original);
});
