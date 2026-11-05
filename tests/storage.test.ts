import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryStore, listQuarantine, readQuarantinedRaw, quarantineRaw } from '../src/data/storage';
import {
  loadProjectsWithReport,
  saveAllProjects,
  STORAGE_PROJECTS_KEY,
  INITIAL_PROJECTS,
} from '../src/data/projectTemplates';

test('최초 실행: 샘플 프로젝트로 시작하고 저장한다', () => {
  const store = new MemoryStore();
  const { projects, report } = loadProjectsWithReport(store);
  assert.ok(projects.length >= 1);
  assert.deepEqual(report, {});
  assert.ok(store.getItem(STORAGE_PROJECTS_KEY));
});

test('저장 후 다시 읽으면 같은 프로젝트가 나온다', () => {
  const store = new MemoryStore();
  const first = loadProjectsWithReport(store).projects;
  const edited = first.map((p, i) => (i === 0 ? { ...p, title: '수정된 제목' } : p));
  assert.equal(saveAllProjects(edited, store).ok, true);
  assert.equal(loadProjectsWithReport(store).projects[0].title, '수정된 제목');
});

test('S-06: 손상된 JSON 은 삭제하지 않고 격리한다', () => {
  const store = new MemoryStore();
  const corrupt = '{"broken": [1,2,';
  store.setItem(STORAGE_PROJECTS_KEY, corrupt);

  const { projects, report } = loadProjectsWithReport(store);
  assert.ok(projects.length >= 1, '샘플로 시작');
  assert.ok(report.quarantinedKey, '격리 키 반환');
  assert.ok(report.reason);

  assert.equal(readQuarantinedRaw(store, report.quarantinedKey!), corrupt, '원본 보존');
  const list = listQuarantine(store);
  assert.equal(list.length, 1);
  assert.equal(list[0].originalKey, STORAGE_PROJECTS_KEY);
});

test('S-06: 배열이 아니거나 id 없는 항목도 격리한다', () => {
  for (const raw of ['{"a":1}', '[{"title":"id 없음"}]', '[null]']) {
    const store = new MemoryStore();
    store.setItem(STORAGE_PROJECTS_KEY, raw);
    const { report } = loadProjectsWithReport(store);
    assert.ok(report.quarantinedKey, `격리되어야 함: ${raw}`);
    assert.equal(readQuarantinedRaw(store, report.quarantinedKey!), raw);
  }
});

test('S-06: 격리 저장 자체가 실패하면 quarantineFailed 로 알린다', () => {
  const store = new MemoryStore();
  store.setItem(STORAGE_PROJECTS_KEY, 'not json');
  store.failWrites = true;
  const { report } = loadProjectsWithReport(store);
  assert.equal(report.quarantineFailed, true);
  assert.equal(store.getItem(STORAGE_PROJECTS_KEY), 'not json', '원본은 그대로');
});

test('S-03: 저장 실패(용량 초과)를 결과로 돌려준다', () => {
  const store = new MemoryStore();
  store.failWrites = true;
  const r = saveAllProjects(INITIAL_PROJECTS, store);
  assert.equal(r.ok, false);
  assert.match(r.error || '', /저장 공간/);
});

test('quarantineRaw: 같은 키를 여러 번 격리해도 서로 덮어쓰지 않는다', () => {
  const store = new MemoryStore();
  const a = quarantineRaw(store, 'k', 'one', 'r', new Date(1000));
  const b = quarantineRaw(store, 'k', 'two', 'r', new Date(2000));
  assert.notEqual(a, b);
  assert.equal(listQuarantine(store).length, 2);
});
