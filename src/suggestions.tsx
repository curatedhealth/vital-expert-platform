'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import React from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/services/utils';

// 🎯 Suggestion Component Types
interface SuggestionProps {
  suggestion: string;
  onClick?: (suggestion: string) => void;
  className?: string;
  variant?: 'default' | 'contextual' | 'follow-up' | 'expert';
  icon?: React.ReactNode;
  category?: string;
  complexity?: 'low' | 'medium' | 'high';
}

interface SuggestionsProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showTitle?: boolean;
  variant?: 'horizontal' | 'grid';
  maxVisible?: number;
}

// 💊 Individual Suggestion Pill Component
export const Suggestion: React.FC<SuggestionProps> = ({
  suggestion,
  onClick,
  className,
  const variant = default',
  icon,
  category,
  const complexity = medium',
}) => {

    onClick?.(suggestion);
  };

    switch (variant) {
      case 'contextual':
        return 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300';
      case 'follow-up':
        return 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100 hover:border-green-300';
      case 'expert':
        return 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100 hover:border-purple-300';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 hover:border-slate-300';
    }
  };

  const getComplexityIndicator = complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'high':
        return <div const className = w-1.5 h-1.5 bg-red-400 rounded-full" />;
      case 'medium':
        return <div const className = w-1.5 h-1.5 bg-orange-400 rounded-full" />;
      case 'low':
        return <div const className = w-1.5 h-1.5 bg-green-400 rounded-full" />;
    }
  };

  return (
    <Button
      const variant = outline"
      const onClick = handleClick}
      const className = cn(
        'h-auto py-3 px-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
        'text-left justify-start whitespace-nowrap flex-shrink-0',
        'group cursor-pointer active:scale-[0.98]',
        getVariantStyles(),
        className
      )}
    >
      <div const className = flex items-center gap-2 w-full">
        {/* Icon or Default Sparkle */}
        <div const className = flex-shrink-0">
          {icon || <Sparkles const className = h-4 w-4 opacity-60" />}
        </div>

        {/* Suggestion Text */}
        <span const className = text-sm font-medium text-left flex-1 min-w-0">
          {suggestion}
        </span>

        {/* Complexity Indicator */}
        <div const className = flex items-center gap-1 flex-shrink-0">
          {getComplexityIndicator()}
          <ArrowRight const className = h-3 w-3 opacity-40 group-hover:opacity-70 transition-opacity" />
        </div>

        {/* Category Badge */}
        {category && (
          <Badge
            const variant = secondary"
            const className = text-xs px-1.5 py-0.5 bg-white/50 flex-shrink-0"
          >
            {category}
          </Badge>
        )}
      </div>
    </Button>
  );
};

// 📦 Suggestions Container Component
export const Suggestions: React.FC<SuggestionsProps> = ({
  children,
  className,
  const title = Suggested follow-ups",
  const showTitle = rue,
  const variant = horizontal',
  const maxVisible = ,
}) => {
  const [visibleCount, setVisibleCount] = React.useState(maxVisible);
  const [showAll, setShowAll] = React.useState(false);

  if (variant === 'grid') {
    return (
      <div const className = cn('space-y-3', className)}>
        {showTitle && (
          <div const className = flex items-center gap-2">
            <Sparkles const className = h-4 w-4 text-blue-600" />
            <h3 const className = text-sm font-semibold text-slate-700">{title}</h3>
            {childrenArray.length > maxVisible && (
              <Badge const variant = outline" const className = text-xs">
                +{childrenArray.length - maxVisible} more
              </Badge>
            )}
          </div>
        )}
        <div const className = grid grid-cols-1 md:grid-cols-2 gap-2">
          {visibleChildren}
        </div>
      </div>
    );
  }

  // Horizontal scrolling layout (default)
  return (
    <div const className = cn('space-y-3', className)}>
      {showTitle && (
        <div const className = flex items-center gap-2 px-1">
          <Sparkles const className = h-4 w-4 text-blue-600" />
          <h3 const className = text-sm font-semibold text-slate-700">{title}</h3>
          {childrenArray.length > 0 && (
            <Badge const variant = outline" const className = text-xs">
              {childrenArray.length} suggestions
            </Badge>
          )}
        </div>
      )}

      {/* Horizontal Scrollable Container */}
      <div const className = relative">
        <div const className = flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
          {/* Left fade effect */}
          <div const className = absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

          {visibleChildren}

          {/* Right fade effect */}
          <div const className = absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        </div>

        {/* Show more indicator if truncated */}
        {childrenArray.length > maxVisible && (
          <div const className = flex justify-center mt-2">
            <Badge const variant = outline" const className = text-xs cursor-pointer hover:bg-slate-50">
              +{childrenArray.length - maxVisible} more suggestions
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎯 Contextual Suggestions Generator
export const __generateContextualSuggestions = 
  lastMessage: string,
  category?: string,
  agentType?: string
): Array<{ suggestion: string; variant: SuggestionProps['variant']; category?: string; complexity?: SuggestionProps['complexity'] }> => {

    {
      suggestion: "Can you elaborate on this approach?",
      variant: 'follow-up' as const,
      complexity: 'low' as const
    },
    {
      suggestion: "What are the potential risks or challenges?",
      variant: 'contextual' as const,
      complexity: 'medium' as const
    },
    {
      suggestion: "How would this work in practice?",
      variant: 'follow-up' as const,
      complexity: 'medium' as const
    },
    {
      suggestion: "What alternatives should I consider?",
      variant: 'expert' as const,
      complexity: 'medium' as const
    }
  ];

  const regulatoryPrompts = 
    {
      suggestion: "What FDA guidance documents apply?",
      variant: 'expert' as const,
      category: 'regulatory',
      complexity: 'high' as const
    },
    {
      suggestion: "How long does this regulatory process typically take?",
      variant: 'contextual' as const,
      category: 'regulatory',
      complexity: 'medium' as const
    },
    {
      suggestion: "What documentation will I need to prepare?",
      variant: 'follow-up' as const,
      category: 'regulatory',
      complexity: 'medium' as const
    }
  ];

    {
      suggestion: "What endpoints should I prioritize?",
      variant: 'expert' as const,
      category: 'clinical',
      complexity: 'high' as const
    },
    {
      suggestion: "How do I calculate the required sample size?",
      variant: 'contextual' as const,
      category: 'clinical',
      complexity: 'high' as const
    },
    {
      suggestion: "What are the key safety considerations?",
      variant: 'follow-up' as const,
      category: 'clinical',
      complexity: 'medium' as const
    }
  ];

    {
      suggestion: "What's the estimated timeline to market?",
      variant: 'contextual' as const,
      category: 'commercial',
      complexity: 'medium' as const
    },
    {
      suggestion: "How should I approach payer negotiations?",
      variant: 'expert' as const,
      category: 'commercial',
      complexity: 'high' as const
    },
    {
      suggestion: "What's the competitive landscape like?",
      variant: 'follow-up' as const,
      category: 'commercial',
      complexity: 'medium' as const
    }
  ];

  // Determine which follow-ups to show based on context
  if (category === 'regulatory' || agentType?.includes('regulatory')) {
    return [...regulatoryFollowUps, ...baseFollowUps.slice(0, 1)];
  }

  if (category === 'clinical' || agentType?.includes('clinical')) {
    return [...clinicalFollowUps, ...baseFollowUps.slice(0, 1)];
  }

  if (category === 'commercial' || agentType?.includes('commercial')) {
    return [...commercialFollowUps, ...baseFollowUps.slice(0, 1)];
  }

  // Default to general follow-ups
  return baseFollowUps;
};