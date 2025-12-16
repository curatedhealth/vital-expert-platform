'use client';

/**
 * VITAL Platform - Mode 1: Expert Chat (Dedicated Page)
 *
 * Route: /ask-expert/interactive/mode1
 *
 * Mode 1: Manual Expert Selection
 * - User manually selects an expert from the sidebar
 * - Interactive conversation with real-time SSE streaming
 * - Token-by-token rendering via streamReducer + flushSync
 * - Supports ?agent=<id> query param to pre-select an agent
 *
 * This is a DEDICATED page for Mode 1 only.
 * Mode 2 has its own separate page at /ask-expert/interactive/mode2
 *
 * Created: December 15, 2025
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTenant } from '@/contexts/tenant-context';
import { InteractiveView } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function Mode1Content({ tenantId }: { tenantId: string }) {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agent');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <InteractiveView
        mode="mode1"
        tenantId={tenantId}
        initialAgentId={agentId || undefined}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-stone-500">Loading Mode 1: Expert Chat...</p>
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
        <Mode1Content tenantId={tenantContext.tenant.id} />
      </Suspense>
    </ErrorBoundary>
  );
}
