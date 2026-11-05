import type { WebNovelProject } from './projectTemplates';
import type { SceneItem } from './storyData';

export interface SceneEditOk {
  ok: true;
  project: WebNovelProject;
  scene: SceneItem;
  previousContent: string;
}
export interface SceneEditFail {
  ok: false;
  error: string;
}

/**
 * 씬 본문을 바꾼 새 프로젝트 객체를 만든다. 입력 객체는 변경하지 않는다.
 * 챕터 합계는 해당 씬의 변동분만 반영한다.
 */
export const applySceneContent = (
  project: WebNovelProject,
  chapterId: string,
  sceneId: string,
  text: string,
  options: { status?: SceneItem['status']; now?: Date } = {}
): SceneEditOk | SceneEditFail => {
  const chapter = project.chapters?.[chapterId];
  const oldScene = chapter?.scenes?.find((s) => s.id === sceneId);
  if (!chapter || !oldScene) {
    return { ok: false, error: '대상 씬을 현재 작품에서 찾을 수 없습니다.' };
  }

  const status: SceneItem['status'] =
    options.status ?? (oldScene.status === '대기' && text.trim() ? '집필 중' : oldScene.status);

  const scene: SceneItem = { ...oldScene, content: text, wordCount: text.length, status };
  const wasDone = oldScene.status === '본문 완료';
  const isDone = status === '본문 완료';

  const updatedChapter = {
    ...chapter,
    scenes: chapter.scenes.map((s) => (s.id === sceneId ? scene : s)),
    totalWords: Math.max(0, chapter.totalWords + (scene.wordCount - oldScene.wordCount)),
    completedScenesCount: Math.max(0, chapter.completedScenesCount + (isDone ? 1 : 0) - (wasDone ? 1 : 0)),
  };

  return {
    ok: true,
    project: {
      ...project,
      chapters: { ...project.chapters, [chapterId]: updatedChapter },
      updatedAt: (options.now ?? new Date()).toISOString().slice(0, 10),
    },
    scene,
    previousContent: oldScene.content,
  };
};
