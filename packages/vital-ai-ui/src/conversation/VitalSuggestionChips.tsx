'use client';

import { cn } from '../../lib/utils';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';

interface Suggestion {
  id: string;
  text: string;
  category?: string;
  icon?: React.ReactNode;
}

interface VitalSuggestionChipsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  onRefresh?: () => void;
  title?: string;
  isLoading?: boolean;
  maxVisible?: number;
  variant?: 'default' | 'compact' | 'cards';
  className?: string;
}

/**
 * VitalSuggestionChips - Next step suggestion component
 * 
 * Displays contextual suggestions for follow-up questions
 * or actions based on the conversation context.
 */
export function VitalSuggestionChips({
  suggestions,
  onSelect,
  onRefresh,
  title = "Suggested follow-ups",
  isLoading = false,
  maxVisible = 4,
  variant = 'default',
  className
}: VitalSuggestionChipsProps) {
  const visibleSuggestions = suggestions.slice(0, maxVisible);
  const hasMore = suggestions.length > maxVisible;
  
  if (suggestions.length === 0 && !isLoading) {
    return null;
  }
  
  if (variant === 'cards') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            {title}
          </h4>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 text-xs"
            >
              <RefreshCw className={cn(
                "h-3 w-3 mr-1",
                isLoading && "animate-spin"
              )} />
              Refresh
            </Button>
          )}
        </div>
        
        <div className="grid gap-2 sm:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-muted animate-pulse"
              />
            ))
          ) : (
            visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSelect(suggestion)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-left",
                  "bg-background hover:bg-muted/50 transition-colors",
                  "group"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {suggestion.icon || (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {suggestion.category && (
                    <span className="text-xs text-muted-foreground">
                      {suggestion.category}
                    </span>
                  )}
                  <p className="text-sm font-medium line-clamp-2">
                    {suggestion.text}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 rounded-full bg-muted animate-pulse"
            />
          ))
        ) : (
          visibleSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onSelect(suggestion)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs",
                "bg-muted hover:bg-muted/80 transition-colors"
              )}
            >
              {suggestion.text}
            </button>
          ))
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {title}
        </h4>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-6 text-xs"
          >
            <RefreshCw className={cn(
              "h-3 w-3",
              isLoading && "animate-spin"
            )} />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-32 rounded-lg bg-muted animate-pulse"
            />
          ))
        ) : (
          <>
            {visibleSuggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => onSelect(suggestion)}
                className="h-auto py-1.5 px-3 text-sm font-normal"
              >
                {suggestion.icon && (
                  <span className="mr-1.5">{suggestion.icon}</span>
                )}
                {suggestion.text}
                <ArrowRight className="h-3 w-3 ml-1.5 opacity-50" />
              </Button>
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1.5 px-3 text-sm text-muted-foreground"
              >
                +{suggestions.length - maxVisible} more
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VitalSuggestionChips;
