'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Approval Required</CardTitle>
          </div>
          <CardDescription>{checkpoint.question || checkpoint.title || 'Please review and approve this action'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkpoint.description && (
            <p className="text-sm text-muted-foreground">{checkpoint.description}</p>
          )}
          {checkpoint.data && (
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
              {typeof checkpoint.data === 'string'
                ? checkpoint.data
                : JSON.stringify(checkpoint.data, null, 2)}
            </pre>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onReject} className="gap-2">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button onClick={onApprove} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MissionCheckpointModal;
