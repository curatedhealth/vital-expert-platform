'use client';

/**
 * VITAL Platform - VitalSuggestionChips Component
 *
 * Displays follow-up question suggestions and quick action chips.
 * Appears after AI responses to guide the conversation.
 *
 * Features:
 * - Animated chip appearance
 * - Category-based grouping
 * - Keyboard navigation (arrow keys)
 * - Loading state during generation
 * - Custom suggestions support
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Repeat,
  ChevronRight,
  Loader2,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface Suggestion {
  id: string;
  text: string;
  category?: 'followup' | 'clarification' | 'deep-dive' | 'compare' | 'example' | 'warning' | 'action';
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface VitalSuggestionChipsProps {
  /** Suggestions to display */
  suggestions: Suggestion[];
  /** Called when a suggestion is selected */
  onSelect: (suggestion: Suggestion) => void;
  /** Whether suggestions are being generated */
  isLoading?: boolean;
  /** Maximum suggestions to show before "show more" */
  maxVisible?: number;
  /** Show as horizontal scroll or wrap */
  layout?: 'scroll' | 'wrap';
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CATEGORY CONFIG
// =============================================================================

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  followup: { icon: ArrowRight, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  clarification: { icon: HelpCircle, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'deep-dive': { icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  compare: { icon: Repeat, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  example: { icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  warning: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  action: { icon: TrendingUp, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
  default: { icon: Sparkles, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalSuggestionChips({
  suggestions,
  onSelect,
  isLoading = false,
  maxVisible = 4,
  layout = 'wrap',
  className,
}: VitalSuggestionChipsProps) {
  const [showAll, setShowAll] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, maxVisible);
  const hasMore = suggestions.length > maxVisible;

  // =========================================================================
  // KEYBOARD NAVIGATION
  // =========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev < visibleSuggestions.length - 1 ? prev + 1 : 0;
            chipRefs.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev > 0 ? prev - 1 : visibleSuggestions.length - 1;
            chipRefs.current[next]?.focus();
            return next;
          });
          break;
        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && focusedIndex < visibleSuggestions.length) {
            e.preventDefault();
            onSelect(visibleSuggestions[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleSuggestions, focusedIndex, onSelect]);

  const handleChipClick = useCallback((suggestion: Suggestion, index: number) => {
    setFocusedIndex(index);
    onSelect(suggestion);
  }, [onSelect]);

  const handleShowMore = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  // =========================================================================
  // LOADING STATE
  // =========================================================================

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 py-2', className)}>
        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        <span className="text-sm text-slate-500">Generating suggestions...</span>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="h-8 w-24 rounded-full bg-slate-100"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div
      ref={containerRef}
      className={cn(
        layout === 'scroll'
          ? 'flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin'
          : 'flex flex-wrap gap-2',
        className
      )}
      role="group"
      aria-label="Suggested follow-up questions"
    >
      {/* Header label */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 py-1">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Suggested:</span>
      </div>

      {/* Suggestion chips */}
      <AnimatePresence mode="popLayout">
        {visibleSuggestions.map((suggestion, index) => (
          <SuggestionChip
            key={suggestion.id}
            ref={el => { chipRefs.current[index] = el; }}
            suggestion={suggestion}
            index={index}
            isFocused={focusedIndex === index}
            onClick={() => handleChipClick(suggestion, index)}
            onFocus={() => setFocusedIndex(index)}
          />
        ))}
      </AnimatePresence>

      {/* Show more/less button */}
      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleShowMore}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs',
            'border border-dashed border-slate-300',
            'text-slate-500 hover:text-slate-700 hover:border-slate-400',
            'transition-colors shrink-0'
          )}
        >
          {showAll ? (
            <>Show less</>
          ) : (
            <>
              +{suggestions.length - maxVisible} more
              <ChevronRight className="h-3 w-3" />
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SuggestionChipProps {
  suggestion: Suggestion;
  index: number;
  isFocused: boolean;
  onClick: () => void;
  onFocus: () => void;
}

const SuggestionChip = motion.forwardRef<HTMLButtonElement, SuggestionChipProps>(
  function SuggestionChip({ suggestion, index, isFocused, onClick, onFocus }, ref) {
    const config = CATEGORY_CONFIG[suggestion.category || 'default'] || CATEGORY_CONFIG.default;
    const Icon = config.icon;

    return (
      <motion.button
        ref={ref}
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -5 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        onFocus={onFocus}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
          'border transition-all cursor-pointer',
          config.bgColor,
          config.borderColor,
          'hover:shadow-sm',
          isFocused && 'ring-2 ring-blue-400 ring-offset-1'
        )}
      >
        <Icon className={cn('h-3.5 w-3.5 shrink-0', config.color)} />
        <span className="text-slate-700 line-clamp-1">{suggestion.text}</span>
      </motion.button>
    );
  }
);

// =============================================================================
// PRESET SUGGESTIONS HELPER
// =============================================================================

export function generateDefaultSuggestions(context?: {
  topic?: string;
  previousQuestions?: string[];
}): Suggestion[] {
  const baseSuggestions: Suggestion[] = [
    {
      id: 'explain-more',
      text: 'Can you explain this in more detail?',
      category: 'clarification',
    },
    {
      id: 'example',
      text: 'Can you give me an example?',
      category: 'example',
    },
    {
      id: 'compare',
      text: 'How does this compare to alternatives?',
      category: 'compare',
    },
    {
      id: 'next-steps',
      text: 'What are the next steps?',
      category: 'action',
    },
  ];

  if (context?.topic) {
    baseSuggestions.unshift({
      id: 'deep-dive',
      text: `Tell me more about ${context.topic}`,
      category: 'deep-dive',
    });
  }

  return baseSuggestions;
}

export default VitalSuggestionChips;
