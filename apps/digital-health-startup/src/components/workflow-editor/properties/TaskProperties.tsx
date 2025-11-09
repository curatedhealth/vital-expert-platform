'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface TaskPropertiesProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
}

export function TaskProperties({ data, onUpdate }: TaskPropertiesProps) {
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description || ''}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Task description..."
          rows={3}
        />
      </div>

      {data.agents?.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Assigned Agents</Label>
          {data.agents.map((agent: any) => (
            <div key={agent.id} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
              {agent.name}
            </div>
          ))}
        </div>
      )}

      {data.tools?.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Assigned Tools</Label>
          {data.tools.map((tool: any) => (
            <div key={tool.id} className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded">
              {tool.name}
            </div>
          ))}
        </div>
      )}

      {data.rags?.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Assigned RAGs</Label>
          {data.rags.map((rag: any) => (
            <div key={rag.id} className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded">
              {rag.name}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

