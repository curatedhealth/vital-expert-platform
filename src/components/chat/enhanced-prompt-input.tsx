'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Wand2, 
  ChevronDown, 
  Loader2,
  Send,
  Square,
  X,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
// import { usePromptEnhancement } from '@/hooks/usePromptEnhancement';
// import { PromptEnhancementModal } from '@/components/chat/PromptEnhancementModal';

interface EnhancedPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  selectedAgent?: any;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

// Available LLM Models
const AI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most advanced model with superior reasoning',
    category: 'premium'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Faster, cost-effective version',
    category: 'standard'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Latest GPT-4 with improved capabilities',
    category: 'premium'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'High-quality reasoning and analysis',
    category: 'premium'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and cost-effective',
    category: 'standard'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most intelligent Claude model',
    category: 'premium'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and cost',
    category: 'standard'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest Claude model',
    category: 'standard'
  },
  {
    id: 'meta-llama/Llama-3-70b-chat-hf',
    name: 'Llama 3 70B',
    provider: 'Hugging Face',
    description: 'Meta\'s most powerful open model',
    category: 'open-source'
  },
  {
    id: 'meta-llama/Llama-3-8b-chat-hf',
    name: 'Llama 3 8B',
    provider: 'Hugging Face',
    description: 'Fast, efficient Meta model',
    category: 'open-source'
  },
  {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral 8x7B',
    provider: 'Hugging Face',
    description: 'Powerful mixture-of-experts model',
    category: 'open-source'
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B',
    provider: 'Hugging Face',
    description: 'Efficient, high-quality responses',
    category: 'open-source'
  }
];

export function EnhancedPromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Message VITAL Expert...",
  className,
  selectedAgent,
  selectedModel = 'gpt-4o',
  onModelChange
}: EnhancedPromptInputProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [showModelSelect, setShowModelSelect] = useState(false);
  
  // const { 
  //   enhancePrompt, 
  //   prompts, 
  //   isLoading: isPromptLoading,
  //   error: promptError 
  // } = usePromptEnhancement();

  // Always allow sending (unconditional)
  const canSend = !disabled && value.trim() && !isLoading;

  // Debug logging
  console.log('EnhancedPromptInput Debug:', {
    disabled,
    value: value.trim(),
    isLoading,
    canSend,
    selectedAgent
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSubmit();
      }
    }
  };

  const handleEnhancePrompt = useCallback(async () => {
    if (!value.trim()) return;
    
    setIsEnhancing(true);
    try {
      // TODO: Implement PRISM prompt enhancement
      console.log('PRISM prompt enhancement not yet implemented');
      // const result = await enhancePrompt(
      //   value,
      //   selectedAgent?.id,
      //   undefined // Let it auto-select the best prompt
      // );
      
      // if (result.enhancedPrompt && result.enhancedPrompt !== value) {
      //   setEnhancedPrompt(result.enhancedPrompt);
      //   setShowPromptModal(true);
      // }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [value, selectedAgent?.id]);

  const handleApplyEnhancedPrompt = (enhanced: string) => {
    onChange(enhanced);
    setEnhancedPrompt(null);
    setShowPromptModal(false);
  };

  const selectedModelInfo = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className={cn("w-full", className)}>
      {/* Main Input Container */}
      <div className="relative">
        <div className="flex items-end gap-2 p-3 bg-white rounded-2xl border border-gray-200 shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[40px] max-h-[120px] resize-none border-0 shadow-none focus:ring-0 text-base bg-transparent"
              disabled={disabled}
              rows={1}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* PRISM Prompt Enhancer - Temporarily disabled */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEnhancePrompt}
              disabled={!value.trim() || isEnhancing}
              className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600 opacity-50"
              title="PRISM prompt enhancement (coming soon)"
            >
              {isEnhancing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>

            {/* Model Selector */}
            <DropdownMenu open={showModelSelect} onOpenChange={setShowModelSelect}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {selectedModelInfo?.name || 'Model'}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {AI_MODELS.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => {
                      onModelChange?.(model.id);
                      setShowModelSelect(false);
                    }}
                    className="flex flex-col items-start p-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{model.name}</span>
                      <Badge 
                        variant={model.category === 'premium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {model.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {model.provider} • {model.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send Button */}
            <Button
              type="submit"
              onClick={onSubmit}
              disabled={!canSend}
              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Prompt Indicator */}
        {enhancedPrompt && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="default" className="bg-purple-600 text-white text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
        {selectedModelInfo && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Using {selectedModelInfo.name}</span>
            <Badge variant="outline" className="text-xs">
              {selectedModelInfo.provider}
            </Badge>
          </div>
        )}
      </div>

      {/* PRISM Prompt Enhancement Modal - Temporarily disabled */}
      {/* <PromptEnhancementModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onApplyPrompt={handleApplyEnhancedPrompt}
        currentInput={value}
      /> */}
    </div>
  );
}
