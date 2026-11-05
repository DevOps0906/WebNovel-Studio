import test from 'node:test';
import assert from 'node:assert/strict';
import { callModel, AiError } from '../server/aiGateway';

const realFetch = globalThis.fetch;
const restore = () => {
  globalThis.fetch = realFetch;
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('callModel: 지원하지 않는 제공자는 400', async () => {
  await assert.rejects(callModel({ provider: 'nope', prompt: 'x' }), (e: any) => e instanceof AiError && e.code === 'invalid_provider' && e.status === 400);
});

test('callModel: 키가 없으면 다른 제공자로 대체하지 않고 실패', async () => {
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    for (const provider of ['openai', 'claude', 'gemini']) {
      await assert.rejects(callModel({ provider, prompt: 'x' }), (e: any) => e.code === 'missing_key');
    }
  } finally {
    if (saved) process.env.GEMINI_API_KEY = saved;
  }
});

test('callModel: OpenAI 성공 시 요청/실제 모델명과 치환 여부를 기록', async () => {
  let sentBody: any;
  globalThis.fetch = (async (_url: any, init: any) => {
    sentBody = JSON.parse(init.body);
    return jsonResponse(200, { choices: [{ message: { content: '본문' } }] });
  }) as any;
  try {
    const r = await callModel({ provider: 'openai', apiKey: 'sk-test', model: 'sol-6.1', prompt: 'p', system: 's' });
    assert.equal(r.text, '본문');
    assert.equal(r.requestedModel, 'sol-6.1');
    assert.equal(r.actualModel, 'gpt-4o');
    assert.equal(r.aliased, true);
    assert.equal(sentBody.model, 'gpt-4o');
    assert.equal(sentBody.messages[0].role, 'system');
  } finally {
    restore();
  }
});

test('callModel: 치환이 없으면 aliased=false', async () => {
  globalThis.fetch = (async () => jsonResponse(200, { content: [{ text: 'ok' }] })) as any;
  try {
    const r = await callModel({ provider: 'claude', apiKey: 'k', model: 'claude-custom', prompt: 'p' });
    assert.equal(r.aliased, false);
    assert.equal(r.actualModel, 'claude-custom');
  } finally {
    restore();
  }
});

test('callModel: 업스트림 오류는 AiError 로 전달 (예시 응답 없음)', async () => {
  globalThis.fetch = (async () => jsonResponse(401, { error: { message: 'bad key' } })) as any;
  try {
    await assert.rejects(callModel({ provider: 'openai', apiKey: 'k', prompt: 'p' }), (e: any) => e.code === 'upstream_error' && e.message === 'bad key');
  } finally {
    restore();
  }
});

test('callModel: 빈 응답은 실패', async () => {
  globalThis.fetch = (async () => jsonResponse(200, { choices: [{ message: { content: '  ' } }] })) as any;
  try {
    await assert.rejects(callModel({ provider: 'openai', apiKey: 'k', prompt: 'p' }), (e: any) => e.code === 'empty_response');
  } finally {
    restore();
  }
});

test('callModel: 타임아웃과 외부 취소를 구분', async () => {
  globalThis.fetch = ((_url: any, init: any) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    })) as any;
  try {
    await assert.rejects(callModel({ provider: 'openai', apiKey: 'k', prompt: 'p', timeoutMs: 30 }), (e: any) => e.code === 'timeout' && e.status === 504);

    const ac = new AbortController();
    const p = callModel({ provider: 'openai', apiKey: 'k', prompt: 'p', timeoutMs: 5000, signal: ac.signal });
    setTimeout(() => ac.abort(), 20);
    await assert.rejects(p, (e: any) => e.code === 'cancelled');
  } finally {
    restore();
  }
});
