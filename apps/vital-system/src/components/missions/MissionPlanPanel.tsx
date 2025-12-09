'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VitalWorkflowProgress } from '@/components/vital-ai-ui/workflow/VitalWorkflowProgress';
import { VitalPreFlightCheck } from '@/components/vital-ai-ui/workflow/VitalPreFlightCheck';

export interface MissionPlanPanelProps {
  plan: any[];
  currentStep: number;
  preflight?: any | null;
  title?: string;
  description?: string;
}

export function MissionPlanPanel({
  plan,
  currentStep,
  preflight,
  title,
  description,
}: MissionPlanPanelProps) {
  return (
    <div className="w-full max-w-sm border-r bg-muted/20 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{title ?? 'Mission Plan'}</h2>
        <p className="text-sm text-muted-foreground">{description ?? 'Live execution steps'}</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <VitalWorkflowProgress steps={plan || []} currentStep={currentStep} totalSteps={plan?.length || 0} />
          {preflight && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pre-flight</CardTitle>
                <CardDescription>Safety gate (Mode 4)</CardDescription>
              </CardHeader>
              <CardContent>
                <VitalPreFlightCheck checks={preflight.checks} passed={preflight.passed} />
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default MissionPlanPanel;
