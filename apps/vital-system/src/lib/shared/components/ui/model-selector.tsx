'use client';

import { Brain, Zap, Clock, Star } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/lib/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/lib/shared/components/ui/select';
import { cn } from '@/lib/utils';

// 🤖 Model Configuration Types
export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'huggingface';
  description: string;
  contextLength: number;
  pricing: {
    input: number;    // per 1M tokens
    output: number;   // per 1M tokens
  };
  capabilities: {
    reasoning: number;    // 1-5 scale
    speed: number;        // 1-5 scale
    creativity: number;   // 1-5 scale
  };
  features: string[];
  status: 'stable' | 'preview' | 'deprecated';
  modelUrl?: string;    // For Hugging Face models
  accessToken?: string; // For private models
}

// 🎯 Available Models Configuration
export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most advanced OpenAI model with superior reasoning and multimodal capabilities',
    contextLength: 128000,
    pricing: { input: 2.50, output: 10.00 },
    capabilities: { reasoning: 5, speed: 4, creativity: 5 },
    features: ['Vision', 'Code', 'Math', 'Reasoning'],
    status: 'stable'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Faster, cost-effective version of GPT-4o with excellent performance',
    contextLength: 128000,
    pricing: { input: 0.15, output: 0.60 },
    capabilities: { reasoning: 4, speed: 5, creativity: 4 },
    features: ['Vision', 'Code', 'Fast'],
    status: 'stable'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 with improved instruction following and JSON mode',
    contextLength: 128000,
    pricing: { input: 10.00, output: 30.00 },
    capabilities: { reasoning: 5, speed: 3, creativity: 5 },
    features: ['JSON Mode', 'Function Calling', 'Vision'],
    status: 'stable'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Original GPT-4 model with excellent reasoning capabilities',
    contextLength: 8192,
    pricing: { input: 30.00, output: 60.00 },
    capabilities: { reasoning: 5, speed: 2, creativity: 4 },
    features: ['Reasoning', 'Analysis'],
    status: 'stable'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and cost-effective model for most conversational tasks',
    contextLength: 16384,
    pricing: { input: 0.50, output: 1.50 },
    capabilities: { reasoning: 3, speed: 5, creativity: 3 },
    features: ['Fast', 'Cost-effective', 'Function Calling'],
    status: 'stable'
  },

  // Hugging Face Models (2025 Router API)
  {
    id: 'microsoft/Phi-3-mini-4k-instruct',
    name: 'Microsoft Phi-3 Mini',
    provider: 'huggingface',
    description: 'Compact medical reasoning model optimized for healthcare applications',
    contextLength: 4096,
    pricing: { input: 0.05, output: 0.10 },
    capabilities: { reasoning: 4, speed: 5, creativity: 3 },
    features: ['Medical', 'Reasoning', 'Compact', 'Fast'],
    status: 'stable'
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B Instruct',
    provider: 'huggingface',
    description: 'Instruction-tuned model excellent for medical Q&A and clinical reasoning',
    contextLength: 4096,
    pricing: { input: 0.06, output: 0.12 },
    capabilities: { reasoning: 4, speed: 4, creativity: 3 },
    features: ['Instruction Following', 'Medical Q&A', 'Clinical'],
    status: 'stable'
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    name: 'Meta Llama 3.1 8B',
    provider: 'huggingface',
    description: 'High-performance language model suitable for medical text processing',
    contextLength: 8192,
    pricing: { input: 0.08, output: 0.15 },
    capabilities: { reasoning: 4, speed: 4, creativity: 4 },
    features: ['Text Generation', 'Medical', 'General Purpose'],
    status: 'stable'
  },
  {
    id: 'deepseek-ai/DeepSeek-V3-0324',
    name: 'DeepSeek V3 (Verified)',
    provider: 'huggingface',
    description: 'Advanced reasoning model for complex medical and clinical scenarios - WORKING',
    contextLength: 8192,
    pricing: { input: 0.10, output: 0.20 },
    capabilities: { reasoning: 5, speed: 3, creativity: 4 },
    features: ['Advanced Reasoning', 'Medical', 'Clinical', 'Research', 'Verified'],
    status: 'stable'
  },

  // CuratedHealth Medical Models (Local LoRA Adapters)
  {
    id: 'CuratedHealth/base_7b',
    name: 'CuratedHealth Base 7B',
    provider: 'huggingface',
    description: 'Medical-optimized 7B parameter model with LoRA adapter for healthcare applications',
    contextLength: 4096,
    pricing: { input: 0.00, output: 0.00 }, // Local model - no API costs
    capabilities: { reasoning: 4, speed: 4, creativity: 3 },
    features: ['Medical', 'LoRA', 'Local', 'Healthcare', 'Base Model'],
    status: 'stable',
    modelUrl: 'CuratedHealth/base_7b'
  },
  {
    id: 'CuratedHealth/meditron70b-qlora-1gpu',
    name: 'Meditron 70B QLoRA',
    provider: 'huggingface',
    description: 'Large-scale medical model with QLoRA optimization for single GPU inference',
    contextLength: 8192,
    pricing: { input: 0.00, output: 0.00 }, // Local model - no API costs
    capabilities: { reasoning: 5, speed: 2, creativity: 4 },
    features: ['Medical', 'QLoRA', 'Large Scale', 'Clinical', 'Research'],
    status: 'stable',
    modelUrl: 'CuratedHealth/meditron70b-qlora-1gpu'
  },
  {
    id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
    name: 'Qwen3 8B SFT',
    provider: 'huggingface',
    description: 'Qwen3 8B model with supervised fine-tuning for medical applications',
    contextLength: 8192,
    pricing: { input: 0.00, output: 0.00 }, // Local model - no API costs
    capabilities: { reasoning: 4, speed: 4, creativity: 4 },
    features: ['Medical', 'SFT', 'Qwen3', 'Instruction Following', 'Clinical'],
    status: 'stable',
    modelUrl: 'CuratedHealth/Qwen3-8B-SFT-20250917123923'
  }
];

// 🎨 Model Selector Component Interface
interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
  showDetails?: boolean;
}

// 🔧 Helper Functions
const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'openai': return '🤖';
    case 'anthropic': return '🧠';
    case 'google': return '🔍';
    case 'meta': return '📘';
    case 'huggingface': return '🤗';
    default: return '🤖';
  }
};

const getProviderColor = (provider: string) => {
  switch (provider) {
    case 'openai': return 'bg-green-100 text-green-800';
    case 'anthropic': return 'bg-orange-100 text-orange-800';
    case 'google': return 'bg-blue-100 text-blue-800';
    case 'meta': return 'bg-purple-100 text-purple-800';
    case 'huggingface': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-neutral-100 text-neutral-800';
  }
};

const getCapabilityIcon = (type: string) => {
  switch (type) {
    case 'reasoning': return <Brain className="h-3 w-3" />;
    case 'speed': return <Zap className="h-3 w-3" />;
    case 'creativity': return <Star className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const formatPrice = (price: number) => {
  if (price < 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(0)}`;
};

// 🎯 Main Model Selector Component
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className,
  showDetails = true,
}) => {
  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className={cn("space-y-2", className)}>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{getProviderIcon(currentModel.provider)}</span>
              <span className="font-medium">{currentModel.name}</span>
              {currentModel.status === 'preview' && (
                <Badge variant="secondary" className="text-xs">Preview</Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-full">
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="p-3">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{getProviderIcon(model.provider)}</span>
                    <span className="font-medium">{model.name}</span>
                    {model.status === 'preview' && (
                      <Badge variant="secondary" className="text-xs">Preview</Badge>
                    )}
                  </div>
                  <Badge className={cn("text-xs", getProviderColor(model.provider))}>
                    {model.provider.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-600 text-left">
                  {model.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>{(model.contextLength / 1000).toFixed(0)}K context</span>
                  <span>•</span>
                  <span>{formatPrice(model.pricing.input)}/M tokens</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {getCapabilityIcon('speed')}
                    <span>Speed: {model.capabilities.speed}/5</span>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Model Details */}
      {showDetails && (
        <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Model</span>
              <Badge className={cn("text-xs", getProviderColor(currentModel.provider))}>
                {currentModel.provider.toUpperCase()}
              </Badge>
            </div>
            {currentModel.status === 'preview' && (
              <Badge variant="outline" className="text-xs">Preview</Badge>
            )}
          </div>

          <p className="text-xs text-neutral-600">{currentModel.description}</p>

          {/* Capabilities */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              {getCapabilityIcon('reasoning')}
              <span>Reasoning: {currentModel.capabilities.reasoning}/5</span>
            </div>
            <div className="flex items-center gap-1">
              {getCapabilityIcon('speed')}
              <span>Speed: {currentModel.capabilities.speed}/5</span>
            </div>
            <div className="flex items-center gap-1">
              {getCapabilityIcon('creativity')}
              <span>Creativity: {currentModel.capabilities.creativity}/5</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {currentModel.features.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-200">
            <span>Context: {(currentModel.contextLength / 1000).toFixed(0)}K tokens</span>
            <span>
              Input: {formatPrice(currentModel.pricing.input)}/M •
              Output: {formatPrice(currentModel.pricing.output)}/M
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 Compact Model Selector (for header/toolbar)
export const CompactModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className,
}) => {
  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className={cn("w-auto min-w-[140px] h-8", className)}>
        <SelectValue>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{getProviderIcon(currentModel.provider)}</span>
            <span className="text-sm font-medium">{currentModel.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center gap-2">
              <span>{getProviderIcon(model.provider)}</span>
              <span>{model.name}</span>
              {model.status === 'preview' && (
                <Badge variant="secondary" className="text-xs ml-1">Preview</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// 🎯 Hook for Model Management
export const __useModelSelection = (defaultModel = 'gpt-4o-mini') => {
  const [selectedModel, setSelectedModel] = useState(defaultModel);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vital-ai-selected-model');
    if (saved && AVAILABLE_MODELS.find((m: any) => m.id === saved)) {
      setSelectedModel(saved);
    }
  }, []);

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Save to localStorage when changed
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('vital-ai-selected-model', modelId);
  };

  return {
    selectedModel,
    currentModel,
    handleModelChange,
    availableModels: AVAILABLE_MODELS,
  };
};

export default ModelSelector;