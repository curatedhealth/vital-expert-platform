'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionalNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-all ${
        selected ? 'border-orange-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded bg-orange-100 text-orange-600">
          <GitBranch className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{data.label}</p>
        </div>
      </div>
      
      {data.condition && (
        <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
          {data.condition}
        </p>
      )}
      
      {/* Multiple outputs for true/false branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !left-[30%]"
        style={{ background: '#22c55e' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !left-[70%]"
        style={{ background: '#ef4444' }}
      />
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span className="text-green-600">✓ True</span>
        <span className="text-red-600">✗ False</span>
      </div>
    </div>
  );
});

ConditionalNode.displayName = 'ConditionalNode';

