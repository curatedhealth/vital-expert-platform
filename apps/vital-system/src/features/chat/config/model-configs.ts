/**
 * LLM model configurations stub
 * TODO: Sync with backend model configurations when chat feature is developed
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  maxTokens: number;
  contextWindow: number;
  costPerThousandTokens: {
    input: number;
    output: number;
  };
  supportsStreaming: boolean;
  supportsVision: boolean;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    contextWindow: 8192,
    costPerThousandTokens: {
      input: 0.03,
      output: 0.06,
    },
    supportsStreaming: true,
    supportsVision: false,
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    contextWindow: 128000,
    costPerThousandTokens: {
      input: 0.01,
      output: 0.03,
    },
    supportsStreaming: true,
    supportsVision: true,
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 16385,
    contextWindow: 16385,
    costPerThousandTokens: {
      input: 0.0005,
      output: 0.0015,
    },
    supportsStreaming: true,
    supportsVision: false,
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    contextWindow: 200000,
    costPerThousandTokens: {
      input: 0.015,
      output: 0.075,
    },
    supportsStreaming: true,
    supportsVision: true,
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    contextWindow: 200000,
    costPerThousandTokens: {
      input: 0.003,
      output: 0.015,
    },
    supportsStreaming: true,
    supportsVision: true,
  },
};

export const getModelConfig = (modelId: string): ModelConfig | undefined => {
  return MODEL_CONFIGS[modelId];
};

export const getDefaultModel = (): ModelConfig => {
  return MODEL_CONFIGS['gpt-4-turbo'];
};

export const getSupportedModels = (): ModelConfig[] => {
  return Object.values(MODEL_CONFIGS);
};

export default MODEL_CONFIGS;
