import { GoogleGenAI } from '@google/genai';

export type AiProvider = 'gemini' | 'openai' | 'claude';

export const SUPPORTED_PROVIDERS: AiProvider[] = ['gemini', 'openai', 'claude'];

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  gemini: 'gemini-3.8-flash',
  openai: 'sol-6.1',
  claude: 'sonnect-5.5',
};

// UI 표시용 모델명 -> 실제 API 모델명. 치환이 일어나면 응답에 aliased=true 로 표시한다.
const MODEL_ALIASES: Record<AiProvider, Record<string, string>> = {
  gemini: {},
  openai: { 'sol-6.1': 'gpt-4o' },
  claude: {
    'sonnect-5.5': 'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-5.5': 'claude-3-5-sonnet-20241022',
  },
};

export class AiError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export interface CallModelOptions {
  provider?: string;
  apiKey?: string;
  model?: string;
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface CallModelResult {
  text: string;
  provider: AiProvider;
  requestedModel: string;
  actualModel: string;
  aliased: boolean;
  latencyMs: number;
}

export const isProvider = (value: unknown): value is AiProvider =>
  typeof value === 'string' && (SUPPORTED_PROVIDERS as string[]).includes(value);

const resolveModel = (provider: AiProvider, requested?: string) => {
  const requestedModel = (requested && requested.trim()) || DEFAULT_MODELS[provider];
  const actualModel = MODEL_ALIASES[provider][requestedModel] || requestedModel;
  return { requestedModel, actualModel, aliased: actualModel !== requestedModel };
};

const extractUpstreamMessage = (data: any, fallback: string) =>
  data?.error?.message || data?.message || fallback;

/**
 * 모든 AI 기능이 쓰는 단일 호출 경로. 실패하면 항상 AiError 를 던진다.
 * 제공자 간 조용한 대체(fallback)와 예시 응답 반환은 하지 않는다.
 */
export const callModel = async (opts: CallModelOptions): Promise<CallModelResult> => {
  const provider = opts.provider || 'gemini';
  if (!isProvider(provider)) {
    throw new AiError('invalid_provider', '지원되지 않는 AI 제공자입니다.', 400);
  }

  const rawKey = typeof opts.apiKey === 'string' ? opts.apiKey.trim() : '';
  const apiKey = rawKey || (provider === 'gemini' ? process.env.GEMINI_API_KEY || '' : '');
  if (!apiKey) {
    throw new AiError(
      'missing_key',
      `${provider} API 키가 설정되지 않았습니다. AI 설정에서 키를 입력해주세요.`,
      400
    );
  }

  const { requestedModel, actualModel, aliased } = resolveModel(provider, opts.model);
  const temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.75;
  const maxTokens = opts.maxTokens && opts.maxTokens > 0 ? opts.maxTokens : 3500;
  const timeoutMs = opts.timeoutMs ?? 60000;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener('abort', onExternalAbort, { once: true });
  }

  const started = Date.now();
  try {
    let text = '';

    if (provider === 'gemini') {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: actualModel,
        contents: opts.prompt,
        config: {
          systemInstruction: opts.system,
          temperature,
          maxOutputTokens: maxTokens,
          abortSignal: controller.signal,
        },
      });
      text = response.text || '';
    } else if (provider === 'openai') {
      const messages = [
        ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
        { role: 'user', content: opts.prompt },
      ];
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: actualModel, messages, temperature, max_tokens: maxTokens }),
        signal: controller.signal,
      });
      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new AiError('upstream_error', extractUpstreamMessage(data, `OpenAI 오류 (${response.status})`));
      }
      text = data.choices?.[0]?.message?.content || '';
    } else {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: actualModel,
          max_tokens: maxTokens,
          temperature,
          ...(opts.system ? { system: opts.system } : {}),
          messages: [{ role: 'user', content: opts.prompt }],
        }),
        signal: controller.signal,
      });
      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new AiError('upstream_error', extractUpstreamMessage(data, `Claude 오류 (${response.status})`));
      }
      text = data.content?.[0]?.text || '';
    }

    if (!text || !text.trim()) {
      throw new AiError('empty_response', 'AI가 빈 응답을 반환했습니다.');
    }

    return {
      text,
      provider,
      requestedModel,
      actualModel,
      aliased,
      latencyMs: Date.now() - started,
    };
  } catch (err: any) {
    if (err instanceof AiError) throw err;
    if (timedOut) {
      throw new AiError('timeout', `AI 응답 시간이 초과되었습니다 (${Math.round(timeoutMs / 1000)}초).`, 504);
    }
    if (controller.signal.aborted || err?.name === 'AbortError') {
      throw new AiError('cancelled', '요청이 취소되었습니다.', 499);
    }
    let message: string = err?.message || 'AI 호출에 실패했습니다.';
    if (message.startsWith('{')) {
      try {
        message = JSON.parse(message)?.error?.message || message;
      } catch {}
    }
    throw new AiError('upstream_error', message);
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onExternalAbort);
  }
};

export const modelInfo = (r: CallModelResult) => ({
  provider: r.provider,
  requestedModel: r.requestedModel,
  actualModel: r.actualModel,
  aliased: r.aliased,
  latencyMs: r.latencyMs,
});
