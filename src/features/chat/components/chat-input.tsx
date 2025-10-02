'use client';

import {
  Paperclip,
  Mic,
  MicOff,
  Square,
  StopCircle,
  Pause,
  FileText,
  Image,
  Code,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from '@/shared/components/ai/prompt-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Agent } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

// Voice Recognition Types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider?: string;
  maxTokens?: number;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  selectedAgent: Agent | null;
  enableVoice?: boolean;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
  onStop?: () => void;
}

// Available AI Models
const AI_MODELS = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable, best for complex tasks',
    category: 'OpenAI'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Faster, optimized for speed',
    category: 'OpenAI'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient',
    category: 'OpenAI'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Anthropic\'s most intelligent model',
    category: 'Anthropic'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance',
    category: 'Anthropic'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model',
    category: 'Anthropic'
  },
  // Hugging Face Models
  {
    id: 'meta-llama/Llama-3-70b-chat-hf',
    name: 'Llama 3 70B',
    description: 'Meta\'s most powerful open model',
    category: 'Hugging Face'
  },
  {
    id: 'meta-llama/Llama-3-8b-chat-hf',
    name: 'Llama 3 8B',
    description: 'Fast, efficient Meta model',
    category: 'Hugging Face'
  },
  {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral 8x7B',
    description: 'Powerful mixture-of-experts model',
    category: 'Hugging Face'
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B',
    description: 'Efficient, high-quality responses',
    category: 'Hugging Face'
  },
  {
    id: 'google/gemma-7b-it',
    name: 'Gemma 7B',
    description: 'Google\'s open-source model',
    category: 'Hugging Face'
  },
  {
    id: 'microsoft/phi-2',
    name: 'Phi-2',
    description: 'Small but powerful Microsoft model',
    category: 'Hugging Face'
  },
  {
    id: 'tiiuae/falcon-40b-instruct',
    name: 'Falcon 40B',
    description: 'Open-source powerhouse',
    category: 'Hugging Face'
  },
  {
    id: 'bigscience/bloom-7b1',
    name: 'BLOOM 7B',
    description: 'Multilingual open model',
    category: 'Hugging Face'
  },
  // CuratedHealth Custom Models
  {
    id: 'CuratedHealth/digital-health-sft',
    name: 'Digital Health SFT',
    description: 'Curated digital health fine-tuned model',
    category: 'CuratedHealth'
  },
  {
    id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
    name: 'Qwen3 8B Health',
    description: 'Health-specialized Qwen3 model',
    category: 'CuratedHealth'
  },
  {
    id: 'CuratedHealth/qwen3-8b-health-finetuned',
    name: 'Qwen3 8B Health Fine-tuned',
    description: 'Enhanced health AI model',
    category: 'CuratedHealth'
  },
  {
    id: 'CuratedHealth/base_7b',
    name: 'Base 7B Medical',
    description: 'Base medical model 7B parameters',
    category: 'CuratedHealth'
  },
  {
    id: 'CuratedHealth/meditron7b-lora-chat',
    name: 'Meditron 7B LoRA Chat',
    description: 'Medical conversation specialist',
    category: 'CuratedHealth'
  },
  {
    id: 'CuratedHealth/meditron70b-qlora-1gpu',
    name: 'Meditron 70B QLoRA',
    description: 'Large medical model with QLoRA',
    category: 'CuratedHealth'
  },
];

// Helper function to map provider to category
function getCategoryFromProvider(provider: string): string {
  switch (provider?.toLowerCase()) {
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      return 'Anthropic';
    case 'huggingface':
      return 'Hugging Face';
    case 'google':
      return 'Google';
    case 'meta':
      return 'Meta';
    default:
      return 'Other';
  }
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  selectedAgent,
  enableVoice = true,
  selectedModel: externalSelectedModel,
  onModelChange,
  onStop,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>(AI_MODELS);
  const [loadingModels, setLoadingModels] = useState(false);
  const [internalSelectedModel, setInternalSelectedModel] = useState(AI_MODELS[0]);
  const recognitionRef = useRef<any>(null);

  // Use external model if provided, otherwise use internal state
  const selectedModel = externalSelectedModel || internalSelectedModel;

  const handleModelChange = (model: AIModel) => {
    if (onModelChange) {
      onModelChange(model);
    } else {
      setInternalSelectedModel(model);
    }
  };

  // Fetch available models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch('/api/llm/available-models');
        const data = await response.json();

        if (data.models && data.models.length > 0) {
          // Transform API models to AIModel format
          const transformedModels: AIModel[] = data.models.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            category: getCategoryFromProvider(m.provider),
            provider: m.provider,
            maxTokens: m.maxTokens
          }));

          setAvailableModels(transformedModels);
          console.log(`✅ Chat Input: Loaded ${transformedModels.length} models from ${data.source}`);
        }
      } catch (error) {
        console.error('❌ Chat Input: Error fetching models:', error);
        // Keep using static AI_MODELS as fallback
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (enableVoice && typeof window !== 'undefined') {
      if ('webkitSpeechRecognition' in window) {
        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onChange(value + (value ? ' ' : '') + transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enableVoice, value, onChange]);

  const handleVoiceToggle = () => {
    if (!enableVoice || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleFileUpload = (type: string) => {
    // TODO: Implement file upload functionality
    setShowAttachments(false);
  };

  const attachmentOptions = [
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      description: 'Upload PDF, DOCX, or TXT files',
      accept: '.pdf,.docx,.txt,.md',
    },
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      description: 'Upload charts, diagrams, or screenshots',
      accept: '.png,.jpg,.jpeg,.gif,.webp',
    },
    {
      id: 'code',
      label: 'Code',
      icon: Code,
      description: 'Share code snippets or technical specs',
      accept: '.js,.ts,.py,.json,.xml,.html',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend();
    }
  };

  return (
    <div className="relative">
      {/* Attachment Options */}
      {showAttachments && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium text-deep-charcoal mb-3">
            Attach files to enhance your query
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {attachmentOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start gap-2 hover:bg-background-gray"
                onClick={() => handleFileUpload(option.id)}
              >
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-medical-gray text-left">
                  {option.description}
                </p>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area with PromptInput */}
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder={
            selectedAgent
              ? `Ask ${selectedAgent.name} anything...`
              : 'Type your message...'
          }
          disabled={isLoading}
        />

        <PromptInputToolbar>
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Voice Input Button */}
            {enableVoice && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  isRecording && 'bg-clinical-red/10 text-clinical-red'
                )}
                onClick={handleVoiceToggle}
                disabled={isLoading}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium hover:bg-gray-50"
                >
                  {selectedModel.name}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
                {loadingModels && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Loading available models...
                  </div>
                )}

                {!loadingModels && (
                  <>
                    {/* OpenAI Models */}
                    {availableModels.filter(m => m.category === 'OpenAI').length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">OpenAI</DropdownMenuLabel>
                        {availableModels.filter(m => m.category === 'OpenAI').map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => handleModelChange(model)}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{model.name}</span>
                      {selectedModel.id === model.id && (
                        <span className="text-xs text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{model.description}</span>
                  </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Anthropic Models */}
                    {availableModels.filter(m => m.category === 'Anthropic').length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">Anthropic</DropdownMenuLabel>
                        {availableModels.filter(m => m.category === 'Anthropic').map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => handleModelChange(model)}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{model.name}</span>
                      {selectedModel.id === model.id && (
                        <span className="text-xs text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{model.description}</span>
                  </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* Hugging Face Models */}
                    {availableModels.filter(m => m.category === 'Hugging Face').length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">Hugging Face (Open Source)</DropdownMenuLabel>
                        {availableModels.filter(m => m.category === 'Hugging Face').map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => handleModelChange(model)}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{model.name}</span>
                      {selectedModel.id === model.id && (
                        <span className="text-xs text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{model.description}</span>
                  </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {/* CuratedHealth Custom Models */}
                    {availableModels.filter(m => m.category === 'CuratedHealth').length > 0 && (
                      <>
                        <DropdownMenuLabel className="text-xs text-gray-500">CuratedHealth (Custom Medical Models)</DropdownMenuLabel>
                        {availableModels.filter(m => m.category === 'CuratedHealth').map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => handleModelChange(model)}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{model.name}</span>
                      {selectedModel.id === model.id && (
                        <span className="text-xs text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{model.description}</span>
                  </DropdownMenuItem>
                        ))}
                      </>
                    )}

                    {/* Show count of total models */}
                    {availableModels.length > 0 && (
                      <div className="px-2 py-2 text-xs text-gray-400 border-t mt-1">
                        {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
                      </div>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status badges */}
            <div className="flex items-center gap-2 text-xs text-medical-gray">
              {selectedAgent?.ragEnabled && (
                <Badge variant="outline" className="text-xs">
                  Knowledge Base Active
                </Badge>
              )}
              <span className="text-xs text-medical-gray">{value.length}/4000</span>
            </div>

            {/* Stop/Submit Button */}
            {isLoading && onStop ? (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-9 w-9 rounded-full p-0 flex items-center justify-center"
                onClick={onStop}
                title="Stop generation"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <PromptInputSubmit disabled={!value.trim() || isLoading}>
                {isLoading ? <Square className="h-4 w-4" /> : undefined}
              </PromptInputSubmit>
            )}
          </div>
        </PromptInputToolbar>
      </PromptInput>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-clinical-red/10 border border-clinical-red/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-clinical-red rounded-full animate-pulse" />
            <span className="text-sm text-clinical-red font-medium">
              Recording... Tap to stop
            </span>
          </div>
        </div>
      )}
    </div>
  );
}