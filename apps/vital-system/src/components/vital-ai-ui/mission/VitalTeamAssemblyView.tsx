'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamExpert {
  id: string;
  name: string;
  role?: string;
  confidence?: number;
}

interface VitalTeamAssemblyViewProps {
  experts: TeamExpert[];
  isAssembling?: boolean;
}

export function VitalTeamAssemblyView({ experts, isAssembling }: VitalTeamAssemblyViewProps) {
  return (
    <div className="space-y-3" data-testid="team-assembly">
      {experts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 py-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {isAssembling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Assembling optimal team...
              </>
            ) : (
              'Waiting for team selection...'
            )}
          </CardContent>
        </Card>
      )}

      {experts.map((expert) => (
        <Card key={expert.id} className="border border-muted">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">{expert.name}</div>
                {expert.role && <div className="text-xs text-muted-foreground">{expert.role}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {expert.confidence !== undefined && (
                <Badge variant="outline" className={cn('text-xs')}>
                  {(expert.confidence * 100).toFixed(0)}%
                </Badge>
              )}
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default VitalTeamAssemblyView;
