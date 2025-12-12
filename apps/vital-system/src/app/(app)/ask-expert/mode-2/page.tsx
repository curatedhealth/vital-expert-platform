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
import { InteractiveView } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading Smart Copilot...</p>
      </div>
    </div>
  );
}

export default function Mode2SmartChatPage() {
  return (
    <ErrorBoundary componentName="Mode2SmartChatPage">
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <InteractiveView
            mode="mode2"
            tenantId="00000000-0000-0000-0000-000000000001"
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
