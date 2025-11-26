/**
 * Workflow Selector Component for Ask Expert
 * Allows users to select and use workflows created in the designer
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Workflow, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  framework: string;
  workflow_definition: any;
  created_at?: string;
  execution_count?: number;
}

interface WorkflowSelectorProps {
  selectedWorkflowId: string | null;
  onWorkflowChange: (workflowId: string | null) => void;
  className?: string;
}

export function WorkflowSelector({
  selectedWorkflowId,
  onWorkflowChange,
  className,
}: WorkflowSelectorProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Fetch workflows from database
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/workflows');
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Failed to fetch workflows';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || `HTTP ${response.status}`;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } catch (err: any) {
        console.error('[WorkflowSelector] Error fetching workflows:', err);
        setError(err.message || 'Failed to load workflows');
        // Set empty array on error so UI doesn't break
        setWorkflows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // Update selected workflow when ID changes
  useEffect(() => {
    if (selectedWorkflowId) {
      const workflow = workflows.find(w => w.id === selectedWorkflowId);
      setSelectedWorkflow(workflow || null);
    } else {
      setSelectedWorkflow(null);
    }
  }, [selectedWorkflowId, workflows]);

  const handleWorkflowSelect = (workflowId: string) => {
    if (workflowId === 'none') {
      onWorkflowChange(null);
      setSelectedWorkflow(null);
    } else {
      onWorkflowChange(workflowId);
      const workflow = workflows.find(w => w.id === workflowId);
      setSelectedWorkflow(workflow || null);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading workflows...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-destructive">{error}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Workflow className="w-4 h-4 text-muted-foreground" />
      <Select
        value={selectedWorkflowId || 'none'}
        onValueChange={handleWorkflowSelect}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a workflow (optional)">
            {selectedWorkflow ? (
              <div className="flex items-center gap-2">
                <span className="truncate">{selectedWorkflow.name}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedWorkflow.framework}
                </Badge>
              </div>
            ) : (
              'Use individual agents'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Use individual agents</span>
            </div>
          </SelectItem>
          {workflows.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No workflows found. Create one in the Designer.
            </div>
          ) : (
            workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{workflow.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {workflow.framework}
                    </Badge>
                  </div>
                  {workflow.description && (
                    <span className="text-xs text-muted-foreground truncate">
                      {workflow.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedWorkflow && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Workflow className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedWorkflow.name}</DialogTitle>
              <DialogDescription>
                {selectedWorkflow.description || 'Workflow details'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Framework</p>
                  <Badge variant="outline">{selectedWorkflow.framework}</Badge>
                </div>
                {selectedWorkflow.execution_count !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Executions</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedWorkflow.execution_count}
                    </p>
                  </div>
                )}
              </div>
              {selectedWorkflow.workflow_definition?.nodes && (
                <div>
                  <p className="text-sm font-medium mb-2">Workflow Structure</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {selectedWorkflow.workflow_definition.nodes.length} nodes,{' '}
                      {selectedWorkflow.workflow_definition.edges?.length || 0} connections
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

