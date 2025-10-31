'use client';

import * as React from 'react';
import { ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@vital/ui';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Inline citation root
// -----------------------------------------------------------------------------

export function InlineCitation({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 align-baseline', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function InlineCitationText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('leading-relaxed', className)}
      {...props}
    >
      {children}
    </span>
  );
}

// -----------------------------------------------------------------------------
// Card state management
// -----------------------------------------------------------------------------

interface CardContextValue {
  open: boolean;
  toggle: (value?: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  cardRef: React.RefObject<HTMLDivElement>;
}

const CardContext = React.createContext<CardContextValue | null>(null);

function useCardContext(component: string): CardContextValue {
  const ctx = React.useContext(CardContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <InlineCitationCard>`);
  }
  return ctx;
}

export interface InlineCitationCardProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export function InlineCitationCard({
  className,
  children,
  ...props
}: InlineCitationCardProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        cardRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const value = React.useMemo<CardContextValue>(
    () => ({
      open,
      toggle: (value?: boolean) => {
        setOpen((previous) => (typeof value === 'boolean' ? value : !previous));
      },
      triggerRef,
      cardRef,
    }),
    [open]
  );

  return (
    <CardContext.Provider value={value}>
      <span className={cn('relative inline-flex', className)} {...props}>
        {children}
      </span>
    </CardContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Trigger
// -----------------------------------------------------------------------------

interface InlineCitationCardTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sources: string[];
}

export function InlineCitationCardTrigger({
  sources,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: InlineCitationCardTriggerProps) {
  const { toggle, triggerRef, open } = useCardContext(
    'InlineCitationCardTrigger'
  );

  const hostname =
    sources.length > 0 ? extractHostname(sources[0]) : 'source';
  const additional = Math.max(0, sources.length - 1);
  const label = additional > 0 ? `${hostname} +${additional}` : hostname;

  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={(event) => {
        toggle();
        onClick?.(event);
      }}
      onMouseEnter={(event) => {
        toggle(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        toggle(false);
        onMouseLeave?.(event);
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50',
        open && 'ring-2 ring-blue-400 dark:ring-blue-300',
        className
      )}
      {...props}
    >
      <span className="truncate max-w-[10rem]">{label}</span>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Card body
// -----------------------------------------------------------------------------

export interface InlineCitationCardBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function InlineCitationCardBody({
  className,
  children,
  ...props
}: InlineCitationCardBodyProps) {
  const { open, cardRef, toggle } = useCardContext(
    'InlineCitationCardBody'
  );

  if (!open) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900',
        className
      )}
      onMouseEnter={() => toggle(true)}
      onMouseLeave={() => toggle(false)}
      {...props}
    >
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-600"
          onClick={() => toggle(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Carousel management
// -----------------------------------------------------------------------------

interface CarouselContextValue {
  index: number;
  total: number;
  goTo: (next: number) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel(component: string): CarouselContextValue {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <InlineCitationCarousel>`);
  }
  return ctx;
}

export interface InlineCitationCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  defaultIndex?: number;
}

export function InlineCitationCarousel({
  children,
  className,
  defaultIndex = 0,
  ...props
}: InlineCitationCarouselProps) {
  const [total, setTotal] = React.useState(0);
  const [index, setIndex] = React.useState(defaultIndex);

  const registerTotal = React.useCallback((value: number) => {
    setTotal(value);
    if (value === 0) {
      setIndex(0);
    } else if (index >= value) {
      setIndex(value - 1);
    }
  }, [index]);

  const goTo = React.useCallback(
    (next: number) => {
      if (next < 0 || next >= total) {
        return;
      }
      setIndex(next);
    },
    [total]
  );

  const value = React.useMemo<CarouselContextValue>(
    () => ({ index, total, goTo }),
    [index, total, goTo]
  );

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn('space-y-3', className)} {...props}>
        <CarouselRegistrar onRegister={registerTotal}>
          {children}
        </CarouselRegistrar>
      </div>
    </CarouselContext.Provider>
  );
}

interface CarouselRegistrarProps {
  onRegister: (count: number) => void;
  children: React.ReactNode;
}

function CarouselRegistrar({
  onRegister,
  children,
}: CarouselRegistrarProps) {
  const arrayChildren = React.Children.toArray(children);
  React.useEffect(() => {
    onRegister(arrayChildren.length);
  }, [arrayChildren.length, onRegister]);
  return <>{children}</>;
}

export function InlineCitationCarouselHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function InlineCitationCarouselIndex({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { index, total } = useCarousel('InlineCitationCarouselIndex');
  if (total <= 1) {
    return null;
  }
  return (
    <span className={cn('text-xs text-muted-foreground', className)} {...props}>
      {index + 1} of {total}
    </span>
  );
}

export function InlineCitationCarouselControls({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { index, total, goTo } = useCarousel(
    'InlineCitationCarouselControls'
  );

  if (total <= 1) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={index <= 0}
        onClick={() => goTo(index - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={index >= total - 1}
        onClick={() => goTo(index + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function InlineCitationCarouselContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { index } = useCarousel('InlineCitationCarouselContent');
  const arrayChildren = React.Children.toArray(children);

  return (
    <div className={cn('relative', className)} {...props}>
      {arrayChildren.map((child, idx) => (
        <div
          key={idx}
          className={cn(
            'transition-opacity duration-200',
            idx === index ? 'opacity-100' : 'pointer-events-none opacity-0 absolute inset-0'
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function InlineCitationCarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-3', className)} {...props} />
  );
}

// -----------------------------------------------------------------------------
// Source presentation
// -----------------------------------------------------------------------------

export interface InlineCitationSourceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  url: string;
  description?: string;
}

export function InlineCitationSource({
  title,
  url,
  description,
  className,
  ...props
}: InlineCitationSourceProps) {
  const hostname = extractHostname(url);

  return (
    <div
      className={cn('rounded-lg border border-gray-200 p-3 dark:border-gray-700', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">{hostname}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  );
}

export function InlineCitationQuote({
  className,
  children,
  ...props
}: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        'rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100',
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function extractHostname(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}
