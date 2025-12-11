'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, UserCircle2 } from 'lucide-react';

export interface DelegationStep {
  id: string;
  from: string;
  to: string;
  task: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface VitalDelegationFlowProps {
  steps?: DelegationStep[];
}

/**
 * Minimal delegation flow renderer used by Mode 3/4 pages.
 * Shows who delegated to whom and the current status.
 */
export function VitalDelegationFlow({ steps = [] }: VitalDelegationFlowProps) {
  if (!steps.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Delegations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No delegation activity yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Delegation Trace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-2">
            <UserCircle2 className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{step.from}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>{step.to}</span>
                <Badge variant="outline" className="text-[11px]">
                  {step.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{step.task}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
