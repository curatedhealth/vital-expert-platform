'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface WorkflowPropertiesProps {
  title: string;
  description: string;
  nodeCount: number;
  agentCount: number;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function WorkflowProperties({
  title,
  description,
  nodeCount,
  agentCount,
  onTitleChange,
  onDescriptionChange,
}: WorkflowPropertiesProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label>Workflow Title</Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter workflow title..."
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what this workflow does..."
          rows={4}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Statistics</Label>
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold">{nodeCount}</div>
              <div className="text-xs text-muted-foreground">Total Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold">{agentCount}</div>
              <div className="text-xs text-muted-foreground">AI Agents</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

