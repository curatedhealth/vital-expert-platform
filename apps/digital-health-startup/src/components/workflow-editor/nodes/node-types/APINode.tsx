'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Cloud } from 'lucide-react';

export const APINode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-all ${
        selected ? 'border-gray-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded bg-gray-100 text-gray-600">
          <Cloud className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{data.label}</p>
        </div>
      </div>
      
      {data.endpoint && (
        <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded truncate">
          {data.endpoint}
        </p>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

APINode.displayName = 'APINode';

