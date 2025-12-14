'use client';

/**
 * VITAL Platform - Autonomous Mode Page
 *
 * Unified page for Mode 3 (Manual Autonomous) and Mode 4 (Auto Autonomous)
 * - Mode 3: User manually selects expert, autonomous execution
 * - Mode 4: System auto-selects expert team via Fusion, background execution
 *
 * The mode is determined by URL parameter: ?mode=3 or ?mode=4
 * Default is Mode 3 for direct expert interaction.
 *
 * Updated: December 11, 2025 - Now uses canonical AutonomousView component
 */

import { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';
import { AutonomousView, type AutonomousMode } from '@/features/ask-expert/views/AutonomousView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Loader2 } from 'lucide-react';

function AutonomousPageContent({ tenantId }: { tenantId: string }) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');

  // Map URL param to AutonomousMode type
  // ?mode=4 → mode4 (Background), default → mode3 (Deep Research)
  const mode: AutonomousMode = modeParam === '4' ? 'mode4' : 'mode3';

  // Handle mission completion
  const handleMissionComplete = useCallback((missionId: string, artifacts: unknown[]) => {
    console.log('Mission completed:', missionId, 'Artifacts:', artifacts.length);
  }, []);

  // Handle mission failure
  const handleMissionFail = useCallback((error: Error) => {
    console.error('Mission failed:', error.message);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <AutonomousView
        mode={mode}
        tenantId={tenantId}
        onMissionComplete={handleMissionComplete}
        onMissionFail={handleMissionFail}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-stone-500">Loading Autonomous Mode...</p>
      </div>
    </div>
  );
}

export default function AutonomousPage() {
  const tenant = useTenant();

  if (!tenant) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary componentName="AutonomousPage">
      <Suspense fallback={<LoadingState />}>
        <AutonomousPageContent tenantId={tenant.id} />
      </Suspense>
    </ErrorBoundary>
  );
}
