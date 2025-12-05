/**
 * Loading Skeleton Components
 * Reusable loading states for async operations
 * Provides visual feedback while content loads
 */

import { Card } from '@vital/ui';
import { Skeleton } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

// ===========================
// CHAT SKELETONS
// ===========================

/**
 * Loading skeleton for chat messages
 */
export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          {/* Avatar */}
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            {/* Message header */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            {/* Message content */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for chat input area
 */
export function ChatInputSkeleton() {
  return (
    <div className="border-t p-4">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for chat sidebar conversations list
 */
export function ChatSidebarSkeleton() {
  return (
    <div className="w-64 border-r bg-neutral-50 p-4 space-y-3">
      <Skeleton className="h-10 w-full rounded-lg mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-3">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </Card>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for prompt starters
 */
export function PromptStartersSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ===========================
// AGENT SKELETONS
// ===========================

/**
 * Loading skeleton for agent card
 */
export function AgentCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          {/* Name and badges */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          {/* Description */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          {/* Capabilities */}
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for agent grid
 */
export function AgentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for agent profile header
 */
export function AgentProfileHeaderSkeleton() {
  return (
    <div className="border-b px-6 py-3 bg-neutral-50">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for agent details modal
 */
export function AgentDetailsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

// ===========================
// DASHBOARD SKELETONS
// ===========================

/**
 * Loading skeleton for dashboard stats card
 */
export function DashboardStatSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for dashboard stats grid
 */
export function DashboardStatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DashboardStatSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for chart/graph
 */
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className={cn('w-full', height)} />
      </div>
    </Card>
  );
}

// ===========================
// TABLE SKELETONS
// ===========================

/**
 * Loading skeleton for table row
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Loading skeleton for full table
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===========================
// FORM SKELETONS
// ===========================

/**
 * Loading skeleton for form field
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * Loading skeleton for full form
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// ===========================
// LIST SKELETONS
// ===========================

/**
 * Loading skeleton for list item
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8" />
    </div>
  );
}

/**
 * Loading skeleton for list
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ===========================
// MODAL SKELETONS
// ===========================

/**
 * Loading skeleton for modal content
 */
export function ModalContentSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Body */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Footer */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// ===========================
// PAGE SKELETONS
// ===========================

/**
 * Loading skeleton for full page with header and content
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <DashboardStatsGridSkeleton count={4} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}

// ===========================
// UTILITY SKELETONS
// ===========================

/**
 * Loading skeleton for text content
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-4/6' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for image/media
 */
export function ImageSkeleton({
  aspectRatio = 'aspect-video',
  rounded = 'rounded-lg'
}: {
  aspectRatio?: string;
  rounded?: string;
}) {
  return (
    <Skeleton className={cn('w-full', aspectRatio, rounded)} />
  );
}

/**
 * Loading skeleton for button
 */
export function ButtonSkeleton({
  size = 'default'
}: {
  size?: 'sm' | 'default' | 'lg'
}) {
  const heights = {
    sm: 'h-8',
    default: 'h-10',
    lg: 'h-12'
  };

  return <Skeleton className={cn(heights[size], 'w-24 rounded-md')} />;
}

/**
 * Loading skeleton for avatar with name
 */
export function AvatarWithNameSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
