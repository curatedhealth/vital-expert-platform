'use client';

import { ShoppingCart, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@vital/ui';
import { Separator } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface Agent {
  id: string;
  name: string;
  avatar: string;
}

interface NavAiAgentsProps {
  onAgentStoreClick: () => void;
  onCreateAgentClick: () => void;
  onAgentSelect?: (agentId: string) => void;
  onAgentRemove?: (agentId: string) => void;
  selectedAgentId?: string;
  agents?: Agent[];
  isCollapsed?: boolean;
  mounted?: boolean;
}

// Agents will be passed as props from the chat store

export function NavAiAgents({ onAgentStoreClick, onCreateAgentClick, onAgentSelect, onAgentRemove, selectedAgentId, agents = [], isCollapsed = false, mounted = false }: NavAiAgentsProps) {
  // Use the mounted prop passed from parent instead of local state
  const safeAgents = mounted ? agents : [];

  // Debug: Log agent data when component renders
  React.useEffect(() => {
    if (mounted && safeAgents.length > 0) {
      console.log('🔍 [NavAiAgents] Agents in sidebar:', safeAgents.map(a => ({ id: a.id, name: a.name })));
    }
  }, [mounted, safeAgents]);

  const handleAgentClick = (agent: Agent) => {
    console.log('👆 [NavAiAgents] Clicked agent:', agent.name, 'id:', agent.id);
    onAgentSelect?.(agent.id);
  };

  return (
    <div className="px-3 flex flex-col">
      <div className="space-y-1 flex flex-col">
        <div className="flex items-center justify-between mb-2 px-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {!isCollapsed && "My Agents"}
          </h2>
          {!isCollapsed && safeAgents.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {safeAgents.length} agent{safeAgents.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {/* Scrollable agent list with max height */}
        <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {!mounted || safeAgents.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              {!isCollapsed && (mounted ? "No agents added yet. Visit Agent Store to add some." : "Loading agents...")}
            </div>
          ) : (
            safeAgents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <div key={agent.id} className="group relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      'transition-colors',
                      isCollapsed
                        ? 'mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-transparent'
                        : 'w-full justify-start pr-8',
                      isSelected &&
                        (isCollapsed
                          ? 'border-blue-300 bg-blue-100 text-blue-900'
                          : 'bg-blue-100 border border-blue-200 text-blue-900')
                    )}
                    onClick={() => handleAgentClick(agent)}
                    aria-label={isCollapsed ? agent.name : undefined}
                  >
                    <div className={cn('relative flex-shrink-0', isCollapsed ? 'h-6 w-6' : 'h-5 w-5')}>
                      {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.startsWith('http')) ? (
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          width={isCollapsed ? 24 : 20}
                          height={isCollapsed ? 24 : 20}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className={cn(
                          'flex items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600',
                          isCollapsed ? 'h-6 w-6 text-sm' : 'h-5 w-5'
                        )}>
                          {(agent.avatar && agent.avatar.trim()) || '🤖'}
                        </div>
                      )}
                    </div>
                    {!isCollapsed && <span className="ml-2 flex-1 text-left truncate">{agent.name}</span>}
                  </Button>
                  {/* Remove button - always visible on hover */}
                  {!isCollapsed && onAgentRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🗑️ [NavAiAgents] Removing agent:', agent.name, 'id:', agent.id);
                        onAgentRemove(agent.id);
                      }}
                      title="Remove from My Agents"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Separator */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <Separator />
          </div>
        )}

        {/* Agent actions */}
        {!isCollapsed && (
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onAgentStoreClick}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2">Agent Store</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onCreateAgentClick}
            >
              <UserPlus className="h-4 w-4" />
              <span className="ml-2">Create New Agent</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
