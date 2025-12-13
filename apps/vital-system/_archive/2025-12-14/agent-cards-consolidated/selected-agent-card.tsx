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
  compact?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function SelectedAgentCard({
  agent,
  isSelected = false,
  compact = false,
  onRemove,
  onClick,
  className,
}: SelectedAgentCardProps) {
  const displayName = agent.displayName || agent.name;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border transition-all cursor-pointer group bg-white/80 dark:bg-neutral-900/60',
        'hover:shadow-sm hover:-translate-y-0.5',
        compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2.5',
        isSelected
          ? 'border-vital-primary-400 shadow-sm'
          : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800',
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
          size={compact ? 'sm' : 'md'}
          className={cn(
            'rounded-full border border-transparent',
            compact ? 'w-8 h-8' : 'w-10 h-10',
            isSelected ? 'border-vital-primary-300' : 'border-neutral-200'
          )}
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-semibold truncate block',
            isSelected ? 'text-vital-primary-900' : 'text-neutral-900'
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
              : 'hover:bg-neutral-100 text-neutral-500'
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
  compact?: boolean;
  onAgentClick?: (agentId: string) => void;
  onAgentRemove?: (agentId: string) => void;
  className?: string;
}

export function SelectedAgentsList({
  agents,
  selectedAgentIds = [],
  compact = false,
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
          compact={compact}
          onClick={() => onAgentClick?.(agent.id)}
          onRemove={() => onAgentRemove?.(agent.id)}
        />
      ))}
    </div>
  );
}
