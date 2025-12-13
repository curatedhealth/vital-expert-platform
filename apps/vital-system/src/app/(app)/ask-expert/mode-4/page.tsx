'use client';

/**
 * VITAL Platform - Mode 4: Background Agent (Autonomous Auto)
 *
 * User describes their task, AI selects the best expert team
 * via Fusion Intelligence, then executes autonomously in background.
 *
 * Features:
 * - FusionSelector for AI-powered expert team selection
 * - TemplateGallery for mission template selection
 * - TemplateCustomizer for mission configuration
 * - Full SSE streaming with 12 event types
 * - HITL checkpoints for human approval at critical points
 * - Background execution with notification on completion
 *
 * Updated: December 12, 2025 - Wired to AutonomousView with mission config
 */

import { Suspense, useCallback } from 'react';
import { AutonomousView } from '@/features/ask-expert/views/AutonomousView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        <p className="text-sm text-stone-500">Loading Background Agent...</p>
      </div>
    </div>
  );
}

function Mode4Content() {
  const handleMissionComplete = useCallback((missionId: string, artifacts: unknown[]) => {
    console.log('Mode 4 mission completed:', missionId, 'Artifacts:', artifacts.length);
    // TODO: Show notification or update UI
  }, []);

  const handleMissionFail = useCallback((error: Error) => {
    console.error('Mode 4 mission failed:', error.message);
    // TODO: Show error notification
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <AutonomousView
        mode="mode4"
        tenantId="00000000-0000-0000-0000-000000000001"
        onMissionComplete={handleMissionComplete}
        onMissionFail={handleMissionFail}
      />
    </div>
  );
}

export default function Mode4BackgroundAgentPage() {
  return (
    <ErrorBoundary componentName="Mode4BackgroundAgentPage">
      <Suspense fallback={<LoadingState />}>
        <Mode4Content />
      </Suspense>
    </ErrorBoundary>
  );
}
