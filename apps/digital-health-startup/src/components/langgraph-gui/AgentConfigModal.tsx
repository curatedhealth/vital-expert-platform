import React, { useState, useEffect } from 'react';
import { X, Search, Bot, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';

interface AgentConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAgent: (agent: Agent) => void;
  currentAgent?: Agent | null;
  nodeId?: string;
}

/**
 * AgentConfigModal - Modal for selecting and configuring agents for workflow nodes
 *
 * Features:
 * - Browse all available agents from the agents store
 * - Filter by tier (1, 2, 3)
 * - Search by name or description
 * - View agent details (capabilities, domain, model)
 * - Select agent for the workflow node
 */
export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({
  open,
  onClose,
  onSelectAgent,
  currentAgent,
  nodeId,
}) => {
  const { agents, loadAgents, isLoading } = useAgentsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | '1' | '2' | '3'>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(currentAgent || null);

  // Load agents when modal opens
  useEffect(() => {
    if (open && agents.length === 0) {
      loadAgents(false); // Load only active/testing agents
    }
  }, [open, agents.length, loadAgents]);

  // Filter agents based on search and tier
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      searchQuery === '' ||
      agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.domain_expertise?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      selectedTier === 'all' || agent.tier === parseInt(selectedTier);

    return matchesSearch && matchesTier;
  });

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleConfirm = () => {
    if (selectedAgent) {
      onSelectAgent(selectedAgent);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedAgent(currentAgent || null);
    onClose();
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
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-purple-500" size={20} />
            Select AI Agent {nodeId && `for Node: ${nodeId}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search agents by name, description, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Tier Filter */}
            <Tabs value={selectedTier} onValueChange={(value) => setSelectedTier(value as typeof selectedTier)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Tiers</TabsTrigger>
                <TabsTrigger value="1">Tier 1</TabsTrigger>
                <TabsTrigger value="2">Tier 2</TabsTrigger>
                <TabsTrigger value="3">Tier 3</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Agent List */}
          <ScrollArea className="flex-1 border rounded-md">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <Bot className="mx-auto mb-2 animate-pulse" size={32} />
                <p>Loading agents...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bot className="mx-auto mb-2" size={32} />
                <p>No agents found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredAgents.map((agent) => {
                  const isSelected = selectedAgent?.id === agent.id;
                  const agentAvatar = agent.avatar || '🤖';
                  const agentColor = agent.color || '#8b5cf6';

                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md',
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300'
                      )}
                      onClick={() => handleSelectAgent(agent)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{
                            backgroundColor: `${agentColor}20`,
                            color: agentColor,
                          }}
                        >
                          {typeof agentAvatar === 'string' && agentAvatar.startsWith('http') ? (
                            <img
                              src={agentAvatar}
                              alt={agent.display_name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            agentAvatar
                          )}
                        </div>

                        {/* Agent Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-base text-gray-900">{agent.display_name}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isSelected && <Check size={18} className="text-purple-500" />}
                              <Badge variant="outline" className={cn('text-xs border', getTierColor(agent.tier))}>
                                Tier {agent.tier}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{agent.description}</p>

                          {/* Metadata Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {agent.domain_expertise && (
                              <Badge variant="secondary" className="text-xs">
                                {agent.domain_expertise}
                              </Badge>
                            )}
                            {agent.model && (
                              <Badge variant="outline" className="text-xs bg-gray-100">
                                {agent.model}
                              </Badge>
                            )}
                            {agent.capabilities && agent.capabilities.length > 0 && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                {agent.capabilities.length} skill{agent.capabilities.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {agent.rag_enabled && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                RAG
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Selected Agent Info */}
          {selectedAgent && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-sm font-medium text-purple-900">
                Selected: <span className="font-bold">{selectedAgent.display_name}</span>
              </p>
              <p className="text-xs text-purple-700 mt-1">{selectedAgent.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAgent} className="bg-purple-600 hover:bg-purple-700">
            <Check size={16} className="mr-2" />
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
