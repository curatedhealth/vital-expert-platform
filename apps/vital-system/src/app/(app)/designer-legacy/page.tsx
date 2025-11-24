'use client';

import { useState } from 'react';
import { Palette, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

import { PageHeader } from '@/components/page-header';
import { DesignerProvider } from '@/contexts/designer-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamically import WorkflowBuilder to avoid SSR issues
const WorkflowBuilder = dynamic(
  () => import('@/components/langgraph-gui/WorkflowBuilder').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Legacy Workflow Builder...</p>
        </div>
      </div>
    ),
  }
);

export default function DesignerLegacyPage() {
  // State to track which workflow/panel is currently selected
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | undefined>(undefined);
  const [key, setKey] = useState(0); // Used to force re-render of WorkflowBuilder

  const handleWorkflowSave = (workflowId: string, workflow: any) => {
    console.log('Saving workflow:', workflowId, workflow);
    // TODO: Implement actual save functionality
  };

  const handleWorkflowExecute = (query: string) => {
    console.log('Executing workflow with query:', query);
    // TODO: Implement actual execution functionality
  };

  const handleWorkflowComplete = (result: any) => {
    console.log('Workflow completed with result:', result);
    // TODO: Handle workflow completion
  };

  // Handle panel/workflow selection from sidebar
  const handlePanelSelect = (panelId: string) => {
    console.log('Loading panel:', panelId);
    setSelectedWorkflowId(panelId);
    // Increment key to force WorkflowBuilder to re-render with new workflow
    setKey(prev => prev + 1);
  };

  return (
    <DesignerProvider onPanelSelect={handlePanelSelect}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Legacy Warning Banner */}
        <Alert variant="default" className="mx-4 mt-4 border-amber-500 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Legacy Workflow Builder</AlertTitle>
          <AlertDescription className="text-amber-800">
            You are viewing the <strong>legacy workflow builder</strong>. This version is being deprecated. 
            Please compare with the{' '}
            <a href="/designer-modern" className="underline font-semibold">
              modern workflow designer
            </a>
            {' '}for new features and improvements.
          </AlertDescription>
        </Alert>

        {/* Page Header */}
        <PageHeader
          icon={Palette}
          title="Workflow Designer (Legacy)"
          description="Original LangGraph-based workflow builder with AI chatbot and panel workflows"
        />

        {/* Main Content - WorkflowBuilder */}
        <div className="flex-1 overflow-hidden">
          <WorkflowBuilder
            key={key}
            initialWorkflowId={selectedWorkflowId}
            onWorkflowSave={handleWorkflowSave}
            onWorkflowExecute={handleWorkflowExecute}
            onWorkflowComplete={handleWorkflowComplete}
            embedded={false}
          />
        </div>
      </div>
    </DesignerProvider>
  );
}

