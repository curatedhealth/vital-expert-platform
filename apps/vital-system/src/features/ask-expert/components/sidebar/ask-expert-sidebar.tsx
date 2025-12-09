/**
 * Ask Expert Sidebar using Shadcn UI Components
 * Collapsible sidebar with agent selection
 */

'use client';

import React, { useState } from 'react';
import { Search, Users, Star, Check } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: number;
  status: string;
  capabilities: string[];
  avatar?: string;
}

interface AskExpertSidebarProps {
  agents: Agent[];
  selectedAgents: string[];
  onAgentSelect: (agentIds: string[]) => void;
}

export function AskExpertSidebar({
  agents,
  selectedAgents,
  onAgentSelect,
}: AskExpertSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<number | null>(null);

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === null || agent.tier === filterTier;
    return matchesSearch && matchesTier && agent.status === 'active';
  });

  // Group agents by tier
  const agentsByTier = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.tier]) acc[agent.tier] = [];
    acc[agent.tier].push(agent);
    return acc;
  }, {} as Record<number, Agent[]>);

  const toggleAgent = (agentId: string) => {
    const newSelection = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    onAgentSelect(newSelection);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 2:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className={cn('border-b p-4', isCollapsed && 'px-2 py-3')}>
        <div
          className={cn(
            'flex items-center gap-2 mb-3',
            isCollapsed && 'justify-center mb-2'
          )}
        >
          <Users className={cn('text-blue-500', isCollapsed ? 'h-5 w-5' : 'h-6 w-6')} />
          {!isCollapsed && <span className="font-semibold text-lg">My Agents</span>}
        </div>

        <Button
          asChild
          variant={isCollapsed ? 'ghost' : 'outline'}
          size={isCollapsed ? 'icon' : 'default'}
          className={cn(
            'w-full',
            isCollapsed && 'h-10 w-10 rounded-full mx-auto p-0'
          )}
        >
          <a
            href="/agents"
            className="flex items-center justify-center gap-2"
            aria-label="Browse Agent Store"
          >
            <Users className="w-4 h-4" />
            {!isCollapsed && <span>Browse Agent Store</span>}
          </a>
        </Button>
      </SidebarHeader>

      <SidebarContent className={cn('p-4', isCollapsed && 'px-2')}>
        {!isCollapsed && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Search & Filter
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterTier === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTier(null)}
                  className="flex-1"
                >
                  All
                </Button>
                {[1, 2, 3].map(tier => (
                  <Button
                    key={tier}
                    variant={filterTier === tier ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTier(tier)}
                    className="flex-1"
                  >
                    T{tier}
                  </Button>
                ))}
              </div>

              <div className="text-sm text-neutral-500">
                {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </div>
        )}

        <div className={cn('mt-4', isCollapsed && 'mt-0')}>
          {!isCollapsed && (
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Agents
            </div>
          )}
          <ScrollArea
            className={cn(
              'h-[calc(100vh-400px)]',
              isCollapsed && 'h-[calc(100vh-220px)] pr-1'
            )}
          >
            <div className={cn('space-y-2', isCollapsed && 'space-y-4 py-2')}>
              {Object.entries(agentsByTier)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([tier, tierAgents]) => (
                  <div key={tier} className={cn('mb-4', isCollapsed && 'mb-2')}>
                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-neutral-500">
                        <Star className={cn('w-3 h-3', Number(tier) === 1 && 'text-yellow-500')} />
                        Tier {tier} ({tierAgents.length})
                      </div>
                    )}
                    <div
                      className={cn(
                        'grid gap-2',
                        isCollapsed ? 'grid-cols-1 place-items-center' : 'grid-cols-1'
                      )}
                    >
                      {tierAgents.map(agent => {
                        const isSelected = selectedAgents.includes(agent.id);

                        return (
                          <button
                            key={agent.id}
                            onClick={() => toggleAgent(agent.id)}
                            className={cn(
                              'transition-all',
                              isCollapsed
                                ? 'relative flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-transparent hover:border-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2'
                                : 'w-full text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800',
                              isSelected &&
                                (isCollapsed
                                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                                  : 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500')
                            )}
                            aria-pressed={isSelected}
                            aria-label={agent.displayName}
                          >
                            {isCollapsed ? (
                              <>
                                {agent.avatar ? (
                                  <img
                                    src={agent.avatar}
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                                    {agent.displayName.charAt(0)}
                                  </div>
                                )}
                                <span className="sr-only">{agent.displayName}</span>
                                {isSelected && (
                                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                                    <Check className="h-3 w-3" />
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="flex items-start gap-2.5 w-full">
                                {isSelected && (
                                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                )}
                                {agent.avatar && (
                                  <img
                                    src={agent.avatar}
                                    alt={agent.displayName}
                                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium truncate">
                                      {agent.displayName}
                                    </span>
                                    <Badge className={getTierColor(agent.tier)}>
                                      T{agent.tier}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                    {agent.description}
                                  </p>
                                  {agent.capabilities && agent.capabilities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {agent.capabilities.slice(0, 2).map((cap, idx) => (
                                        <span
                                          key={idx}
                                          className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                                        >
                                          {cap}
                                        </span>
                                      ))}
                                      {agent.capabilities.length > 2 && (
                                        <span className="text-xs text-neutral-500">
                                          +{agent.capabilities.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {filteredAgents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No agents found
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                    Click &quot;Browse Agent Store&quot; to add agents
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SidebarContent>

      <SidebarFooter className={cn('border-t p-4', isCollapsed && 'p-2')}>
        {!isCollapsed && (
          <div className="text-xs text-neutral-500 text-center">
            {agents.length} total agents
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
