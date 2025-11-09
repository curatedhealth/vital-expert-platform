'use client';

import { useEffect } from 'react';
import { useWorkflowEditorStore } from '@/lib/stores/workflow-editor-store';
import { NodePalette } from './node-palette/NodePalette';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesPanel } from './properties/PropertiesPanel';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkflowEditorProps {
  mode: 'create' | 'edit' | 'template';
  workflowId?: string | null;
  useCaseId?: string | null;
  templateId?: string | null;
}

export function WorkflowEditor({
  mode,
  workflowId,
  useCaseId,
  templateId,
}: WorkflowEditorProps) {
  const { isLoading, loadWorkflow, reset } = useWorkflowEditorStore();

  useEffect(() => {
    const initializeEditor = async () => {
      if (mode === 'edit' && workflowId) {
        await loadWorkflow(workflowId);
      } else if (mode === 'template' && templateId) {
        // TODO: Load template
        console.log('Loading template:', templateId);
      } else if (mode === 'create') {
        // Start fresh
        reset();
      }
    };

    initializeEditor();
  }, [mode, workflowId, templateId, loadWorkflow, reset]);

  if (isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Node Palette */}
      <NodePalette />

      {/* Center: Canvas */}
      <EditorCanvas />

      {/* Right: Properties Panel */}
      <PropertiesPanel />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex-1 flex">
      <Skeleton className="w-64 h-full" />
      <Skeleton className="flex-1 h-full" />
      <Skeleton className="w-80 h-full" />
    </div>
  );
}

