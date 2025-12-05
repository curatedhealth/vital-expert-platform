'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

interface WorkflowFlowVisualizerProps {
  workflows: any[];
  tasksByWorkflow: Record<string, any[]>;
  useCaseTitle: string;
}

export function WorkflowFlowVisualizer({ workflows, tasksByWorkflow, useCaseTitle }: WorkflowFlowVisualizerProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <GitBranch className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Flow Diagram
        </h3>
        <p className="text-neutral-600 mb-4">
          Interactive workflow visualization for <strong>{useCaseTitle}</strong>
        </p>
        <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-900">
            <strong>{workflows.length}</strong> workflow{workflows.length !== 1 ? 's' : ''} • 
            <strong className="ml-1">{Object.values(tasksByWorkflow).reduce((sum, tasks) => sum + tasks.length, 0)}</strong> total tasks
          </p>
        </div>
        <p className="text-sm text-neutral-500 mt-6 italic">
          Flow visualization coming soon
        </p>
      </CardContent>
    </Card>
  );
}

