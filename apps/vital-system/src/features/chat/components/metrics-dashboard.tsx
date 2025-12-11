'use client';

/**
 * Metrics Dashboard component stub
 * TODO: Implement metrics visualization when chat feature is developed
 */

import React from 'react';

export interface MetricsDashboardProps {
  agentId?: string;
  sessionId?: string;
  className?: string;
}

export interface AgentMetrics {
  responseTime: number;
  tokenCount: number;
  successRate: number;
  errorCount: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  className,
}) => {
  // TODO: Implement metrics fetching and visualization
  return (
    <div className={className}>
      <p className="text-muted-foreground text-sm">
        Metrics dashboard coming soon
      </p>
    </div>
  );
};

export default MetricsDashboard;
