'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================

interface TimelineItem {
  id: string;
  title: string | React.ReactNode;
  description?: string;
  content?: React.ReactNode;
  status?: 'completed' | 'active' | 'pending';
  icon?: React.ReactNode;
}

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
  activeIndex?: number;
  orientation?: 'vertical' | 'horizontal';
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, items, activeIndex, orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row',
          className
        )}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = activeIndex !== undefined ? index === activeIndex : item.status === 'active';
          const isCompleted = activeIndex !== undefined ? index < activeIndex : item.status === 'completed';
          const isPending = !isActive && !isCompleted;

          return (
            <div
              key={item.id}
              className={cn(
                'relative',
                orientation === 'vertical' ? 'flex gap-4 pb-8 last:pb-0' : 'flex flex-col gap-4 pr-8 last:pr-0'
              )}
            >
              {/* Timeline Line */}
              {index < items.length - 1 && (
                <div
                  className={cn(
                    'absolute',
                    orientation === 'vertical'
                      ? 'left-4 top-8 bottom-0 w-0.5'
                      : 'top-4 right-4 left-8 h-0.5',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}

              {/* Timeline Icon */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2',
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {item.icon ? (
                    item.icon
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      'font-semibold',
                      isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.title}
                  </h3>
                  {isActive && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Active
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className={cn('text-sm', isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground')}>
                    {item.description}
                  </p>
                )}
                {item.content && (
                  <div className={cn('mt-2', isActive || isCompleted ? 'opacity-100' : 'opacity-60')}>
                    {item.content}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';

// ============================================================================
// TIMELINE ITEM COMPONENT (Alternative API)
// ============================================================================

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  content?: React.ReactNode;
  status?: 'completed' | 'active' | 'pending';
  icon?: React.ReactNode;
  isLast?: boolean;
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, title, description, content, status = 'pending', icon, isLast, ...props }, ref) => {
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
      <div
        ref={ref}
        className={cn('relative flex gap-4 pb-8', isLast && 'pb-0', className)}
        {...props}
      >
        {/* Timeline Line */}
        {!isLast && (
          <div
            className={cn(
              'absolute left-4 top-8 bottom-0 w-0.5',
              isCompleted ? 'bg-primary' : 'bg-border'
            )}
          />
        )}

        {/* Timeline Icon */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2',
              isCompleted
                ? 'border-primary bg-primary text-primary-foreground'
                : isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            {icon ? (
              icon
            ) : isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-semibold',
                isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {title}
            </h3>
            {isActive && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Active
              </span>
            )}
          </div>
          {description && (
            <p className={cn('text-sm', isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground')}>
              {description}
            </p>
          )}
          {content && (
            <div className={cn('mt-2', isActive || isCompleted ? 'opacity-100' : 'opacity-60')}>
              {content}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TimelineItem.displayName = 'TimelineItem';

export { Timeline, TimelineItem, type TimelineItem as TimelineItemType };

