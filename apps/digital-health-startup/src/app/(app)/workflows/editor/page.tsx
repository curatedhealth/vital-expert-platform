'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { WorkflowEditor } from '@/components/workflow-editor/WorkflowEditor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflowEditorStore } from '@/lib/stores/workflow-editor-store';
import { 
  Save, 
  CheckCircle, 
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowEditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <WorkflowEditorContent />
    </Suspense>
  );
}

function WorkflowEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = (searchParams.get('mode') as 'create' | 'edit' | 'template') || 'create';
  const workflowId = searchParams.get('id');
  const useCaseId = searchParams.get('useCase');
  const templateId = searchParams.get('template');
  
  const {
    workflowTitle,
    isDirty,
    isSaving,
    saveWorkflow,
    publishWorkflow,
    setUseCaseId,
  } = useWorkflowEditorStore();
  
  // Set use case ID if provided
  useEffect(() => {
    if (useCaseId) {
      setUseCaseId(useCaseId);
    }
  }, [useCaseId, setUseCaseId]);
  
  const handleSave = async () => {
    try {
      await saveWorkflow();
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };
  
  const handlePublish = async () => {
    try {
      await publishWorkflow();
      toast.success('Workflow published successfully');
      router.push('/workflows');
    } catch (error) {
      toast.error('Failed to publish workflow');
    }
  };
  
  const handleBack = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                {mode === 'create' ? 'Create Workflow' : 'Edit Workflow'}
                {isDirty && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved changes
                  </span>
                )}
              </h1>
              {workflowTitle && (
                <p className="text-sm text-muted-foreground">{workflowTitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={isSaving || !isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={handlePublish} disabled={isSaving}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Editor */}
      <WorkflowEditor
        mode={mode}
        workflowId={workflowId}
        useCaseId={useCaseId}
        templateId={templateId}
      />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <Skeleton className="w-64 h-full" />
        <Skeleton className="flex-1 h-full" />
        <Skeleton className="w-80 h-full" />
      </div>
    </div>
  );
}

