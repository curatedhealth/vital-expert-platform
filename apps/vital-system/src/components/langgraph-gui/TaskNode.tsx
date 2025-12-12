import React from 'react';
import { Handle, Position } from 'reactflow';
import { TaskDefinition } from './TaskLibrary';
import { Workflow, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { WorkflowDefinition } from '@/features/workflow-designer/types/workflow';

interface TaskNodeProps {
  id: string;
  data: {
    task: TaskDefinition;
    enabled?: boolean;
    subflow?: { nodes: any[]; edges: any[] } | null;
    subworkflow?: WorkflowDefinition | null; // Support both naming conventions
    [key: string]: any;
  };
  selected?: boolean;
  updateNodeData?: (data: any) => void;
  onOpenSubflow?: () => void;
  onOpenTaskEditor?: () => void;
  onDelete?: (nodeId: string) => void;
}

export const TaskNode: React.FC<TaskNodeProps> = ({ id, data, selected, onOpenSubflow, onOpenTaskEditor, onDelete }) => {
  const { task, enabled = false, subflow, subworkflow } = data;
  // Support both subflow and subworkflow naming
  const nestedWorkflow = subworkflow || (subflow ? { nodes: subflow.nodes || [], edges: subflow.edges || [] } : null);
  // Check if nested workflow exists and has nodes (excluding input/output)
  const hasSubflow = nestedWorkflow && 
    ((nestedWorkflow as WorkflowDefinition).nodes?.length > 0 || 
     (nestedWorkflow as any).nodes?.length > 0);

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Don't open subflow if clicking on handles, delete button, menu button, or their area
    const target = e.target as HTMLElement;
    if (target.closest('.react-flow__handle') || 
        target.closest('.task-node-delete') || 
        target.closest('.task-node-menu') ||
        target.closest('.task-node-actions')) {
      return;
    }
    // Double click opens subflow
    e.stopPropagation();
    if (onOpenSubflow) {
      onOpenSubflow();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this task?')) {
        onDelete(id);
      }
    }
  };

  const handleOpenEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenTaskEditor) {
      onOpenTaskEditor();
    }
  };

  // Don't add onClick handler - let ReactFlow handle it
  // The delete button has its own onClick that stops propagation

  return (
    <div 
      className={cn(
        "group bg-white rounded-lg p-4 min-w-[200px] shadow-md border-2 transition-all cursor-pointer relative",
        enabled ? "border-green-500 shadow-green-300/30" : "border-neutral-300",
        selected && "ring-2 ring-primary ring-offset-2",
        hasSubflow && "border-l-4 border-l-green-500",
        "hover:border-primary hover:shadow-lg"
      )}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="source" position={Position.Right} className="!w-5 !h-5 !bg-primary !border-[3px] !border-white hover:!w-6 hover:!h-6 transition-all" />
      <Handle type="target" position={Position.Left} className="!w-5 !h-5 !bg-primary !border-[3px] !border-white hover:!w-6 hover:!h-6 transition-all" />
      
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto">
        <Button
          variant="default"
          size="icon"
          className="h-6 w-6 bg-primary hover:bg-primary/90 shadow-md"
          onClick={handleOpenEditor}
          title="Open task editor"
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MoreVertical size={12} />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 shadow-md"
          onClick={handleDelete}
          title="Delete task"
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X size={12} />
        </Button>
      </div>
      
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0 leading-none">{task.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-neutral-900 mb-0.5 leading-tight">{task.name}</div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">{task.category}</div>
        </div>
        {hasSubflow && (
          <Badge 
            variant="secondary" 
            className="bg-green-500 text-white flex items-center gap-1 text-[10px] flex-shrink-0 px-2 py-0.5"
            title="Has nested workflow"
          >
            <Workflow size={10} />
            {(() => {
              const nodeCount = (nestedWorkflow as WorkflowDefinition).nodes?.length || 
                               (nestedWorkflow as any).nodes?.length || 0;
              return `${nodeCount} step${nodeCount !== 1 ? 's' : ''}`;
            })()}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2.5">
        {task.description && (
          <p className="text-xs text-neutral-600 leading-relaxed">{task.description}</p>
        )}
        {task.config?.model && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 font-medium">
              {task.config.model}
            </Badge>
            {task.config.tools && task.config.tools.length > 0 && (
              <Badge variant="default" className="text-[11px] bg-primary text-primary-foreground px-2 py-0.5">
                {task.config.tools.length} tool{task.config.tools.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
        <div className="text-[11px] text-neutral-500 italic text-center pt-2 border-t border-neutral-200">
          {hasSubflow ? 'Double-click to view workflow' : 'Double-click to create workflow'}
        </div>
      </div>
    </div>
  );
};

