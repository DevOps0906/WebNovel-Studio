import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEpisodeWords, STORY_RULES } from '../src/config/storyRules';
import { buildEpisodeTable, recomputeDerived, validateProject } from '../src/data/metrics';
import { INITIAL_PROJECTS, ensureProjectIntegrity, WebNovelProject } from '../src/data/projectTemplates';
import { applySceneContent } from '../src/data/sceneEdit';

const fresh = (i = 0): WebNovelProject => ensureProjectIntegrity(JSON.parse(JSON.stringify(INITIAL_PROJECTS[i])));

test('classifyEpisodeWords: 경계값 (D-3 잠정 기준)', () => {
  assert.equal(classifyEpisodeWords(0), 'none');
  assert.equal(classifyEpisodeWords(4999), 'short');
  assert.equal(classifyEpisodeWords(5000), 'below-target');
  assert.equal(classifyEpisodeWords(5999), 'below-target');
  assert.equal(classifyEpisodeWords(6000), 'target');
  assert.equal(classifyEpisodeWords(8000), 'target');
  assert.equal(classifyEpisodeWords(8001), 'above-target');
  assert.equal(classifyEpisodeWords(9000), 'above-target');
  assert.equal(classifyEpisodeWords(9001), 'long');
  assert.equal(STORY_RULES.structure.totalEpisodes, 100);
});

test('recomputeDerived: 입력을 변경하지 않고 멱등이다', () => {
  const p = fresh();
  const snapshot = JSON.stringify(p);
  const once = recomputeDerived(p);
  assert.equal(JSON.stringify(p), snapshot);
  assert.deepEqual(recomputeDerived(once), once);
});

test('U-02: 작품 총 분량 = 화별 분량 합 = 챕터 분량 합 (모든 샘플)', () => {
  for (let i = 0; i < INITIAL_PROJECTS.length; i++) {
    const p = fresh(i);
    const rows = buildEpisodeTable(p);
    const sumRows = rows.reduce((a, r) => a + r.words, 0);
    assert.equal(p.currentProgress.totalWordCount, sumRows, `${p.id}: 작품 총 분량`);
    assert.equal(p.currentProgress.episodesOrganized, rows.filter((r) => r.words > 0).length, `${p.id}: 편성 화 수`);
    const sumChapters = Object.values(p.chapters).reduce((a, c) => a + c.totalWords, 0);
    // 챕터에 속하지 않은 화(chapter 미지정)가 없다면 합이 같다
    const unassigned = rows.filter((r) => !p.chapters[r.chapter]).reduce((a, r) => a + r.words, 0);
    assert.equal(sumChapters + unassigned, sumRows, `${p.id}: 챕터 분량 합`);
  }
});

test('U-02: 씬 본문을 수정하면 화·챕터·작품 분량이 같이 바뀐다', () => {
  const p = fresh(0);
  const chapterId = 'ch03';
  const scene = p.chapters[chapterId].scenes.find((s) => s.status !== '대기' && s.wordCount > 0)!;
  const beforeEp = buildEpisodeTable(p).find((r) => r.episode === scene.episode)!;
  const beforeTotal = p.currentProgress.totalWordCount;
  const beforeChapter = p.chapters[chapterId].totalWords;

  const r = applySceneContent(p, chapterId, scene.id, 'x'.repeat(scene.wordCount + 1000));
  assert.ok(r.ok);
  if (!r.ok) return;
  const next = recomputeDerived(r.project);
  const afterEp = buildEpisodeTable(next).find((x) => x.episode === scene.episode)!;
  assert.equal(afterEp.words, beforeEp.words + 1000);
  assert.equal(afterEp.source, 'scenes');
  assert.equal(next.chapters[chapterId].totalWords, beforeChapter + 1000);
  assert.equal(next.currentProgress.totalWordCount, beforeTotal + 1000);
});

test('U-02: 계획용(대기) 씬은 분량에 세지 않는다', () => {
  const p = fresh(0);
  const planned = Object.values(p.chapters).flatMap((c) => c.scenes).filter((s) => s.status === '대기');
  assert.ok(planned.length > 0);
  const rows = buildEpisodeTable(p);
  const plannedOnlyEpisodes = new Set(planned.map((s) => s.episode));
  for (const ep of plannedOnlyEpisodes) {
    const hasWritten = Object.values(p.chapters).flatMap((c) => c.scenes).some((s) => s.episode === ep && s.status !== '대기' && s.wordCount > 0);
    if (!hasWritten && !p.episodes.some((e) => e.episode === ep)) {
      assert.ok(!rows.some((r) => r.episode === ep), `${ep}화는 집계되지 않아야 함`);
    }
  }
});

test('U-03: 미달/과분량 화를 점검 항목으로 보고한다', () => {
  const p = fresh(0);
  p.episodes = [
    { episode: 1, title: 'a', words: 3000, chapter: 'ch01', hook: '' },
    { episode: 2, title: 'b', words: 9500, chapter: 'ch01', hook: '' },
    { episode: 3, title: 'c', words: 7000, chapter: 'ch01', hook: '' },
  ] as any;
  for (const ch of Object.values(p.chapters)) ch.scenes = [];
  const issues = validateProject(recomputeDerived(p));
  assert.ok(issues.some((i) => i.code === 'episode-short' && /1화/.test(i.message)));
  assert.ok(issues.some((i) => i.code === 'episode-long' && /2화/.test(i.message)));
  assert.ok(!issues.some((i) => /3화/.test(i.message) && i.code.startsWith('episode-')));
});

test('validateProject: 중복 씬 ID, 화 중복, 범위 초과를 찾는다', () => {
  const p = fresh(0);
  const [c1, c2] = Object.values(p.chapters).filter((c) => c.scenes.length > 0).slice(0, 2);
  c2.scenes = [{ ...c1.scenes[0] }, ...c2.scenes];
  p.episodes = [...p.episodes, { ...p.episodes[0] }, { episode: 101, title: 'x', words: 6000, chapter: 'ch04', hook: '' }] as any;
  const codes = validateProject(recomputeDerived(p)).map((i) => i.code);
  assert.ok(codes.includes('scene-id-duplicate'));
  assert.ok(codes.includes('episode-duplicate'));
  assert.ok(codes.includes('episode-over'));
});

test('D-1: 첫 아크가 기준 1막 종료 화와 다르면 정보로 보고한다', () => {
  const issues = validateProject(fresh(0));
  assert.ok(issues.some((i) => i.code === 'act1-end-mismatch' && i.level === 'info'));
});
