'use client';

/**
 * VITAL Platform - PromptInput Component (Mode 3/4 Redesign)
 *
 * Shared prompt input component for both Mode 3 (Expert Mode) and Mode 4 (AI Wizard).
 * This is the entry point where users describe their research goal.
 *
 * Features:
 * - Free-form text input with auto-resize
 * - Example prompts to inspire users
 * - Loading state during AI analysis
 * - Keyboard shortcuts (Cmd/Ctrl + Enter to submit)
 *
 * Design System: VITAL Brand v6.0 (Purple theme for autonomous modes)
 * Phase 3 Redesign - December 13, 2025
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Sparkles,
  Lightbulb,
  ChevronRight,
  Loader2,
  Zap,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface PromptInputProps {
  /** Called when user submits their prompt */
  onSubmit: (prompt: string) => void;
  /** Whether the AI is processing the prompt */
  isAnalyzing?: boolean;
  /** Mode 3 (expert) or Mode 4 (wizard) - affects UI messaging */
  mode: 'mode3' | 'mode4';
  /** Placeholder text */
  placeholder?: string;
  /** Initial value for the prompt */
  initialValue?: string;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// EXAMPLE PROMPTS
// =============================================================================

const EXAMPLE_PROMPTS = [
  {
    category: 'Research',
    prompt: 'Conduct a comprehensive literature review on CAR-T therapy efficacy in pediatric ALL patients',
    icon: '📚',
  },
  {
    category: 'Strategy',
    prompt: 'Analyze market access pathways for orphan drug designation in the EU',
    icon: '🎯',
  },
  {
    category: 'Evaluation',
    prompt: 'Compare HEOR methodologies for demonstrating value in rare disease treatments',
    icon: '📊',
  },
  {
    category: 'Investigation',
    prompt: 'Investigate recent FDA warning letters related to GMP compliance in biologics manufacturing',
    icon: '🔍',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function PromptInput({
  onSubmit,
  isAnalyzing = false,
  mode,
  placeholder,
  initialValue = '',
  className,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || isAnalyzing) return;
    onSubmit(prompt.trim());
  }, [prompt, isAnalyzing, onSubmit]);

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
    setPrompt(examplePrompt);
    textareaRef.current?.focus();
  }, []);

  const defaultPlaceholder = mode === 'mode3'
    ? 'Describe your research goal in detail...'
    : 'What would you like to accomplish? I\'ll help guide you through the process...';

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/25 mb-4"
        >
          {mode === 'mode3' ? (
            <Sparkles className="w-8 h-8 text-white" />
          ) : (
            <Zap className="w-8 h-8 text-white" />
          )}
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {mode === 'mode3' ? 'Deep Research Mission' : 'AI-Guided Research'}
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          {mode === 'mode3'
            ? 'Configure your autonomous research mission with full control over every parameter.'
            : 'Tell me what you need, and I\'ll ask clarifying questions to set up the perfect mission.'}
        </p>
      </div>

      {/* Main Input Area */}
      <div className="relative max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={cn(
            'relative rounded-2xl border-2 bg-white transition-all duration-200',
            isFocused
              ? 'border-purple-400 shadow-lg shadow-purple-500/10'
              : 'border-slate-200 hover:border-purple-300',
            isAnalyzing && 'opacity-80 pointer-events-none'
          )}
        >
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            className={cn(
              'min-h-[120px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              'text-lg placeholder:text-slate-400 p-5 pr-20',
              'rounded-2xl'
            )}
            disabled={isAnalyzing}
          />

          {/* Submit Button */}
          <div className="absolute right-3 bottom-3">
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isAnalyzing}
              className={cn(
                'rounded-xl px-4 py-2 h-auto transition-all',
                'bg-gradient-to-r from-purple-600 to-purple-700',
                'hover:from-purple-700 hover:to-purple-800',
                'shadow-lg shadow-purple-500/25',
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
        </motion.div>

        {/* Analyzing State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2 text-purple-600"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-medium">Analyzing your research goal...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example Prompts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-12 max-w-3xl mx-auto w-full"
      >
        <div className="flex items-center gap-2 mb-4 text-slate-600">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Example research goals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map((example, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleExampleClick(example.prompt)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'p-4 text-left rounded-xl border-2 border-slate-100 bg-white',
                'hover:border-purple-200 hover:bg-purple-50/50 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                'group'
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
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mode Badge */}
      <div className="flex justify-center mt-8">
        <Badge
          variant="outline"
          className={cn(
            'px-3 py-1 text-xs',
            mode === 'mode3'
              ? 'border-purple-200 text-purple-700 bg-purple-50'
              : 'border-amber-200 text-amber-700 bg-amber-50'
          )}
        >
          {mode === 'mode3' ? 'Mode 3: Expert Control' : 'Mode 4: AI Wizard'}
        </Badge>
      </div>
    </div>
  );
}

export default PromptInput;
