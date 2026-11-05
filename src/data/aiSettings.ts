// AI Engine & API Key Management configuration

export type AiProvider = 'claude' | 'openai' | 'gemini';

export interface AiSettingsConfig {
  activeProvider: AiProvider;
  claude: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  openai: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  gemini: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export const DEFAULT_AI_SETTINGS: AiSettingsConfig = {
  activeProvider: 'gemini',
  claude: {
    apiKey: '',
    model: 'sonnect-5.5',
    temperature: 0.75,
    maxTokens: 3000,
  },
  openai: {
    apiKey: '',
    model: 'sol-6.1',
    temperature: 0.75,
    maxTokens: 3000,
  },
  gemini: {
    apiKey: '',
    model: 'gemini-3.8-flash',
    temperature: 0.75,
    maxTokens: 3000,
  },
};

const STORAGE_KEY = 'webnovel_studio_ai_settings';

export const loadAiSettings = (): AiSettingsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AI_SETTINGS,
      ...parsed,
      claude: { ...DEFAULT_AI_SETTINGS.claude, ...(parsed.claude || {}) },
      openai: { ...DEFAULT_AI_SETTINGS.openai, ...(parsed.openai || {}) },
      gemini: { ...DEFAULT_AI_SETTINGS.gemini, ...(parsed.gemini || {}) },
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
};

export const saveAiSettings = (settings: AiSettingsConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save AI settings:', err);
  }
};

export const getActiveAiCredentials = () => {
  const settings = loadAiSettings();
  const provider = settings.activeProvider;
  const config = settings[provider];
  return {
    provider,
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };
};
