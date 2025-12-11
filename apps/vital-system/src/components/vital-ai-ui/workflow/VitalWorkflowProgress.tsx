'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VitalProgressTimeline } from './VitalProgressTimeline';

type StepStatus = 'pending' | 'active' | 'complete' | 'error' | 'skipped';

export interface WorkflowStep {
  id: string;
  name: string;
  status: StepStatus;
  duration?: number;
  description?: string;
}

interface VitalWorkflowProgressProps {
  steps: WorkflowStep[];
  currentStepId?: string;
  totalProgress?: number;
}

/**
 * Lightweight wrapper to show timeline + aggregate progress.
 */
export function VitalWorkflowProgress({
  steps,
  currentStepId,
  totalProgress,
}: VitalWorkflowProgressProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        {typeof totalProgress === 'number' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} />
          </div>
        )}
        <VitalProgressTimeline
          steps={steps.map((s) => ({
            id: s.id,
            title: s.name,
            description: s.description,
            status: s.status,
            duration: s.duration,
          }))}
          currentStepId={currentStepId}
        />
      </CardContent>
    </Card>
  );
}
