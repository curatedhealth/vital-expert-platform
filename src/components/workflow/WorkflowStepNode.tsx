'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  User,
  Settings,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Trash2,
  Edit3
} from 'lucide-react';
import { EnhancedWorkflowStep } from '@/types/workflow-enhanced';
import { Agent } from '@/lib/agents/agent-service';

interface WorkflowStepNodeData {
  step: EnhancedWorkflowStep;
  agent?: Agent;
  capabilities?: string[];
  isSelected?: boolean;
  onSelect?: (stepId: string) => void;
  onUpdate?: (updates: Partial<EnhancedWorkflowStep>) => void;
  onDelete?: () => void;
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
}

export const WorkflowStepNode: React.FC<NodeProps<WorkflowStepNodeData>> = ({
  data,
  selected,
  id
}) => {
  const { step, agent, capabilities, isSelected, onSelect, onUpdate, onDelete, status = 'idle' } = data;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(step.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(step.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'failed':
        return 'border-red-500 bg-red-50';
      case 'paused':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return selected || isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white';
    }
  };

  const getAgentTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-purple-100 text-purple-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="workflow-step-node">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      <Card
        className={`w-80 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor()}`}
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon()}
                <span className="text-xs font-medium text-gray-500">
                  Step {step.step_number}
                </span>
              </div>
              <h3 className="font-semibold text-sm leading-tight">
                {step.step_name}
              </h3>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleEdit}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Step Description */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {step.step_description || 'No description provided'}
          </p>

          {/* Duration */}
          <div className="flex items-center space-x-1 mb-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {step.estimated_duration || 30} min
            </span>
          </div>

          {/* Agent Assignment */}
          {agent ? (
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-700 font-medium">
                {agent.name}
              </span>
              <Badge size="sm" className={getAgentTierColor(agent.tier || 3)}>
                Tier {agent.tier || 3}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {step.agent_selection?.strategy === 'automatic' ? 'Auto-select' : 'No agent'}
              </span>
            </div>
          )}

          {/* Required Capabilities */}
          {capabilities && capabilities.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Required capabilities:</span>
              <div className="flex flex-wrap gap-1">
                {capabilities.slice(0, 3).map((capability, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-1 py-0"
                  >
                    {capability.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {capabilities.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{capabilities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Conditional Logic Indicator */}
          {step.conditional_next && step.conditional_next.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center">
                <Settings className="w-3 h-3 mr-1" />
                {step.conditional_next.length} condition(s)
              </span>
            </div>
          )}

          {/* Parallel Execution Indicator */}
          {step.is_parallel && (
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                Parallel execution
              </Badge>
            </div>
          )}

          {/* Validation Errors */}
          {step.validation_rules && step.validation_rules.some(rule => rule.severity === 'error') && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Has validation errors
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
    </div>
  );
};