'use client';

import { Sparkles, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
      {/* Success Banner - Migration Complete */}
      <Alert variant="default" className="mx-4 mt-4 border-emerald-500 bg-emerald-50">
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900">Enhanced Workflow Designer (Migrated)</AlertTitle>
        <AlertDescription className="text-emerald-800">
          This is the modern workflow designer with all features from the legacy builder and Ask Panel V1 integrated.
          Includes AI chatbot, panel workflows, advanced layout, and more.
        </AlertDescription>
      </Alert>

      {/* Page Header */}
      <PageHeader
        icon={Sparkles}
        title="Workflow Designer"
        description="Visual workflow builder with AI assistance for creating and executing agent workflows"
      />

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
