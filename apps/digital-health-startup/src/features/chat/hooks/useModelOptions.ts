import { useState, useEffect } from 'react';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider?: string;
  maxTokens?: number;
}

export interface FitnessScore {
  overall: number;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const defaultModelOptions: ModelOption[] = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable, best for complex reasoning' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster GPT-4 with 128K context window' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model for complex tasks' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest Claude model for quick responses' },
  { id: 'CuratedHealth/base_7b', name: 'CuratedHealth Base 7B', description: 'Hugging Face fine-tuned 7B parameter base model' },
  { id: 'CuratedHealth/meditron70b-qlora-1gpu', name: 'Meditron 70B QLoRA', description: 'Medical-focused 70B model optimized for single GPU' },
  { id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923', name: 'Qwen3 8B SFT', description: 'Supervised fine-tuned Qwen3 8B model for medical tasks' },
];

export function useModelOptions() {
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(defaultModelOptions);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelFitnessScore, setModelFitnessScore] = useState<FitnessScore | null>(null);

  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch('/api/llm/available-models');
        const data = await response.json();

        if (data.models && data.models.length > 0) {
          setModelOptions(data.models);
          console.log(`✅ Loaded ${data.models.length} LLM models from ${data.source}`);
        } else {
          // Fallback to default models
          setModelOptions(defaultModelOptions);
          console.log('ℹ️ Using default model options');
        }
      } catch (error) {
        console.error('❌ Error fetching available models:', error);
        // Fallback to default models on error
        setModelOptions(defaultModelOptions);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchAvailableModels();
  }, []);

  return {
    modelOptions,
    loadingModels,
    modelFitnessScore,
    setModelFitnessScore,
  };
}

