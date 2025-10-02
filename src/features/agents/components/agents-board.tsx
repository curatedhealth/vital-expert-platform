'use client';

import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Heart,
  Edit,
  Copy,
  MoreVertical,
  Brain,
  Eye,
  Trash2,
  Upload,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import type { AgentWithCategories } from '@/lib/agents/agent-service';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { HealthcareBusinessFunction, HealthcareRole } from '@/types/healthcare-compliance';
import { BUSINESS_FUNCTIONS, DEPARTMENTS_BY_FUNCTION, ROLES_BY_DEPARTMENT } from '@/config/organizational-structure';

// Use shared organizational structure configuration
const staticDepartmentsByFunction = DEPARTMENTS_BY_FUNCTION;
const staticRolesByDepartment = ROLES_BY_DEPARTMENT;

// OLD definitions (replaced by shared config - keeping for reference only)
/*
const staticDepartmentsByFunction_OLD: Record<string, string[]> = {
  'Regulatory Affairs': ['Regulatory Strategy', 'Submissions & Filings', 'Compliance & Quality'],
  'regulatory-affairs': ['Regulatory Strategy', 'Submissions & Filings', 'Compliance & Quality'],
  'Regulatory': ['Regulatory Strategy', 'Submissions & Filings', 'Compliance & Quality'],

  'Clinical Development': ['Clinical Operations', 'Clinical Strategy', 'Medical Monitoring'],
  'clinical-development': ['Clinical Operations', 'Clinical Strategy', 'Medical Monitoring'],
  'Clinical': ['Clinical Operations', 'Clinical Strategy', 'Medical Monitoring'],

  'Market Access': ['Health Economics', 'Payer Relations', 'Market Strategy'],
  'market-access': ['Health Economics', 'Payer Relations', 'Market Strategy'],
  'Market': ['Health Economics', 'Payer Relations', 'Market Strategy'],

  'Information Technology': ['IT Operations', 'Software Development', 'Data Management'],
  'information-technology': ['IT Operations', 'Software Development', 'Data Management'],
  'IT': ['IT Operations', 'Software Development', 'Data Management'],

  'Business Development': ['Corporate Strategy', 'Partnerships', 'M&A'],
  'business-development': ['Corporate Strategy', 'Partnerships', 'M&A'],
  'Business': ['Corporate Strategy', 'Partnerships', 'M&A'],

  'Medical Affairs': ['Medical Information', 'Medical Communications', 'Medical Science Liaison'],
  'medical-affairs': ['Medical Information', 'Medical Communications', 'Medical Science Liaison'],
  'Medical': ['Medical Information', 'Medical Communications', 'Medical Science Liaison'],

  'Human Resources': ['Talent Acquisition', 'Learning & Development', 'Compensation & Benefits'],
  'human-resources': ['Talent Acquisition', 'Learning & Development', 'Compensation & Benefits'],
  'HR': ['Talent Acquisition', 'Learning & Development', 'Compensation & Benefits'],

  'Quality Assurance': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing'],
  'quality-assurance': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing'],
  'Quality': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing'],

  'Manufacturing': ['Production', 'Quality Control', 'Supply Chain'],
  'manufacturing': ['Production', 'Quality Control', 'Supply Chain'],

  'Finance': ['Financial Planning', 'Accounting', 'Treasury'],
  'finance': ['Financial Planning', 'Accounting', 'Treasury'],

  'Legal': ['Corporate Law', 'Compliance', 'Intellectual Property'],
  'legal': ['Corporate Law', 'Compliance', 'Intellectual Property'],

  'Marketing': ['Brand Management', 'Market Research', 'Communications'],
  'marketing': ['Brand Management', 'Market Research', 'Communications'],
};

// Static role mapping by function and department
// Support multiple function key variations for fuzzy matching
const qaDepartmentRoles = {
  'Quality Management Systems': ['QMS Architect', 'ISO 13485 Specialist', 'Design Controls Lead', 'Quality Systems Manager'],
  'Quality Control': ['Quality Analyst', 'Testing Specialist', 'Validation Engineer', 'QC Manager'],
  'Compliance & Auditing': ['Compliance Officer', 'Internal Auditor', 'Regulatory Compliance Specialist', 'Audit Manager'],
};

const regAffairsDepartmentRoles = {
  'Regulatory Strategy': ['Regulatory Strategist', 'Global Strategy Lead', 'Regulatory Project Manager'],
  'Submissions & Filings': ['Submission Specialist', '510(k) Expert', 'PMA Specialist', 'Filing Manager'],
  'Compliance & Quality': ['Compliance Specialist', 'Quality Compliance Lead', 'GCP Specialist'],
};

const clinicalDevDepartmentRoles = {
  'Clinical Operations': ['Clinical Operations Manager', 'CRA', 'Site Manager', 'Clinical Coordinator'],
  'Clinical Strategy': ['Clinical Strategist', 'Protocol Designer', 'Endpoint Specialist'],
  'Medical Monitoring': ['Medical Monitor', 'Safety Physician', 'Data Safety Manager'],
};

const marketAccessDepartmentRoles = {
  'Health Economics': ['Health Economist', 'HEOR Specialist', 'Outcomes Researcher'],
  'Payer Relations': ['Payer Strategy Lead', 'Contracting Specialist', 'Market Access Manager'],
  'Market Strategy': ['Market Strategist', 'Pricing Specialist', 'Launch Planning Lead'],
};

const medicalAffairsDepartmentRoles = {
  'Medical Information': ['Medical Information Specialist', 'Medical Writer', 'Scientific Communications'],
  'Medical Communications': ['Medical Communications Manager', 'Publication Specialist', 'Content Strategist'],
  'Medical Science Liaison': ['MSL', 'Field Medical Director', 'KOL Manager'],
};

const staticRolesByDepartment: Record<string, Record<string, string[]>> = {
  'Quality Assurance': qaDepartmentRoles,
  'quality-assurance': qaDepartmentRoles,
  'Quality': qaDepartmentRoles,

  'Regulatory Affairs': regAffairsDepartmentRoles,
  'regulatory-affairs': regAffairsDepartmentRoles,
  'Regulatory': regAffairsDepartmentRoles,

  'Clinical Development': clinicalDevDepartmentRoles,
  'clinical-development': clinicalDevDepartmentRoles,
  'Clinical': clinicalDevDepartmentRoles,

  'Market Access': marketAccessDepartmentRoles,
  'market-access': marketAccessDepartmentRoles,
  'Market': marketAccessDepartmentRoles,

  'Medical Affairs': medicalAffairsDepartmentRoles,
  'medical-affairs': medicalAffairsDepartmentRoles,
  'Medical': medicalAffairsDepartmentRoles,
};
*/

interface AgentsBoard {
  onAgentSelect?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  showCreateButton?: boolean;
  hiddenControls?: boolean;
  // External state management for sidebar controls
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedDomain?: string;
  selectedCapability?: string;
  selectedBusinessFunction?: string;
  selectedRole?: string;
  onFilterChange?: (filters: unknown) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function AgentsBoard({
  onAgentSelect,
  onAddToChat,
  showCreateButton = true,
  hiddenControls = false,
  // External props for sidebar control
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  selectedDomain: externalSelectedDomain,
  selectedCapability: externalSelectedCapability,
  selectedBusinessFunction: externalSelectedBusinessFunction,
  selectedRole: externalSelectedRole,
  onFilterChange: externalOnFilterChange,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
}: AgentsBoardProps) {
  const { agents, createCustomAgent, updateAgent, deleteAgent, loadAgents } = useAgentsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessFunction, setSelectedBusinessFunction] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set());
  const [dbBusinessFunctions, setDbBusinessFunctions] = useState<HealthcareBusinessFunction[]>([]);

  // Helper function to get function name by ID
  const getFunctionName = (functionId?: string | null) => {
    if (!functionId) return null;
    const func = dbBusinessFunctions.find(f => f.id === functionId);
    return func?.department_name || null;
  };

  // Load agents on component mount only if not already loaded
  useEffect(() => {
    if (agents.length === 0) {
      loadAgents();
    }
  }, [loadAgents, agents.length]);

  // Load business functions from API (bypasses RLS)
  useEffect(() => {
    async function loadBusinessFunctions() {
      try {
        const response = await fetch('/api/organizational-structure');
        const result = await response.json();

        if (result.success && result.data) {
          const { functions } = result.data;
          console.log('[Agents Board] Loaded business functions:', functions?.length || 0);
          setDbBusinessFunctions(functions || []);
        } else {
          console.error('[Agents Board] Failed to load business functions:', result.error);
        }
      } catch (error) {
        console.error('[Agents Board] Error loading business functions:', error);
      }
    }

    loadBusinessFunctions();
  }, []);

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
      display_name: `${agent.display_name} (Copy)`,
      is_custom: true,
    };
    createCustomAgent(duplicatedAgent);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleDeleteAgent = (agent: Agent) => {
    if (agent.is_custom) {
      // Only allow deleting custom agents, not default ones
      if (confirm(`Are you sure you want to delete "${agent.display_name}"? This action cannot be undone.`)) {
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
        display_name: agentData.name,
        description: agentData.description,
        system_prompt: agentData.systemPrompt || agentData.prompt || 'You are a helpful AI assistant.',
        model: agentData.model || 'gpt-4',
        avatar: agentData.avatar || '🤖',
        color: agentData.color || 'text-trust-blue',
        capabilities: agentData.capabilities || [],
        rag_enabled: agentData.ragEnabled ?? true,
        temperature: agentData.temperature ?? 0.7,
        max_tokens: agentData.maxTokens ?? 2000,
        is_custom: true,
        status: 'active' as const,
        tier: 1,
        priority: 1,
        implementation_phase: 1,
        knowledge_domains: agentData.knowledgeDomains || [],
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
    const agent: Record<string, any> = {};
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for headers
      if (trimmedLine.startsWith('# ')) {
        agent.display_name = trimmedLine.substring(2).trim();
      } else       if (trimmedLine.startsWith('## Description')) {
        if (currentSection) {
          // eslint-disable-next-line security/detect-object-injection
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'description';
        currentContent = [];
      } else if (trimmedLine.startsWith('## System Prompt') || trimmedLine.startsWith('## Prompt')) {
        if (currentSection) {
          // eslint-disable-next-line security/detect-object-injection
          agent[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'systemPrompt';
        currentContent = [];
      } else if (trimmedLine.startsWith('## Capabilities')) {
        if (currentSection) {
          // eslint-disable-next-line security/detect-object-injection
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
      // eslint-disable-next-line security/detect-object-injection
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

  // Simple filter: search + business function only
  const filteredAgents = useMemo(() => {
    console.log('[Agents Board] Filtering:', {
      searchQuery,
      selectedFunction: selectedBusinessFunction,
      totalAgents: agents.length,
      sampleAgent: agents[0] ? {
        name: agents[0].display_name,
        function_id: agents[0].function_id
      } : null
    });

    return agents.filter(agent => {
      // Search filter
      const matchesSearch = !searchQuery ||
        agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Business function filter
      const matchesFunction = selectedBusinessFunction === 'all' ||
        agent.function_id === selectedBusinessFunction;

      const matches = matchesSearch && matchesFunction;

      // Debug first match
      if (matches && selectedBusinessFunction !== 'all') {
        console.log('[Agents Board] Matched agent:', {
          name: agent.display_name,
          function_id: agent.function_id,
          selectedFunction: selectedBusinessFunction
        });
      }

      return matches;
    });
  }, [agents, searchQuery, selectedBusinessFunction]);

  return (
    <div className="space-y-6">
      {!hiddenControls && (
        <>
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
                      input.onchange = handleFileUpload as unknown;
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
                placeholder="Search agents by name or description..."
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
                  <span className="text-sm text-medical-gray">Filter by:</span>
                </div>

                {/* Business Function Filter */}
                <select
                  value={selectedBusinessFunction}
                  onChange={(e) => setSelectedBusinessFunction(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-progress-teal"
                >
                  <option value="all">All Business Functions</option>
                  {dbBusinessFunctions.map(func => (
                    <option key={func.id} value={func.id}>
                      {func.department_name}
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
        </>
      )}

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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAgentSelect?.(agent);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select agent ${agent.display_name}`}
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
                      <AgentAvatar avatar={agent.avatar} name={agent.name} size="md" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-deep-charcoal group-hover:text-progress-teal transition-colors">
                          {agent.display_name}
                        </h3>
                        {agent.is_custom && (
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
                        {onAddToChat && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAddToChat(agent);
                          }}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add to Chat
                          </DropdownMenuItem>
                        )}
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
                        {agent.is_custom && (
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

                  {/* Business Function Badge */}
                  {(() => {
                    const functionName = getFunctionName(agent.function_id) ||
                                        agent.business_function?.replace(/_/g, ' ');
                    return functionName ? (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {functionName.toUpperCase()}
                      </Badge>
                    ) : null;
                  })()}

                  {/* Knowledge Domains */}
                  {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {agent.knowledge_domains.slice(0, 2).map((domain) => (
                        <Badge
                          key={domain}
                          className={cn('text-xs', getDomainColor([domain]))}
                        >
                          {domain}
                        </Badge>
                      ))}
                      {agent.knowledge_domains.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.knowledge_domains.length - 2} more
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
                  <AgentAvatar avatar={agent.avatar} name={agent.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-deep-charcoal group-hover:text-progress-teal transition-colors">
                        {agent.display_name}
                      </h3>
                      {agent.is_custom && (
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
                    {/* Business Function Badge */}
                    {(() => {
                      const functionName = getFunctionName(agent.function_id) ||
                                          agent.business_function?.replace(/_/g, ' ');
                      return functionName ? (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          {functionName.toUpperCase()}
                        </Badge>
                      ) : null;
                    })()}
                    {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
                      <Badge className={cn('text-xs', getDomainColor(agent.knowledge_domains))}>
                        {agent.knowledge_domains[0]}
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
                        {onAddToChat && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAddToChat(agent);
                          }}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add to Chat
                          </DropdownMenuItem>
                        )}
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
                        {agent.is_custom && (
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
            loadAgents();
          }}
          editingAgent={editingAgent ? {
            ...editingAgent,
            categories: []
          } as unknown as AgentWithCategories : null}
        />
      )}
    </div>
  );
}
