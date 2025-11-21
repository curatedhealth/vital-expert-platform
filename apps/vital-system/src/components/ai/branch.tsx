'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { Button } from '@vital/ui';
import { cn } from '@/lib/utils';

interface BranchContextValue {
  current: number;
  total: number;
  goTo: (index: number) => void;
  registerTotal: (count: number) => void;
}

const BranchContext = React.createContext<BranchContextValue | null>(null);

function useBranch(component: string): BranchContextValue {
  const context = React.useContext(BranchContext);
  if (!context) {
    throw new Error(`${component} must be used within <Branch>`);
  }
  return context;
}

export interface BranchProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultBranch?: number;
  currentBranch?: number;
  totalBranches?: number;
  onBranchChange?: (index: number) => void;
}

export function Branch({
  children,
  defaultBranch = 0,
  currentBranch,
  totalBranches,
  onBranchChange,
  className,
  ...rest
}: BranchProps) {
  const isControlled = typeof currentBranch === 'number';
  const [internalIndex, setInternalIndex] = React.useState(defaultBranch);
  const [internalTotal, setInternalTotal] = React.useState(0);

  const total = typeof totalBranches === 'number' ? totalBranches : internalTotal;
  const rawIndex = isControlled ? (currentBranch as number) : internalIndex;
  const safeTotal = Math.max(total, 0);
  const safeIndex =
    safeTotal > 0 ? Math.min(Math.max(rawIndex, 0), safeTotal - 1) : 0;

  React.useEffect(() => {
    if (!isControlled && safeIndex !== internalIndex) {
      setInternalIndex(safeIndex);
    }
  }, [safeIndex, internalIndex, isControlled]);

  React.useEffect(() => {
    if (!isControlled) {
      onBranchChange?.(safeIndex);
    }
  }, [safeIndex, isControlled, onBranchChange]);

  const goTo = React.useCallback(
    (next: number) => {
      if (next < 0) {
        return;
      }
      if (safeTotal > 0 && next >= safeTotal) {
        return;
      }

      if (!isControlled) {
        setInternalIndex(next);
      }
      onBranchChange?.(next);
    },
    [isControlled, safeTotal, onBranchChange]
  );

  const registerTotal = React.useCallback(
    (count: number) => {
      if (count !== internalTotal) {
        setInternalTotal(count);
      }
    },
    [internalTotal]
  );

  const value = React.useMemo(
    () => ({
      current: safeIndex,
      total: safeTotal,
      goTo,
      registerTotal,
    }),
    [safeIndex, safeTotal, goTo, registerTotal]
  );

  return (
    <BranchContext.Provider value={value}>
      <div className={cn('flex flex-col gap-2', className)} {...rest}>
        {children}
      </div>
    </BranchContext.Provider>
  );
}

export interface BranchMessagesProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function BranchMessages({
  children,
  className,
  ...rest
}: BranchMessagesProps) {
  const { current, registerTotal } = useBranch('BranchMessages');
  const branches = React.Children.toArray(children);

  React.useEffect(() => {
    registerTotal(branches.length);
  }, [branches.length, registerTotal]);

  return (
    <div className={className} {...rest}>
      {branches[current] ?? null}
    </div>
  );
}

export interface BranchSelectorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  from?: 'user' | 'assistant' | 'system';
}

export function BranchSelector({
  from = 'assistant',
  className,
  children,
  ...rest
}: BranchSelectorProps) {
  return (
    <div
      className={cn(
        'mt-3 flex items-center justify-between gap-2 rounded-lg border border-transparent bg-transparent text-xs',
        from === 'user' ? 'justify-end' : 'justify-between',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface BranchPreviousProps
  extends React.ComponentProps<typeof Button> {}

export function BranchPrevious({
  className,
  ...rest
}: BranchPreviousProps) {
  const { current, goTo } = useBranch('BranchPrevious');
  const disabled = current <= 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={() => goTo(current - 1)}
      className={cn('h-7 w-7 p-0', className)}
      {...rest}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}

export interface BranchNextProps
  extends React.ComponentProps<typeof Button> {}

export function BranchNext({ className, ...rest }: BranchNextProps) {
  const { current, total, goTo } = useBranch('BranchNext');
  const disabled = total === 0 || current >= total - 1;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={() => goTo(current + 1)}
      className={cn('h-7 w-7 p-0', className)}
      {...rest}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}

export interface BranchPageProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export function BranchPage({
  className,
  ...rest
}: BranchPageProps) {
  const { current, total } = useBranch('BranchPage');

  if (total <= 1) {
    return null;
  }

  return (
    <span
      className={cn('text-muted-foreground text-xs font-medium', className)}
      {...rest}
    >
      {current + 1} of {total}
    </span>
  );
}
