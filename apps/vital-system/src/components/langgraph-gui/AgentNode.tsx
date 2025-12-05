import React from 'react';
import { Handle, Position } from 'reactflow';
import { Bot, X, MoreVertical, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Agent } from '@/lib/stores/agents-store';

interface AgentNodeProps {
  id: string;
  data: {
    agent?: Agent;
    agentId?: string;
    agentName?: string;
    label?: string;
    configured?: boolean;
    enabled?: boolean;
    [key: string]: any;
  };
  selected?: boolean;
  onOpenConfig?: () => void;
  onDelete?: (nodeId: string) => void;
}

/**
 * AgentNode - Custom ReactFlow node for representing AI agents in workflows
 *
 * Visual Appearance:
 * - Purple/violet color scheme to distinguish from task nodes
 * - Robot icon to indicate AI agent
 * - Shows agent tier badge (Tier 1, 2, or 3)
 * - Displays configuration status
 * - Shows agent specialty/domain
 *
 * Features:
 * - Draggable and connectable
 * - Configurable via click or menu button
 * - Deletable with confirmation
 * - Visual feedback for selection and enabled state
 */
export const AgentNode: React.FC<AgentNodeProps> = ({
  id,
  data,
  selected,
  onOpenConfig,
  onDelete,
}) => {
  const { agent, agentId, agentName, label, configured = false, enabled = false } = data;

  // Determine display values
  const displayName = label || agent?.display_name || agentName || 'Select Agent';
  const isConfigured = configured || !!agent;
  const agentTier = agent?.tier || 1;
  const agentDomain = agent?.domain_expertise || 'General';
  const agentAvatar = agent?.avatar || '🤖';
  const agentColor = agent?.color || '#8b5cf6'; // Default purple

  const handleClick = (e: React.MouseEvent) => {
    // Don't open config if clicking on handles, delete button, or menu button
    const target = e.target as HTMLElement;
    if (
      target.closest('.react-flow__handle') ||
      target.closest('.agent-node-delete') ||
      target.closest('.agent-node-menu')
    ) {
      return;
    }

    e.stopPropagation();
    if (onOpenConfig) {
      onOpenConfig();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (window.confirm('Are you sure you want to remove this agent from the workflow?')) {
        onDelete(id);
      }
    }
  };

  const handleOpenConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenConfig) {
      onOpenConfig();
    }
  };

  // Get tier color
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 2:
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 3:
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-300';
    }
  };

  return (
    <div
      className={cn(
        'group bg-white rounded-lg p-4 min-w-[220px] max-w-[280px] shadow-md border-2 transition-all cursor-pointer relative',
        enabled ? 'border-purple-500 shadow-purple-300/30' : 'border-purple-300',
        selected && 'ring-2 ring-purple-500 ring-offset-2',
        !isConfigured && 'border-dashed',
        'hover:border-purple-500 hover:shadow-lg'
      )}
      onClick={handleClick}
    >
      {/* Connection Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-5 !h-5 !bg-purple-500 !border-[3px] !border-white hover:!w-6 hover:!h-6 transition-all"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-5 !h-5 !bg-purple-500 !border-[3px] !border-white hover:!w-6 hover:!h-6 transition-all"
      />

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto">
        <Button
          variant="default"
          size="icon"
          className="h-6 w-6 bg-purple-600 hover:bg-purple-700 shadow-md agent-node-menu"
          onClick={handleOpenConfig}
          title="Configure agent"
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MoreVertical size={12} />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 shadow-md agent-node-delete"
          onClick={handleDelete}
          title="Remove agent"
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X size={12} />
        </Button>
      </div>

      {/* Header with Icon and Name */}
      <div className="flex items-start gap-3 mb-3">
        {/* Agent Avatar/Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${agentColor}20`,
            color: agentColor,
          }}
        >
          {typeof agentAvatar === 'string' && agentAvatar.startsWith('http') ? (
            <img src={agentAvatar} alt={displayName} className="w-full h-full rounded-lg object-cover" />
          ) : (
            agentAvatar
          )}
        </div>

        {/* Name and Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="font-bold text-sm text-neutral-900 truncate leading-tight">{displayName}</p>
            {isConfigured && (
              <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" title="Configured" />
            )}
            {!isConfigured && (
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" title="Not configured" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Bot size={10} className="text-purple-500" />
            <span className="text-[10px] text-purple-600 uppercase tracking-wider font-medium">AI Agent</span>
          </div>
        </div>
      </div>

      {/* Agent Details */}
      <div className="space-y-2">
        {/* Description or Domain */}
        {agent?.description ? (
          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{agent.description}</p>
        ) : (
          <p className="text-xs text-neutral-500 italic">
            {isConfigured ? `Domain: ${agentDomain}` : 'Click to configure agent'}
          </p>
        )}

        {/* Tier and Capabilities Badges */}
        {isConfigured && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn('text-[11px] px-2 py-0.5 font-medium border', getTierColor(agentTier))}>
              Tier {agentTier}
            </Badge>
            {agent?.capabilities && agent.capabilities.length > 0 && (
              <Badge variant="secondary" className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5">
                {agent.capabilities.length} skill{agent.capabilities.length > 1 ? 's' : ''}
              </Badge>
            )}
            {agent?.rag_enabled && (
              <Badge variant="secondary" className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5">
                RAG
              </Badge>
            )}
          </div>
        )}

        {/* Model Info */}
        {agent?.model && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 font-medium">
              {agent.model}
            </Badge>
          </div>
        )}

        {/* Footer Hint */}
        <div className="text-[11px] text-neutral-500 italic text-center pt-2 border-t border-neutral-200">
          {isConfigured ? 'Click to reconfigure' : 'Click to select agent'}
        </div>
      </div>
    </div>
  );
};
