import { createZip, readZip, ZipEntry } from './zip';
import { ensureProjectIntegrity, WebNovelProject } from './projectTemplates';

// S-05: 작품을 마크다운 묶음(zip)으로 내보내고 같은 묶음으로 가져온다.
//
// 폴더 규칙
//   manifest.json                              묶음 정보
//   <작품폴더>/project.json                    무손실 복원용 전체 데이터
//   <작품폴더>/README.md                       작품 개요
//   <작품폴더>/chapters/<챕터ID>/<NN>-<씬ID>.md  씬 본문 (프런트매터 + 본문)
// 가져올 때 씬 마크다운 본문이 project.json 보다 우선한다. 옵시디언 등에서 고친 내용이 반영된다.

export const BUNDLE_FORMAT = 'webnovel-studio-bundle';
export const BUNDLE_VERSION = 1;

const enc = new TextEncoder();
const dec = new TextDecoder('utf-8');

export const safeName = (s: string) => s.replace(/[^A-Za-z0-9._\-가-힣]/g, '_').replace(/^\.+/, '_') || '_';

const sceneMarkdown = (projectId: string, chapterId: string, s: WebNovelProject['chapters'][string]['scenes'][number]) =>
  [
    '---',
    `project: ${JSON.stringify(projectId)}`,
    `chapter: ${JSON.stringify(chapterId)}`,
    `scene: ${JSON.stringify(s.id)}`,
    `sceneNumber: ${JSON.stringify(s.sceneNumber)}`,
    `title: ${JSON.stringify(s.title)}`,
    `status: ${JSON.stringify(s.status)}`,
    '---',
    '',
    s.content,
  ].join('\n');

const readme = (p: WebNovelProject) =>
  [
    `# ${p.title}`,
    p.subtitle ? `\n${p.subtitle}` : '',
    '',
    `- 필명: ${p.penName}`,
    `- 장르: ${p.genre}`,
    `- 시점: ${p.pov}`,
    `- 배경: ${p.background}`,
    `- 로그라인: ${p.coreConcept?.logline ?? ''}`,
    `- 최종 수정: ${p.updatedAt}`,
    '',
  ].join('\n');

export const buildBundleEntries = (projects: WebNovelProject[], now: Date = new Date()): ZipEntry[] => {
  const entries: ZipEntry[] = [];
  const manifest = {
    format: BUNDLE_FORMAT,
    version: BUNDLE_VERSION,
    exportedAt: now.toISOString(),
    projects: [] as { id: string; title: string; folder: string }[],
  };

  for (const p of projects) {
    const folder = safeName(p.id);
    manifest.projects.push({ id: p.id, title: p.title, folder });
    entries.push({ name: `${folder}/project.json`, data: enc.encode(JSON.stringify(p, null, 2)) });
    entries.push({ name: `${folder}/README.md`, data: enc.encode(readme(p)) });

    for (const [chapterId, chapter] of Object.entries(p.chapters || {})) {
      (chapter.scenes || []).forEach((scene, idx) => {
        const nn = String(idx + 1).padStart(2, '0');
        entries.push({
          name: `${folder}/chapters/${safeName(chapterId)}/${nn}-${safeName(scene.id)}.md`,
          data: enc.encode(sceneMarkdown(p.id, chapterId, scene)),
        });
      });
    }
  }
  entries.unshift({ name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2)) });
  return entries;
};

export const exportBundle = (projects: WebNovelProject[], now: Date = new Date()): Uint8Array =>
  createZip(buildBundleEntries(projects, now), now);

export const parseSceneMarkdown = (text: string): { meta: Record<string, string>; body: string } | null => {
  const src = text.replace(/\r\n/g, '\n');
  if (!src.startsWith('---\n')) return null;
  const end = src.indexOf('\n---\n', 4);
  const endAtEof = src.endsWith('\n---') && end < 0;
  if (end < 0 && !endAtEof) return null;

  const headerText = src.slice(4, end < 0 ? src.length - 4 : end);
  const meta: Record<string, string> = {};
  for (const line of headerText.split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    try {
      val = JSON.parse(val);
    } catch {
      // 따옴표 없는 값은 그대로 사용
    }
    meta[key] = String(val);
  }
  let body = end < 0 ? '' : src.slice(end + 5);
  if (body.startsWith('\n')) body = body.slice(1);
  return { meta, body };
};

export interface ParsedBundle {
  projects: WebNovelProject[];
  warnings: string[];
}

export const parseBundle = async (bytes: Uint8Array): Promise<ParsedBundle> => {
  const entries = await readZip(bytes);
  const files = new Map(entries.map((e) => [e.name, e.data]));
  const warnings: string[] = [];

  const manifestRaw = files.get('manifest.json');
  if (!manifestRaw) throw new Error('manifest.json 이 없습니다. 이 앱에서 내보낸 묶음이 아닙니다.');
  let manifest: any;
  try {
    manifest = JSON.parse(dec.decode(manifestRaw));
  } catch {
    throw new Error('manifest.json 을 해석할 수 없습니다.');
  }
  if (manifest?.format !== BUNDLE_FORMAT) throw new Error('지원하지 않는 묶음 형식입니다.');
  if (typeof manifest.version !== 'number' || manifest.version > BUNDLE_VERSION) {
    throw new Error('더 새로운 버전의 묶음입니다. 앱을 업데이트한 뒤 가져오세요.');
  }
  if (!Array.isArray(manifest.projects)) throw new Error('manifest 에 작품 목록이 없습니다.');

  const projects: WebNovelProject[] = [];
  for (const meta of manifest.projects) {
    const folder = safeName(String(meta?.folder ?? meta?.id ?? ''));
    const raw = files.get(`${folder}/project.json`);
    if (!raw) {
      warnings.push(`작품 "${meta?.title ?? meta?.id}": project.json 이 없어 건너뜁니다.`);
      continue;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(dec.decode(raw));
    } catch {
      warnings.push(`작품 "${meta?.title ?? meta?.id}": project.json 이 손상되어 건너뜁니다.`);
      continue;
    }
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.title !== 'string') {
      warnings.push(`작품 "${meta?.title ?? meta?.id}": 필수 필드(id, title)가 없어 건너뜁니다.`);
      continue;
    }
    const project = ensureProjectIntegrity(parsed);

    // 씬 마크다운 본문 반영
    let changed = 0;
    for (const [chapterId, chapter] of Object.entries(project.chapters || {})) {
      (chapter.scenes || []).forEach((scene, idx) => {
        const nn = String(idx + 1).padStart(2, '0');
        const md = files.get(`${folder}/chapters/${safeName(chapterId)}/${nn}-${safeName(scene.id)}.md`);
        if (!md) return;
        const parsedMd = parseSceneMarkdown(dec.decode(md));
        if (!parsedMd) {
          warnings.push(`${chapterId}/${scene.id}: 마크다운 프런트매터를 해석하지 못해 project.json 본문을 유지합니다.`);
          return;
        }
        if (parsedMd.meta.scene && parsedMd.meta.scene !== scene.id) {
          warnings.push(`${chapterId}/${scene.id}: 마크다운의 scene ID 가 달라 무시합니다.`);
          return;
        }
        if (parsedMd.body !== scene.content) {
          scene.content = parsedMd.body;
          scene.wordCount = parsedMd.body.length;
          changed++;
        }
      });
    }
    if (changed > 0) warnings.push(`작품 "${project.title}": 마크다운에서 수정된 씬 ${changed}개를 반영했습니다.`);
    projects.push(project);
  }

  if (projects.length === 0) throw new Error('가져올 수 있는 작품이 없습니다.');
  return { projects, warnings };
};

/** 같은 ID 의 작품은 덮어쓰지 않고 새 ID 로 추가한다. */
export const mergeImportedProjects = (
  existing: WebNovelProject[],
  imported: WebNovelProject[],
  now: Date = new Date()
): { projects: WebNovelProject[]; renamed: { from: string; to: string }[] } => {
  const ids = new Set(existing.map((p) => p.id));
  const renamed: { from: string; to: string }[] = [];
  const added: WebNovelProject[] = [];
  for (const p of imported) {
    let id = p.id;
    if (ids.has(id)) {
      let candidate = `${p.id}-import-${now.getTime().toString(36)}`;
      let n = 2;
      while (ids.has(candidate)) candidate = `${p.id}-import-${now.getTime().toString(36)}-${n++}`;
      id = candidate;
      renamed.push({ from: p.id, to: id });
      added.push({ ...p, id, title: `${p.title} (가져옴)` });
    } else {
      added.push(p);
    }
    ids.add(id);
  }
  return { projects: [...added, ...existing], renamed };
};
