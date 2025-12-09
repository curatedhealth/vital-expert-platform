'use client';

/**
 * VitalInlineCitation - Inline Citation with Hover Card and Carousel
 * 
 * Provides a way to display citations inline with text content, similar to 
 * academic papers or research documents. Features a citation pill that shows 
 * detailed source information on hover.
 * 
 * Features:
 * - Hover interaction to reveal detailed citation information
 * - Carousel navigation for multiple citations with prev/next controls
 * - Live index tracking showing current slide position (e.g., "1/5")
 * - Support for source titles, URLs, and descriptions
 * - Optional quote blocks for relevant excerpts
 * - Composable architecture for flexible citation formats
 * - Accessible design with proper keyboard navigation
 * - Seamless integration with AI-generated content
 * - Clean visual design that doesn't disrupt reading flow
 * - Smart badge display showing source hostname and count
 * 
 * @example
 * ```tsx
 * <VitalInlineCitation>
 *   <VitalInlineCitationCard>
 *     <VitalInlineCitationCardTrigger sources={[citation.url]} />
 *     <VitalInlineCitationCardBody>
 *       <VitalInlineCitationCarousel>
 *         <VitalInlineCitationCarouselHeader>
 *           <VitalInlineCitationCarouselPrev />
 *           <VitalInlineCitationCarouselNext />
 *           <VitalInlineCitationCarouselIndex />
 *         </VitalInlineCitationCarouselHeader>
 *         <VitalInlineCitationCarouselContent>
 *           <VitalInlineCitationCarouselItem>
 *             <VitalInlineCitationSource
 *               title={citation.title}
 *               url={citation.url}
 *               description={citation.description}
 *             />
 *             {citation.quote && (
 *               <VitalInlineCitationQuote>
 *                 {citation.quote}
 *               </VitalInlineCitationQuote>
 *             )}
 *           </VitalInlineCitationCarouselItem>
 *         </VitalInlineCitationCarouselContent>
 *       </VitalInlineCitationCarousel>
 *     </VitalInlineCitationCardBody>
 *   </VitalInlineCitationCard>
 * </VitalInlineCitation>
 * ```
 */

import { cn } from '../lib/utils';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalInlineCitationProps = ComponentProps<'span'>;

export type VitalInlineCitationTextProps = ComponentProps<'span'>;

export type VitalInlineCitationCardProps = {
  /** Delay before opening (ms) */
  openDelay?: number;
  /** Delay before closing (ms) */
  closeDelay?: number;
  /** Whether the card is open */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Children */
  children?: ReactNode;
};

export type VitalInlineCitationCardTriggerProps = ComponentProps<'button'> & {
  /** Array of source URLs. The length determines the number displayed in the badge */
  sources: string[];
  /** Badge variant */
  variant?: 'default' | 'secondary' | 'outline';
};

export type VitalInlineCitationCardBodyProps = ComponentProps<'div'> & {
  /** Alignment of the popover */
  align?: 'start' | 'center' | 'end';
  /** Side of the popover */
  side?: 'top' | 'right' | 'bottom' | 'left';
};

export type VitalInlineCitationCarouselProps = ComponentProps<'div'>;

export type VitalInlineCitationCarouselContentProps = ComponentProps<'div'>;

export type VitalInlineCitationCarouselItemProps = ComponentProps<'div'>;

export type VitalInlineCitationCarouselHeaderProps = ComponentProps<'div'>;

export type VitalInlineCitationCarouselIndexProps = ComponentProps<'div'>;

export type VitalInlineCitationCarouselPrevProps = ComponentProps<'button'>;

export type VitalInlineCitationCarouselNextProps = ComponentProps<'button'>;

export type VitalInlineCitationSourceProps = ComponentProps<'div'> & {
  /** The title of the source */
  title?: string;
  /** The URL of the source */
  url?: string;
  /** A brief description of the source */
  description?: string;
};

export type VitalInlineCitationQuoteProps = ComponentProps<'blockquote'>;

// ============================================================================
// Contexts
// ============================================================================

// Hover card context
interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = createContext<HoverCardContextValue | undefined>(undefined);

const useHoverCardContext = () => {
  const context = useContext(HoverCardContext);
  if (!context) {
    throw new Error('HoverCard components must be used within VitalInlineCitationCard');
  }
  return context;
};

// Carousel context
interface CarouselContextValue {
  currentIndex: number;
  totalItems: number;
  scrollPrev: () => void;
  scrollNext: () => void;
  registerItem: () => number;
  unregisterItem: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | undefined>(undefined);

const useCarouselContext = () => {
  const context = useContext(CarouselContext);
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root inline citation wrapper
 */
export const VitalInlineCitation = ({
  className,
  ...props
}: VitalInlineCitationProps) => (
  <span
    className={cn('group inline items-center gap-1', className)}
    {...props}
  />
);

/**
 * Text that gets highlighted on hover
 */
export const VitalInlineCitationText = ({
  className,
  ...props
}: VitalInlineCitationTextProps) => (
  <span
    className={cn('transition-colors group-hover:bg-accent', className)}
    {...props}
  />
);

/**
 * Hover card container for citation details
 */
export const VitalInlineCitationCard = ({
  openDelay = 0,
  closeDelay = 0,
  open: controlledOpen,
  onOpenChange,
  children,
}: VitalInlineCitationCardProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  
  const setOpen = useCallback((newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <span className="relative inline-block">
        {children}
      </span>
    </HoverCardContext.Provider>
  );
};

/**
 * Trigger button that shows source badge
 */
export const VitalInlineCitationCardTrigger = ({
  sources,
  variant = 'secondary',
  className,
  ...props
}: VitalInlineCitationCardTriggerProps) => {
  const { setOpen } = useHoverCardContext();

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent',
  };

  return (
    <button
      type="button"
      className={cn(
        'ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        'transition-colors cursor-pointer',
        variantClasses[variant],
        className
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...props}
    >
      {sources[0] ? (
        <>
          {getHostname(sources[0])}{' '}
          {sources.length > 1 && `+${sources.length - 1}`}
        </>
      ) : (
        'unknown'
      )}
    </button>
  );
};

/**
 * Card body/content container
 */
export const VitalInlineCitationCardBody = ({
  className,
  align = 'start',
  side = 'bottom',
  children,
  ...props
}: VitalInlineCitationCardBodyProps) => {
  const { open } = useHoverCardContext();

  if (!open) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2 top-0',
    right: 'left-full ml-2 top-0',
  };

  return (
    <div
      className={cn(
        'absolute z-50 w-80 p-0 rounded-md border bg-popover shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        sideClasses[side],
        className
      )}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Carousel container for multiple sources
 */
export const VitalInlineCitationCarousel = ({
  className,
  children,
  ...props
}: VitalInlineCitationCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const scrollPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const scrollNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalItems - 1, prev + 1));
  }, [totalItems]);

  const registerItem = useCallback(() => {
    setTotalItems((prev) => prev + 1);
    return totalItems;
  }, [totalItems]);

  const unregisterItem = useCallback(() => {
    setTotalItems((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        currentIndex,
        totalItems,
        scrollPrev,
        scrollNext,
        registerItem,
        unregisterItem,
      }}
    >
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

/**
 * Carousel content wrapper
 */
export const VitalInlineCitationCarouselContent = ({
  className,
  ...props
}: VitalInlineCitationCarouselContentProps) => (
  <div className={cn('overflow-hidden', className)} {...props} />
);

/**
 * Individual carousel item
 */
export const VitalInlineCitationCarouselItem = ({
  className,
  ...props
}: VitalInlineCitationCarouselItemProps) => (
  <div className={cn('w-full space-y-2 p-4 pl-8', className)} {...props} />
);

/**
 * Carousel header with navigation
 */
export const VitalInlineCitationCarouselHeader = ({
  className,
  ...props
}: VitalInlineCitationCarouselHeaderProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2',
      className
    )}
    {...props}
  />
);

/**
 * Carousel index display (e.g., "1/5")
 */
export const VitalInlineCitationCarouselIndex = ({
  children,
  className,
  ...props
}: VitalInlineCitationCarouselIndexProps) => {
  const context = useCarouselContext();
  const current = context?.currentIndex ?? 0;
  const count = context?.totalItems ?? 0;

  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-end px-3 py-1 text-muted-foreground text-xs',
        className
      )}
      {...props}
    >
      {children ?? `${current + 1}/${count || 1}`}
    </div>
  );
};

/**
 * Previous button
 */
export const VitalInlineCitationCarouselPrev = ({
  className,
  ...props
}: VitalInlineCitationCarouselPrevProps) => {
  const context = useCarouselContext();

  const handleClick = useCallback(() => {
    context?.scrollPrev();
  }, [context]);

  return (
    <button
      type="button"
      aria-label="Previous"
      className={cn(
        'shrink-0 p-1 rounded hover:bg-accent transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={!context || context.currentIndex <= 0}
      {...props}
    >
      <ArrowLeftIcon className="size-4 text-muted-foreground" />
    </button>
  );
};

/**
 * Next button
 */
export const VitalInlineCitationCarouselNext = ({
  className,
  ...props
}: VitalInlineCitationCarouselNextProps) => {
  const context = useCarouselContext();

  const handleClick = useCallback(() => {
    context?.scrollNext();
  }, [context]);

  return (
    <button
      type="button"
      aria-label="Next"
      className={cn(
        'shrink-0 p-1 rounded hover:bg-accent transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      disabled={!context || context.currentIndex >= context.totalItems - 1}
      {...props}
    >
      <ArrowRightIcon className="size-4 text-muted-foreground" />
    </button>
  );
};

/**
 * Source information display
 */
export const VitalInlineCitationSource = ({
  title,
  url,
  description,
  className,
  children,
  ...props
}: VitalInlineCitationSourceProps) => (
  <div className={cn('space-y-1', className)} {...props}>
    {title && (
      <h4 className="truncate font-medium text-sm leading-tight">{title}</h4>
    )}
    {url && (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate break-all text-muted-foreground text-xs hover:underline block"
      >
        {url}
      </a>
    )}
    {description && (
      <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    )}
    {children}
  </div>
);

/**
 * Quote/excerpt block
 */
export const VitalInlineCitationQuote = ({
  children,
  className,
  ...props
}: VitalInlineCitationQuoteProps) => (
  <blockquote
    className={cn(
      'border-muted border-l-2 pl-3 text-muted-foreground text-sm italic',
      className
    )}
    {...props}
  >
    {children}
  </blockquote>
);

// ============================================================================
// Display Names
// ============================================================================

VitalInlineCitation.displayName = 'VitalInlineCitation';
VitalInlineCitationText.displayName = 'VitalInlineCitationText';
VitalInlineCitationCard.displayName = 'VitalInlineCitationCard';
VitalInlineCitationCardTrigger.displayName = 'VitalInlineCitationCardTrigger';
VitalInlineCitationCardBody.displayName = 'VitalInlineCitationCardBody';
VitalInlineCitationCarousel.displayName = 'VitalInlineCitationCarousel';
VitalInlineCitationCarouselContent.displayName = 'VitalInlineCitationCarouselContent';
VitalInlineCitationCarouselItem.displayName = 'VitalInlineCitationCarouselItem';
VitalInlineCitationCarouselHeader.displayName = 'VitalInlineCitationCarouselHeader';
VitalInlineCitationCarouselIndex.displayName = 'VitalInlineCitationCarouselIndex';
VitalInlineCitationCarouselPrev.displayName = 'VitalInlineCitationCarouselPrev';
VitalInlineCitationCarouselNext.displayName = 'VitalInlineCitationCarouselNext';
VitalInlineCitationSource.displayName = 'VitalInlineCitationSource';
VitalInlineCitationQuote.displayName = 'VitalInlineCitationQuote';

// ============================================================================
// Aliases (for compatibility with ai-elements naming)
// ============================================================================

export const InlineCitation = VitalInlineCitation;
export const InlineCitationText = VitalInlineCitationText;
export const InlineCitationCard = VitalInlineCitationCard;
export const InlineCitationCardTrigger = VitalInlineCitationCardTrigger;
export const InlineCitationCardBody = VitalInlineCitationCardBody;
export const InlineCitationCarousel = VitalInlineCitationCarousel;
export const InlineCitationCarouselContent = VitalInlineCitationCarouselContent;
export const InlineCitationCarouselItem = VitalInlineCitationCarouselItem;
export const InlineCitationCarouselHeader = VitalInlineCitationCarouselHeader;
export const InlineCitationCarouselIndex = VitalInlineCitationCarouselIndex;
export const InlineCitationCarouselPrev = VitalInlineCitationCarouselPrev;
export const InlineCitationCarouselNext = VitalInlineCitationCarouselNext;
export const InlineCitationSource = VitalInlineCitationSource;
export const InlineCitationQuote = VitalInlineCitationQuote;

export default VitalInlineCitation;
