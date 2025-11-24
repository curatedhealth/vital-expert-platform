'use client';

import { useState } from 'react';
import { Palette, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

import { PageHeader } from '@/components/page-header';
import { DesignerProvider } from '@/contexts/designer-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Dynamically import WorkflowBuilder to avoid SSR issues
const WorkflowBuilder = dynamic(
  () => import('@/components/langgraph-gui/WorkflowBuilder').then(mod => ({ default: mod.default })),
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

export default function DesignerPage() {
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
        {/* Migration Info Banner */}
        <Alert variant="default" className="mx-4 mt-4 border-blue-500 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Workflow Designer Migration in Progress</AlertTitle>
          <AlertDescription className="text-blue-800 flex items-center justify-between">
            <span>
              We're migrating to a modern workflow designer. You can try both versions:
            </span>
            <div className="flex gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/designer-legacy'}
                className="bg-amber-100 hover:bg-amber-200 border-amber-300"
              >
                View Legacy Builder
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/designer-modern'}
                className="bg-emerald-100 hover:bg-emerald-200 border-emerald-300"
              >
                View Modern Builder ✨
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Page Header */}
        <PageHeader
          icon={Palette}
          title="Workflow Designer"
          description="Design and build AI agent workflows with LangGraph"
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

