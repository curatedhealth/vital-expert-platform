'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TaskProperties } from './TaskProperties';
import { ConditionalProperties } from './ConditionalProperties';
import { AgentProperties } from './AgentProperties';
import { RAGProperties } from './RAGProperties';
import { AlertCircle } from 'lucide-react';

interface NodePropertiesProps {
  node: any;
  onUpdate: (key: string, value: any) => void;
}

export function NodeProperties({ node, onUpdate }: NodePropertiesProps) {
  if (!node) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No node selected</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Node Type Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="capitalize">
          {node.type}
        </Badge>
        <span className="text-xs text-muted-foreground">ID: {node.id.slice(0, 8)}...</span>
      </div>

      {/* Node Label */}
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={node.data.label || ''}
          onChange={(e) => onUpdate('label', e.target.value)}
          placeholder="Node label..."
        />
      </div>

      {/* Node-specific properties */}
      {node.type === 'task' && <TaskProperties data={node.data} onUpdate={onUpdate} />}
      {node.type === 'agent' && <AgentProperties data={node.data} onUpdate={onUpdate} />}
      {node.type === 'rag' && <RAGProperties data={node.data} onUpdate={onUpdate} />}
      {node.type === 'conditional' && <ConditionalProperties data={node.data} onUpdate={onUpdate} />}

      {/* Position */}
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              value={Math.round(node.position.x)}
              readOnly
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              value={Math.round(node.position.y)}
              readOnly
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

