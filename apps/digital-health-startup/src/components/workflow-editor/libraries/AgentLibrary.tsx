'use client';

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Agent {
  id: string;
  unique_id: string;
  name: string;
  agent_type: string;
  framework?: string;
  specialty?: string;
  description?: string;
}

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
    agent.agent_type?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} available
          </p>
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-background cursor-move hover:bg-accent hover:border-accent-foreground transition-all"
              draggable
              onDragStart={(e) => onDragStart(e, agent)}
            >
              <div className="p-2 rounded-md bg-indigo-100 text-indigo-600">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{agent.agent_type}</p>
                {agent.framework && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {agent.framework}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

