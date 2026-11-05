import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { createZip, readZip } from '../src/data/zip';
import {
  exportBundle,
  parseBundle,
  parseSceneMarkdown,
  mergeImportedProjects,
  buildBundleEntries,
  safeName,
} from '../src/data/bundle';
import { INITIAL_PROJECTS, ensureProjectIntegrity, WebNovelProject } from '../src/data/projectTemplates';

const clone = (): WebNovelProject[] => INITIAL_PROJECTS.map((p) => ensureProjectIntegrity(JSON.parse(JSON.stringify(p))));
const enc = new TextEncoder();
const dec = new TextDecoder();

test('zip: 쓰고 읽으면 이름과 내용이 같다 (한글 이름, 빈 파일 포함)', async () => {
  const entries = [
    { name: 'a/한글.md', data: enc.encode('가나다\n라마바') },
    { name: 'empty.txt', data: new Uint8Array(0) },
    { name: 'bin.dat', data: new Uint8Array([0, 1, 2, 255]) },
  ];
  const out = await readZip(createZip(entries));
  assert.deepEqual(out.map((e) => e.name), entries.map((e) => e.name));
  assert.equal(dec.decode(out[0].data), '가나다\n라마바');
  assert.equal(out[1].data.length, 0);
  assert.deepEqual(Array.from(out[2].data), [0, 1, 2, 255]);
});

test('zip: deflate 로 압축된 항목도 읽는다 (외부 도구로 다시 압축한 경우)', async () => {
  const plain = enc.encode('반복 '.repeat(500));
  const compressed = deflateRawSync(plain);
  // stored 로 만든 zip 의 데이터/메서드를 deflate 로 바꿔 끼워 만든다
  const name = enc.encode('d.txt');
  const local = new Uint8Array(30 + name.length);
  const lv = new DataView(local.buffer);
  lv.setUint32(0, 0x04034b50, true);
  lv.setUint16(4, 20, true);
  lv.setUint16(8, 8, true);
  lv.setUint32(18, compressed.length, true);
  lv.setUint32(22, plain.length, true);
  lv.setUint16(26, name.length, true);
  local.set(name, 30);
  const cd = new Uint8Array(46 + name.length);
  const cv = new DataView(cd.buffer);
  cv.setUint32(0, 0x02014b50, true);
  cv.setUint16(10, 8, true);
  cv.setUint32(20, compressed.length, true);
  cv.setUint32(24, plain.length, true);
  cv.setUint16(28, name.length, true);
  cv.setUint32(42, 0, true);
  cd.set(name, 46);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, cd.length, true);
  ev.setUint32(16, local.length + compressed.length, true);
  const zip = new Uint8Array(local.length + compressed.length + cd.length + eocd.length);
  zip.set(local, 0);
  zip.set(compressed, local.length);
  zip.set(cd, local.length + compressed.length);
  zip.set(eocd, local.length + compressed.length + cd.length);

  const out = await readZip(zip);
  assert.equal(dec.decode(out[0].data), '반복 '.repeat(500));
});

test('zip: ZIP 이 아니거나 잘린 파일은 오류', async () => {
  await assert.rejects(readZip(enc.encode('이건 zip 이 아님')));
  const good = createZip([{ name: 'a.txt', data: enc.encode('hello') }]);
  await assert.rejects(readZip(good.subarray(0, good.length - 30)));
});

test('S-05: 내보내기 -> 가져오기 왕복에서 작품 데이터가 같다', async () => {
  const projects = clone();
  const { projects: back, warnings } = await parseBundle(exportBundle(projects));
  assert.equal(back.length, projects.length);
  for (let i = 0; i < projects.length; i++) {
    assert.deepEqual(back[i], projects[i]);
  }
  assert.deepEqual(warnings, []);
});

test('S-05: 묶음에는 API 키/토큰성 필드가 들어가지 않는다', () => {
  const entries = buildBundleEntries(clone());
  const all = entries.map((e) => dec.decode(e.data)).join('\n');
  assert.ok(!/apiKey|ghp_|sk-ant|github_pat/i.test(all));
});

test('S-05: 마크다운에서 고친 본문이 가져오기에 반영된다', async () => {
  const projects = clone();
  const entries = buildBundleEntries(projects);
  const mdIdx = entries.findIndex((e) => e.name.includes('/chapters/') && e.name.endsWith('.md'));
  assert.ok(mdIdx >= 0, '씬 마크다운이 있어야 함');
  const md = dec.decode(entries[mdIdx].data);
  const parsed = parseSceneMarkdown(md)!;
  const edited = md.replace(/\n---\n\n[\s\S]*$/, '\n---\n\nObsidian 에서 고친 본문\r\n둘째 줄');
  entries[mdIdx] = { name: entries[mdIdx].name, data: enc.encode(edited) };

  const { projects: back, warnings } = await parseBundle(createZip(entries));
  const proj = back.find((p) => p.id === parsed.meta.project)!;
  const scene = proj.chapters[parsed.meta.chapter].scenes.find((s) => s.id === parsed.meta.scene)!;
  assert.equal(scene.content, 'Obsidian 에서 고친 본문\n둘째 줄');
  assert.equal(scene.wordCount, scene.content.length);
  assert.ok(warnings.some((w) => /수정된 씬 1개/.test(w)));
});

test('S-05: 잘못된 묶음은 명확한 오류로 거부하고 부분 성공도 알린다', async () => {
  await assert.rejects(parseBundle(createZip([{ name: 'x.txt', data: enc.encode('x') }])), /manifest\.json/);
  await assert.rejects(
    parseBundle(createZip([{ name: 'manifest.json', data: enc.encode('{"format":"other"}') }])),
    /지원하지 않는 묶음 형식/
  );
  await assert.rejects(
    parseBundle(createZip([{ name: 'manifest.json', data: enc.encode(JSON.stringify({ format: 'webnovel-studio-bundle', version: 99, projects: [] })) }])),
    /더 새로운 버전/
  );

  // 두 작품 중 하나가 손상: 나머지는 가져오고 경고
  const projects = clone();
  const entries = buildBundleEntries(projects.slice(0, 2));
  const folder = safeName(projects[0].id);
  const i = entries.findIndex((e) => e.name === `${folder}/project.json`);
  entries[i] = { name: entries[i].name, data: enc.encode('{ 손상') };
  if (projects.length >= 2) {
    const r = await parseBundle(createZip(entries));
    assert.equal(r.projects.length, 1);
    assert.ok(r.warnings.some((w) => /손상/.test(w)));
  }
});

test('parseSceneMarkdown: 프런트매터가 없으면 null, CRLF 허용', () => {
  assert.equal(parseSceneMarkdown('본문만'), null);
  const r = parseSceneMarkdown('---\r\nscene: "s1"\r\n---\r\n\r\n본문');
  assert.equal(r?.meta.scene, 's1');
  assert.equal(r?.body, '본문');
});

test('mergeImportedProjects: 같은 ID 는 덮어쓰지 않고 새 ID 로 추가', () => {
  const existing = clone();
  const imported = clone();
  const { projects, renamed } = mergeImportedProjects(existing, imported, new Date(123456));
  assert.equal(projects.length, existing.length + imported.length);
  assert.equal(renamed.length, imported.length);
  assert.equal(new Set(projects.map((p) => p.id)).size, projects.length, 'ID 중복 없음');
  for (const e of existing) assert.ok(projects.some((p) => p === e), '기존 작품 객체 유지');
  assert.ok(projects.filter((p) => p.title.endsWith('(가져옴)')).length === imported.length);
});

test('safeName: 경로 구분자와 상위 경로 문자를 제거', () => {
  assert.ok(!safeName('../../etc/passwd').includes('/'));
  assert.ok(!safeName('../../etc/passwd').startsWith('.'));
  assert.ok(!safeName('a/b\\c').includes('/'));
  assert.ok(!safeName('a/b\\c').includes('\\'));
  assert.ok(!safeName('..').startsWith('.'));
});
