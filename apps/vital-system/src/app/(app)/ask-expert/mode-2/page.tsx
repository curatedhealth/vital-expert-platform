'use client';

/**
 * VITAL Platform - Mode 2: Smart Copilot (Interactive Auto)
 *
 * User types a query first, then Fusion Intelligence
 * automatically selects the best expert for the conversation.
 *
 * Features:
 * - FusionSelector for AI-powered expert selection
 * - Query-first flow (user describes need, AI picks expert)
 * - ChatInput with file attachments
 * - Full SSE streaming with 12 event types
 * - HITL components for human oversight
 *
 * Updated: December 12, 2025 - Wired to InteractiveView with ChatInput
 */

import { Suspense } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { InteractiveView } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-sm text-stone-500">Loading Smart Copilot...</p>
      </div>
    </div>
  );
}

export default function Mode2SmartChatPage() {
  const tenant = useTenant();

  if (!tenant) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary componentName="Mode2SmartChatPage">
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <InteractiveView
            mode="mode2"
            tenantId={tenant.id}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
