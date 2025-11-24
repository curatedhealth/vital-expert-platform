'use client';

import React, { useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/page-header';
import type { WorkflowDefinition } from '@/features/workflow-designer/types/workflow';

// Dynamically import the enhanced designer to avoid SSR issues
const WorkflowDesignerEnhanced = dynamic(
  () => import('@/features/workflow-designer/components/designer/WorkflowDesignerEnhanced').then(mod => ({ default: mod.WorkflowDesignerEnhanced })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Workflow Designer...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Ask Panel V1 - Enhanced Designer Page
 * Visual workflow builder for creating and executing AI-powered panel discussions
 * Now powered by the modern WorkflowDesigner with AI Chatbot and advanced features
 */
export default function AskPanelV1Page() {
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
      // Use the legacy API endpoint for backward compatibility
      const response = await fetch('/api/langgraph-gui/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_definition: workflow,
          inputs: {},
          streaming: true,
          debug: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Workflow execution started!`);
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
    <div className="flex h-full flex-col min-h-0 overflow-hidden">
      <PageHeader
        icon={Sparkles}
        title="AI Panel Designer"
        description="Visual workflow builder for creating and executing AI-powered panel discussions with integrated AI assistant"
      />
      <div className="flex-1 overflow-hidden min-h-0 p-4">
        <WorkflowDesignerEnhanced
          mode="editor"
          onSave={handleSave}
          onExecute={handleExecute}
          apiBaseUrl="/api/langgraph-gui"
          embedded={true}
          className="h-full"
        />
      </div>
    </div>
  );
}

