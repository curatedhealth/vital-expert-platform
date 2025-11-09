'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ConditionalPropertiesProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
}

export function ConditionalProperties({ data, onUpdate }: ConditionalPropertiesProps) {
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <Label>Condition</Label>
        <Textarea
          value={data.condition || ''}
          onChange={(e) => onUpdate('condition', e.target.value)}
          placeholder="e.g., result.score > 0.8"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          JavaScript-like expression to evaluate
        </p>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Output Branches</Label>
        <div className="flex gap-2">
          <div className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
            ✓ True Branch
          </div>
          <div className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded">
            ✗ False Branch
          </div>
        </div>
      </div>
    </>
  );
}

