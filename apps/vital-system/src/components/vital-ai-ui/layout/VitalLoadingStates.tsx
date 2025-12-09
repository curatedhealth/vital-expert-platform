'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * VitalLoadingStates - Collection of loading indicators
 * 
 * Provides consistent loading states across the application
 * including spinners, skeletons, and shimmer effects.
 * Replaces legacy loading-skeletons component.
 */

// ============================================================================
// SPINNER
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VitalSpinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn(
      "animate-spin text-muted-foreground",
      sizeClasses[size],
      className
    )} />
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface SkeletonProps {
  className?: string;
}

export function VitalSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "animate-pulse rounded-md bg-muted",
      className
    )} />
  );
}

// ============================================================================
// SKELETON VARIANTS
// ============================================================================

export function VitalSkeletonText({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <VitalSkeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

export function VitalSkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-3", className)}>
      <VitalSkeleton className="h-4 w-2/3" />
      <VitalSkeleton className="h-4 w-full" />
      <VitalSkeleton className="h-4 w-4/5" />
    </div>
  );
}

export function VitalSkeletonMessage({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <VitalSkeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <VitalSkeleton className="h-4 w-1/4" />
        <VitalSkeleton className="h-4 w-full" />
        <VitalSkeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function VitalSkeletonTable({ 
  rows = 5,
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <VitalSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: columns }).map((_, col) => (
            <VitalSkeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function VitalSkeletonAvatar({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <VitalSkeleton className={cn(
      "rounded-full",
      sizeClasses[size],
      className
    )} />
  );
}

// ============================================================================
// SHIMMER
// ============================================================================

interface ShimmerProps {
  className?: string;
}

export function VitalShimmer({ className }: ShimmerProps) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-muted rounded-md",
      className
    )}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export function VitalLoadingOverlay({ 
  isLoading, 
  message,
  children,
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <VitalSpinner size="lg" />
          {message && (
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LOADING PAGE
// ============================================================================

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function VitalLoadingPage({ message, className }: LoadingPageProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px]",
      className
    )}>
      <VitalSpinner size="lg" />
      {message && (
        <p className="mt-4 text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

// ============================================================================
// PULSE ANIMATION
// ============================================================================

interface PulseProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function VitalPulse({ 
  children, 
  isActive = true,
  className 
}: PulseProps) {
  return (
    <div className={cn(
      isActive && "animate-pulse",
      className
    )}>
      {children}
    </div>
  );
}

// Default export for convenience
export default {
  Spinner: VitalSpinner,
  Skeleton: VitalSkeleton,
  SkeletonText: VitalSkeletonText,
  SkeletonCard: VitalSkeletonCard,
  SkeletonMessage: VitalSkeletonMessage,
  SkeletonTable: VitalSkeletonTable,
  SkeletonAvatar: VitalSkeletonAvatar,
  Shimmer: VitalShimmer,
  LoadingOverlay: VitalLoadingOverlay,
  LoadingPage: VitalLoadingPage,
  Pulse: VitalPulse,
};
