/**
 * Custom Workflow Node Component
 * 
 * React Flow custom node for workflow nodes
 */

'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { getNodeTypeDefinition } from '../../constants/node-types';
import type { NodeType, NodeConfig } from '../../types/workflow';

interface WorkflowNodeData {
  id: string;
  type: NodeType;
  label: string;
  config: NodeConfig;
  position: { x: number; y: number };
  status?: 'pending' | 'running' | 'completed' | 'error';
}

interface WorkflowNodeProps {
  data: WorkflowNodeData;
  isConnectable: boolean;
  selected: boolean;
}

export const WorkflowNode = memo(({ data, isConnectable, selected }: WorkflowNodeProps) => {
  const nodeDef = getNodeTypeDefinition(data.type);

  // Defensive: if node type not found, return null or use a fallback
  if (!nodeDef) {
    console.warn(`Unknown node type: ${data.type}`);
    return null;
  }

  const Icon = nodeDef.icon;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return '';
    }
  };

  const hasInputs = data.type !== 'start';
  const hasOutputs = data.type !== 'end';

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 shadow-md min-w-[200px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
        ${getStatusColor(data.status)}
      `}
      style={{
        backgroundColor: nodeDef.bgColor,
        borderColor: selected ? nodeDef.color : nodeDef.borderColor,
      }}
    >
      {/* Input Handle */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-3 h-3"
          style={{ background: nodeDef.color }}
        />
      )}

      {/* Node Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${nodeDef.color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: nodeDef.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-neutral-900 truncate">
            {data.label}
          </div>
          <Badge 
            variant="outline" 
            className="text-[10px] px-1 py-0 mt-0.5"
          >
            {data.type}
          </Badge>
        </div>
      </div>

      {/* Node Description */}
      {data.config.description && (
        <p className="text-xs text-neutral-600 mt-2 line-clamp-2">
          {data.config.description}
        </p>
      )}

      {/* Node Config Preview */}
      {data.type === 'agent' && data.config.model && (
        <div className="mt-2 pt-2 border-t border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>{data.config.model}</span>
            {data.config.temperature !== undefined && (
              <span>T: {data.config.temperature}</span>
            )}
          </div>
        </div>
      )}

      {data.type === 'tool' && data.config.toolName && (
        <div className="mt-2 pt-2 border-t border-neutral-200">
          <div className="text-xs text-neutral-600 truncate">
            Tool: {data.config.toolName}
          </div>
        </div>
      )}

      {/* Output Handle */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-3 h-3"
          style={{ background: nodeDef.color }}
        />
      )}

      {/* Status Indicator */}
      {data.status && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          style={{
            backgroundColor: 
              data.status === 'running' ? '#3b82f6' :
              data.status === 'completed' ? '#22c55e' :
              data.status === 'error' ? '#ef4444' :
              '#9ca3af'
          }}
        />
      )}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';

