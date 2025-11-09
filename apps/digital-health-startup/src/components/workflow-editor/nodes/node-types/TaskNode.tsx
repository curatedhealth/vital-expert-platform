'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckSquare } from 'lucide-react';

export const TaskNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded bg-blue-100 text-blue-600">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{data.label}</p>
        </div>
      </div>
      
      {data.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{data.description}</p>
      )}

      {/* Show agent/tool/rag counts if present */}
      {(data.agents?.length > 0 || data.tools?.length > 0 || data.rags?.length > 0) && (
        <div className="flex gap-1 mt-2">
          {data.agents?.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
              {data.agents.length} agent{data.agents.length !== 1 ? 's' : ''}
            </span>
          )}
          {data.tools?.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
              {data.tools.length} tool{data.tools.length !== 1 ? 's' : ''}
            </span>
          )}
          {data.rags?.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded">
              {data.rags.length} RAG{data.rags.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

