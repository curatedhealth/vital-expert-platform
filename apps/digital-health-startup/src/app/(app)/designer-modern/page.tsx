'use client';

import { useState, useCallback } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { WorkflowDesigner } from '@/features/workflow-designer/components/designer/WorkflowDesigner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { WorkflowDefinition } from '@/features/workflow-designer/types/workflow';

export default function DesignerModernPage() {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | undefined>(undefined);

  const handleSave = useCallback(async (workflow: WorkflowDefinition) => {
    console.log('Saving workflow:', workflow);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          workflow_definition: workflow,
          is_public: false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Workflow saved successfully! ID: ${result.id}`);
        setWorkflow(result.workflow_definition);
      } else {
        const error = await response.json();
        alert(`Failed to save workflow: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow. Please check console for details.');
    }
  }, []);

  const handleExecute = useCallback(async (workflow: WorkflowDefinition) => {
    console.log('Executing workflow:', workflow);
    try {
      // First save the workflow if it doesn't have an ID
      if (!workflow.id) {
        alert('Please save the workflow before executing');
        return;
      }

      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {},
          streaming: true,
          debug: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Workflow execution started! Execution ID: ${result.execution_id}`);
      } else {
        const error = await response.json();
        alert(`Failed to execute workflow: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Failed to execute workflow. Please check console for details.');
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Modern Features Banner */}
      <Alert variant="default" className="mx-4 mt-4 border-emerald-500 bg-emerald-50">
        <Sparkles className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900">Modern Workflow Designer</AlertTitle>
        <AlertDescription className="text-emerald-800">
          You are viewing the <strong>modern workflow designer</strong> with multi-framework support, 
          database integration, and production-ready features. Compare with the{' '}
          <a href="/designer-legacy" className="underline font-semibold">
            legacy builder
          </a>
          {' '}to see the improvements.
        </AlertDescription>
      </Alert>

      {/* Page Header */}
      <PageHeader
        icon={Palette}
        title="Workflow Designer (Modern)"
        description="Production-ready workflow designer with multi-framework support and advanced features"
      />

      {/* Main Content - WorkflowDesigner */}
      <div className="flex-1 overflow-hidden p-4">
        <WorkflowDesigner
          initialWorkflow={workflow}
          mode="editor"
          onSave={handleSave}
          onExecute={handleExecute}
          className="h-full border rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}

