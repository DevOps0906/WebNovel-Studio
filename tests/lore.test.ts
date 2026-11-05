import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chapterNumbers,
  payoffChapterOf,
  canTransition,
  transitionForeshadow,
  addPlanting,
  addPartialPayoff,
  changePayoffChapter,
  foreshadowWarnings,
  issueWarnings,
  researchWarnings,
  findImpact,
  addDecision,
  DecisionItem,
} from '../src/data/lore';
import { INITIAL_PROJECTS, ensureProjectIntegrity, WebNovelProject } from '../src/data/projectTemplates';
import type { ForeshadowingItem } from '../src/data/storyData';

const fresh = (): WebNovelProject => ensureProjectIntegrity(JSON.parse(JSON.stringify(INITIAL_PROJECTS[0])));
const fs = (over: Partial<ForeshadowingItem> = {}): ForeshadowingItem => ({
  id: 'f1',
  location: 'ch01 s02',
  title: '만년필',
  description: '',
  payoff: 'ch12 증거로 제시',
  status: '심음',
  arc: '아크 1',
  ...over,
});

test('chapterNumbers: 여러 표기에서 챕터 번호를 읽는다', () => {
  assert.deepEqual(chapterNumbers('ch02 s05 발견 → ch03 s13 확인'), [2, 3]);
  assert.deepEqual(chapterNumbers('CH 4'), [4]);
  assert.deepEqual(chapterNumbers('ch124'), []);
  assert.deepEqual(chapterNumbers('없음'), []);
});

test('payoffChapterOf: 명시 필드 우선, 없으면 문구의 마지막 챕터 (여러 단계 회수)', () => {
  assert.equal(payoffChapterOf(fs({ payoff: 'ch12 일기 #3 → ch24 법정 제출' })), 24);
  assert.equal(payoffChapterOf(fs({ payoff: 'ch12', payoffChapter: 'ch05' })), 5);
  assert.equal(payoffChapterOf(fs({ payoff: '회수 지점 미정' })), null);
});

test('C-04: 상태 흐름. 허용되지 않은 전이는 거부', () => {
  assert.ok(canTransition('심을 예정', '심음'));
  assert.ok(canTransition('심음', '회수 예정'));
  assert.ok(canTransition('회수 예정', '회수됨'));
  assert.ok(!canTransition('심을 예정', '회수됨'));
  assert.ok(!canTransition('회수됨', '심음'));
  const r = transitionForeshadow(fs({ status: '심을 예정' }), '회수됨', { chapter: 'ch05' });
  assert.equal(r.ok, false);
});

test('C-04: 회수됨 전이는 회수 위치가 필요하고 이력이 남는다', () => {
  assert.equal(transitionForeshadow(fs(), '회수됨').ok, false);
  const r = transitionForeshadow(fs(), '회수됨', { chapter: 'ch12', now: new Date(1000) });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.item.status, '회수됨');
    assert.equal(r.item.resolvedChapter, 'ch12');
    assert.equal(r.item.events?.[0].from, '심음');
    assert.equal(r.item.events?.[0].to, '회수됨');
  }
});

test('C-04: 여러 번 심기와 부분 회수는 상태를 바꾸지 않는다', () => {
  const a = addPlanting(fs(), 'ch05', '두 번째 단서');
  assert.ok(a.ok);
  if (!a.ok) return;
  assert.equal(a.item.status, '심음');
  const b = addPartialPayoff(a.item, 'ch08', '절반 공개');
  assert.ok(b.ok);
  if (!b.ok) return;
  assert.equal(b.item.status, '심음');
  assert.deepEqual(b.item.events?.map((e) => e.kind), ['부분 회수', '추가 심기']);
  assert.equal(addPartialPayoff(fs({ status: '심을 예정' }), 'ch08').ok, false);
  assert.equal(addPlanting(fs({ status: '회수됨' }), 'ch05').ok, false);
  assert.equal(addPlanting(fs(), '위치없음').ok, false);
});

test('C-04: 회수 예정 챕터 변경은 이력으로 남는다', () => {
  const r = changePayoffChapter(fs({ payoffChapter: 'ch12' }), 'ch15');
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.item.payoffChapter, 'ch15');
    assert.equal(r.item.events?.[0].kind, '회수 예정 변경');
  }
  assert.equal(changePayoffChapter(fs({ status: '회수됨' }), 'ch15').ok, false);
});

test('C-05: 회수 예정 챕터를 지난 미회수 복선만 error, 전체 미회수 건수는 기준이 아니다', () => {
  const p = fresh();
  p.currentProgress = { ...p.currentProgress, currentChapter: 'ch10' };
  p.foreshadowing = [
    fs({ id: 'a', payoffChapter: 'ch05' }), // 지남
    fs({ id: 'b', payoffChapter: 'ch10' }), // 이번 챕터
    fs({ id: 'c', payoffChapter: 'ch30' }), // 아직 멀다
    fs({ id: 'd', payoffChapter: 'ch05', status: '회수됨' }),
    fs({ id: 'e', payoffChapter: 'ch05', status: '회수 취소' }),
    fs({ id: 'f', payoff: '미정' }),
    fs({ id: 'g', status: '심을 예정', location: 'ch03', payoffChapter: 'ch30' }),
  ];
  const w = foreshadowWarnings(p);
  const by = (id: string) => w.find((x) => x.targetId === id)?.code;
  assert.equal(by('a'), 'fs-overdue');
  assert.equal(by('b'), 'fs-due-now');
  assert.equal(by('c'), undefined);
  assert.equal(by('d'), undefined);
  assert.equal(by('e'), undefined);
  assert.equal(by('f'), 'fs-no-payoff');
  assert.equal(by('g'), 'fs-plant-late');
  assert.equal(w.find((x) => x.targetId === 'a')?.level, 'error');
});

test('C-06: 결정 예정 챕터를 지난 미결만 경고. 명시적 보류와 해결은 제외', () => {
  const p = fresh();
  p.currentProgress = { ...p.currentProgress, currentChapter: 'ch10' };
  p.unresolvedIssues = [
    { id: 'i1', title: 'a', description: '', status: '미결', category: '설정', dueChapter: 'ch05' },
    { id: 'i2', title: 'b', description: '', status: '미결', category: '설정', dueChapter: 'ch05', deferred: true },
    { id: 'i3', title: 'c', description: '', status: '해결', category: '설정', dueChapter: 'ch05' },
    { id: 'i4', title: 'd', description: '', status: '미결', category: '설정', dueChapter: 'ch10' },
    { id: 'i5', title: 'e', description: '', status: '미결', category: '설정' },
  ];
  const w = issueWarnings(p);
  assert.deepEqual(w.map((x) => [x.targetId, x.code]), [['i1', 'issue-overdue'], ['i4', 'issue-due-now']]);
});

test('C-03: 미확인 고증은 공개 임박/경과 시 경고', () => {
  const p = fresh();
  p.currentProgress = { ...p.currentProgress, currentChapter: 'ch10' };
  p.research = [
    { id: 'r1', question: '유전자 검사 소요', nature: '현실', verification: '미확인', applied: false, revealChapter: 'ch09' },
    { id: 'r2', question: 'b', nature: '현실', verification: '확인중', applied: false, revealChapter: 'ch11' },
    { id: 'r3', question: 'c', nature: '현실', verification: '확인됨', applied: true, revealChapter: 'ch09' },
    { id: 'r4', question: 'd', nature: '허구', verification: '미확인', applied: false, revealChapter: 'ch30' },
    { id: 'r5', question: 'e', nature: '현실', verification: '미확인', applied: false },
  ];
  const w = researchWarnings(p);
  assert.deepEqual(w.map((x) => [x.targetId, x.level]), [['r1', 'error'], ['r2', 'warn']]);
});

test('C-02: 영향 범위는 씬, 복선, 미결, 인물, 챕터를 키워드로 찾아 목록으로 낸다', () => {
  const p = fresh();
  const scene = Object.values(p.chapters).flatMap((c) => c.scenes).find((s) => s.content && s.content.length > 30)!;
  const word = scene.content.replace(/\s+/g, ' ').trim().slice(0, 4);
  p.foreshadowing = [fs({ id: 'ff', title: `${word} 단서` })];
  const hits = findImpact(p, { keywords: [word, '  ', 'x'], manualImpacts: ['05-문체가이드.md'] });
  assert.ok(hits.some((h) => h.type === '씬' && h.ref.endsWith(`/${scene.id}`)));
  assert.ok(hits.some((h) => h.type === '복선' && h.ref === 'ff'));
  assert.ok(hits.some((h) => h.type === '직접 지정' && h.label === '05-문체가이드.md'));
  assert.ok(hits.every((h, i) => hits.findIndex((x) => x.type === h.type && x.ref === h.ref) === i), '중복 없음');
  assert.deepEqual(findImpact(p, { keywords: ['절대로없는낱말xyz'] }), []);
  assert.deepEqual(findImpact(p, { keywords: ['a'] }), [], '한 글자 키워드는 무시');
});

test('C-01: 새 결정이 기존 결정을 대체하면 기존은 대체됨이 되고 폐기 요약이 남는다', () => {
  const first = addDecision([], { title: '주인공은 1인칭', keywords: ['1인칭'] }, new Date('2026-11-01'));
  assert.ok(first.ok);
  if (!first.ok) return;
  assert.equal(first.decisions[0].no, 1);
  assert.equal(first.decisions[0].decidedAt, '2026-11-01');

  const second = addDecision(first.decisions, { title: '3인칭 제한 시점으로 변경', keywords: ['3인칭'], supersedes: first.decisions[0].id, discardSummary: '1인칭은 폐기' }, new Date('2026-11-05'));
  assert.ok(second.ok);
  if (!second.ok) return;
  const list: DecisionItem[] = second.decisions;
  assert.equal(list[0].no, 2);
  assert.equal(list[0].supersedes, first.decisions[0].id);
  const old = list.find((d) => d.no === 1)!;
  assert.equal(old.status, '대체됨');
  assert.equal(old.discardSummary, '1인칭은 폐기');

  // 이미 대체된 결정을 다시 대체할 수 없고, 빈 사안은 거부
  assert.equal(addDecision(list, { title: 'x', keywords: [], supersedes: old.id }).ok, false);
  assert.equal(addDecision(list, { title: '  ', keywords: [] }).ok, false);
  assert.equal(addDecision(list, { title: 'x', keywords: [], supersedes: 'nope' }).ok, false);
});

test('파생 진행 수치: 미결 수와 현재 챕터 복선 회수 수가 목록에서 계산된다', () => {
  const p = fresh();
  assert.equal(p.currentProgress.openIssues, p.unresolvedIssues.filter((i) => i.status === '미결').length);
  assert.equal(p.currentProgress.resolvedIssues, p.unresolvedIssues.filter((i) => i.status === '해결').length);
});

import { chapterGate, confirmChapter, reopenChapter } from '../src/data/lore';

test('6-1 게이트: 회수 예정 복선·열린 미결·미완료 씬이 있으면 확정할 수 없다', () => {
  const p = fresh();
  const ch = Object.values(p.chapters).find((c) => c.scenes.length > 0 && c.scenes.every((s) => s.status === '본문 완료'))!;
  assert.ok(ch, '모든 씬이 완료된 챕터가 있어야 함');
  p.foreshadowing = [fs({ id: 'x', payoffChapter: ch.id })];
  p.unresolvedIssues = [{ id: 'q', title: '미결', description: '', status: '미결', category: '설정', dueChapter: ch.id }];
  p.research = [];
  let gate = chapterGate(p, ch.id);
  assert.equal(gate.ok, false);
  assert.equal(gate.blockers.length, 2);

  // 복선 회수, 미결은 명시적 보류 -> 확정 가능
  const t = transitionForeshadow(p.foreshadowing[0], '회수됨', { chapter: ch.id });
  assert.ok(t.ok);
  if (!t.ok) return;
  p.foreshadowing = [t.item];
  p.unresolvedIssues = [{ ...p.unresolvedIssues[0], deferred: true }];
  gate = chapterGate(p, ch.id);
  assert.equal(gate.ok, true, gate.blockers.join('\n'));

  const c = confirmChapter(p, ch.id);
  assert.ok(c.ok);
  if (!c.ok) return;
  assert.equal(c.project.chapters[ch.id].status, '검토 완료');
  assert.equal(p.chapters[ch.id].status === '검토 완료', ch.status === '검토 완료', '입력 불변');
  assert.equal(reopenChapter(c.project, ch.id).chapters[ch.id].status, '진행 중');
});

test('6-1 게이트: 본문 완료가 아닌 씬이 있으면 막고, 확정 시도는 실패를 돌려준다', () => {
  const p = fresh();
  const ch = Object.values(p.chapters).find((c) => c.scenes.some((s) => s.status !== '본문 완료'))!;
  p.foreshadowing = [];
  p.unresolvedIssues = [];
  const gate = chapterGate(p, ch.id);
  assert.equal(gate.ok, false);
  assert.ok(gate.blockers.some((b) => /본문 완료가 아닌 씬/.test(b)));
  const r = confirmChapter(p, ch.id);
  assert.equal(r.ok, false);
  assert.equal(chapterGate(p, 'nope').ok, false);
});

test('6-1 게이트: 미확인 고증은 막지 않고 경고만 한다', () => {
  const p = fresh();
  const ch = Object.values(p.chapters).find((c) => c.scenes.length > 0 && c.scenes.every((s) => s.status === '본문 완료'))!;
  p.foreshadowing = [];
  p.unresolvedIssues = [];
  p.research = [{ id: 'r', question: '고증', nature: '현실', verification: '미확인', applied: false, revealChapter: ch.id }];
  const gate = chapterGate(p, ch.id);
  assert.equal(gate.ok, true);
  assert.equal(gate.warnings.length, 1);
});
