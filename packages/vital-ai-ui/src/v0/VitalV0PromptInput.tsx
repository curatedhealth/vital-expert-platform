'use client';

import { memo, useCallback, useRef, KeyboardEvent } from 'react';
import { cn } from '../lib/utils';
import {
  Wand2,
  Loader2,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { V0GenerationType, VitalV0PromptInputProps, V0PromptExample } from './types';

/**
 * Placeholder text for each generation type
 */
const TYPE_PLACEHOLDERS: Record<V0GenerationType, string> = {
  'workflow-node': 'Describe the workflow node you need... e.g., "Create a KOL Influence Scorer node that displays publication metrics, H-index, and network influence score"',
  'agent-card': 'Describe the agent card... e.g., "Create a Medical Affairs Specialist card showing therapeutic area badges and engagement metrics"',
  'panel-ui': 'Describe the panel interface... e.g., "Create a Risk Assessment Panel with a 5x5 matrix, expert cards, and consensus indicator"',
  'visualization': 'Describe the visualization... e.g., "Create a KOL Network Graph showing expert connections with influence score sizing"',
  'dashboard': 'Describe the dashboard layout... e.g., "Create a KOL Engagement Dashboard with network graph, timeline, and action items"',
  'form': 'Describe the form... e.g., "Create a KOL Profile Form with personal info, expertise areas, and engagement preferences"',
  'table': 'Describe the data table... e.g., "Create a KOL Directory Table with influence metrics, filtering, and row expansion"',
};

/**
 * VitalV0PromptInput - Natural Language Prompt Input
 * 
 * Specialized textarea for entering v0 generation prompts with:
 * - Context-aware placeholder text based on generation type
 * - Example prompt suggestions as clickable badges
 * - Submit on Enter (with Shift+Enter for new line)
 * - Loading state with disabled interaction
 * 
 * @example
 * ```tsx
 * <VitalV0PromptInput
 *   value={prompt}
 *   onChange={setPrompt}
 *   onSubmit={handleGenerate}
 *   generationType="workflow-node"
 *   isGenerating={isLoading}
 *   examples={[
 *     { label: 'KOL Scorer', prompt: 'Create a KOL...', category: 'Medical Affairs' }
 *   ]}
 * />
 * ```
 * 
 * @package @vital/ai-ui/v0
 */
export const VitalV0PromptInput = memo(function VitalV0PromptInput({
  value,
  onChange,
  onSubmit,
  generationType,
  isGenerating = false,
  examples = [],
  className,
}: VitalV0PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isGenerating) {
        onSubmit();
      }
    }
  }, [value, isGenerating, onSubmit]);

  const handleExampleClick = useCallback((prompt: string) => {
    onChange(prompt);
    // Focus textarea after selecting example
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [onChange]);

  const placeholder = TYPE_PLACEHOLDERS[generationType] || 'Describe what you want to generate...';

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label 
          htmlFor="v0-prompt" 
          className="text-sm font-medium flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4 text-purple-600" />
          Describe your component
        </label>
        {value.trim() && (
          <span className="text-xs text-muted-foreground">
            Press Enter to generate
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id="v0-prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating}
          rows={4}
          className={cn(
            'resize-none pr-12 transition-all',
            'focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
            isGenerating && 'opacity-70'
          )}
        />
        
        {/* Submit Button (inside textarea) */}
        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          disabled={!value.trim() || isGenerating}
          className={cn(
            'absolute right-2 bottom-2 h-8 w-8',
            'bg-gradient-to-r from-violet-600 to-purple-600',
            'hover:from-violet-700 hover:to-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Example Prompts */}
      {examples.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>Examples (click to use):</span>
          </div>
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2 pb-1">
              {examples.map((example, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className={cn(
                    'cursor-pointer text-xs py-1 px-2 max-w-[200px]',
                    'hover:bg-secondary/80 transition-colors',
                    'truncate'
                  )}
                  onClick={() => handleExampleClick(example.prompt)}
                  title={example.prompt}
                >
                  <span className="truncate">{example.label}</span>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Generation Status */}
      {isGenerating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <span>Generating your component with v0...</span>
        </div>
      )}
    </div>
  );
});

export default VitalV0PromptInput;






