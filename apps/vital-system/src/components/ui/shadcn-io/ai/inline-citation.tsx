'use client';

import { ExternalLink } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@vital/ui';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@vital/ui';
import { cn } from '@/lib/utils';

import type { ComponentProps, HTMLAttributes } from 'react';

interface Source {
  url: string;
  title?: string;
  description?: string;
  date?: string;
  authors?: string[];
  excerpt?: string;
}

export type InlineCitationProps = HTMLAttributes<HTMLSpanElement>;

export const InlineCitation = ({
  children,
  className,
  ...props
}: InlineCitationProps) => (
  <span className={cn('inline-flex items-baseline gap-1', className)} {...props}>
    {children}
  </span>
);

InlineCitation.displayName = 'InlineCitation';

export type InlineCitationTextProps = HTMLAttributes<HTMLSpanElement>;

export const InlineCitationText = ({
  children,
  className,
  ...props
}: InlineCitationTextProps) => (
  <span className={className} {...props}>
    {children}
  </span>
);

InlineCitationText.displayName = 'InlineCitationText';

export type InlineCitationCardProps = ComponentProps<typeof HoverCard>;

export const InlineCitationCard = ({
  children,
  openDelay = 200,
  ...props
}: InlineCitationCardProps) => (
  <HoverCard openDelay={openDelay} {...props}>
    {children}
  </HoverCard>
);

InlineCitationCard.displayName = 'InlineCitationCard';

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
  sources: string[];
};

export const InlineCitationCardTrigger = ({
  sources,
  className,
  ...props
}: InlineCitationCardTriggerProps) => {
  const uniqueHostnames = React.useMemo(() => {
    const hostnames = sources.map((url) => {
      try {
        return new URL(url).hostname.replace('www.', '');
      } catch {
        return 'source';
      }
    });
    return Array.from(new Set(hostnames));
  }, [sources]);

  return (
    <HoverCardTrigger asChild>
      <sup className="cursor-pointer">
        <Badge
          variant="outline"
          className={cn(
            'h-5 px-1.5 text-[10px] font-medium hover:bg-muted transition-colors',
            className
          )}
          {...props}
        >
          {uniqueHostnames.length > 1
            ? `${uniqueHostnames[0]}+${uniqueHostnames.length - 1}`
            : uniqueHostnames[0]}
        </Badge>
      </sup>
    </HoverCardTrigger>
  );
};

InlineCitationCardTrigger.displayName = 'InlineCitationCardTrigger';

export type InlineCitationCardBodyProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end';
};

export const InlineCitationCardBody = ({
  children,
  className,
  align = 'start',
  ...props
}: InlineCitationCardBodyProps) => (
  <HoverCardContent
    className={cn('w-80 p-3', className)}
    align={align}
    {...props}
  >
    {children}
  </HoverCardContent>
);

InlineCitationCardBody.displayName = 'InlineCitationCardBody';

export type InlineCitationCarouselProps = HTMLAttributes<HTMLDivElement>;

export const InlineCitationCarousel = ({
  children,
  className,
  ...props
}: InlineCitationCarouselProps) => (
  <div className={cn('space-y-2', className)} {...props}>
    {children}
  </div>
);

InlineCitationCarousel.displayName = 'InlineCitationCarousel';

export type InlineCitationCarouselContentProps = HTMLAttributes<HTMLDivElement>;

export const InlineCitationCarouselContent = ({
  children,
  className,
  ...props
}: InlineCitationCarouselContentProps) => (
  <div className={cn('space-y-2', className)} {...props}>
    {children}
  </div>
);

InlineCitationCarouselContent.displayName = 'InlineCitationCarouselContent';

export type InlineCitationCarouselItemProps = HTMLAttributes<HTMLDivElement>;

export const InlineCitationCarouselItem = ({
  children,
  className,
  ...props
}: InlineCitationCarouselItemProps) => (
  <div className={className} {...props}>
    {children}
  </div>
);

InlineCitationCarouselItem.displayName = 'InlineCitationCarouselItem';

export type InlineCitationSourceProps = HTMLAttributes<HTMLDivElement> &
  Source & {
    index?: number;
  };

export const InlineCitationSource = ({
  url,
  title,
  description,
  date,
  authors,
  excerpt,
  index,
  className,
  ...props
}: InlineCitationSourceProps) => {
  const hostname = React.useMemo(() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown source';
    }
  }, [url]);

  // Format Harvard citation
  const harvardCitation = React.useMemo(() => {
    const year = date ? new Date(date).getFullYear() : 'n.d.';
    const authorText =
      authors && authors.length > 0
        ? authors.length === 1
          ? authors[0]
          : authors.length === 2
            ? `${authors[0]} and ${authors[1]}`
            : `${authors[0]} et al.`
        : hostname;

    return `${authorText} (${year})`;
  }, [authors, date, hostname]);

  return (
    <div className={cn('space-y-2 border-l-2 border-muted pl-3', className)} {...props}>
      {index !== undefined && (
        <div className="text-xs font-medium text-muted-foreground">
          Source {index + 1}
        </div>
      )}

      <div className="space-y-1">
        <div className="text-sm font-semibold leading-tight">
          {title || hostname}
        </div>

        <div className="text-xs text-muted-foreground">{harvardCitation}</div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {excerpt && (
          <blockquote className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mt-2">
            "{excerpt}"
          </blockquote>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <span className="truncate max-w-[200px]">{hostname}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      </div>
    </div>
  );
};

InlineCitationSource.displayName = 'InlineCitationSource';

export type InlineCitationQuoteProps = React.HTMLAttributes<HTMLElement>;

export const InlineCitationQuote = ({
  children,
  className,
  ...props
}: InlineCitationQuoteProps) => (
  <blockquote
    className={cn(
      'text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mt-2',
      className
    )}
    {...props}
  >
    {children}
  </blockquote>
);

InlineCitationQuote.displayName = 'InlineCitationQuote';

