'use client';

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { EnhancedAgentCard } from '@vital/ui';
import { type Agent } from '@/lib/stores/chat-store';

interface AgentLibraryProps {
  onDragStart: (event: React.DragEvent, agent: Agent) => void;
  className?: string;
}

export function AgentLibrary({ onDragStart, className }: AgentLibraryProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/workflows/agents');
        if (response.ok) {
          const { agents } = await response.json();
          setAgents(agents || []);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agent_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Agent List */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} available
          </p>
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="cursor-move"
              draggable
              onDragStart={(e) => onDragStart(e, agent)}
            >
              <EnhancedAgentCard
                agent={agent}
                showReasoning={false}
                showTier={true}
                size="sm"
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

