'use client';

/**
 * AgentLifecycleCard - Card for agent monitoring and lifecycle management
 *
 * Displays agent info with status, tier, model, and action buttons.
 * Used in Agent Builder Monitoring tab.
 */

import React from 'react';
import {
  Bot,
  Power,
  PowerOff,
  Trash2,
  Clock,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { AgentStatusIcon } from './agent-status-icon';

export interface AgentLifecycleData {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  tier?: number;
  model?: string;
  temperature?: number;
  is_custom?: boolean;
}

export interface AgentLifecycleCardProps {
  agent: AgentLifecycleData;
  onActivate?: (agent: AgentLifecycleData) => void;
  onDeactivate?: (agent: AgentLifecycleData) => void;
  onDelete?: (agent: AgentLifecycleData) => void;
  onConfigure?: (agent: AgentLifecycleData) => void;
  className?: string;
}

/**
 * AgentLifecycleCard - Agent card with lifecycle actions
 *
 * @example
 * <AgentLifecycleCard
 *   agent={agent}
 *   onActivate={handleActivate}
 *   onDeactivate={handleDeactivate}
 *   onDelete={handleDelete}
 * />
 */
export const AgentLifecycleCard: React.FC<AgentLifecycleCardProps> = ({
  agent,
  onActivate,
  onDeactivate,
  onDelete,
  onConfigure,
  className,
}) => {
  const status = agent.status || 'active';
  const isActive = status === 'active';

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Bot className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-stone-800">
                {agent.display_name || agent.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <AgentStatusIcon status={status} size="sm" />
                <span className="capitalize">{status}</span>
                <span>•</span>
                <span>Tier {agent.tier || 1}</span>
                {agent.is_custom && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs py-0 px-1">
                      Custom
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onConfigure && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfigure(agent)}
                title="Configure"
              >
                <Settings className="h-4 w-4 text-stone-400" />
              </Button>
            )}
            {isActive ? (
              onDeactivate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeactivate(agent)}
                  title="Deactivate"
                >
                  <PowerOff className="h-4 w-4 text-stone-400" />
                </Button>
              )
            ) : (
              onActivate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onActivate(agent)}
                  title="Activate"
                >
                  <Power className="h-4 w-4 text-green-500" />
                </Button>
              )
            )}
            {agent.is_custom && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(agent)}
                title="Delete"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-500 mt-3 line-clamp-2">
          {agent.description || 'No description available'}
        </p>

        {/* Metrics */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Model: {agent.model || 'gpt-4'}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Temp: {agent.temperature ?? 0.7}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

AgentLifecycleCard.displayName = 'AgentLifecycleCard';

export default AgentLifecycleCard;
