"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle2 } from 'lucide-react';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-red-50 dark:bg-red-950/20 ${
        selected
          ? 'border-red-600 shadow-lg'
          : 'border-red-400 dark:border-red-700'
      }`}
      style={{ minWidth: '120px' }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-red-500 !border-2 !border-red-600"
        style={{ width: '10px', height: '10px' }}
      />

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-red-900 dark:text-red-100">
            {data.label || 'End'}
          </div>
          {data.description && (
            <div className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
