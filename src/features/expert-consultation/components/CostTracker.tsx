'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { CostData } from '@/types/expert-consultation';

interface CostTrackerProps {
  sessionId: string;
}

export function CostTracker({ sessionId }: CostTrackerProps) {
  const [costData, setCostData] = useState<CostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(`/api/ask-expert/stream/${sessionId}`);
    
    eventSource.addEventListener('cost_update', (event) => {
      try {
        const data = JSON.parse(event.data);
        setCostData(data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing cost update:', error);
      }
    });

    eventSource.addEventListener('execution_complete', () => {
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!costData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No cost data available</p>
        </CardContent>
      </Card>
    );
  }

  const percentUsed = costData.budget_used_percent;
  const isWarning = percentUsed >= 90;
  const isCritical = percentUsed >= 95;

  const getStatusIcon = () => {
    if (isCritical) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (isWarning) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (isCritical) return 'text-red-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Tracking
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={isCritical ? 'destructive' : isWarning ? 'secondary' : 'default'}>
              {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Cost Display */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            ${costData.accumulated_cost.toFixed(3)}
          </div>
          <div className="text-sm text-gray-500">
            of ${costData.budget.toFixed(2)} budget
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget Used</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {percentUsed.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={percentUsed} 
            className="h-2"
          />
        </div>

        {/* Remaining Budget */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className="font-medium text-gray-900">
              ${costData.budget_remaining.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cost by Phase */}
        {Object.keys(costData.cost_by_phase).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Cost by Phase</h4>
            <div className="space-y-1">
              {Object.entries(costData.cost_by_phase).map(([phase, cost]) => (
                <div key={phase} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 capitalize">{phase}</span>
                  <span className="font-medium">${cost.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token Usage */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Token Usage</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Input:</span>
              <span className="ml-1 font-medium">{costData.token_usage.input.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-blue-700">Output:</span>
              <span className="ml-1 font-medium">{costData.token_usage.output.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Last Update */}
        {costData.last_update && (
          <div className="text-xs text-gray-500 border-t pt-2">
            Last update: {costData.last_update.phase} phase (+${costData.last_update.cost.toFixed(4)})
          </div>
        )}

        {/* Warning Messages */}
        {isCritical && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Budget exceeded! Execution may be paused.</span>
            </div>
          </div>
        )}
        
        {isWarning && !isCritical && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Approaching budget limit. Consider pausing if needed.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
