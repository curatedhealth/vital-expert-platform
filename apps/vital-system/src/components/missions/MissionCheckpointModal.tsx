'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VitalHITLCheckpoint } from '@/components/vital-ai-ui/workflow/VitalHITLCheckpoint';

export interface MissionCheckpointModalProps {
  checkpoint: any;
  onApprove: () => void;
  onReject: () => void;
}

export function MissionCheckpointModal({ checkpoint, onApprove, onReject }: MissionCheckpointModalProps) {
  if (!checkpoint) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Approval Required</CardTitle>
          <CardDescription>{checkpoint.question || checkpoint.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <VitalHITLCheckpoint
            checkpoint={checkpoint}
            onApprove={onApprove}
            onReject={onReject}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default MissionCheckpointModal;
