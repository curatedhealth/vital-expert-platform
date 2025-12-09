'use client';

/**
 * VitalResponse - AI Response Wrapper with Streamdown
 * 
 * A memoized component for rendering AI responses using Streamdown
 * for jitter-free markdown streaming. Streamdown is a "forgiving parser"
 * that auto-closes tags before the stream finishes, eliminating flicker.
 * 
 * Features:
 * - Streamdown integration for smooth, jitter-free streaming
 * - Native Shiki code highlighting
 * - GitHub Flavored Markdown support
 * - Memoized for optimal performance
 * - Proper typography styling
 * - Custom comparison function for efficient re-renders
 * 
 * @see https://streamdown.ai/
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <VitalResponse>{message.content}</VitalResponse>
 * 
 * // With streaming indicator
 * <VitalResponse isStreaming>{partialContent}</VitalResponse>
 * 
 * // Custom styling
 * <VitalResponse className="text-sm">{content}</VitalResponse>
 * ```
 */

import { cn } from '../lib/utils';
import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for VitalResponse component
 * Extends Streamdown props for full compatibility
 */
export type VitalResponseProps = ComponentProps<typeof Streamdown> & {
  /** Whether content is actively streaming (shows cursor) */
  isStreaming?: boolean;
};

// ============================================================================
// Component
// ============================================================================

/**
 * AI Response wrapper with Streamdown integration
 * 
 * Uses Streamdown for jitter-free markdown rendering during streaming.
 * The component is memoized with a custom comparison function that
 * only re-renders when the children content actually changes.
 */
const ResponseComponent = ({
  className,
  isStreaming,
  children,
  ...props
}: VitalResponseProps) => (
  <div className="relative">
    <Streamdown
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
      {...props}
    >
      {children}
    </Streamdown>
    {isStreaming && (
      <span 
        className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle" 
        aria-label="AI is typing"
      />
    )}
  </div>
);

/**
 * Memoized VitalResponse component
 * 
 * Custom comparison function ensures efficient re-renders:
 * - Only re-renders when `children` content changes
 * - Also re-renders when `isStreaming` state changes
 */
export const VitalResponse = memo(
  ResponseComponent,
  (prevProps, nextProps) => 
    prevProps.children === nextProps.children &&
    prevProps.isStreaming === nextProps.isStreaming
);

VitalResponse.displayName = 'VitalResponse';

// ============================================================================
// Streamdown-only variant (exact ai-elements match)
// ============================================================================

/**
 * VitalStreamdownResponse - Pure Streamdown wrapper
 * 
 * Exact match to ai-elements/response.tsx for maximum compatibility.
 * Use this when you want the simplest Streamdown integration.
 */
export const VitalStreamdownResponse = memo(
  ({ className, ...props }: ComponentProps<typeof Streamdown>) => (
    <Streamdown
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

VitalStreamdownResponse.displayName = 'VitalStreamdownResponse';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalResponse */
export const Response = VitalResponse;

/** @alias VitalStreamdownResponse - exact ai-elements match */
export const StreamdownResponse = VitalStreamdownResponse;

export default VitalResponse;
