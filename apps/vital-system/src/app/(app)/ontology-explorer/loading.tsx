/**
 * Loading skeleton for Ontology Explorer
 */

import { Skeleton } from "@vital/ui";

export default function OntologyExplorerLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Graph canvas skeleton */}
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading graph...</p>
        </div>
      </div>
    </div>
  );
}
