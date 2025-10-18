'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Star, Clock, User, Check } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  domain: string;
  tier: string;
  capabilities: string[];
  description: string;
  business_function?: string;
  performance_score?: number;
  is_favorite?: boolean;
}

interface AgentBrowserProps {
  onAgentSelect: (agent: Agent) => void;
  selectedAgent: Agent | null;
  searchAgents: (filters: any) => Promise<Agent[]>;
}

const DOMAINS = [
  'regulatory_affairs',
  'clinical_development', 
  'medical_affairs',
  'pharmacovigilance',
  'drug_development',
  'oncology',
  'cardiology',
  'neurology',
  'digital_health',
  'precision_medicine'
];

const TIERS = ['tier_1', 'tier_2', 'tier_3'];

const BUSINESS_FUNCTIONS = [
  'Research & Development',
  'Regulatory Affairs',
  'Medical Affairs',
  'Commercial',
  'Operations',
  'Quality Assurance'
];

export function AgentBrowser({ onAgentSelect, selectedAgent, searchAgents }: AgentBrowserProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedBusinessFunctions, setSelectedBusinessFunctions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, []);

  // Filter agents when filters change
  useEffect(() => {
    filterAgents();
  }, [agents, searchQuery, selectedDomains, selectedTiers, selectedBusinessFunctions, sortBy]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const results = await searchAgents({
        limit: 50
      });
      setAgents(results);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(query))
      );
    }

    // Domain filter
    if (selectedDomains.length > 0) {
      filtered = filtered.filter(agent => 
        selectedDomains.includes(agent.domain)
      );
    }

    // Tier filter
    if (selectedTiers.length > 0) {
      filtered = filtered.filter(agent => 
        selectedTiers.includes(agent.tier)
      );
    }

    // Business function filter
    if (selectedBusinessFunctions.length > 0) {
      filtered = filtered.filter(agent => 
        agent.business_function && selectedBusinessFunctions.includes(agent.business_function)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'tier':
          const tierOrder = { 'tier_1': 0, 'tier_2': 1, 'tier_3': 2 };
          return tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder];
        case 'performance':
          return (b.performance_score || 0) - (a.performance_score || 0);
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleTierToggle = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) 
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
  };

  const handleBusinessFunctionToggle = (func: string) => {
    setSelectedBusinessFunctions(prev => 
      prev.includes(func) 
        ? prev.filter(f => f !== func)
        : [...prev, func]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomains([]);
    setSelectedTiers([]);
    setSelectedBusinessFunctions([]);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier_1': return 'bg-gold-100 text-gold-800';
      case 'tier_2': return 'bg-silver-100 text-silver-800';
      case 'tier_3': return 'bg-bronze-100 text-bronze-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'tier_1': return 'Senior';
      case 'tier_2': return 'Mid-level';
      case 'tier_3': return 'Junior';
      default: return tier;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Domains</h4>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(domain => (
                <Button
                  key={domain}
                  variant={selectedDomains.includes(domain) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDomainToggle(domain)}
                  className="text-xs"
                >
                  {domain.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Tier</h4>
            <div className="flex space-x-2">
              {TIERS.map(tier => (
                <Button
                  key={tier}
                  variant={selectedTiers.includes(tier) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTierToggle(tier)}
                  className="text-xs"
                >
                  {getTierLabel(tier)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Business Function</h4>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_FUNCTIONS.map(func => (
                <Button
                  key={func}
                  variant={selectedBusinessFunctions.includes(func) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBusinessFunctionToggle(func)}
                  className="text-xs"
                >
                  {func}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort and View Controls */}
        <div className="flex justify-between items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="tier">Tier</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {(selectedDomains.length > 0 || selectedTiers.length > 0 || selectedBusinessFunctions.length > 0 || searchQuery) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
          </p>
          {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onSelect={() => onAgentSelect(agent)}
                getTierColor={getTierColor}
                getTierLabel={getTierLabel}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAgents.map(agent => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onSelect={() => onAgentSelect(agent)}
                getTierColor={getTierColor}
                getTierLabel={getTierLabel}
              />
            ))}
          </div>
        )}

        {filteredAgents.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No agents found matching your criteria</p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ 
  agent, 
  isSelected, 
  onSelect, 
  getTierColor, 
  getTierLabel 
}: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  getTierColor: (tier: string) => string;
  getTierLabel: (tier: string) => string;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:ring-1 hover:ring-primary/30'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{agent.name}</h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {agent.description}
            </p>
          </div>
          {isSelected && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={`text-xs ${getTierColor(agent.tier)}`}>
              {getTierLabel(agent.tier)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {agent.domain.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map((capability, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.capabilities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentListItem({ 
  agent, 
  isSelected, 
  onSelect, 
  getTierColor, 
  getTierLabel 
}: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  getTierColor: (tier: string) => string;
  getTierLabel: (tier: string) => string;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:ring-1 hover:ring-primary/30'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm">{agent.name}</h4>
              <Badge className={`text-xs ${getTierColor(agent.tier)}`}>
                {getTierLabel(agent.tier)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {agent.domain.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {agent.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 4).map((capability, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {agent.capabilities.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{agent.capabilities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          {isSelected && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
