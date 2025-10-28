'use client';

import {
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

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@vital/ui';
import { EnhancedAgentCard, AgentCardGrid } from '@vital/ui';
import { DEPARTMENTS_BY_FUNCTION, ROLES_BY_DEPARTMENT } from '@/config/organizational-structure';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import type { AgentWithCategories } from '@/lib/agents/agent-service';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';
import { cn } from '@vital/ui/lib/utils';
import type { HealthcareBusinessFunction } from '@/types/healthcare-compliance';

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

interface AgentFilters {
  selectedTier: string;
  selectedStatus: string;
  selectedBusinessFunction: string;
  selectedDepartment: string;
  selectedRole: string;
}

interface AgentsBoardProps {
  onAgentSelect?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  showCreateButton?: boolean;
  hiddenControls?: boolean;
  // External state management for sidebar controls
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filters?: AgentFilters;
  onFilterChange?: (filters: AgentFilters) => void;
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
  filters: externalFilters,
  onFilterChange: externalOnFilterChange,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
}: AgentsBoardProps) {
  const { agents, createCustomAgent, updateAgent, deleteAgent, loadAgents } = useAgentsStore();

  // Use external state if provided, otherwise use internal state
  const searchQuery = externalSearchQuery ?? '';
  const selectedTier = externalFilters?.selectedTier ?? 'all';
  const selectedStatus = externalFilters?.selectedStatus ?? 'all';
  const selectedBusinessFunction = externalFilters?.selectedBusinessFunction ?? 'all';
  const selectedDepartment = externalFilters?.selectedDepartment ?? 'all';
  const selectedRole = externalFilters?.selectedRole ?? 'all';
  const viewMode = externalViewMode ?? 'grid';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [savedAgents, setSavedAgents] = useState<Set<string>>(new Set());
  const [dbBusinessFunctions, setDbBusinessFunctions] = useState<HealthcareBusinessFunction[]>([]);

  // Helper function to get function name by ID
  const getFunctionName = (functionId?: string | null) => {
    if (!functionId) return null;
    const func = dbBusinessFunctions.find((f: any) => f.id === functionId);
    return func?.department_name || null;
  };

  // Load agents on component mount only if not already loaded
  useEffect(() => {
    console.log('AgentsBoard mounted, agents.length:', agents.length);
    if (agents.length === 0) {
      console.log('AgentsBoard: Loading agents with showAll=true...');
      loadAgents(true).catch(err => {
        console.error('AgentsBoard: Failed to load agents:', err);
      });
    }
  }, []);

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
          console.warn(
            '[Agents Board] Business functions unavailable, using empty list:',
            result?.error || 'Unknown error'
          );
          setDbBusinessFunctions([]);
        }
      } catch (error) {
        console.warn('[Agents Board] Error loading business functions, using empty list:', error);
        setDbBusinessFunctions([]);
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

  // Filter: search + business function + department + role + tier + status
  const filteredAgents = useMemo(() => {
    console.log('[Agents Board] Filtering:', {
      searchQuery,
      selectedFunction: selectedBusinessFunction,
      selectedDepartment,
      selectedRole,
      selectedTier,
      selectedStatus,
      totalAgents: agents.length,
      sampleAgent: agents[0] ? {
        name: agents[0].display_name,
        business_function: agents[0].business_function,
        department: agents[0].department,
        role: agents[0].role
      } : null
    });

    return agents.filter((agent: any) => {
      // Search filter
      const matchesSearch = !searchQuery ||
        agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Business function filter - match by name, not ID
      const matchesFunction = selectedBusinessFunction === 'all' ||
        agent.business_function === selectedBusinessFunction;

      // Department filter
      const matchesDepartment = selectedDepartment === 'all' ||
        agent.department === selectedDepartment;

      // Role filter
      const matchesRole = selectedRole === 'all' ||
        agent.role === selectedRole;

      // Tier filter
      const matchesTier = selectedTier === 'all' ||
        (selectedTier === 'core' && agent.tier === 0) ||
        agent.tier?.toString() === selectedTier;

      // Status filter
      const matchesStatus = selectedStatus === 'all' ||
        agent.status === selectedStatus;

      return matchesSearch && matchesFunction && matchesDepartment && matchesRole && matchesTier && matchesStatus;
    });
  }, [agents, searchQuery, selectedBusinessFunction, selectedDepartment, selectedRole, selectedTier, selectedStatus]);

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

        </>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-medical-gray">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Agents Grid/List */}
      {viewMode === 'grid' ? (
        <AgentCardGrid columns={3} className="gap-6">
          {filteredAgents.map((agent) => (
            <EnhancedAgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onAgentSelect?.(agent)}
              onAddToChat={onAddToChat ? () => onAddToChat(agent) : undefined}
              showReasoning={false}
              showTier={true}
              size="lg"
            />
          ))}
        </AgentCardGrid>
      ) : (
        <div className="space-y-3">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className="hover:shadow-lg transition-all cursor-pointer group hover:bg-gray-50"
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
                <div className="flex flex-col h-full">
                  {/* Header with Avatar and Actions */}
                  <div className="flex items-start gap-3 mb-3">
                    <AgentAvatar avatar={agent.avatar} name={agent.name} size="card" className="flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-deep-charcoal group-hover:text-progress-teal transition-colors truncate leading-tight">
                            {agent.display_name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            {agent.tier !== undefined && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-bold px-1.5 py-0 h-4",
                                  agent.tier === 0 && "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300",
                                  agent.tier === 1 && "bg-blue-50 text-blue-700 border-blue-200",
                                  agent.tier === 2 && "bg-green-50 text-green-700 border-green-200",
                                  agent.tier === 3 && "bg-orange-50 text-orange-700 border-orange-200"
                                )}
                              >
                                {agent.tier === 0 ? 'Core' : `T${agent.tier}`}
                              </Badge>
                            )}
                            {agent.status && (
                              <Badge
                                className={cn(
                                  "text-[10px] font-medium px-1.5 py-0 h-4",
                                  agent.status === 'active' && "bg-green-100 text-green-700 border-green-200",
                                  agent.status === 'development' && "bg-blue-100 text-blue-700 border-blue-200",
                                  agent.status === 'testing' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                  agent.status === 'deprecated' && "bg-red-100 text-red-700 border-red-200",
                                  agent.status === 'inactive' && "bg-gray-100 text-gray-600 border-gray-200"
                                )}
                              >
                                {agent.status === 'active' ? 'Active' : agent.status === 'development' ? 'Dev' : agent.status === 'testing' ? 'Test' : agent.status}
                              </Badge>
                            )}
                            {agent.is_custom && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1">
                              <MoreVertical className="h-3.5 w-3.5" />
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
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-snug">
                    {agent.description}
                  </p>

                  {/* Metadata Section */}
                  <div className="space-y-2 flex-1">
                    {/* Business Function */}
                    {(() => {
                      const functionName = getFunctionName(agent.function_id) ||
                                          agent.business_function?.replace(/_/g, ' ');
                      return functionName ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 bg-indigo-50 text-indigo-700 border-indigo-200 font-medium">
                            {functionName}
                          </Badge>
                          {savedAgents.has(agent.id) && (
                            <Heart className="h-3.5 w-3.5 fill-current text-red-500" />
                          )}
                        </div>
                      ) : savedAgents.has(agent.id) ? (
                        <div className="flex items-center">
                          <Heart className="h-3.5 w-3.5 fill-current text-red-500" />
                        </div>
                      ) : null;
                    })()}

                    {/* Capabilities Preview */}
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 2).map((capability) => (
                          <Badge key={capability} variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 bg-gray-50 text-gray-700 border-gray-200">
                            {capability}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 bg-gray-50 text-gray-600 border-gray-200">
                            +{agent.capabilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer with Model */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Brain className="h-3 w-3" />
                      <span className="font-medium">{agent.model}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* List View Layout */}
              {viewMode === 'list' && (
                <>
                  <AgentAvatar avatar={agent.avatar} name={agent.name} size="list" />
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
      )}

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
            loadAgents(true);
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
