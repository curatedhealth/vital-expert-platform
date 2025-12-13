'use client';

import dynamic from 'next/dynamic';

// Dynamically import WorkflowDesignerEnhanced to avoid SSR issues
const WorkflowDesignerEnhanced = dynamic(
  () => import('@/features/workflow-designer/components/designer/WorkflowDesignerEnhanced').then(
    mod => ({ default: mod.WorkflowDesignerEnhanced })
  ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Enhanced Workflow Designer...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Enhanced Workflow Designer Page
 * 
 * Modern workflow designer with all capabilities from:
 * - WorkflowBuilder (legacy) - visual workflow design
 * - Ask Panel V1 - AI chatbot integration
 * - React Flow architecture with advanced features
 */
export default function DesignerPage() {
  const handleWorkflowSave = (workflow: any) => {
    console.log('Saving workflow:', workflow);
    // TODO: Implement actual save functionality (API call, DB, etc.)
  };

  const handleWorkflowExecute = (workflow: any) => {
    console.log('Executing workflow:', workflow);
    // TODO: Implement actual execution functionality (API call to ai-engine)
  };

  return (
    <div className="flex h-full flex-col min-h-0 overflow-hidden">
      {/* Main Content - Enhanced Workflow Designer */}
      <div className="flex-1 overflow-hidden min-h-0">
        <WorkflowDesignerEnhanced
          mode="editor"
          onSave={handleWorkflowSave}
          onExecute={handleWorkflowExecute}
          className="h-full"
          apiBaseUrl={process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000'}
        />
      </div>
    </div>
  );
}
