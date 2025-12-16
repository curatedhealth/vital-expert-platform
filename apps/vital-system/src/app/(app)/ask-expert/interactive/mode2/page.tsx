'use client';

/**
 * VITAL Platform - Mode 2: Smart Copilot (Dedicated Page)
 *
 * Route: /ask-expert/interactive/mode2
 *
 * Mode 2: Automatic Expert Selection (Fusion Intelligence)
 * - User types query, backend auto-selects best expert via GraphRAG
 * - Uses 3-method fusion: PostgreSQL (30%) + Pinecone (50%) + Neo4j (20%)
 * - Interactive conversation with real-time SSE streaming
 *
 * This is a DEDICATED page for Mode 2 only.
 * Mode 1 has its own separate page at /ask-expert/interactive/mode1
 *
 * Created: December 15, 2025
 */

import { Suspense } from 'react';
import { useTenant } from '@/contexts/tenant-context';
import { InteractiveView } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function Mode2Content({ tenantId }: { tenantId: string }) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <InteractiveView
        mode="mode2"
        tenantId={tenantId}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-stone-500">Loading Mode 2: Smart Copilot...</p>
      </div>
    </div>
  );
}

export default function Mode2SmartCopilotPage() {
  const tenantContext = useTenant();

  if (!tenantContext?.tenant) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary componentName="Mode2SmartCopilotPage">
      <Suspense fallback={<LoadingState />}>
        <Mode2Content tenantId={tenantContext.tenant.id} />
      </Suspense>
    </ErrorBoundary>
  );
}
