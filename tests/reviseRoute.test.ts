import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { registerAiRoutes } from '../server/aiRoutes';

const withServer = async (fn: (base: string) => Promise<void>) => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  registerAiRoutes(app);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    // keep-alive 연결이 남아 있으면 close 가 끝나지 않으므로 먼저 끊는다
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
};

// keep-alive 소켓이 남으면 테스트 프로세스가 종료되지 않으므로 요청마다 연결을 닫는다
const post = (base: string, path: string, body: unknown) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Connection: 'close' },
    body: JSON.stringify(body),
  });

test('revise-scene: 본문이 비어 있으면 400', async () => {
  await withServer(async (base) => {
    const r = await post(base, '/api/aiwc/revise-scene', { sceneText: '   ', provider: 'openai', apiKey: 'k' });
    assert.equal(r.status, 400);
    const j: any = await r.json();
    assert.equal(j.success, false);
    assert.equal(j.status, 'failed');
  });
});

test('revise-scene: 키가 없으면 다른 제공자로 대체하지 않고 실패(400, missing_key)', async () => {
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await withServer(async (base) => {
      const r = await post(base, '/api/aiwc/revise-scene', { sceneText: '나는 문을 열었다.', provider: 'claude' });
      assert.equal(r.status, 400);
      const j: any = await r.json();
      assert.equal(j.code, 'missing_key');
      assert.equal(j.success, false);
    });
  } finally {
    if (saved) process.env.GEMINI_API_KEY = saved;
  }
});

test('revise-scene: 잘못된 제공자는 400', async () => {
  await withServer(async (base) => {
    const r = await post(base, '/api/aiwc/revise-scene', { sceneText: '본문', provider: 'unknown', apiKey: 'k' });
    assert.equal(r.status, 400);
    const j: any = await r.json();
    assert.equal(j.code, 'invalid_provider');
  });
});

test('review-chapter: 본문이 비어 있으면 고정 리포트 없이 400', async () => {
  await withServer(async (base) => {
    const r = await post(base, '/api/aiwc/review-chapter', { sceneText: '', provider: 'gemini' });
    assert.equal(r.status, 400);
    const j: any = await r.json();
    assert.equal(j.review, undefined);
  });
});
