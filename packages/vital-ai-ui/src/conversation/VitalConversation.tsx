'use client';

/**
 * VitalConversation - Scrollable Conversation Container
 * 
 * A container component for chat conversations with auto-scroll functionality.
 * Provides smooth auto-scrolling behavior with a scroll-to-bottom button.
 * 
 * Features:
 * - Automatic scrolling to the bottom when new messages are added
 * - Smooth scrolling behavior with configurable animation
 * - Scroll button that appears when not at the bottom
 * - Responsive design with customizable padding and spacing
 * - Flexible content layout with consistent message spacing
 * - Accessible with proper ARIA roles for screen readers
 * - Context-based architecture for nested component communication
 * - Support for render props pattern
 * 
 * @example
 * ```tsx
 * <VitalConversation>
 *   <VitalConversationContent>
 *     {messages.length === 0 ? (
 *       <VitalConversationEmptyState
 *         icon={<MessageSquare className="size-12" />}
 *         title="Start a conversation"
 *         description="Type a message below to begin chatting"
 *       />
 *     ) : (
 *       messages.map((msg) => <VitalMessage key={msg.id} {...msg} />)
 *     )}
 *   </VitalConversationContent>
 *   <VitalConversationScrollButton />
 * </VitalConversation>
 * ```
 */

import { cn } from '../lib/utils';
import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps, ReactNode, RefObject } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Context object for controlling scroll behavior
 */
export interface ConversationContextValue {
  /** Whether the scroll position is at the bottom */
  isAtBottom: boolean;
  /** Scroll to the bottom of the conversation */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** Scroll to a specific position */
  scrollTo: (options: ScrollToOptions) => void;
  /** Current scroll position */
  scrollTop: number;
  /** Total scrollable height */
  scrollHeight: number;
  /** Visible height */
  clientHeight: number;
}

/**
 * Instance for external control
 */
export interface ConversationInstance {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollTo: (options: ScrollToOptions) => void;
  getScrollState: () => { scrollTop: number; scrollHeight: number; clientHeight: number };
}

export type VitalConversationProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Optional ref to access the context object */
  contextRef?: RefObject<ConversationContextValue | null>;
  /** Optional instance for controlling the component */
  instance?: ConversationInstance;
  /** Render prop or ReactNode for custom rendering with context */
  children?: ((context: ConversationContextValue) => ReactNode) | ReactNode;
  /** Initial scroll behavior */
  initial?: ScrollBehavior;
  /** Scroll behavior on resize */
  resize?: ScrollBehavior;
  /** Auto-scroll threshold in pixels */
  threshold?: number;
};

export type VitalConversationContentProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Render prop or ReactNode for custom rendering with context */
  children?: ((context: ConversationContextValue) => ReactNode) | ReactNode;
};

export type VitalConversationEmptyStateProps = ComponentProps<'div'> & {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Custom icon */
  icon?: ReactNode;
};

export type VitalConversationScrollButtonProps = ComponentProps<'button'> & {
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

// ============================================================================
// Context
// ============================================================================

const ConversationContext = createContext<ConversationContextValue | null>(null);

/**
 * Hook to access the conversation context
 */
export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('Conversation components must be used within VitalConversation');
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root conversation container with auto-scroll
 */
export const VitalConversation = forwardRef<HTMLDivElement, VitalConversationProps>(
  (
    {
      className,
      children,
      contextRef,
      instance,
      initial = 'smooth',
      resize = 'smooth',
      threshold = 100,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [scrollState, setScrollState] = useState({
      scrollTop: 0,
      scrollHeight: 0,
      clientHeight: 0,
    });

    // Combine refs
    useImperativeHandle(ref, () => containerRef.current!);

    const updateScrollState = useCallback(() => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setScrollState({ scrollTop, scrollHeight, clientHeight });
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }, [threshold]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }, []);

    const scrollTo = useCallback((options: ScrollToOptions) => {
      if (!containerRef.current) return;
      containerRef.current.scrollTo(options);
    }, []);

    // Create context value
    const contextValue: ConversationContextValue = {
      isAtBottom,
      scrollToBottom,
      scrollTo,
      ...scrollState,
    };

    // Expose context ref
    useEffect(() => {
      if (contextRef && 'current' in contextRef) {
        (contextRef as { current: ConversationContextValue | null }).current = contextValue;
      }
    }, [contextRef, contextValue]);

    // Handle scroll events
    const handleScroll = useCallback(() => {
      updateScrollState();
    }, [updateScrollState]);

    // Auto-scroll on content changes
    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new MutationObserver(() => {
        if (isAtBottom) {
          scrollToBottom(resize);
        }
        updateScrollState();
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }, [isAtBottom, scrollToBottom, resize, updateScrollState]);

    // Handle resize
    useEffect(() => {
      if (!containerRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        if (isAtBottom) {
          scrollToBottom(resize);
        }
        updateScrollState();
      });

      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }, [isAtBottom, scrollToBottom, resize, updateScrollState]);

    // Initial scroll
    useEffect(() => {
      scrollToBottom(initial);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <ConversationContext.Provider value={contextValue}>
        <div
          ref={containerRef}
          className={cn('relative flex-1 overflow-y-auto', className)}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          {...props}
        >
          {typeof children === 'function' ? children(contextValue) : children}
        </div>
      </ConversationContext.Provider>
    );
  }
);

/**
 * Content container with proper spacing
 */
export const VitalConversationContent = ({
  className,
  children,
  ...props
}: VitalConversationContentProps) => {
  const context = useConversationContext();

  return (
    <div className={cn('flex flex-col gap-8 p-4', className)} {...props}>
      {typeof children === 'function' ? children(context) : children}
    </div>
  );
};

/**
 * Empty state for when there are no messages
 */
export const VitalConversationEmptyState = ({
  className,
  title = 'No messages yet',
  description = 'Start a conversation to see messages here',
  icon,
  children,
  ...props
}: VitalConversationEmptyStateProps) => (
  <div
    className={cn(
      'flex size-full flex-col items-center justify-center gap-3 p-8 text-center',
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

/**
 * Scroll-to-bottom button that shows when not at bottom
 */
export const VitalConversationScrollButton = ({
  className,
  variant = 'outline',
  size = 'icon',
  children,
  ...props
}: VitalConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useConversationContext();

  const handleClick = useCallback(() => {
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  if (isAtBottom) return null;

  const sizeClasses = {
    default: 'h-10 w-10',
    sm: 'h-8 w-8',
    lg: 'h-12 w-12',
    icon: 'h-10 w-10',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border bg-background hover:bg-accent',
    ghost: 'hover:bg-accent',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
        'inline-flex items-center justify-center shadow-md',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Scroll to bottom"
      {...props}
    >
      {children ?? <ArrowDownIcon className="size-4" />}
    </button>
  );
};

// ============================================================================
// Display Names
// ============================================================================

VitalConversation.displayName = 'VitalConversation';
VitalConversationContent.displayName = 'VitalConversationContent';
VitalConversationEmptyState.displayName = 'VitalConversationEmptyState';
VitalConversationScrollButton.displayName = 'VitalConversationScrollButton';

// ============================================================================
// Aliases
// ============================================================================

export const Conversation = VitalConversation;
export const ConversationContent = VitalConversationContent;
export const ConversationEmptyState = VitalConversationEmptyState;
export const ConversationScrollButton = VitalConversationScrollButton;

export default VitalConversation;
