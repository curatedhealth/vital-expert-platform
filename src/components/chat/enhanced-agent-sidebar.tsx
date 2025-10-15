import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Check, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  business_function?: string;
  tier: number;
  capabilities: string[];
  rag_enabled: boolean;
  model: string;
  avatar?: string;
}

interface EnhancedAgentSidebarProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  interactionMode: 'manual' | 'automatic';
  onModeChange: (mode: 'manual' | 'automatic') => void;
}

export function EnhancedAgentSidebar({
  agents,
  selectedAgent,
  onSelectAgent,
  interactionMode,
  onModeChange
}: EnhancedAgentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  
  // Filter agents based on search and filters
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = !searchQuery || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.business_function?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        agent.business_function === selectedCategory;
      
      const matchesTier = !selectedTier || 
        agent.tier === selectedTier;
      
      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [agents, searchQuery, selectedCategory, selectedTier]);
  
  // Group agents by category
  const groupedAgents = useMemo(() => {
    const groups: Record<string, Agent[]> = {};
    
    filteredAgents.forEach(agent => {
      const category = agent.business_function || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(agent);
    });
    
    return groups;
  }, [filteredAgents]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-4 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>AI Experts</span>
          <Badge variant={interactionMode === 'manual' ? 'default' : 'secondary'}>
            {interactionMode === 'manual' ? 'Manual' : 'Automatic'}
          </Badge>
        </CardTitle>
        
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={interactionMode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('manual')}
            className="flex-1"
          >
            Manual Selection
          </Button>
          <Button
            variant={interactionMode === 'automatic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('automatic')}
            className="flex-1"
          >
            Auto Select
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search experts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Tier Filter */}
        <div className="flex gap-2">
          {[1, 2, 3].map(tier => (
            <Button
              key={tier}
              variant={selectedTier === tier ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
            >
              Tier {tier}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          {interactionMode === 'manual' ? (
            /* Manual Mode - Show all agents */
            <div className="space-y-4 pb-4">
              {Object.entries(groupedAgents).map(([category, categoryAgents]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground sticky top-0 bg-background py-2">
                    {category}
                  </h3>
                  {categoryAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgent?.id === agent.id}
                      onSelect={() => onSelectAgent(agent)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            /* Automatic Mode - Show info */
            <div className="p-4 text-center text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">Automatic Selection Active</h3>
              <p className="text-sm">
                The AI will automatically select the best expert for your question.
                Switch to Manual mode to choose an expert yourself.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}

function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Agent Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {agent.name.charAt(0)}
          </div>
          
          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm">{agent.display_name || agent.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {agent.description}
                </p>
              </div>
              {isSelected && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </div>
            
            {/* Agent Metadata */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                Tier {agent.tier}
              </Badge>
              {agent.rag_enabled && (
                <Badge variant="outline" className="text-xs">
                  RAG
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {agent.model}
              </Badge>
            </div>
            
            {/* Capabilities */}
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.capabilities.slice(0, 3).map((cap, idx) => (
                <span key={idx} className="text-xs text-muted-foreground">
                  • {cap}
                </span>
              ))}
              {agent.capabilities.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{agent.capabilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
