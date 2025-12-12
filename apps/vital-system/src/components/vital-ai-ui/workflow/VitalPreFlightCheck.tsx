'use client';

/**
 * VitalPreFlightCheck component stub
 * Pre-flight validation for mission/workflow execution
 * TODO: Implement full pre-flight checks when workflow feature is developed
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export interface PreFlightCheckItem {
  id: string;
  name: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  message?: string;
}

export interface VitalPreFlightCheckProps {
  checks?: PreFlightCheckItem[];
  isChecking?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function VitalPreFlightCheck({
  checks = [],
  isChecking = false,
  className,
}: VitalPreFlightCheckProps) {
  const getStatusIcon = (status: PreFlightCheckItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (checks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pre-flight Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isChecking ? 'Running checks...' : 'No pre-flight checks configured'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pre-flight Checks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2">
            {getStatusIcon(check.status)}
            <span className="text-sm">{check.name}</span>
            {check.message && (
              <span className="text-xs text-muted-foreground ml-auto">
                {check.message}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default VitalPreFlightCheck;
