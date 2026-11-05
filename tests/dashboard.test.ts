import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardMetrics, redactForShare, REDACTED } from '../src/data/dashboard';
import { recomputeDerived } from '../src/data/metrics';
import { INITIAL_PROJECTS, ensureProjectIntegrity, WebNovelProject } from '../src/data/projectTemplates';

const fresh = (i = 0): WebNovelProject => ensureProjectIntegrity(JSON.parse(JSON.stringify(INITIAL_PROJECTS[i])));
const byId = (p: WebNovelProject, id: string) => buildDashboardMetrics(p).find((c) => c.id === id)!;

test('D-01: 카드 값은 recomputeDerived 의 요약값과 같다', () => {
  for (let i = 0; i < INITIAL_PROJECTS.length; i++) {
    const p = recomputeDerived(fresh(i));
    const cp = p.currentProgress;
    assert.equal(byId(p, 'episodes').value, cp.episodesOrganized, `${p.id} episodes`);
    assert.equal(byId(p, 'words').value, cp.totalWordCount, `${p.id} words`);
    assert.equal(byId(p, 'reviewedChapters').value, cp.completedChapters, `${p.id} chapters`);
    assert.equal(byId(p, 'openIssues').value, cp.openIssues, `${p.id} issues`);
  }
});

test('D-01: 저장된 요약값이 틀려도 카드는 원본 데이터로 계산한다', () => {
  const p = fresh();
  p.currentProgress = { ...p.currentProgress, openIssues: 999, totalWordCount: 1 };
  const real = recomputeDerived(p).currentProgress;
  assert.equal(byId(p, 'openIssues').value, real.openIssues);
  assert.equal(byId(p, 'words').value, real.totalWordCount);
});

test('D-02: 모든 카드가 출처 경로를 갖고 근거 개수가 값과 맞는다', () => {
  const p = recomputeDerived(fresh());
  for (const c of buildDashboardMetrics(p)) {
    assert.ok(c.sourcePath.length > 0, c.id);
    assert.ok(c.rule.length > 0, c.id);
  }
  assert.equal(byId(p, 'episodes').evidence.length, byId(p, 'episodes').value);
  assert.equal(byId(p, 'openIssues').evidence.length, byId(p, 'openIssues').value);
  assert.equal(byId(p, 'reviewedChapters').evidence.length, byId(p, 'reviewedChapters').value);
});

test('D-01: 회수 취소 복선은 분모에서 제외한다', () => {
  const p = fresh();
  const before = byId(p, 'foreshadow').total!;
  p.foreshadowing = [...p.foreshadowing, { ...p.foreshadowing[0], id: 'x-cancel', status: '회수 취소' }];
  assert.equal(byId(p, 'foreshadow').total, before);
});

test('D-03: 공유용 사본은 미공개 항목을 가리고 원본은 바꾸지 않는다', () => {
  const p = fresh();
  const snapshot = JSON.stringify(p);
  const { project: shared, summary } = redactForShare(p);
  assert.equal(JSON.stringify(p), snapshot);

  for (const d of shared.diaries.filter((x) => !x.unlocked)) {
    assert.equal(d.previewText, REDACTED);
    assert.equal(d.fullText, undefined);
  }
  for (const f of shared.foreshadowing.filter((x) => x.status !== '회수됨')) assert.equal(f.payoff, REDACTED);
  for (const ch of Object.values(shared.chapters))
    for (const s of ch.scenes.filter((x) => x.status !== '본문 완료')) assert.equal(s.content, REDACTED);

  assert.equal(summary.diaries, p.diaries.filter((d) => !d.unlocked).length);
  assert.equal(summary.foreshadowing, p.foreshadowing.filter((f) => f.status !== '회수됨').length);
});

test('D-03: 가림은 지표 숫자를 바꾸지 않는다', () => {
  const p = recomputeDerived(fresh());
  const a = buildDashboardMetrics(p).map((c) => [c.id, c.value]);
  const b = buildDashboardMetrics(redactForShare(p).project).map((c) => [c.id, c.value]);
  assert.deepEqual(a, b);
});
