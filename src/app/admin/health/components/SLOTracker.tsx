'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { SLOConfig } from '@/services/health-monitoring.service';

interface SLOTrackerProps {
  slo: SLOConfig;
}

export default function SLOTracker({ slo }: SLOTrackerProps) {
  const getBurnRateColor = (burnRate: number) => {
    if (burnRate < 1) return 'text-green-600';
    if (burnRate < 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBurnRateIcon = (burnRate: number) => {
    if (burnRate < 1) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (burnRate < 2) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getErrorBudgetColor = (budget: number) => {
    if (budget > 50) return 'bg-green-500';
    if (budget > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSLOStatus = (target: number, errorBudget: number, burnRate: number) => {
    if (errorBudget <= 0) return 'critical';
    if (burnRate > 2) return 'warning';
    if (burnRate > 1) return 'caution';
    return 'healthy';
  };

  const sloStatus = getSLOStatus(slo.target, slo.errorBudget, slo.burnRate);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{slo.service}</CardTitle>
          <Badge variant={
            sloStatus === 'healthy' ? 'default' :
            sloStatus === 'caution' ? 'secondary' :
            sloStatus === 'warning' ? 'destructive' : 'destructive'
          }>
            {sloStatus.charAt(0).toUpperCase() + sloStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target SLO */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Target SLO</span>
            <span className="font-medium">{slo.target}%</span>
          </div>
          <Progress value={slo.target} className="h-2" />
        </div>

        {/* Error Budget */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Error Budget</span>
            <span className="font-medium">{slo.errorBudget.toFixed(1)}%</span>
          </div>
          <Progress 
            value={slo.errorBudget} 
            className="h-2"
          />
          <div className={`h-2 rounded-full ${getErrorBudgetColor(slo.errorBudget)}`} 
               style={{ width: `${slo.errorBudget}%` }} />
        </div>

        {/* Burn Rate */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Burn Rate</span>
            <div className="flex items-center gap-1">
              {getBurnRateIcon(slo.burnRate)}
              <span className={`font-medium ${getBurnRateColor(slo.burnRate)}`}>
                {slo.burnRate.toFixed(2)}x
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {slo.burnRate < 1 ? 'Budget is increasing' :
             slo.burnRate < 2 ? 'Normal burn rate' :
             'High burn rate - investigate'}
          </div>
        </div>

        {/* Window */}
        <div className="text-sm">
          <span className="text-muted-foreground">Window: </span>
          <span className="font-medium">{slo.window} minutes</span>
        </div>

        {/* Alerts */}
        {sloStatus === 'critical' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error budget exhausted! Immediate action required.
            </AlertDescription>
          </Alert>
        )}

        {sloStatus === 'warning' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High burn rate detected. Monitor closely.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
