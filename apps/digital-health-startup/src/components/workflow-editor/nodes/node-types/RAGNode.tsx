'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database } from 'lucide-react';

export const RAGNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md min-w-[200px] transition-all ${
        selected ? 'border-cyan-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded bg-cyan-100 text-cyan-600">
          <Database className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{data.label}</p>
        </div>
      </div>
      
      {data.rags && data.rags.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium text-cyan-700">
            {data.rags[0].name}
          </p>
          <p className="text-xs text-gray-500">{data.rags[0].source_type}</p>
          {data.rags[0].domain && (
            <p className="text-xs text-gray-400">{data.rags[0].domain}</p>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

RAGNode.displayName = 'RAGNode';

