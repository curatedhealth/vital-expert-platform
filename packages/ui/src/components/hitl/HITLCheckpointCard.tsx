'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { useState } from 'react';

export interface HITLCheckpoint {
  checkpointId: string;
  title: string;
  description?: string;
  type?: string;
  isBlocking?: boolean;
}

export interface HITLCheckpointCardProps {
  checkpoint: HITLCheckpoint;
  onApprove: (feedback?: string) => void;
  onReject: (reason: string) => void;
  onModify?: (modifications: string) => void;
}

export function HITLCheckpointCard({
  checkpoint,
  onApprove,
  onReject,
  onModify,
}: HITLCheckpointCardProps) {
  const [feedback, setFeedback] = useState('');
  const [modifications, setModifications] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{checkpoint.title}</CardTitle>
        {checkpoint.description ? <CardDescription>{checkpoint.description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{checkpoint.type ?? 'checkpoint'}</span>
          {checkpoint.isBlocking ? <span className="rounded-full bg-amber-100 px-2 py-0.5">Blocking</span> : null}
        </div>

        <Textarea
          placeholder="Add feedback or notes (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        {onModify ? (
          <Textarea
            placeholder="Suggest modifications (optional)"
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
          />
        ) : null}

        <Textarea
          placeholder="Provide rejection reason (required for reject)"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onApprove(feedback || undefined)}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!onModify || !modifications.trim()}
            onClick={() => onModify?.(modifications)}
          >
            Request Changes
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={!rejectionReason.trim()}
            onClick={() => onReject(rejectionReason)}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
