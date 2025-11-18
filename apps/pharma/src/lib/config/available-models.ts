/**
 * Available AI Models Configuration
 *
 * Based on environment variables (API keys present in .env.local)
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'huggingface';
  description: string;
  maxTokens: number;
  supportsStreaming: boolean;
  costTier: 'free' | 'low' | 'medium' | 'high';
  icon: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models (OPENAI_API_KEY available)
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Most capable model, best for complex medical/regulatory analysis',
    maxTokens: 128000,
    supportsStreaming: true,
    costTier: 'high',
    icon: '🤖'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Powerful model for detailed analysis and reasoning',
    maxTokens: 8192,
    supportsStreaming: true,
    costTier: 'high',
    icon: '🧠'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and cost-effective for general queries',
    maxTokens: 16385,
    supportsStreaming: true,
    costTier: 'low',
    icon: '⚡'
  },

  // Google Gemini Models (GEMINI_API_KEY available)
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google\'s most capable model with large context window',
    maxTokens: 1000000,
    supportsStreaming: true,
    costTier: 'medium',
    icon: '💎'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient for quick responses',
    maxTokens: 1000000,
    supportsStreaming: true,
    costTier: 'low',
    icon: '⚡'
  },

  // HuggingFace Models (HUGGINGFACE_API_KEY available)
  // Medical-specialized models from CuratedHealth
  {
    id: 'CuratedHealth/meditron70b-qlora-1gpu',
    name: 'Meditron 70B (Medical)',
    provider: 'huggingface',
    description: 'Large medical-specialized model, best for clinical reasoning and complex medical queries',
    maxTokens: 8192,
    supportsStreaming: true,
    costTier: 'medium',
    icon: '🏥'
  },
  {
    id: 'CuratedHealth/meditron7b-lora-chat',
    name: 'Meditron 7B Chat (Medical)',
    provider: 'huggingface',
    description: 'Efficient medical chat model optimized for clinical conversations',
    maxTokens: 4096,
    supportsStreaming: true,
    costTier: 'low',
    icon: '💊'
  },
  {
    id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
    name: 'Qwen3 8B Medical (Fine-tuned)',
    provider: 'huggingface',
    description: 'Medical fine-tuned Qwen model for healthcare applications',
    maxTokens: 8192,
    supportsStreaming: true,
    costTier: 'low',
    icon: '🔬'
  },
  {
    id: 'CuratedHealth/base_7b',
    name: 'CuratedHealth Base 7B',
    provider: 'huggingface',
    description: 'Base medical model for general healthcare queries',
    maxTokens: 4096,
    supportsStreaming: true,
    costTier: 'free',
    icon: '⚕️'
  },
];

// Default model (best balance of capability and cost)
export const DEFAULT_MODEL = 'gpt-4-turbo';

// Get model by ID
export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(model => model.id === id);
}

// Get models by provider
export function getModelsByProvider(provider: 'openai' | 'google' | 'huggingface'): ModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.provider === provider);
}

// Get recommended model for a mode
export function getRecommendedModel(isAutonomous: boolean, isAutomatic: boolean): string {
  // Autonomous modes benefit from more capable models
  if (isAutonomous) {
    return 'gpt-4-turbo'; // Most capable for complex autonomous tasks
  }

  // Interactive modes can use faster models
  if (!isAutonomous && isAutomatic) {
    return 'gpt-3.5-turbo'; // Fast for automatic routing
  }

  return DEFAULT_MODEL;
}

// Get recommended medical model based on query complexity
export function getRecommendedMedicalModel(isComplex: boolean = false): string {
  if (isComplex) {
    return 'CuratedHealth/meditron70b-qlora-1gpu'; // Large medical model for complex clinical reasoning
  }
  return 'CuratedHealth/meditron7b-lora-chat'; // Efficient medical chat model
}

// Check if a model is medical-specialized
export function isMedicalModel(modelId: string): boolean {
  return modelId.startsWith('CuratedHealth/');
}

// Check if a model supports a feature
export function modelSupportsFeature(modelId: string, feature: 'streaming' | 'largeContext'): boolean {
  const model = getModelById(modelId);
  if (!model) return false;

  switch (feature) {
    case 'streaming':
      return model.supportsStreaming;
    case 'largeContext':
      return model.maxTokens > 32000;
    default:
      return false;
  }
}
