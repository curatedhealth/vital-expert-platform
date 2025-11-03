/**
 * Workflow Designer Page
 * 
 * Main page for creating and editing workflows
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkflowDesigner } from '@/features/workflow-designer/components/designer/WorkflowDesigner';
import { workflowService } from '@/features/workflow-designer/services/workflow-service';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowDefinition } from '@/features/workflow-designer/types/workflow';

export default function WorkflowDesignerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');
  
  const [workflow, setWorkflow] = useState<WorkflowDefinition | undefined>();
  const [isLoading, setIsLoading] = useState(!!workflowId);
  const [isSaving, setIsSaving] = useState(false);

  // Load workflow if ID is provided
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await workflowService.getWorkflow(id);
      setWorkflow(data.workflow_definition);
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedWorkflow: WorkflowDefinition) => {
    try {
      setIsSaving(true);
      
      if (workflowId) {
        // Update existing
        await workflowService.updateWorkflow(workflowId, updatedWorkflow);
        toast.success('Workflow updated successfully');
      } else {
        // Create new
        const created = await workflowService.createWorkflow(updatedWorkflow);
        toast.success('Workflow created successfully');
        router.push(`/workflow-designer?id=${created.id}`);
      }
      
      setWorkflow(updatedWorkflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async (workflow: WorkflowDefinition) => {
    if (!workflowId) {
      toast.error('Please save the workflow before executing');
      return;
    }

    try {
      toast.info('Executing workflow...');
      const response = await workflowService.executeWorkflow(workflowId, {});
      
      // Navigate to execution view
      router.push(`/workflow-designer/execution?id=${workflowId}`);
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/workflows')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {workflow?.name || 'New Workflow'}
            </h1>
            <p className="text-sm text-gray-600">
              {workflow?.framework || 'LangGraph'} Workflow Designer
            </p>
          </div>
        </div>
      </div>

      {/* Designer */}
      <div className="flex-1 overflow-hidden">
        <WorkflowDesigner
          initialWorkflow={workflow}
          mode="editor"
          onSave={handleSave}
          onExecute={handleExecute}
          className="h-full"
        />
      </div>
    </div>
  );
}

