"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play } from 'lucide-react';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-green-50 dark:bg-green-950/20 ${
        selected
          ? 'border-green-600 shadow-lg'
          : 'border-green-400 dark:border-green-700'
      }`}
      style={{ minWidth: '120px' }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
          <Play className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-green-900 dark:text-green-100">
            {data.label || 'Start'}
          </div>
          {data.description && (
            <div className="text-xs text-green-700 dark:text-green-300 mt-0.5">
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-green-500 !border-2 !border-green-600"
        style={{ width: '10px', height: '10px' }}
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';
