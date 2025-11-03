'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function UseCaseDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button Skeleton */}
      <Skeleton className="h-9 w-40" />

      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-48" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-2xl" />
        
        {/* Content Area */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function WorkflowFlowSkeleton() {
  return (
    <div className="space-y-4">
      {/* Summary Header Skeleton */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center space-y-1">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-px h-8" />
              <div className="text-center space-y-1">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-px h-8" />
              <div className="text-center space-y-1">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Canvas Skeleton */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-0">
          <div className="w-full h-[800px] bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  Loading workflow visualization...
                </p>
                <p className="text-sm text-gray-500">
                  Preparing nodes and connections
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend Skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

