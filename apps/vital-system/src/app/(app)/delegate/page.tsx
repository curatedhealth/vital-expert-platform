'use client';

/**
 * VITAL Delegate Service (/delegate)
 *
 * Deep research and background task execution (Mode 3 & 4)
 * - Mode 3: Deep Research - Agent selected, autonomous multi-step execution
 * - Mode 4: Background Tasks - AI selects expert, runs in background
 *
 * Uses the AutonomousView component from features/ask-expert
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useTenant } from '@/contexts/tenant-context';
import { AutonomousView, type AutonomousMode } from '@/features/ask-expert/views/AutonomousView';
import { ErrorBoundary } from '@/features/ask-expert/components/errors';
import { Suspense, useCallback, useState, useEffect } from 'react';
import { Loader2, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Loading Component
// ============================================================================

function DelegateLoadingState() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-muted-foreground">Loading Delegate Service...</p>
      </div>
    </div>
  );
}

// ============================================================================
// Mode Selection Component
// ============================================================================

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  mode: 'mode3' | 'mode4';
  isSelected: boolean;
  onClick: () => void;
  gradient: string;
}

function ModeCard({ title, description, icon: Icon, mode, isSelected, onClick, gradient }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-4 p-6 rounded-xl border-2 text-left transition-all",
        "hover:shadow-lg hover:scale-[1.02]",
        isSelected ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-border hover:border-purple-300"
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white", gradient)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </button>
  );
}

// ============================================================================
// Main Content
// ============================================================================

function DelegateContent({ tenantId }: { tenantId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get mode from URL params (default to mode selection)
  const modeParam = searchParams.get('mode');
  const mode: AutonomousMode | null = modeParam === 'deep-research' ? 'mode3' :
                                       modeParam === 'background' ? 'mode4' : null;

  // Handle mode selection
  const handleModeSelect = useCallback((selectedMode: 'mode3' | 'mode4') => {
    const modeValue = selectedMode === 'mode3' ? 'deep-research' : 'background';
    router.push(`/delegate?mode=${modeValue}`);
  }, [router]);

  // Handle mode change (back to selection)
  const handleModeChange = useCallback(() => {
    router.push('/delegate');
  }, [router]);

  // If no mode selected, show mode selection
  if (!mode) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">Delegate a Task</h1>
            <p className="text-muted-foreground text-lg">
              Choose how you want AI to handle your complex research or background tasks
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ModeCard
              title="Deep Research"
              description="Multi-step autonomous research with human checkpoints. Perfect for comprehensive analysis and reports."
              icon={Brain}
              mode="mode3"
              isSelected={false}
              onClick={() => handleModeSelect('mode3')}
              gradient="from-purple-500 to-indigo-600"
            />
            <ModeCard
              title="Background Task"
              description="AI selects the best expert and runs tasks in the background. Get notified when complete."
              icon={Zap}
              mode="mode4"
              isSelected={false}
              onClick={() => handleModeSelect('mode4')}
              gradient="from-amber-500 to-orange-600"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AutonomousView
      tenantId={tenantId}
      mode={mode}
      onModeChange={handleModeChange}
    />
  );
}

// ============================================================================
// Page with Tenant Context
// ============================================================================

function DelegatePageWithTenant() {
  const { tenantId, isLoading: tenantLoading } = useTenant();

  if (tenantLoading) {
    return <DelegateLoadingState />;
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No tenant configured</p>
      </div>
    );
  }

  return <DelegateContent tenantId={tenantId} />;
}

// ============================================================================
// Page Export with Suspense
// ============================================================================

export default function DelegatePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DelegateLoadingState />}>
        <DelegatePageWithTenant />
      </Suspense>
    </ErrorBoundary>
  );
}
