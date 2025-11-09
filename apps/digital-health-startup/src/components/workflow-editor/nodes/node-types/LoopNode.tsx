'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RefreshCw } from 'lucide-react';

export const LoopNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-all ${
        selected ? 'border-pink-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded bg-pink-100 text-pink-600">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{data.label}</p>
        </div>
      </div>
      
      {data.iterations && (
        <p className="text-xs text-gray-500 mt-1">
          Repeat: <span className="font-semibold">{data.iterations}x</span>
        </p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

LoopNode.displayName = 'LoopNode';

