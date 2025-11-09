'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot } from 'lucide-react';

export const AgentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md min-w-[200px] transition-all ${
        selected ? 'border-indigo-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded bg-indigo-100 text-indigo-600">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{data.label}</p>
        </div>
      </div>
      
      {data.agents && data.agents.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium text-indigo-700">
            {data.agents[0].name}
          </p>
          <p className="text-xs text-gray-500">{data.agents[0].agent_type}</p>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

