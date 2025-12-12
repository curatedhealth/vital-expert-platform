'use client';

/**
 * VITAL Platform - Mode 3: Deep Research (Autonomous Manual)
 *
 * User manually selects an expert, then the system executes
 * an autonomous research mission with HITL checkpoints.
 *
 * Features:
 * - ExpertPicker for manual expert selection
 * - TemplateGallery for mission template selection
 * - TemplateCustomizer for mission configuration
 * - Full SSE streaming with 12 event types
 * - HITL checkpoints for human approval at critical points
 * - Progressive disclosure of mission progress
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
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-sm text-muted-foreground">Loading Deep Research...</p>
      </div>
    </div>
  );
}

function Mode3Content() {
  const handleMissionComplete = useCallback((missionId: string, artifacts: unknown[]) => {
    console.log('Mode 3 mission completed:', missionId, 'Artifacts:', artifacts.length);
  }, []);

  const handleMissionFail = useCallback((error: Error) => {
    console.error('Mode 3 mission failed:', error.message);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <AutonomousView
        mode="mode3"
        tenantId="00000000-0000-0000-0000-000000000001"
        onMissionComplete={handleMissionComplete}
        onMissionFail={handleMissionFail}
      />
    </div>
  );
}

export default function Mode3DeepResearchPage() {
  return (
    <ErrorBoundary componentName="Mode3DeepResearchPage">
      <Suspense fallback={<LoadingState />}>
        <Mode3Content />
      </Suspense>
    </ErrorBoundary>
  );
}
