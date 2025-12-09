'use client';

/**
 * VitalSuggestion - Suggestion Chips Component Suite
 * 
 * Displays a horizontal row of clickable suggestions for user interaction.
 * Perfect for showing quick actions or follow-up questions.
 * 
 * Features:
 * - Horizontal row of clickable suggestion buttons
 * - Customizable styling with variant and size options
 * - Flexible layout that wraps suggestions on smaller screens
 * - onClick callback that emits the selected suggestion string
 * - Support for both individual suggestions and suggestion lists
 * - Clean, modern styling with hover effects
 * - Responsive design with mobile-friendly touch targets
 * - TypeScript support with proper type definitions
 * 
 * @example
 * ```tsx
 * <VitalSuggestions>
 *   <VitalSuggestion
 *     suggestion="What is the weather?"
 *     onClick={(s) => sendMessage(s)}
 *   />
 *   <VitalSuggestion
 *     suggestion="Tell me a joke"
 *     onClick={(s) => sendMessage(s)}
 *   />
 * </VitalSuggestions>
 * ```
 */

import { cn } from '../lib/utils';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalSuggestionsProps = ComponentProps<'div'>;

export type VitalSuggestionProps = Omit<ComponentProps<'button'>, 'onClick'> & {
  /** The suggestion string to display and emit on click */
  suggestion: string;
  /** Callback fired when the suggestion is clicked */
  onClick?: (suggestion: string) => void;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg';
};

// ============================================================================
// Components
// ============================================================================

/**
 * Container for suggestion chips with horizontal scroll
 */
export const VitalSuggestions = forwardRef<HTMLDivElement, VitalSuggestionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('w-full overflow-x-auto whitespace-nowrap', className)}
      {...props}
    >
      <div className="flex w-max flex-nowrap items-center gap-2">
        {children}
      </div>
    </div>
  )
);

/**
 * Individual suggestion chip button
 */
export const VitalSuggestion = forwardRef<HTMLButtonElement, VitalSuggestionProps>(
  (
    {
      suggestion,
      onClick,
      className,
      variant = 'outline',
      size = 'sm',
      children,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      onClick?.(suggestion);
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizeClasses = {
      default: 'h-10 px-4',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center',
          'cursor-pointer rounded-full font-medium',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children || suggestion}
      </button>
    );
  }
);

// ============================================================================
// Display Names
// ============================================================================

VitalSuggestions.displayName = 'VitalSuggestions';
VitalSuggestion.displayName = 'VitalSuggestion';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const Suggestions = VitalSuggestions;
export const Suggestion = VitalSuggestion;

export default VitalSuggestions;
