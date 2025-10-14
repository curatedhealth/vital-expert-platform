'use client';

import React from 'react';
import { Search, Check, Sparkles, Clock } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/agent.types';

export function AgentSelectionPanel({ 
  agents, 
  selectedAgent, 
  onSelectAgent, 
  isLoading = false, 
  className 
}: {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => Promise<string | void>; // Returns ack
  isLoading?: boolean;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectingAgentId, setSelectingAgentId] = React.useState<string | null>(null);
  const [recentAgents, setRecentAgents] = React.useState<string[]>([]);
  const [selectDebounceTimer, setSelectDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  // AUDIT FIX: Move localStorage to useEffect with try-catch
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-agents');
      setRecentAgents(raw ? JSON.parse(raw) : []);
    } catch {
      setRecentAgents([]);
      localStorage.removeItem('recent-agents'); // heal corrupted data
    }
  }, []);

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (selectDebounceTimer) {
        clearTimeout(selectDebounceTimer);
      }
    };
  }, [selectDebounceTimer]);

  const filteredAgents = React.useMemo(() => {
    let out = agents;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      out = out.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.display_name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      out = out.filter(a => 
        a.business_function?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return out;
  }, [agents, debouncedSearch, selectedCategory]);

  const categories = React.useMemo(
    () => ['all', ...Array.from(new Set(agents.map(a => a.business_function).filter(Boolean)))],
    [agents]
  );

  // AUDIT FIX: Async acknowledgment pattern with debounce
  const handleSelectAgent = React.useCallback(async (agent: Agent) => {
    if (selectingAgentId) return; // Prevent double-click
    
    // Clear any pending selection
    if (selectDebounceTimer) {
      clearTimeout(selectDebounceTimer);
    }
    
    // Debounce for 100ms to prevent double-clicks
    const timer = setTimeout(async () => {
      setSelectingAgentId(agent.id);
      try {
        const ack = await onSelectAgent(agent);
        if (!ack) return; // Guard on acknowledgment
        
        // Update recent agents
        setRecentAgents(prev => {
          const next = [agent.id, ...prev.filter(id => id !== agent.id)].slice(0, 5);
          try { 
            localStorage.setItem('recent-agents', JSON.stringify(next)); 
          } catch (e) {
            console.warn('Failed to persist recent agents', e);
          }
          return next;
        });
      } finally {
        setSelectingAgentId(null);
      }
    }, 100);
    
    setSelectDebounceTimer(timer);
  }, [onSelectAgent, selectingAgentId, selectDebounceTimer]);

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Memoized Agent Card
  const AgentCard = React.memo<{
    agent: Agent;
    isSelected: boolean;
    onSelect: () => void;
    isSelecting: boolean;
  }>(({ agent, isSelected, onSelect, isSelecting }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-blue-400 hover:shadow-md",
        isSelected && "border-blue-500 bg-blue-50",
        isSelecting && "opacity-50 cursor-not-allowed"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* AUDIT FIX: Proper Avatar API */}
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={agent.avatarUrl ?? ''} 
              alt={agent.display_name || agent.name} 
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {(agent.display_name || agent.name)[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm truncate">
                {agent.display_name || agent.name}
              </h4>
              {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {agent.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities?.slice(0, 2).map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  AgentCard.displayName = 'AgentCard';

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Select AI Agent
        </CardTitle>
      </CardHeader>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mb-2">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4">
            {/* Recently Used Section */}
            {selectedCategory === 'all' && recentAgents.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recently Used
                </h5>
                <div className="space-y-2">
                  {recentAgents
                    .slice(0, 3)
                    .map((id: string) => agents.find((a) => a.id === id))
                    .filter(Boolean)
                    .map((agent: Agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        isSelected={selectedAgent?.id === agent.id}
                        onSelect={() => handleSelectAgent(agent)}
                        isSelecting={selectingAgentId === agent.id}
                      />
                    ))}
                </div>
                <Separator className="my-4" />
              </div>
            )}

            {/* All Agents */}
            {filteredAgents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No agents found</p>
                {debouncedSearch && (
                  <p className="text-xs mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                {filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent?.id === agent.id}
                    onSelect={() => handleSelectAgent(agent)}
                    isSelecting={selectingAgentId === agent.id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}