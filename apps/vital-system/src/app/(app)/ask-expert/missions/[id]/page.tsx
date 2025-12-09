'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMissionStream } from '@/features/missions/hooks';
import { Button } from '@/components/ui/button';
import { MissionPlanPanel, MissionArtifactsPanel, MissionCheckpointModal } from '@/components/missions';

export default function MissionDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params?.id as string | undefined;
  const { status, plan, artifacts, checkpoint, preflight } = useMissionStream({ missionId });

  const handleCheckpoint = async (action: 'approve' | 'reject' | 'modify', option?: string) => {
    if (!missionId || !checkpoint) return;
    await fetch(`/api/v1/missions/${missionId}/checkpoint/${checkpoint.id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'demo-tenant' },
      body: JSON.stringify({ action, option }),
    });
  };

  return (
    <div className="flex h-screen">
      <MissionPlanPanel plan={plan} currentStep={status.currentStep} preflight={preflight} />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Mission {missionId}</h1>
            <p className="text-sm text-muted-foreground">
              {status.isStreaming ? 'Running...' : 'Completed'}
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/ask-expert/templates')}>
            Back to Templates
          </Button>
        </div>
        <MissionArtifactsPanel artifacts={artifacts} missionId={missionId} isStreaming={status.isStreaming} />
      </div>

      {checkpoint && (
        <MissionCheckpointModal
          checkpoint={checkpoint}
          onApprove={() => handleCheckpoint('approve', checkpoint.options?.[0])}
          onReject={() => handleCheckpoint('reject')}
        />
      )}
    </div>
  );
}
