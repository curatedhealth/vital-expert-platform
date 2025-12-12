'use client';

/**
 * VITAL Platform - Interactive Expert Chat
 *
 * Mode 1: Manual expert selection (user picks) - ?mode=manual
 * Mode 2: Auto expert selection (Fusion Intelligence) - ?mode=auto
 *
 * Query param determines initial mode, no toggle needed.
 *
 * Updated: December 11, 2025 - Now uses canonical InteractiveView component
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { InteractiveView, type InteractiveMode } from '@/features/ask-expert/views/InteractiveView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Suspense, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

function InteractiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get('mode');

  // Map URL param to InteractiveMode type
  const mode: InteractiveMode = modeParam === 'auto' ? 'mode2' : 'mode1';

  // Handle mode change by updating URL
  const handleModeChange = useCallback((newMode: InteractiveMode) => {
    const param = newMode === 'mode2' ? 'auto' : 'manual';
    router.push(`/ask-expert/interactive?mode=${param}`);
  }, [router]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <InteractiveView
        mode={mode}
        tenantId="00000000-0000-0000-0000-000000000001"
        onModeChange={handleModeChange}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading Interactive Chat...</p>
      </div>
    </div>
  );
}

export default function InteractiveExpertPage() {
  return (
    <ErrorBoundary componentName="InteractiveExpertPage">
      <Suspense fallback={<LoadingState />}>
        <InteractiveContent />
      </Suspense>
    </ErrorBoundary>
  );
}
