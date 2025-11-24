'use client';

import { useState } from 'react';
import { Users, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/page-header';
import { DesignerProvider } from '@/contexts/designer-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamically import the ORIGINAL WorkflowBuilder (legacy)
const WorkflowBuilder = dynamic(
  () => import('@/components/langgraph-gui/WorkflowBuilder').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Original Ask Panel V1...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Ask Panel V1 - ORIGINAL Legacy Builder
 * This is the TRUE original Ask Panel V1 with the old WorkflowBuilder component
 * Kept for comparison with the modern /designer view
 */
export default function AskPanelV1Page() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | undefined>(undefined);
  const [key, setKey] = useState(0);

  const handleWorkflowSave = (workflowId: string, workflow: any) => {
    console.log('Saving workflow:', workflowId, workflow);
  };

  const handleWorkflowExecute = (query: string) => {
    console.log('Executing workflow with query:', query);
  };

  const handleWorkflowComplete = (result: any) => {
    console.log('Workflow completed with result:', result);
  };

  const handlePanelSelect = (panelId: string) => {
    console.log('Loading panel:', panelId);
    setSelectedWorkflowId(panelId);
    setKey(prev => prev + 1);
  };

  return (
    <DesignerProvider onPanelSelect={handlePanelSelect}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Info Banner */}
        <Alert variant="default" className="mx-4 mt-4 border-blue-500 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Original Ask Panel V1 (Legacy)</AlertTitle>
          <AlertDescription className="text-blue-800">
            This is the <strong>original Ask Panel V1</strong> with the legacy WorkflowBuilder. 
            Compare with{' '}
            <a href="/designer" className="underline font-semibold">
              /designer
            </a>
            {' '}to see the modern enhanced version.
          </AlertDescription>
        </Alert>

        {/* Page Header */}
        <PageHeader
          icon={Users}
          title="Ask Panel V1 - Original (Legacy)"
          description="Original LangGraph-based panel workflow builder with AI chatbot - kept for comparison"
        />

        {/* Main Content - ORIGINAL WorkflowBuilder */}
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

