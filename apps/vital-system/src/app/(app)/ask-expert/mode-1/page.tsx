'use client';

/**
 * VITAL Platform - Mode 1: Expert Chat (Interactive Manual)
 *
 * User manually selects an expert via ExpertPicker grid,
 * then has an interactive conversation with SSE streaming.
 *
 * Features:
 * - ExpertPicker for manual expert selection
 * - ChatInput with file attachments
 * - Full SSE streaming with 12 event types
 * - HITL components for human oversight
 *
 * Updated: December 12, 2025 - Wired to InteractiveView with ChatInput
 */

import { Suspense } from 'react';
import { useTenant } from '@/contexts/tenant-context';
import { InteractiveView } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-stone-500">Loading Expert Chat...</p>
      </div>
    </div>
  );
}

export default function Mode1ExpertChatPage() {
  const tenantContext = useTenant();

  if (!tenantContext?.tenant) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary componentName="Mode1ExpertChatPage">
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <InteractiveView
            mode="mode1"
            tenantId={tenantContext.tenant.id}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
