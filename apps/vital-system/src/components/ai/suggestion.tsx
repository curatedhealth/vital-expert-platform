'use client';

import * as React from 'react';

import { Button } from '@vital/ui';
import { cn } from '@/lib/utils';

export interface SuggestionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  layout?: 'wrap' | 'scroll';
}

export function Suggestions({
  className,
  children,
  layout = 'wrap',
  ...props
}: SuggestionsProps) {
  const baseClass = React.useMemo(() => {
    if (layout === 'scroll') {
      return cn(
        'flex gap-2 overflow-x-auto whitespace-nowrap py-1',
        '[-ms-overflow-style:none] [scrollbar-width:none]',
        '[&::-webkit-scrollbar]:hidden'
      );
    }

    // wrap layout
    return 'flex flex-wrap gap-2 py-1';
  }, [layout]);

  return (
    <div
      className={cn(baseClass, 'max-w-full', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SuggestionProps
  extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  suggestion: string;
  onClick?: (suggestion: string) => void;
}

export function Suggestion({
  suggestion,
  onClick,
  className,
  children,
  variant = 'outline',
  size = 'sm',
  ...props
}: SuggestionProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        'rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-100 whitespace-normal',
        'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800',
        className
      )}
      onClick={() => onClick?.(suggestion)}
      {...props}
    >
      {children ?? suggestion}
    </Button>
  );
}
