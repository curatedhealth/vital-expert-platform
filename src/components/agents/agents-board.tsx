'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Star,
  Heart,
  Edit,
  Copy,
  MoreVertical,
  Brain,
  Settings,
  Eye,
  Trash2,
  Upload,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore, type Agent } from '@/lib/stores/chat-store';
import type { AgentWithCategories } from '@/lib/agents/agent-service';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { AgentCreator } from '@/components/chat/agent-creator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AgentsBoard {
  onAgentSelect?: (agent: Agent) => void;
  showCreateButton?: boolean;
}

export function AgentsBoard({ onAgentSelect, showCreateButton = true }: AgentsBoard) {
  const { agents, createCustomAgent, updateAgent, deleteAgent, loadAgentsFromDatabase } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [selectedBusinessFunction, setSelectedBusinessFunction] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set());
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Load agents on component mount
  useEffect(() => {
    loadAgentsFromDatabase();
  }, [loadAgentsFromDatabase]);

  // Dynamic filter options based on actual agent data
  const availableDomains = useMemo(() => {
    const uniqueDomains = new Set<string>();
    agents.forEach(agent => {
      agent.knowledgeDomains?.forEach(domain => uniqueDomains.add(domain));
    });
    return Array.from(uniqueDomains).sort();
  }, [agents]);

  const availableCapabilities = useMemo(() => {
    const uniqueCapabilities = new Set<string>();
    agents.forEach(agent => {
      agent.capabilities.forEach(cap => uniqueCapabilities.add(cap));
    });
    return Array.from(uniqueCapabilities).sort();
  }, [agents]);

  const availableBusinessFunctions = useMemo(() => {
    const uniqueBusinessFunctions = new Set<string>();
    agents.forEach(agent => {
      if (agent.businessFunction) {
        uniqueBusinessFunctions.add(agent.businessFunction);
      }
    });
    return Array.from(uniqueBusinessFunctions).sort();
  }, [agents]);

  const availableRoles = useMemo(() => {
    const uniqueRoles = new Set<string>();
    agents.forEach(agent => {
      if (agent.role) {
        uniqueRoles.add(agent.role);
      }
    });
    return Array.from(uniqueRoles).sort();
  }, [agents]);

  const domains = [
    { value: 'all', label: 'All RAG Domains' },
    ...availableDomains.map(domain => ({
      value: domain,
      label: {
        'digital-health': 'Digital Health',
        'clinical-research': 'Clinical Research',
        'market-access': 'Market Access',
        'regulatory': 'Regulatory',
        'quality-assurance': 'Quality Assurance',
        'health-economics': 'Health Economics'
      }[domain] || domain
    }))
  ];

  const capabilities = [
    { value: 'all', label: 'All Capabilities' },
    ...availableCapabilities.map(cap => ({ value: cap, label: cap }))
  ];

  const businessFunctions = [
    { value: 'all', label: 'All Business Functions' },
    ...availableBusinessFunctions.map(bf => ({ value: bf, label: bf }))
  ];

  const roles = [
    { value: 'all', label: 'All Roles' },
    ...availableRoles.map(role => ({ value: role, label: role }))
  ];

  // Filtered agents based on search and filters
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDomain = selectedDomain === 'all' ||
        (agent.knowledgeDomains && agent.knowledgeDomains.includes(selectedDomain));

      const matchesCapability = selectedCapability === 'all' ||
        agent.capabilities.includes(selectedCapability);

      const matchesBusinessFunction = selectedBusinessFunction === 'all' ||
        agent.businessFunction === selectedBusinessFunction;

      const matchesRole = selectedRole === 'all' ||
        agent.role === selectedRole;

      return matchesSearch && matchesDomain && matchesCapability && matchesBusinessFunction && matchesRole;
    });
  }, [agents, searchQuery, selectedDomain, selectedCapability, selectedBusinessFunction, selectedRole]);

  const handleSaveToLibrary = (agentId: string) => {
    setSavedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const handleDuplicateAgent = (agent: Agent) => {
    const duplicatedAgent: Agent = {
      ...agent,
      id: `${agent.id}-copy-${Date.now()}`,
      name: `${agent.name} (Copy)`,
      isCustom: true,
    };
    createCustomAgent(duplicatedAgent);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleDeleteAgent = (agent: Agent) => {
    if (agent.isCustom) {
      // Only allow deleting custom agents, not default ones
      if (confirm(`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`)) {
        deleteAgent(agent.id);
      }
    } else {
      alert('Default agents cannot be deleted. You can only delete custom agents.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['json', 'md', 'markdown'].includes(fileExtension || '')) {
      alert('Please upload a JSON or Markdown file.');
      return;
    }

    try {
      const content = await file.text();
      let agentData;

      if (fileExtension === 'json') {
        agentData = JSON.parse(content);
      } else {
        // Parse markdown file
        agentData = parseMarkdownToAgent(content);
      }

      // Validate required fields
      if (!agentData.name || !agentData.description) {
        alert('Invalid file format. Agent must have at least a name and description.');
        return;
      }

      // Create the agent with defaults for missing fields
      const newAgent: Agent = {
        id: `imported-${Date.now()}`,
        name: agentData.name,
        description: agentData.description,
        systemPrompt: agentData.systemPrompt || agentData.prompt || 'You are a helpful AI assistant.',
        model: agentData.model || 'gpt-4',
        avatar: agentData.avatar || '🤖',
        color: agentData.color || 'text-trust-blue',
        capabilities: agentData.capabilities || [],
        ragEnabled: agentData.ragEnabled ?? true,
        temperature: agentData.temperature ?? 0.7,
        maxTokens: agentData.maxTokens ?? 2000,
        isCustom: true,
        knowledgeDomains: agentData.knowledgeDomains || [],
        tools: agentData.tools || [],
        knowledgeUrls: agentData.knowledgeUrls || [],
      };

      createCustomAgent(newAgent);
      setShowFileUpload(false);
      alert(`Successfully imported agent: ${newAgent.name}`);

    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the file format and try again.');
    }

    // Reset file input
    event.target.value = '';
  };

  const parseMarkdownToAgent = (content: string) => {
    const lines = content.split('\n');
    const agent: any = {};
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for headers
      if (trimmedLine.startsWith('# ')) {
        agent.name = trimmedLine.substring(2).trim();
      } else if (trimmedLine.startsWith('## Description')) {
        if (currentSection) {
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'description';
        currentContent = [];
      } else if (trimmedLine.startsWith('## System Prompt') || trimmedLine.startsWith('## Prompt')) {
        if (currentSection) {
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'systemPrompt';
        currentContent = [];
      } else if (trimmedLine.startsWith('## Capabilities')) {
        if (currentSection) {
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'capabilities';
        currentContent = [];
      } else if (trimmedLine.startsWith('- ') && currentSection === 'capabilities') {
        if (!agent.capabilities) agent.capabilities = [];
        agent.capabilities.push(trimmedLine.substring(2).trim());
      } else if (trimmedLine.startsWith('**Model:**') || trimmedLine.startsWith('Model:')) {
        agent.model = trimmedLine.split(':')[1]?.trim();
      } else if (trimmedLine.startsWith('**Temperature:**') || trimmedLine.startsWith('Temperature:')) {
        agent.temperature = parseFloat(trimmedLine.split(':')[1]?.trim() || '0.7');
      } else if (!trimmedLine.startsWith('#') && trimmedLine) {
        currentContent.push(line);
      }
    }

    // Add final section
    if (currentSection && currentContent.length > 0) {
      agent[currentSection] = currentContent.join('\n').trim();
    }

    return agent;
  };

  const getDomainColor = (domains: string[] = []) => {
    if (domains.length === 0) return 'bg-gray-100 text-gray-800';

    const primaryDomain = domains[0];
    const colors = {
      'digital-health': 'bg-trust-blue/10 text-trust-blue',
      'clinical-research': 'bg-progress-teal/10 text-progress-teal',
      'market-access': 'bg-market-purple/10 text-market-purple',
      'regulatory': 'bg-clinical-green/10 text-clinical-green',
      'quality-assurance': 'bg-amber-100 text-amber-800',
      'health-economics': 'bg-rose-100 text-rose-800',
    };
    return colors[primaryDomain as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">AI Agents</h1>
          <p className="text-medical-gray">
            Discover, manage, and create specialized AI experts for your healthcare needs
          </p>
        </div>
        {showCreateButton && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-progress-teal hover:bg-progress-teal/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setEditingAgent(null);
                  setShowCreateModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Agent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json,.md,.markdown';
                  input.onchange = handleFileUpload as any;
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload from File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-gray" />
          <Input
            placeholder="Search agents by name, description, or capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-medical-gray" />
              <span className="text-sm text-medical-gray">Filters:</span>
            </div>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {domains.map(domain => (
                <option key={domain.value} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCapability}
              onChange={(e) => setSelectedCapability(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {capabilities.map(cap => (
                <option key={cap.value} value={cap.value}>
                  {cap.label}
                </option>
              ))}
            </select>

            <select
              value={selectedBusinessFunction}
              onChange={(e) => setSelectedBusinessFunction(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {businessFunctions.map(bf => (
                <option key={bf.value} value={bf.value}>
                  {bf.label}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-medical-gray">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Agents Grid/List */}
      <div className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      )}>
        {filteredAgents.map((agent) => (
          <Card
            key={agent.id}
            className={cn(
              'hover:shadow-lg transition-all cursor-pointer group',
              viewMode === 'list' && 'hover:bg-gray-50'
            )}
            onClick={() => onAgentSelect?.(agent)}
          >
            <CardContent className={cn(
              'p-4',
              viewMode === 'list' && 'flex items-center gap-4'
            )}>
              {/* Grid View Layout */}
              {viewMode === 'grid' && (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AgentAvatar agent={agent} size="md" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-deep-charcoal group-hover:text-progress-teal transition-colors">
                          {agent.name}
                        </h3>
                        {agent.isCustom && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onAgentSelect?.(agent);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditAgent(agent);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateAgent(agent);
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleSaveToLibrary(agent.id);
                        }}>
                          <Heart className={cn(
                            'h-4 w-4 mr-2',
                            savedAgents.has(agent.id) && 'fill-current text-red-500'
                          )} />
                          {savedAgents.has(agent.id) ? 'Remove from Library' : 'Save to Library'}
                        </DropdownMenuItem>
                        {agent.isCustom && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAgent(agent);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-medical-gray line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Knowledge Domains */}
                  {agent.knowledgeDomains && agent.knowledgeDomains.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {agent.knowledgeDomains.slice(0, 2).map((domain) => (
                        <Badge
                          key={domain}
                          className={cn('text-xs', getDomainColor([domain]))}
                        >
                          {domains.find(d => d.value === domain)?.label || domain}
                        </Badge>
                      ))}
                      {agent.knowledgeDomains.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.knowledgeDomains.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-medical-gray">
                      <Brain className="h-3 w-3" />
                      {agent.model}
                    </div>
                    {savedAgents.has(agent.id) && (
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    )}
                  </div>
                </div>
              )}

              {/* List View Layout */}
              {viewMode === 'list' && (
                <>
                  <AgentAvatar agent={agent} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-deep-charcoal group-hover:text-progress-teal transition-colors">
                        {agent.name}
                      </h3>
                      {agent.isCustom && (
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-medical-gray truncate">
                      {agent.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.knowledgeDomains && agent.knowledgeDomains.length > 0 && (
                      <Badge className={cn('text-xs', getDomainColor(agent.knowledgeDomains))}>
                        {domains.find(d => d.value === agent.knowledgeDomains![0])?.label || agent.knowledgeDomains[0]}
                      </Badge>
                    )}
                    {savedAgents.has(agent.id) && (
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onAgentSelect?.(agent);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditAgent(agent);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateAgent(agent);
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleSaveToLibrary(agent.id);
                        }}>
                          <Heart className={cn(
                            'h-4 w-4 mr-2',
                            savedAgents.has(agent.id) && 'fill-current text-red-500'
                          )} />
                          {savedAgents.has(agent.id) ? 'Remove from Library' : 'Save to Library'}
                        </DropdownMenuItem>
                        {agent.isCustom && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAgent(agent);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-medical-gray mx-auto mb-4" />
            <h3 className="font-semibold text-deep-charcoal mb-2">
              No agents found
            </h3>
            <p className="text-medical-gray mb-4">
              Try adjusting your search terms or filters, or create a new agent.
            </p>
            {showCreateButton && (
              <Button
                onClick={() => {
                  setEditingAgent(null);
                  setShowCreateModal(true);
                }}
                className="bg-progress-teal hover:bg-progress-teal/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Creator Modal */}
      {showCreateModal && (
        <AgentCreator
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
            // Reload agents from database to show the newly created/edited agent
            loadAgentsFromDatabase();
          }}
          editingAgent={editingAgent as unknown as AgentWithCategories}
        />
      )}
    </div>
  );
}