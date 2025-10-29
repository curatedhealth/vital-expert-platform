'use client';

import { X } from 'lucide-react';
import { AgentAvatar } from '@vital/ui';
import { cn } from '@/lib/utils';

interface SelectedAgentCardProps {
  agent: {
    id: string;
    name: string;
    displayName?: string;
    avatar?: string;
  };
  isSelected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function SelectedAgentCard({
  agent,
  isSelected = false,
  onRemove,
  onClick,
  className,
}: SelectedAgentCardProps) {
  const displayName = agent.displayName || agent.name;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer group',
        'hover:shadow-md hover:scale-[1.02]',
        isSelected
          ? 'bg-vital-primary-100 border-vital-primary-500 text-vital-primary-900 shadow-sm'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <AgentAvatar
          agent={agent}
          size="md"
          className="w-10 h-10 rounded-lg border-2 border-gray-200 group-hover:border-vital-primary-300"
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-semibold truncate block',
            isSelected ? 'text-vital-primary-900' : 'text-gray-900'
          )}
        >
          {displayName}
        </span>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'opacity-0 group-hover:opacity-100',
            isSelected
              ? 'hover:bg-vital-primary-200 text-vital-primary-700'
              : 'hover:bg-gray-100 text-gray-500'
          )}
          aria-label={`Remove ${displayName}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface SelectedAgentsListProps {
  agents: Array<{
    id: string;
    name: string;
    displayName?: string;
    avatar?: string;
  }>;
  selectedAgentIds?: string[];
  onAgentClick?: (agentId: string) => void;
  onAgentRemove?: (agentId: string) => void;
  className?: string;
}

export function SelectedAgentsList({
  agents,
  selectedAgentIds = [],
  onAgentClick,
  onAgentRemove,
  className,
}: SelectedAgentsListProps) {
  if (agents.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {agents.map((agent) => (
        <SelectedAgentCard
          key={agent.id}
          agent={agent}
          isSelected={selectedAgentIds.includes(agent.id)}
          onClick={() => onAgentClick?.(agent.id)}
          onRemove={() => onAgentRemove?.(agent.id)}
        />
      ))}
    </div>
  );
}
