'use client';

/**
 * VitalMissionGoalInput - Research Goal Input Component
 *
 * Entry point for Mode 3/4 autonomous missions.
 * Provides a rich input experience for users to describe their research goal.
 *
 * Features:
 * - Auto-resizing textarea with placeholder animation
 * - Example prompts to inspire users (industry-specific)
 * - Keyboard shortcuts (Cmd/Ctrl + Enter to submit)
 * - Loading state during AI analysis
 * - Mode-specific styling (purple for Mode 3, amber for Mode 4)
 *
 * Used by: Mode 3 (Expert Control), Mode 4 (AI Wizard)
 *
 * @example
 * ```tsx
 * <VitalMissionGoalInput
 *   mode="mode3"
 *   onSubmit={(goal) => handleGoalSubmit(goal)}
 *   isAnalyzing={isLoading}
 *   industry="pharmaceutical"
 * />
 * ```
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Send,
  Sparkles,
  Lightbulb,
  ChevronRight,
  Loader2,
  Zap,
  BookOpen,
  BarChart3,
  FileSearch2,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// =============================================================================
// TYPES
// =============================================================================

export type MissionMode = 'mode3' | 'mode4';
export type Industry = 'pharmaceutical' | 'healthcare' | 'biotech' | 'medtech' | 'general';

export interface ExamplePrompt {
  /** Category label (e.g., "Research", "Strategy") */
  category: string;
  /** The example prompt text */
  prompt: string;
  /** Emoji icon for visual interest */
  icon: string;
  /** Optional industry filter */
  industries?: Industry[];
}

export interface VitalMissionGoalInputProps {
  /** Called when user submits their goal */
  onSubmit: (goal: string) => void;
  /** Called to enhance the goal with AI (optional) */
  onEnhance?: (goal: string) => Promise<string>;
  /** Whether the AI is processing the goal */
  isAnalyzing?: boolean;
  /** Mode 3 (expert) or Mode 4 (wizard) - affects UI messaging and colors */
  mode: MissionMode;
  /** Industry context for example prompts filtering */
  industry?: Industry;
  /** Placeholder text (defaults based on mode) */
  placeholder?: string;
  /** Initial value for the goal input */
  initialValue?: string;
  /** Custom example prompts (overrides defaults) */
  examplePrompts?: ExamplePrompt[];
  /** Show/hide example prompts section */
  showExamples?: boolean;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// DEFAULT EXAMPLE PROMPTS (Industry-specific)
// =============================================================================

const DEFAULT_EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    category: 'Research',
    prompt: 'Conduct a comprehensive literature review on CAR-T therapy efficacy in pediatric ALL patients',
    icon: '📚',
    industries: ['pharmaceutical', 'biotech', 'healthcare'],
  },
  {
    category: 'Strategy',
    prompt: 'Analyze market access pathways for orphan drug designation in the EU',
    icon: '🎯',
    industries: ['pharmaceutical', 'biotech'],
  },
  {
    category: 'Evaluation',
    prompt: 'Compare HEOR methodologies for demonstrating value in rare disease treatments',
    icon: '📊',
    industries: ['pharmaceutical', 'healthcare'],
  },
  {
    category: 'Investigation',
    prompt: 'Investigate recent FDA warning letters related to GMP compliance in biologics manufacturing',
    icon: '🔍',
    industries: ['pharmaceutical', 'biotech'],
  },
  {
    category: 'Research',
    prompt: 'Review clinical evidence for AI-assisted diagnostic tools in oncology imaging',
    icon: '📚',
    industries: ['medtech', 'healthcare'],
  },
  {
    category: 'Strategy',
    prompt: 'Develop a competitive landscape analysis for digital therapeutics in mental health',
    icon: '🎯',
    industries: ['healthcare', 'medtech'],
  },
  {
    category: 'Evaluation',
    prompt: 'Assess real-world evidence requirements for medical device 510(k) submissions',
    icon: '📊',
    industries: ['medtech'],
  },
  {
    category: 'Investigation',
    prompt: 'Analyze patent landscapes for CRISPR gene editing applications in rare diseases',
    icon: '🔍',
    industries: ['biotech', 'pharmaceutical'],
  },
];

// =============================================================================
// MODE CONFIGURATION
// =============================================================================

const MODE_CONFIG: Record<MissionMode, {
  title: string;
  description: string;
  placeholder: string;
  icon: typeof Sparkles;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  borderColor: string;
  hoverBorderColor: string;
  badgeClass: string;
  badgeLabel: string;
}> = {
  mode3: {
    title: 'Deep Research Mission',
    description: 'Configure your autonomous research mission with full control over every parameter.',
    placeholder: 'Describe your research goal in detail...',
    icon: Sparkles,
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-700',
    shadowColor: 'shadow-purple-500/25',
    borderColor: 'border-purple-400',
    hoverBorderColor: 'hover:border-purple-300',
    badgeClass: 'border-purple-200 text-purple-700 bg-purple-50',
    badgeLabel: 'Mode 3: Expert Control',
  },
  mode4: {
    title: 'AI-Guided Research',
    description: "Tell me what you need, and I'll ask clarifying questions to set up the perfect mission.",
    placeholder: "What would you like to accomplish? I'll help guide you through the process...",
    icon: Zap,
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-700',
    shadowColor: 'shadow-amber-500/25',
    borderColor: 'border-amber-400',
    hoverBorderColor: 'hover:border-amber-300',
    badgeClass: 'border-amber-200 text-amber-700 bg-amber-50',
    badgeLabel: 'Mode 4: AI Wizard',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalMissionGoalInput({
  onSubmit,
  onEnhance,
  isAnalyzing = false,
  mode,
  industry = 'pharmaceutical',
  placeholder,
  initialValue = '',
  examplePrompts,
  showExamples = true,
  title,
  description,
  className,
}: VitalMissionGoalInputProps) {
  const [goal, setGoal] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = MODE_CONFIG[mode];
  const ModeIcon = config.icon;

  // Filter example prompts by industry
  const filteredPrompts = useMemo(() => {
    const prompts = examplePrompts || DEFAULT_EXAMPLE_PROMPTS;
    return prompts.filter((p) => !p.industries || p.industries.includes(industry)).slice(0, 4);
  }, [examplePrompts, industry]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [goal]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!goal.trim() || isAnalyzing) return;
    onSubmit(goal.trim());
  }, [goal, isAnalyzing, onSubmit]);

  // Handle AI enhancement
  const handleEnhance = useCallback(async () => {
    if (!onEnhance || !goal.trim() || isEnhancing || isAnalyzing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await onEnhance(goal);
      setGoal(enhanced);
    } finally {
      setIsEnhancing(false);
    }
  }, [onEnhance, goal, isEnhancing, isAnalyzing]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Handle example prompt click
  const handleExampleClick = useCallback((examplePrompt: string) => {
    setGoal(examplePrompt);
    textareaRef.current?.focus();
  }, []);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg mb-4',
            config.gradientFrom,
            config.gradientTo,
            config.shadowColor
          )}
        >
          <ModeIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {title || config.title}
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          {description || config.description}
        </p>
      </div>

      {/* Main Input Area */}
      <div className="relative max-w-2xl mx-auto w-full">
        <div
          className={cn(
            'relative rounded-2xl border-2 bg-white transition-all duration-200',
            isFocused
              ? `${config.borderColor} shadow-lg ${config.shadowColor.replace('shadow-', 'shadow-').replace('/25', '/10')}`
              : `border-slate-200 ${config.hoverBorderColor}`,
            isAnalyzing && 'opacity-80 pointer-events-none'
          )}
        >
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || config.placeholder}
            className={cn(
              'min-h-[120px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              'text-lg placeholder:text-slate-400 p-5 pr-20',
              'rounded-2xl'
            )}
            disabled={isAnalyzing}
          />

          {/* Action Buttons */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {/* AI Enhance Button */}
            {onEnhance && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhance}
                disabled={!goal.trim() || isAnalyzing || isEnhancing}
                className={cn(
                  'rounded-xl h-auto py-2 px-3 transition-all border-2',
                  mode === 'mode3'
                    ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                title="Enhance your research goal with AI"
              >
                {isEnhancing ? (
                  <Loader2 className={cn('w-4 h-4 animate-spin', mode === 'mode3' ? 'text-purple-600' : 'text-amber-600')} />
                ) : (
                  <Sparkles className={cn('w-4 h-4', mode === 'mode3' ? 'text-purple-600' : 'text-amber-600')} />
                )}
              </Button>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!goal.trim() || isAnalyzing || isEnhancing}
              className={cn(
                'rounded-xl px-4 py-2 h-auto transition-all',
                `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`,
                `hover:brightness-110`,
                `shadow-lg ${config.shadowColor}`,
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Continue
                </>
              )}
            </Button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="absolute left-5 bottom-4 text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 ml-0.5">↵</kbd>
            {' '}to submit
          </div>
        </div>

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2 text-purple-600">
            <div className="flex gap-1">
              <span
                className={cn('w-2 h-2 rounded-full animate-bounce', mode === 'mode3' ? 'bg-purple-600' : 'bg-amber-600')}
                style={{ animationDelay: '0ms' }}
              />
              <span
                className={cn('w-2 h-2 rounded-full animate-bounce', mode === 'mode3' ? 'bg-purple-600' : 'bg-amber-600')}
                style={{ animationDelay: '150ms' }}
              />
              <span
                className={cn('w-2 h-2 rounded-full animate-bounce', mode === 'mode3' ? 'bg-purple-600' : 'bg-amber-600')}
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className={cn('text-sm font-medium', mode === 'mode3' ? 'text-purple-600' : 'text-amber-600')}>
              Analyzing your research goal...
            </span>
          </div>
        )}
      </div>

      {/* Example Prompts */}
      {showExamples && filteredPrompts.length > 0 && (
        <div className="mt-12 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 text-slate-600">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Example research goals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPrompts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example.prompt)}
                className={cn(
                  'p-4 text-left rounded-xl border-2 border-slate-100 bg-white',
                  mode === 'mode3'
                    ? 'hover:border-purple-200 hover:bg-purple-50/50'
                    : 'hover:border-amber-200 hover:bg-amber-50/50',
                  'transition-all focus:outline-none focus:ring-2',
                  mode === 'mode3' ? 'focus:ring-purple-500' : 'focus:ring-amber-500',
                  'focus:ring-offset-2 group'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{example.icon}</span>
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="secondary"
                      className="mb-2 bg-slate-100 text-slate-600 text-xs"
                    >
                      {example.category}
                    </Badge>
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {example.prompt}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 text-slate-400 transition-colors flex-shrink-0 mt-1',
                      mode === 'mode3' ? 'group-hover:text-purple-600' : 'group-hover:text-amber-600'
                    )}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Badge */}
      <div className="flex justify-center mt-8">
        <Badge
          variant="outline"
          className={cn('px-3 py-1 text-xs', config.badgeClass)}
        >
          {config.badgeLabel}
        </Badge>
      </div>
    </div>
  );
}

export default VitalMissionGoalInput;
