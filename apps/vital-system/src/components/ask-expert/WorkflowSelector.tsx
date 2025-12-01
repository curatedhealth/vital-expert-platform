/**
 * Ask Expert - Workflow Selector
 *
 * Lightweight selector for user-owned/public workflows, used in the
 * Ask Expert settings panel. It fetches from `/api/workflows` and
 * exposes only the selected workflow id back to the parent.
 */

'use client';

import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  framework?: string | null;
}

interface WorkflowSelectorProps {
  selectedWorkflowId: string | null;
  onWorkflowChange: (workflowId: string | null) => void;
}

export function WorkflowSelector({
  selectedWorkflowId,
  onWorkflowChange,
}: WorkflowSelectorProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/workflows');
        if (!res.ok) {
          throw new Error(`Failed to load workflows (${res.status})`);
        }

        const data = await res.json();
        const items = (data?.workflows ?? []) as Workflow[];

        if (isMounted) {
          setWorkflows(items);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[WorkflowSelector] Failed to load workflows', err);
        setError('Unable to load workflows');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWorkflows();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (value: string) => {
    if (!value) {
      onWorkflowChange(null);
      return;
    }
    onWorkflowChange(value);
  };

  if (loading) {
    return (
      <div className="text-xs text-muted-foreground">
        Loading workflows…
      </div>
    );
  }

  if (error || workflows.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        {error ?? 'No workflows available yet.'}
      </div>
    );
  }

  return (
    <Select
      value={selectedWorkflowId ?? ''}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a workflow (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">No workflow</SelectItem>
        {workflows.map((workflow) => (
          <SelectItem key={workflow.id} value={workflow.id}>
            {workflow.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


